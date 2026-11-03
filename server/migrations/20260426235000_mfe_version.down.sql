-- Remove version column from microfrontends table
ALTER TABLE microfrontends DROP COLUMN IF EXISTS version;
