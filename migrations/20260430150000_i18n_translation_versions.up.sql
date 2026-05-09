-- Up migration
CREATE TABLE IF NOT EXISTS i18n_translation_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL,
    locale TEXT NOT NULL,
    value TEXT NOT NULL,
    version_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    comment TEXT
);

CREATE INDEX idx_i18n_translation_versions_key_locale ON i18n_translation_versions(key, locale);
