DROP INDEX IF EXISTS idx_media_folders_parent_id;
DROP INDEX IF EXISTS idx_media_content_hash;
DROP INDEX IF EXISTS idx_media_folder_id;
ALTER TABLE media DROP COLUMN IF EXISTS content_hash;
ALTER TABLE media DROP COLUMN IF EXISTS folder_id;
DROP TABLE IF EXISTS media_folders;
