-- Add optimized_path and blurhash to media table
ALTER TABLE media ADD COLUMN IF NOT EXISTS optimized_path TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS blurhash TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS width INTEGER;
ALTER TABLE media ADD COLUMN IF NOT EXISTS height INTEGER;
