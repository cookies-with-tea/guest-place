use sha2::{Sha256, Digest};
use std::path::PathBuf;
use tokio::fs;
use image::ImageFormat;
use anyhow::{Result, Context};

#[derive(Debug)]
pub struct StorageService {
    base_path: PathBuf,
}

impl StorageService {
    pub fn new(base_path: impl Into<PathBuf>) -> Self {
        Self { base_path: base_path.into() }
    }

    /// Сохраняет данные по хешу содержимого (CAS)
    pub async fn save_cas(&self, data: &[u8], extension: &str) -> Result<(String, String)> {
        let hash = self.calculate_hash(data);
        
        // Организация папок: aa/bb/hash
        let dir1 = &hash[0..2];
        let dir2 = &hash[2..4];
        let file_dir = self.base_path.join(dir1).join(dir2);
        
        fs::create_dir_all(&file_dir).await.context("Failed to create CAS directory")?;
        
        let path = file_dir.join(format!("{}.{}", hash, extension));
        let relative_path = format!("{}/{}/{}.{}", dir1, dir2, hash, extension);

        if !path.exists() {
            fs::write(&path, data).await.context("Failed to write CAS file")?;
        }

        Ok((hash, relative_path))
    }

    /// Обрабатывает изображение: конвертация в WebP и ресайз (при необходимости)
    pub async fn process_image(&self, data: &[u8]) -> Result<Vec<u8>> {
        let img = image::load_from_memory(data).context("Failed to load image from memory")?;
        let mut webp_data = Vec::new();
        
        // Конвертация в WebP
        img.write_to(&mut std::io::Cursor::new(&mut webp_data), ImageFormat::WebP)
            .context("Failed to encode image to WebP")?;
            
        Ok(webp_data)
    }

    fn calculate_hash(&self, data: &[u8]) -> String {
        let mut hasher = Sha256::new();
        hasher.update(data);
        format!("{:x}", hasher.finalize())
    }
}
