use image::{ImageBuffer, Rgba, DynamicImage};
use guest_place::media::palette::extract_palette;
use guest_place::media::sanitizer::{strip_jpeg_metadata, strip_png_metadata};
use guest_place::media::optimizer::generate_variants_sync;
use uuid::Uuid;

#[test]
fn test_palette_extraction_dominant_and_palette() {
    let width = 100;
    let height = 100;
    let mut img_buf: ImageBuffer<Rgba<u8>, Vec<u8>> = ImageBuffer::new(width, height);

    // 70% blue pixels (#0000ff), 20% red pixels (#ff0000), 10% green pixels (#00ff00)
    for (_x, y, pixel) in img_buf.enumerate_pixels_mut() {
        if y < 70 {
            *pixel = Rgba([0, 0, 255, 255]); // Blue
        } else if y < 90 {
            *pixel = Rgba([255, 0, 0, 255]); // Red
        } else {
            *pixel = Rgba([0, 255, 0, 255]); // Green
        }
    }

    let dyn_img = DynamicImage::ImageRgba8(img_buf);
    let result = extract_palette(&dyn_img, 5);

    // Dominant color should be blue (e.g. #0000ff or close quantized)
    assert_eq!(result.dominant_color, "#0000ff");

    // Palette should contain blue, red, and green
    assert!(result.palette.len() >= 3);
    assert!(result.palette.contains(&"#0000ff".to_string()));
    assert!(result.palette.contains(&"#ff0000".to_string()));
    assert!(result.palette.contains(&"#00ff00".to_string()));
}

#[test]
fn test_palette_ignores_transparent_pixels() {
    let width = 50;
    let height = 50;
    let mut img_buf: ImageBuffer<Rgba<u8>, Vec<u8>> = ImageBuffer::new(width, height);

    // 80% transparent black pixels, 20% fully opaque orange pixels (#ff8800)
    for (_x, y, pixel) in img_buf.enumerate_pixels_mut() {
        if y < 40 {
            *pixel = Rgba([0, 0, 0, 0]); // Transparent
        } else {
            *pixel = Rgba([255, 136, 0, 255]); // Opaque orange
        }
    }

    let dyn_img = DynamicImage::ImageRgba8(img_buf);
    let result = extract_palette(&dyn_img, 5);

    // Dominant color must ignore the 80% transparent pixels and pick orange
    assert_eq!(result.dominant_color, "#ff8800");
    assert_eq!(result.palette[0], "#ff8800");
}

#[test]
fn test_jpeg_lossless_metadata_stripping() {
    // 1. Create a minimal valid JPEG using image crate
    let img = DynamicImage::new_rgb8(16, 16);
    let mut raw_jpeg = Vec::new();
    img.write_to(&mut std::io::Cursor::new(&mut raw_jpeg), image::ImageFormat::Jpeg)
        .expect("Failed to encode test JPEG");

    // 2. Synthesize an APP1 segment containing fake EXIF and GPS tags
    // JPEG marker APP1: 0xFF, 0xE1, len_hi, len_lo, "Exif\0\0" + payload
    let fake_exif_payload = b"Exif\0\0II*\0\x08\0\0\0\x01\0\x25\x88\x04\0\x01\0\0\0\0\0\0\0\0\0\0\0";
    let seg_len = (2 + fake_exif_payload.len()) as u16;
    let mut app1_seg = vec![0xFF, 0xE1];
    app1_seg.extend_from_slice(&seg_len.to_be_bytes());
    app1_seg.extend_from_slice(fake_exif_payload);

    // Insert APP1 segment right after SOI (0xFF, 0xD8)
    let mut jpeg_with_metadata = Vec::new();
    jpeg_with_metadata.extend_from_slice(&raw_jpeg[..2]); // SOI
    jpeg_with_metadata.extend_from_slice(&app1_seg);
    jpeg_with_metadata.extend_from_slice(&raw_jpeg[2..]);

    assert!(jpeg_with_metadata.windows(2).any(|w| w == [0xFF, 0xE1]));

    // 3. Strip metadata
    let stripped = strip_jpeg_metadata(&jpeg_with_metadata);

    // 4. Verify APP1 is completely removed
    assert!(!stripped.windows(2).any(|w| w == [0xFF, 0xE1]), "APP1 EXIF segment must be stripped");

    // 5. Verify stripped JPEG is still a valid decodable image!
    let decoded = image::load_from_memory_with_format(&stripped, image::ImageFormat::Jpeg)
        .expect("Stripped JPEG must remain valid and decodable");
    assert_eq!(decoded.width(), 16);
    assert_eq!(decoded.height(), 16);
}

#[test]
fn test_png_metadata_stripping() {
    // Create a minimal PNG
    let img = DynamicImage::new_rgba8(8, 8);
    let mut raw_png = Vec::new();
    img.write_to(&mut std::io::Cursor::new(&mut raw_png), image::ImageFormat::Png)
        .expect("Failed to encode test PNG");

    // Inject a fake tEXt chunk before IEND
    let text_chunk_data = b"Comment\0Sensitive geolocation data";
    let chunk_len = text_chunk_data.len() as u32;
    let mut custom_chunk = Vec::new();
    custom_chunk.extend_from_slice(&chunk_len.to_be_bytes());
    custom_chunk.extend_from_slice(b"tEXt");
    custom_chunk.extend_from_slice(text_chunk_data);
    custom_chunk.extend_from_slice(&[0, 0, 0, 0]); // dummy CRC

    // Find IEND position
    let iend_pos = raw_png.windows(4).position(|w| w == b"IEND").unwrap() - 4;
    let mut png_with_meta = Vec::new();
    png_with_meta.extend_from_slice(&raw_png[..iend_pos]);
    png_with_meta.extend_from_slice(&custom_chunk);
    png_with_meta.extend_from_slice(&raw_png[iend_pos..]);

    assert!(png_with_meta.windows(4).any(|w| w == b"tEXt"));

    // Strip metadata
    let stripped = strip_png_metadata(&png_with_meta);

    // Verify tEXt chunk is removed
    assert!(!stripped.windows(4).any(|w| w == b"tEXt"), "tEXt chunk must be stripped from PNG");

    // Verify stripped PNG is still decodable
    let decoded = image::load_from_memory_with_format(&stripped, image::ImageFormat::Png)
        .expect("Stripped PNG must remain valid and decodable");
    assert_eq!(decoded.width(), 8);
    assert_eq!(decoded.height(), 8);
}

#[test]
fn test_optimizer_integration_extracts_metadata_and_palette() {
    let temp_dir = std::env::temp_dir().join(format!("metadata_test_{}", Uuid::new_v4()));
    std::fs::create_dir_all(&temp_dir).expect("Failed to create temp directory");

    let width = 300;
    let height = 200;
    let mut img_buf: ImageBuffer<Rgba<u8>, Vec<u8>> = ImageBuffer::new(width, height);
    for (_x, _y, pixel) in img_buf.enumerate_pixels_mut() {
        *pixel = Rgba([42, 99, 180, 255]); // Custom blue-ish color #2a63b4
    }

    let source_path = temp_dir.join("test_metadata.png");
    img_buf.save(&source_path).expect("Failed to save test image");

    let media_id = Uuid::new_v4();
    let result = generate_variants_sync(
        &source_path,
        &media_id,
        temp_dir.to_str().unwrap(),
        "http://localhost:8080",
    )
    .expect("Variant generation failed");

    assert_eq!(result.width, 300);
    assert_eq!(result.height, 200);
    assert_eq!(result.dominant_color, "#2a63b4");
    assert!(!result.palette.is_empty());
    assert_eq!(result.palette[0], "#2a63b4");

    // Clean up
    let _ = std::fs::remove_dir_all(&temp_dir);
}
