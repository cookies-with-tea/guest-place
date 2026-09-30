-- Migration: Revert tabs fields from venues table
ALTER TABLE venues
DROP COLUMN IF EXISTS menu_photos,
DROP COLUMN IF EXISTS reviews,
DROP COLUMN IF EXISTS pricing_table,
DROP COLUMN IF EXISTS menu_url,
DROP COLUMN IF EXISTS rider_url;
