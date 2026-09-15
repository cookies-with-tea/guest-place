-- Add variants column to media table for responsive WebP/image sizes
ALTER TABLE media ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '{}'::jsonb;
