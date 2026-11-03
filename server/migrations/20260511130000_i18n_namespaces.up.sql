CREATE TABLE IF NOT EXISTS i18n_namespaces (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_dynamic BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed initial namespaces from existing data
INSERT INTO i18n_namespaces (name)
SELECT DISTINCT split_part(key, '.', 1) as name
FROM i18n_translations
WHERE key LIKE '%.%'
ON CONFLICT (name) DO NOTHING;
