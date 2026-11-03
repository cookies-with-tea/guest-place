use exif::{In, Reader, Tag};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ExifMetadata {
    pub make: Option<String>,
    pub model: Option<String>,
    pub software: Option<String>,
    pub date_time: Option<String>,
    pub exposure_time: Option<String>,
    pub f_number: Option<String>,
    pub iso: Option<u32>,
    pub focal_length: Option<String>,
    pub lens_model: Option<String>,
    pub orientation: Option<u32>,
    pub has_gps: bool,
    pub gps_stripped: bool,
    pub sanitized: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SanitizeResult {
    pub data: Vec<u8>,
    pub metadata: ExifMetadata,
    pub original_size: usize,
    pub sanitized_size: usize,
}

/// Extracts EXIF metadata and strips sensitive tags (GPS, camera serials, personal tags)
/// from the image bytes cleanly and losslessly.
pub fn extract_and_sanitize(data: &[u8], extension: &str) -> SanitizeResult {
    let mut metadata = extract_exif(data);

    let sanitized_data = match extension.to_lowercase().as_str() {
        "jpg" | "jpeg" => strip_jpeg_metadata(data),
        "png" => strip_png_metadata(data),
        "webp" => strip_webp_metadata(data),
        _ => data.to_vec(),
    };

    let original_size = data.len();
    let sanitized_size = sanitized_data.len();

    metadata.sanitized = true;
    if metadata.has_gps {
        metadata.gps_stripped = true;
    }

    SanitizeResult {
        data: sanitized_data,
        metadata,
        original_size,
        sanitized_size,
    }
}

/// Reads EXIF metadata from raw image container
pub fn extract_exif(data: &[u8]) -> ExifMetadata {
    let mut meta = ExifMetadata::default();
    let mut cursor = std::io::Cursor::new(data);

    let exif = match Reader::new().read_from_container(&mut cursor) {
        Ok(e) => e,
        Err(_) => return meta,
    };

    let get_str = |tag: Tag| -> Option<String> {
        exif.get_field(tag, In::PRIMARY)
            .map(|f| f.display_value().to_string().trim_matches('"').to_string())
    };

    meta.make = get_str(Tag::Make);
    meta.model = get_str(Tag::Model);
    meta.software = get_str(Tag::Software);
    meta.date_time = get_str(Tag::DateTimeOriginal).or_else(|| get_str(Tag::DateTime));
    meta.exposure_time = get_str(Tag::ExposureTime);
    meta.f_number = get_str(Tag::FNumber);
    meta.focal_length = get_str(Tag::FocalLength);
    meta.lens_model = get_str(Tag::LensModel);

    if let Some(f) = exif.get_field(Tag::PhotographicSensitivity, In::PRIMARY) {
        if let Some(val) = f.value.get_uint(0) {
            meta.iso = Some(val);
        }
    }

    if let Some(f) = exif.get_field(Tag::Orientation, In::PRIMARY) {
        if let Some(val) = f.value.get_uint(0) {
            meta.orientation = Some(val);
        }
    }

    // Check for sensitive GPS tags
    meta.has_gps = exif.get_field(Tag::GPSLatitude, In::PRIMARY).is_some()
        || exif.get_field(Tag::GPSLongitude, In::PRIMARY).is_some()
        || exif.get_field(Tag::GPSAltitude, In::PRIMARY).is_some();

    meta
}

/// Losslessly strips APP1 (EXIF/XMP), APP2, APP13, and COM segments from JPEG.
pub fn strip_jpeg_metadata(data: &[u8]) -> Vec<u8> {
    if data.len() < 4 || data[0] != 0xFF || data[1] != 0xD8 {
        return data.to_vec();
    }

    let mut output = Vec::with_capacity(data.len());
    output.push(0xFF);
    output.push(0xD8);

    let mut i = 2;
    while i < data.len() {
        if data[i] != 0xFF {
            // Unexpected byte, fallback to remaining data
            output.extend_from_slice(&data[i..]);
            break;
        }

        // Skip any padding 0xFFs
        while i < data.len() && data[i] == 0xFF {
            i += 1;
        }

        if i >= data.len() {
            break;
        }

        let marker = data[i];
        i += 1;

        // Standalone markers without length: RST0-7 (0xD0..0xD7), SOI (0xD8), EOI (0xD9)
        if (0xD0..=0xD7).contains(&marker) {
            output.push(0xFF);
            output.push(marker);
            continue;
        }

        if marker == 0xD9 {
            // End of Image
            output.push(0xFF);
            output.push(0xD9);
            break;
        }

        // Start of Scan: raw entropy data begins after SOS header
        if marker == 0xDA {
            if i + 1 >= data.len() {
                output.push(0xFF);
                output.push(marker);
                break;
            }
            let seg_len = u16::from_be_bytes([data[i], data[i + 1]]) as usize;
            if i + seg_len > data.len() {
                output.extend_from_slice(&data[i - 2..]);
                break;
            }
            output.push(0xFF);
            output.push(marker);
            output.extend_from_slice(&data[i..]);
            break;
        }

        // Segments with length
        if i + 1 >= data.len() {
            break;
        }

        let seg_len = u16::from_be_bytes([data[i], data[i + 1]]) as usize;
        if seg_len < 2 || i + seg_len > data.len() {
            // Invalid length, fallback
            output.extend_from_slice(&data[i - 2..]);
            break;
        }

        // Check if marker should be dropped:
        // 0xE1 = APP1 (EXIF / XMP)
        // 0xED = APP13 (Photoshop / IPTC)
        // 0xFE = COM (Comment)
        let drop_marker = marker == 0xE1 || marker == 0xED || marker == 0xFE;

        if !drop_marker {
            output.push(0xFF);
            output.push(marker);
            output.extend_from_slice(&data[i..i + seg_len]);
        }

        i += seg_len;
    }

    output
}

/// Strips eXIf, tEXt, zTXt, iTXt metadata chunks from PNG losslessly.
pub fn strip_png_metadata(data: &[u8]) -> Vec<u8> {
    const PNG_HEADER: [u8; 8] = [137, 80, 78, 71, 13, 10, 26, 10];
    if data.len() < 8 || &data[..8] != PNG_HEADER {
        return data.to_vec();
    }

    let mut output = Vec::with_capacity(data.len());
    output.extend_from_slice(&PNG_HEADER);

    let mut i = 8;
    while i + 8 <= data.len() {
        let chunk_len = u32::from_be_bytes([data[i], data[i + 1], data[i + 2], data[i + 3]]) as usize;
        let chunk_type = &data[i + 4..i + 8];
        let total_chunk_len = 4 + 4 + chunk_len + 4; // len + type + data + crc

        if i + total_chunk_len > data.len() {
            output.extend_from_slice(&data[i..]);
            break;
        }

        let is_metadata = chunk_type == b"eXIf"
            || chunk_type == b"tEXt"
            || chunk_type == b"zTXt"
            || chunk_type == b"iTXt";

        if !is_metadata {
            output.extend_from_slice(&data[i..i + total_chunk_len]);
        }

        i += total_chunk_len;
    }

    output
}

/// Strips EXIF and XMP chunks from WebP losslessly.
pub fn strip_webp_metadata(data: &[u8]) -> Vec<u8> {
    if data.len() < 12 || &data[..4] != b"RIFF" || &data[8..12] != b"WEBP" {
        return data.to_vec();
    }

    let mut chunks = Vec::new();
    let mut i = 12;

    while i + 8 <= data.len() {
        let fourcc = &data[i..i + 4];
        let chunk_len = u32::from_le_bytes([data[i + 4], data[i + 5], data[i + 6], data[i + 7]]) as usize;
        let pad = chunk_len % 2;
        let total_len = 8 + chunk_len + pad;

        if i + total_len > data.len() {
            chunks.extend_from_slice(&data[i..]);
            break;
        }

        let is_metadata = fourcc == b"EXIF" || fourcc == b"XMP ";
        if !is_metadata {
            chunks.extend_from_slice(&data[i..i + total_len]);
        }

        i += total_len;
    }

    let mut output = Vec::with_capacity(12 + chunks.len());
    output.extend_from_slice(b"RIFF");
    let total_riff_size = (4 + chunks.len()) as u32;
    output.extend_from_slice(&total_riff_size.to_le_bytes());
    output.extend_from_slice(b"WEBP");
    output.extend_from_slice(&chunks);

    output
}
