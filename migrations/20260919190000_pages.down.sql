-- Down migration: Drop pages and block_types tables
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS block_types CASCADE;
