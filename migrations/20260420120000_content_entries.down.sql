-- Down migration: Drop content_entries table
DROP TABLE IF EXISTS content_entries;
DROP FUNCTION IF EXISTS update_content_entries_updated_at();
