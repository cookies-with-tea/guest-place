-- Up migration: Create content_schemas table
CREATE TABLE IF NOT EXISTS content_schemas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for slug
CREATE INDEX IF NOT EXISTS idx_content_schemas_slug ON content_schemas(slug);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_content_schemas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_content_schemas_updated_at
BEFORE UPDATE ON content_schemas
FOR EACH ROW
EXECUTE FUNCTION update_content_schemas_updated_at();
