use uuid::Uuid;
use image::{ImageBuffer, Rgba, GenericImageView};
use guest_place::media::optimizer::generate_variants_sync;

#[tokio::test]
async fn test_generate_responsive_variants_and_webp() {
    let temp_dir = std::env::temp_dir().join(format!("optimizer_test_{}", Uuid::new_v4()));
    std::fs::create_dir_all(&temp_dir).expect("Failed to create temp directory");

    // 1. Create a 1920x1080 test image with a gradient
    let width = 1920;
    let height = 1080;
    let mut img_buf: ImageBuffer<Rgba<u8>, Vec<u8>> = ImageBuffer::new(width, height);
    for (x, y, pixel) in img_buf.enumerate_pixels_mut() {
        let r = ((x as f32 / width as f32) * 255.0) as u8;
        let g = ((y as f32 / height as f32) * 255.0) as u8;
        let b = 128;
        *pixel = Rgba([r, g, b, 255]);
    }

    let source_path = temp_dir.join("test_source.png");
    img_buf.save(&source_path).expect("Failed to save source image");

    // 2. Run generate_variants_sync
    let media_id = Uuid::new_v4();
    let upload_dir_str = temp_dir.to_str().unwrap();
    let public_url = "http://localhost:8080";

    let result = generate_variants_sync(&source_path, &media_id, upload_dir_str, public_url)
        .expect("Variant generation failed");

    // 3. Assertions on dimensions and blurhash
    assert_eq!(result.width, 1920);
    assert_eq!(result.height, 1080);
    assert!(result.blurhash.is_some(), "Blurhash must be generated");
    let blurhash_str = result.blurhash.unwrap();
    assert!(!blurhash_str.is_empty(), "Blurhash must not be empty");

    // 4. Assertions on Thumbnail variant (max 256x256)
    let thumb = result.variants.thumbnail.expect("Thumbnail variant missing");
    assert_eq!(thumb.format, "webp");
    assert!(thumb.width <= 256);
    assert!(thumb.height <= 256);
    assert!(thumb.size_bytes > 0);
    assert_eq!(
        thumb.url,
        format!("http://localhost:8080/uploads/variants/{}/thumbnail.webp", media_id)
    );

    let thumb_file = temp_dir.join(&thumb.path);
    assert!(thumb_file.exists(), "Thumbnail file must exist on disk");
    let decoded_thumb = image::open(&thumb_file).expect("Thumbnail must be decodable as image");
    assert_eq!(decoded_thumb.dimensions(), (thumb.width, thumb.height));

    // 5. Assertions on Medium variant (max 800x800)
    let medium = result.variants.medium.expect("Medium variant missing");
    assert_eq!(medium.format, "webp");
    assert!(medium.width <= 800);
    assert!(medium.height <= 800);
    assert!(medium.size_bytes > 0);
    assert_eq!(
        medium.url,
        format!("http://localhost:8080/uploads/variants/{}/medium.webp", media_id)
    );

    let medium_file = temp_dir.join(&medium.path);
    assert!(medium_file.exists(), "Medium file must exist on disk");
    let decoded_medium = image::open(&medium_file).expect("Medium must be decodable as image");
    assert_eq!(decoded_medium.dimensions(), (medium.width, medium.height));

    // 6. Assertions on Large variant (max 1600x1600)
    let large = result.variants.large.expect("Large variant missing");
    assert_eq!(large.format, "webp");
    assert!(large.width <= 1600);
    assert!(large.height <= 1600);
    assert!(large.size_bytes > 0);
    assert_eq!(
        large.url,
        format!("http://localhost:8080/uploads/variants/{}/large.webp", media_id)
    );

    let large_file = temp_dir.join(&large.path);
    assert!(large_file.exists(), "Large file must exist on disk");
    let decoded_large = image::open(&large_file).expect("Large must be decodable as image");
    assert_eq!(decoded_large.dimensions(), (large.width, large.height));

    // 7. Assertions on Original WebP variant (1920x1080)
    let original = result.variants.original.expect("Original variant missing");
    assert_eq!(original.format, "webp");
    assert_eq!(original.width, 1920);
    assert_eq!(original.height, 1080);
    assert!(original.size_bytes > 0);

    let original_file = temp_dir.join(&original.path);
    assert!(original_file.exists(), "Original WebP file must exist on disk");

    // Clean up
    let _ = std::fs::remove_dir_all(&temp_dir);
}

#[tokio::test]
async fn test_small_image_variants_no_upscaling() {
    let temp_dir = std::env::temp_dir().join(format!("optimizer_test_small_{}", Uuid::new_v4()));
    std::fs::create_dir_all(&temp_dir).expect("Failed to create temp directory");

    // Create a 150x100 small image (smaller than 256x256, 800x800, 1600x1600)
    let img_buf: ImageBuffer<Rgba<u8>, Vec<u8>> = ImageBuffer::new(150, 100);
    let source_path = temp_dir.join("small.png");
    img_buf.save(&source_path).expect("Failed to save source image");

    let media_id = Uuid::new_v4();
    let result = generate_variants_sync(
        &source_path,
        &media_id,
        temp_dir.to_str().unwrap(),
        "http://localhost:8080",
    )
    .expect("Variant generation failed");

    assert_eq!(result.width, 150);
    assert_eq!(result.height, 100);

    // Medium and Large should preserve small original dimensions without upscaling
    let medium = result.variants.medium.unwrap();
    assert_eq!(medium.width, 150);
    assert_eq!(medium.height, 100);

    let large = result.variants.large.unwrap();
    assert_eq!(large.width, 150);
    assert_eq!(large.height, 100);

    // Clean up
    let _ = std::fs::remove_dir_all(&temp_dir);
}
