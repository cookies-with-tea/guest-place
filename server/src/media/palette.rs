use std::collections::HashMap;
use image::{DynamicImage, GenericImageView};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PaletteResult {
    pub dominant_color: String,
    pub palette: Vec<String>,
}

/// Extracts dominant color and a diverse color palette from an image.
pub fn extract_palette(img: &DynamicImage, max_palette_colors: usize) -> PaletteResult {
    let (width, height) = img.dimensions();
    if width == 0 || height == 0 {
        return PaletteResult {
            dominant_color: "#000000".to_string(),
            palette: vec!["#000000".to_string()],
        };
    }

    // Downscale to 64x64 for fast analysis
    let thumb = img.thumbnail(64, 64);
    let rgba = thumb.to_rgba8();

    // Bin colors using 5-bit channels (32x32x32 = 32,768 bins)
    // Map bin_id -> (frequency, sum_r, sum_g, sum_b)
    let mut bins: HashMap<u16, (u32, u64, u64, u64)> = HashMap::new();

    for pixel in rgba.pixels() {
        let [r, g, b, a] = pixel.0;
        if a < 128 {
            continue; // Skip transparent / semi-transparent pixels
        }

        let r_bin = (r >> 3) as u16;
        let g_bin = (g >> 3) as u16;
        let b_bin = (b >> 3) as u16;
        let bin_id = (r_bin << 10) | (g_bin << 5) | b_bin;

        let entry = bins.entry(bin_id).or_insert((0, 0, 0, 0));
        entry.0 += 1;
        entry.1 += r as u64;
        entry.2 += g as u64;
        entry.3 += b as u64;
    }

    // If completely transparent or empty, fallback
    if bins.is_empty() {
        return PaletteResult {
            dominant_color: "#ffffff".to_string(),
            palette: vec!["#ffffff".to_string()],
        };
    }

    // Sort bins by frequency descending
    let mut sorted_bins: Vec<(u32, [u8; 3])> = bins
        .into_iter()
        .map(|(_, (count, sr, sg, sb))| {
            let avg_r = (sr / count as u64) as u8;
            let avg_g = (sg / count as u64) as u8;
            let avg_b = (sb / count as u64) as u8;
            (count, [avg_r, avg_g, avg_b])
        })
        .collect();

    sorted_bins.sort_by(|a, b| b.0.cmp(&a.0));

    let to_hex = |c: [u8; 3]| format!("#{:02x}{:02x}{:02x}", c[0], c[1], c[2]);

    let dominant_color = to_hex(sorted_bins[0].1);

    // Color distance helper (Euclidean distance in RGB)
    let color_dist = |c1: [u8; 3], c2: [u8; 3]| -> f32 {
        let dr = c1[0] as f32 - c2[0] as f32;
        let dg = c1[1] as f32 - c2[1] as f32;
        let db = c1[2] as f32 - c2[2] as f32;
        (dr * dr + dg * dg + db * db).sqrt()
    };

    let mut selected_colors: Vec<[u8; 3]> = Vec::new();
    selected_colors.push(sorted_bins[0].1);

    let distance_threshold = 40.0;

    for (_, candidate) in sorted_bins.iter().skip(1) {
        if selected_colors.len() >= max_palette_colors {
            break;
        }

        let is_distinct = selected_colors
            .iter()
            .all(|&selected| color_dist(selected, *candidate) >= distance_threshold);

        if is_distinct {
            selected_colors.push(*candidate);
        }
    }

    let palette: Vec<String> = selected_colors.into_iter().map(to_hex).collect();

    PaletteResult {
        dominant_color,
        palette,
    }
}
