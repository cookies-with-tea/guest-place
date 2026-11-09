DROP INDEX IF EXISTS idx_content_entries_scheduled_at;
DROP INDEX IF EXISTS idx_pages_scheduled_at;
ALTER TABLE content_entries DROP COLUMN IF EXISTS scheduled_at;
ALTER TABLE pages DROP COLUMN IF EXISTS scheduled_at;
