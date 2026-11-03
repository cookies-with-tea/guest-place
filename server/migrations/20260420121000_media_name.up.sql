-- Up migration: Add name column to media and expand media_type
ALTER TABLE media ADD COLUMN name TEXT;

-- Update existing records to have name equal to title or url
UPDATE media SET name = COALESCE(title, split_part(url, '/', array_length(string_to_array(url, '/'), 1)));

-- Alter type to add new types if possible (Note: Postgres doesn't allow ALTER TYPE ... ADD VALUE in transaction before 12, but we are fine here usually)
ALTER TYPE media_type ADD VALUE 'document';
ALTER TYPE media_type ADD VALUE 'archive';
ALTER TYPE media_type ADD VALUE 'other';
