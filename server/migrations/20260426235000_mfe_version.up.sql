-- Add version column to microfrontends table
ALTER TABLE microfrontends ADD COLUMN IF NOT EXISTS version TEXT;

-- Update existing modules with a default version
UPDATE microfrontends SET version = '1.0.0' WHERE version IS NULL;
