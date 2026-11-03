-- Up migration: content_translation_refs — tracks which content entry/field a
-- {key:namespace.key} i18n tag (see admin-panel/packages/i18n/parser.ts) is used in.
-- Resynced wholesale on every content entry create/update/rollback (server/src/content/translation_refs.rs).

CREATE TABLE IF NOT EXISTS content_translation_refs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_entry_id UUID NOT NULL REFERENCES content_entries(id) ON DELETE CASCADE,
    field_path TEXT NOT NULL,
    translation_key TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (content_entry_id, field_path, translation_key)
);

CREATE INDEX IF NOT EXISTS idx_content_translation_refs_key ON content_translation_refs(translation_key);
CREATE INDEX IF NOT EXISTS idx_content_translation_refs_entry ON content_translation_refs(content_entry_id);
