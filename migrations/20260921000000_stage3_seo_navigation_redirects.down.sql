-- Down migration: Revert Stage 3 SEO, Navigation & Redirects

DROP TABLE IF EXISTS redirects;
DROP TABLE IF EXISTS menus;

DROP INDEX IF EXISTS idx_pages_parent_id;
ALTER TABLE pages DROP COLUMN IF EXISTS parent_id;
