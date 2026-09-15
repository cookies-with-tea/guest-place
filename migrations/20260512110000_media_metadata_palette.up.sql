-- Add dominant_color, palette, and exif metadata columns to media table
ALTER TABLE media ADD COLUMN IF NOT EXISTS dominant_color VARCHAR(16);
ALTER TABLE media ADD COLUMN IF NOT EXISTS palette JSONB DEFAULT '[]'::jsonb;
ALTER TABLE media ADD COLUMN IF NOT EXISTS exif JSONB DEFAULT '{}'::jsonb;
