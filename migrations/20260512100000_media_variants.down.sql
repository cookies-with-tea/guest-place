-- Remove variants column from media table
ALTER TABLE media DROP COLUMN IF EXISTS variants;
