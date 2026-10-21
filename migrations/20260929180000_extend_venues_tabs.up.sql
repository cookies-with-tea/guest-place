-- Migration: Add tabs fields to venues table (menu_photos, reviews, pricing_table, menu_url, rider_url)
ALTER TABLE venues
ADD COLUMN IF NOT EXISTS menu_photos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS pricing_table JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS menu_url TEXT,
ADD COLUMN IF NOT EXISTS rider_url TEXT;
