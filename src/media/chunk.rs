use std::path::{Path, PathBuf};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;
use tokio::fs;
use anyhow::{bail, Context, Result};
use sha2::{Digest, Sha256};

#[derive(Debug, Deserialize, Serialize, ToSchema, Clone)]
pub struct InitChunkUploadDTO {
    pub filename: String,
    #[serde(alias = "totalSize")]
    pub total_size: i64,
    #[serde(alias = "chunkSize")]
    pub chunk_size: usize,
    #[serde(alias = "totalChunks")]
    pub total_chunks: usize,
    #[serde(alias = "checksumSha256")]
    pub checksum_sha256: Option<String>,
    pub title: Option<String>,
    pub alt: Option<String>,
    pub category: Option<String>,
    pub tags: Option<Vec<String>>,
    pub source: Option<String>,
    #[serde(alias = "convertToWebp")]
    pub convert_to_webp: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct InitChunkUploadResponse {
    #[serde(alias = "uploadId")]
    pub upload_id: Uuid,
    #[serde(alias = "chunkSize")]
    pub chunk_size: usize,
    #[serde(alias = "totalChunks")]
    pub total_chunks: usize,
    #[serde(alias = "receivedChunks")]
    pub received_chunks: Vec<usize>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ChunkStatusResponse {
    #[serde(alias = "uploadId")]
    pub upload_id: Uuid,
    #[serde(alias = "totalChunks")]
    pub total_chunks: usize,
    #[serde(alias = "totalSize")]
    pub total_size: i64,
    #[serde(alias = "receivedChunks")]
    pub received_chunks: Vec<usize>,
    #[serde(alias = "isComplete")]
    pub is_complete: bool,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ChunkUploadResultDTO {
    #[serde(alias = "uploadId")]
    pub upload_id: Uuid,
    #[serde(alias = "chunkIndex")]
    pub chunk_index: usize,
    #[serde(alias = "receivedChunks")]
    pub received_chunks: Vec<usize>,
    #[serde(alias = "totalChunks")]
    pub total_chunks: usize,
}

#[derive(Debug, Clone)]
pub struct ChunkManager {
    chunks_dir: PathBuf,
}

impl ChunkManager {
    pub fn new(upload_dir: impl AsRef<Path>) -> Self {
        let chunks_dir = upload_dir.as_ref().join(".chunks");
        Self { chunks_dir }
    }

    fn session_dir(&self, upload_id: &Uuid) -> PathBuf {
        self.chunks_dir.join(upload_id.to_string())
    }

    fn meta_path(&self, upload_id: &Uuid) -> PathBuf {
        self.session_dir(upload_id).join("meta.json")
    }

    fn chunk_path(&self, upload_id: &Uuid, chunk_index: usize) -> PathBuf {
        self.session_dir(upload_id).join(format!("{}.part", chunk_index))
    }

    pub async fn init_session(&self, dto: InitChunkUploadDTO) -> Result<InitChunkUploadResponse> {
        let upload_id = Uuid::new_v4();
        let session_dir = self.session_dir(&upload_id);
        
        fs::create_dir_all(&session_dir)
            .await
            .context("Failed to create chunk upload session directory")?;

        let meta_json = serde_json::to_string_pretty(&dto)
            .context("Failed to serialize chunk upload metadata")?;
        
        fs::write(self.meta_path(&upload_id), meta_json)
            .await
            .context("Failed to write chunk upload metadata")?;

        Ok(InitChunkUploadResponse {
            upload_id,
            chunk_size: dto.chunk_size,
            total_chunks: dto.total_chunks,
            received_chunks: Vec::new(),
        })
    }

    pub async fn get_meta(&self, upload_id: &Uuid) -> Result<InitChunkUploadDTO> {
        let meta_path = self.meta_path(upload_id);
        if !meta_path.exists() {
            bail!("Upload session {} not found", upload_id);
        }
        let content = fs::read_to_string(meta_path)
            .await
            .context("Failed to read upload session metadata")?;
        let meta: InitChunkUploadDTO = serde_json::from_str(&content)
            .context("Failed to parse upload session metadata")?;
        Ok(meta)
    }

    pub async fn list_received_chunks(&self, upload_id: &Uuid) -> Result<Vec<usize>> {
        let session_dir = self.session_dir(upload_id);
        if !session_dir.exists() {
            bail!("Upload session {} not found", upload_id);
        }

        let mut received = Vec::new();
        let mut entries = fs::read_dir(session_dir)
            .await
            .context("Failed to read chunk session directory")?;

        while let Some(entry) = entries.next_entry().await? {
            let path = entry.path();
            if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                if file_name.ends_with(".part") {
                    if let Ok(idx) = file_name.trim_end_matches(".part").parse::<usize>() {
                        received.push(idx);
                    }
                }
            }
        }

        received.sort_unstable();
        Ok(received)
    }

    pub async fn save_chunk(
        &self,
        upload_id: &Uuid,
        chunk_index: usize,
        data: &[u8],
    ) -> Result<ChunkUploadResultDTO> {
        let meta = self.get_meta(upload_id).await?;
        if chunk_index >= meta.total_chunks {
            bail!(
                "Invalid chunk index {}: session has {} total chunks",
                chunk_index,
                meta.total_chunks
            );
        }

        let chunk_path = self.chunk_path(upload_id, chunk_index);
        fs::write(&chunk_path, data)
            .await
            .context("Failed to write chunk file")?;

        let received_chunks = self.list_received_chunks(upload_id).await?;

        Ok(ChunkUploadResultDTO {
            upload_id: *upload_id,
            chunk_index,
            received_chunks,
            total_chunks: meta.total_chunks,
        })
    }

    pub async fn get_status(&self, upload_id: &Uuid) -> Result<ChunkStatusResponse> {
        let meta = self.get_meta(upload_id).await?;
        let received_chunks = self.list_received_chunks(upload_id).await?;
        let is_complete = received_chunks.len() == meta.total_chunks;

        Ok(ChunkStatusResponse {
            upload_id: *upload_id,
            total_chunks: meta.total_chunks,
            total_size: meta.total_size,
            received_chunks,
            is_complete,
        })
    }

    pub async fn assemble(&self, upload_id: &Uuid) -> Result<(Vec<u8>, InitChunkUploadDTO)> {
        let meta = self.get_meta(upload_id).await?;
        let received = self.list_received_chunks(upload_id).await?;

        // Verify all parts exist
        let mut missing = Vec::new();
        for i in 0..meta.total_chunks {
            if !received.contains(&i) {
                missing.push(i);
            }
        }

        if !missing.is_empty() {
            bail!(
                "Cannot assemble file: missing {} chunks: {:?}",
                missing.len(),
                missing
            );
        }

        // Concatenate all chunks in order
        let mut assembled_data = Vec::with_capacity(meta.total_size as usize);
        for i in 0..meta.total_chunks {
            let part_path = self.chunk_path(upload_id, i);
            let part_data = fs::read(&part_path)
                .await
                .with_context(|| format!("Failed to read chunk {}.part", i))?;
            assembled_data.extend_from_slice(&part_data);
        }

        // Checksum verification
        let mut hasher = Sha256::new();
        hasher.update(&assembled_data);
        let actual_hash = format!("{:x}", hasher.finalize());

        if let Some(expected_hash) = &meta.checksum_sha256 {
            let expected_clean = expected_hash.trim().to_lowercase();
            if actual_hash != expected_clean {
                bail!(
                    "Checksum mismatch! Expected SHA-256 '{}', but assembled data has '{}'",
                    expected_clean,
                    actual_hash
                );
            }
        }

        // Clean up temporary chunk session directory
        let session_dir = self.session_dir(upload_id);
        if let Err(e) = fs::remove_dir_all(&session_dir).await {
            tracing::warn!("Failed to remove chunk session dir {:?}: {}", session_dir, e);
        }

        Ok((assembled_data, meta))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sha2::{Digest, Sha256};

    #[tokio::test]
    async fn test_chunk_lifecycle_with_checksum() {
        let temp_dir = std::env::temp_dir().join(format!("chunk_test_{}", Uuid::new_v4()));
        let manager = ChunkManager::new(&temp_dir);

        let data = b"Hello, local chunked upload world! This is a test file.";
        let chunk_size = 15;
        let total_chunks = (data.len() + chunk_size - 1) / chunk_size;

        let mut hasher = Sha256::new();
        hasher.update(data);
        let expected_checksum = format!("{:x}", hasher.finalize());

        let init_dto = InitChunkUploadDTO {
            filename: "hello.txt".to_string(),
            total_size: data.len() as i64,
            chunk_size,
            total_chunks,
            checksum_sha256: Some(expected_checksum.clone()),
            title: Some("Hello Title".to_string()),
            alt: Some("Hello Alt".to_string()),
            category: Some("Test".to_string()),
            tags: Some(vec!["chunk".to_string(), "resumable".to_string()]),
            source: Some("test".to_string()),
            convert_to_webp: Some(false),
        };

        // 1. Init
        let init_resp = manager.init_session(init_dto).await.expect("init failed");
        assert_eq!(init_resp.total_chunks, total_chunks);
        assert!(init_resp.received_chunks.is_empty());

        // 2. Save chunks
        for i in 0..total_chunks {
            let start = i * chunk_size;
            let end = (start + chunk_size).min(data.len());
            let chunk_slice = &data[start..end];
            let res = manager.save_chunk(&init_resp.upload_id, i, chunk_slice).await.expect("save chunk failed");
            assert_eq!(res.chunk_index, i);
            assert_eq!(res.received_chunks.len(), i + 1);
        }

        // 3. Status
        let status = manager.get_status(&init_resp.upload_id).await.expect("status failed");
        assert!(status.is_complete);
        assert_eq!(status.received_chunks.len(), total_chunks);

        // 4. Assemble
        let (assembled, meta) = manager.assemble(&init_resp.upload_id).await.expect("assemble failed");
        assert_eq!(assembled, data);
        assert_eq!(meta.filename, "hello.txt");
        assert_eq!(meta.title.as_deref(), Some("Hello Title"));

        // Clean up root
        let _ = fs::remove_dir_all(&temp_dir).await;
    }

    #[tokio::test]
    async fn test_checksum_mismatch_fails() {
        let temp_dir = std::env::temp_dir().join(format!("chunk_test_mismatch_{}", Uuid::new_v4()));
        let manager = ChunkManager::new(&temp_dir);

        let data = b"Some data that will fail checksum verification";
        let init_dto = InitChunkUploadDTO {
            filename: "mismatch.txt".to_string(),
            total_size: data.len() as i64,
            chunk_size: data.len(),
            total_chunks: 1,
            checksum_sha256: Some("0000000000000000000000000000000000000000000000000000000000000000".to_string()),
            title: None,
            alt: None,
            category: None,
            tags: None,
            source: None,
            convert_to_webp: None,
        };

        let init_resp = manager.init_session(init_dto).await.expect("init failed");
        manager.save_chunk(&init_resp.upload_id, 0, data).await.expect("save failed");

        let result = manager.assemble(&init_resp.upload_id).await;
        assert!(result.is_err());
        let err_msg = result.unwrap_err().to_string();
        assert!(err_msg.contains("Checksum mismatch"), "Unexpected error: {}", err_msg);

        let _ = fs::remove_dir_all(&temp_dir).await;
    }

    #[tokio::test]
    async fn test_missing_chunk_fails() {
        let temp_dir = std::env::temp_dir().join(format!("chunk_test_missing_{}", Uuid::new_v4()));
        let manager = ChunkManager::new(&temp_dir);

        let init_dto = InitChunkUploadDTO {
            filename: "missing.txt".to_string(),
            total_size: 100,
            chunk_size: 50,
            total_chunks: 2,
            checksum_sha256: None,
            title: None,
            alt: None,
            category: None,
            tags: None,
            source: None,
            convert_to_webp: None,
        };

        let init_resp = manager.init_session(init_dto).await.expect("init failed");
        // Save only chunk 0, skipping chunk 1
        manager.save_chunk(&init_resp.upload_id, 0, b"first chunk").await.expect("save failed");

        let result = manager.assemble(&init_resp.upload_id).await;
        assert!(result.is_err());
        let err_msg = result.unwrap_err().to_string();
        assert!(err_msg.contains("missing 1 chunks"), "Unexpected error: {}", err_msg);

        let _ = fs::remove_dir_all(&temp_dir).await;
    }
}
