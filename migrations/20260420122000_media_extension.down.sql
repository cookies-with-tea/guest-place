-- Down migration: Remove extension column from media
ALTER TABLE media DROP COLUMN extension;
