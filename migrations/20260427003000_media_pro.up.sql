-- Add category and tags to media table
ALTER TABLE media ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create index for faster filtering and potential full-text search
CREATE INDEX IF NOT EXISTS idx_media_category ON media(category);
CREATE INDEX IF NOT EXISTS idx_media_tags ON media USING GIN(tags);
