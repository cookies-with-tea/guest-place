-- Add is_singleton column to content_schemas
ALTER TABLE content_schemas ADD COLUMN is_singleton BOOLEAN DEFAULT FALSE;
