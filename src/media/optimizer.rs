use std::path::Path;
use std::sync::Arc;
use image::GenericImageView;
use sqlx::{Pool, Postgres};
use uuid::Uuid;
use crate::core::bus::{RealtimeBus, SystemEvent};
use tracing::{error, info};

#[derive(Debug)]
pub struct MediaOptimizer {
    pool: Pool<Postgres>,
    bus: Arc<RealtimeBus>,
    upload_dir: String,
}

impl MediaOptimizer {
    pub fn new(pool: Pool<Postgres>, bus: Arc<RealtimeBus>, upload_dir: String) -> Self {
        Self { pool, bus, upload_dir }
    }

    pub async fn process_image(&self, id: Uuid, file_path: String) {
        let pool = self.pool.clone();
        let bus = self.bus.clone();
        let upload_dir = self.upload_dir.clone();
        
        tokio::spawn(async move {
            info!("Processing image: {}", file_path);
            let full_path = Path::new(&upload_dir).join(&file_path);
            
            let img = match image::open(&full_path) {
                Ok(img) => img,
                Err(e) => {
                    error!("Failed to open image {}: {}", file_path, e);
                    return;
                }
            };

            let (width, height) = img.dimensions();
            
            // 1. Generate Blurhash
            let (w, h) = if width > height {
                (4, (4.0 * (height as f32 / width as f32)) as u32)
            } else {
                ((4.0 * (width as f32 / height as f32)) as u32, 4)
            };
            
            let resized_for_hash = img.thumbnail(w * 10, h * 10);
            let hash = blurhash::encode(w, h, resized_for_hash.width(), resized_for_hash.height(), &resized_for_hash.to_rgba8());
            
            let hash_str = match hash {
                Ok(h) => Some(h),
                Err(e) => {
                    error!("Blurhash error: {}", e);
                    None
                }
            };

            // 2. Generate WebP
            let optimized_name = format!("{}.webp", id);
            let optimized_path = Path::new(&upload_dir).join(&optimized_name);
            
            if let Err(e) = img.save_with_format(&optimized_path, image::ImageFormat::WebP) {
                error!("Failed to save optimized image {}: {}", optimized_name, e);
                return;
            }

            // 3. Update DB
            let result = sqlx::query(
                "UPDATE media SET blurhash = $1, optimized_path = $2, width = $3, height = $4 WHERE id = $5"
            )
            .bind(hash_str)
            .bind(&optimized_name)
            .bind(width as i32)
            .bind(height as i32)
            .bind(id)
            .execute(&pool)
            .await;

            match result {
                Ok(_) => {
                    info!("Successfully optimized image: {}", file_path);
                    bus.publish(SystemEvent::FileProcessed { 
                        id: id.to_string(), 
                        path: optimized_name 
                    });
                },
                Err(e) => error!("Failed to update media info for {}: {}", id, e),
            }
        });
    }
}
