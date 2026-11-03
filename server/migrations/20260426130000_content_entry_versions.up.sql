-- Up migration: Create content_entry_versions table
CREATE TABLE IF NOT EXISTS content_entry_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL REFERENCES content_entries(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    i18n JSONB NOT NULL,
    version_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID, -- Can be linked to users table if needed later
    comment TEXT
);

-- Index for entry_id to speed up history retrieval
CREATE INDEX IF NOT EXISTS idx_content_entry_versions_entry_id ON content_entry_versions(entry_id);

-- Down migration (to be kept in a separate file usually, but here for reference)
-- DROP TABLE IF EXISTS content_entry_versions;
