-- Down migration: Rollback Stage 2 draft & publish system
DROP INDEX IF EXISTS idx_pages_status;
DROP INDEX IF EXISTS idx_content_entries_status;

ALTER TABLE pages 
    DROP COLUMN IF EXISTS published_at,
    DROP COLUMN IF EXISTS published_by;

ALTER TABLE content_entries 
    DROP COLUMN IF EXISTS published_at,
    DROP COLUMN IF EXISTS published_by;
