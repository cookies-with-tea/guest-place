use std::path::Path;
use std::sync::Arc;
use anyhow::{Context, Result};
use image::GenericImageView;
use sqlx::{Pool, Postgres};
use uuid::Uuid;
use crate::core::bus::{RealtimeBus, SystemEvent};
use crate::media::dto::{MediaVariantDTO, MediaVariantsDTO};
use tracing::{error, info};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct OptimizationResult {
    pub width: u32,
    pub height: u32,
    pub blurhash: Option<String>,
    pub optimized_path: String,
    pub variants: MediaVariantsDTO,
    pub dominant_color: String,
    pub palette: Vec<String>,
    pub exif: serde_json::Value,
}

#[derive(Debug, Clone)]
pub struct MediaOptimizer {
    pool: Pool<Postgres>,
    bus: Arc<RealtimeBus>,
    upload_dir: String,
    public_url: String,
}

impl MediaOptimizer {
    pub fn new(
        pool: Pool<Postgres>,
        bus: Arc<RealtimeBus>,
        upload_dir: String,
        public_url: String,
    ) -> Self {
        Self {
            pool,
            bus,
            upload_dir,
            public_url,
        }
    }

    /// Asynchronously trigger optimization in the background without blocking the caller.
    pub async fn process_image(&self, id: Uuid, file_path: String) {
        let optimizer = self.clone();
        tokio::spawn(async move {
            info!("Processing image variants for {}: {}", id, file_path);
            if let Err(e) = optimizer.optimize_file(id, &file_path).await {
                error!("Failed to optimize image {} ({}): {:#}", id, file_path, e);
            }
        });
    }

    /// Performs image optimization and variants generation synchronously on blocking thread pool,
    /// updates the database, and emits bus event.
    pub async fn optimize_file(&self, id: Uuid, file_path: &str) -> Result<OptimizationResult> {
        let upload_dir = self.upload_dir.clone();
        let public_url = self.public_url.clone();
        let full_path = Path::new(&upload_dir).join(file_path);

        let opt_res = tokio::task::spawn_blocking(move || {
            generate_variants_sync(&full_path, &id, &upload_dir, &public_url)
        })
        .await
        .context("Optimization task panicked")??;

        let variants_json = serde_json::to_value(&opt_res.variants)
            .context("Failed to serialize variants to JSON")?;
        let palette_json = serde_json::to_value(&opt_res.palette)
            .context("Failed to serialize palette to JSON")?;

        sqlx::query(
            "UPDATE media 
             SET blurhash = $1, 
                 optimized_path = $2, 
                 width = $3, 
                 height = $4, 
                 variants = $5,
                 dominant_color = $6,
                 palette = $7,
                 exif = $8
             WHERE uuid = $9",
        )
        .bind(&opt_res.blurhash)
        .bind(&opt_res.optimized_path)
        .bind(opt_res.width as i32)
        .bind(opt_res.height as i32)
        .bind(variants_json)
        .bind(&opt_res.dominant_color)
        .bind(palette_json)
        .bind(&opt_res.exif)
        .bind(id)
        .execute(&self.pool)
        .await
        .context("Failed to update media database record with optimized variants")?;

        info!("Successfully generated variants and metadata for media {}", id);
        self.bus.publish(SystemEvent::FileProcessed {
            id: id.to_string(),
            path: opt_res.optimized_path.clone(),
        });

        Ok(opt_res)
    }

    /// Re-optimizes an existing media record by UUID.
    pub async fn reoptimize_by_uuid(&self, id: Uuid) -> Result<OptimizationResult> {
        let row = sqlx::query_scalar::<_, String>("SELECT url FROM media WHERE uuid = $1")
            .bind(id)
            .fetch_optional(&self.pool)
            .await
            .context("Failed to query media for optimization")?
            .context("Media not found")?;

        let relative_path = if let Some(idx) = row.find("/uploads/") {
            row[idx + "/uploads/".len()..].to_string()
        } else {
            row
        };

        self.optimize_file(id, &relative_path).await
    }
}

/// Generates responsive sizes and WebP variants synchronously for an image file.
pub fn generate_variants_sync(
    full_path: &Path,
    id: &Uuid,
    upload_dir: &str,
    public_url: &str,
) -> Result<OptimizationResult> {
    let img = image::open(full_path)
        .with_context(|| format!("Failed to open source image at {:?}", full_path))?;

    let (orig_width, orig_height) = img.dimensions();

    // Directory for responsive variants: uploads/variants/{uuid}/
    let variants_dir = Path::new(upload_dir).join("variants").join(id.to_string());
    std::fs::create_dir_all(&variants_dir)
        .with_context(|| format!("Failed to create variants directory {:?}", variants_dir))?;

    let base_url = public_url.trim_end_matches('/');

    // 1. Generate Blurhash
    let (bw, bh) = if orig_width > orig_height {
        (4, (4.0 * (orig_height as f32 / orig_width as f32)).max(1.0) as u32)
    } else {
        (((4.0 * (orig_width as f32 / orig_height as f32)).max(1.0) as u32), 4)
    };
    let resized_for_hash = img.thumbnail(bw * 10, bh * 10);
    let blurhash = blurhash::encode(
        bw,
        bh,
        resized_for_hash.width(),
        resized_for_hash.height(),
        &resized_for_hash.to_rgba8(),
    )
    .ok();

    // Helper closure to save dynamic image as WebP variant and return DTO
    let save_variant = |name: &str, target_img: &image::DynamicImage| -> Result<MediaVariantDTO> {
        let file_name = format!("{}.webp", name);
        let dest_path = variants_dir.join(&file_name);
        target_img
            .save_with_format(&dest_path, image::ImageFormat::WebP)
            .with_context(|| format!("Failed to save {} WebP variant", name))?;

        let size_bytes = std::fs::metadata(&dest_path)
            .map(|m| m.len() as i64)
            .unwrap_or(0);

        let (w, h) = target_img.dimensions();
        let rel_path = format!("variants/{}/{}", id, file_name);
        let url = format!("{}/uploads/{}", base_url, rel_path);

        Ok(MediaVariantDTO {
            path: rel_path,
            url,
            width: w,
            height: h,
            format: "webp".to_string(),
            size_bytes,
        })
    };

    // 2. Thumbnail (max 256x256)
    let thumb_img = img.thumbnail(256, 256);
    let thumbnail = save_variant("thumbnail", &thumb_img)?;

    // 3. Medium (max 800x800)
    let medium_img = if orig_width > 800 || orig_height > 800 {
        img.thumbnail(800, 800)
    } else {
        img.clone()
    };
    let medium = save_variant("medium", &medium_img)?;

    // 4. Large (max 1600x1600)
    let large_img = if orig_width > 1600 || orig_height > 1600 {
        img.thumbnail(1600, 1600)
    } else {
        img.clone()
    };
    let large = save_variant("large", &large_img)?;

    // 5. Full resolution WebP (original)
    let original = save_variant("original", &img)?;
    let optimized_path = original.path.clone();

    // 6. Extract EXIF and palette
    let raw_bytes = std::fs::read(full_path).unwrap_or_default();
    let exif_meta = crate::media::sanitizer::extract_exif(&raw_bytes);
    let exif_val = serde_json::to_value(&exif_meta).unwrap_or_else(|_| serde_json::json!({}));
    let palette_res = crate::media::palette::extract_palette(&img, 6);

    Ok(OptimizationResult {
        width: orig_width,
        height: orig_height,
        blurhash,
        optimized_path,
        variants: MediaVariantsDTO {
            thumbnail: Some(thumbnail),
            medium: Some(medium),
            large: Some(large),
            original: Some(original),
        },
        dominant_color: palette_res.dominant_color,
        palette: palette_res.palette,
        exif: exif_val,
    })
}
