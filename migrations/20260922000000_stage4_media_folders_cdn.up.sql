-- Stage 4: Media Folders & CDN Cache-Busting
CREATE TABLE IF NOT EXISTS media_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    parent_id UUID REFERENCES media_folders(id) ON DELETE CASCADE,
    color TEXT DEFAULT '#409EFF',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE media ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES media_folders(id) ON DELETE SET NULL;
ALTER TABLE media ADD COLUMN IF NOT EXISTS content_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_media_folder_id ON media(folder_id);
CREATE INDEX IF NOT EXISTS idx_media_content_hash ON media(content_hash);
CREATE INDEX IF NOT EXISTS idx_media_folders_parent_id ON media_folders(parent_id);
