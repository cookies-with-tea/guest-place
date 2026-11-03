-- Add size_bytes to media table
ALTER TABLE media ADD COLUMN size_bytes BIGINT NOT NULL DEFAULT 0;
