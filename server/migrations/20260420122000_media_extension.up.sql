-- Up migration: Add extension column to media
ALTER TABLE media ADD COLUMN extension TEXT;

-- Update existing records to extract extension from URL
UPDATE media SET extension = split_part(url, '.', array_length(string_to_array(url, '.'), 1));
