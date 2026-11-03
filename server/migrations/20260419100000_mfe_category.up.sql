-- Add category column to microfrontends table
ALTER TABLE microfrontends ADD COLUMN category TEXT NOT NULL DEFAULT 'system';

-- Update display name for About MFE if it exists, or just ensure we have a category
-- (We'll seed the about MFE later)
