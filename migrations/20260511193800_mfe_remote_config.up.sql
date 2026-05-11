-- Add config column to microfrontends table for Remote Config Control
ALTER TABLE microfrontends ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}';
