-- Up migration: Create content_entries table
CREATE TABLE IF NOT EXISTS content_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schema_id UUID NOT NULL REFERENCES content_schemas(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft',
    i18n JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(schema_id, slug)
);

-- Index for schema_id and slug
CREATE INDEX IF NOT EXISTS idx_content_entries_schema_id ON content_entries(schema_id);
CREATE INDEX IF NOT EXISTS idx_content_entries_slug ON content_entries(slug);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_content_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_content_entries_updated_at
BEFORE UPDATE ON content_entries
FOR EACH ROW
EXECUTE FUNCTION update_content_entries_updated_at();
