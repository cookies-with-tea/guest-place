-- Revert dominant_color, palette, and exif metadata columns from media table
ALTER TABLE media DROP COLUMN IF EXISTS dominant_color;
ALTER TABLE media DROP COLUMN IF EXISTS palette;
ALTER TABLE media DROP COLUMN IF EXISTS exif;
