-- Down migration: Remove name column from media
ALTER TABLE media DROP COLUMN name;
-- Note: Reverting enum values is hard in Postgres, usually not done in down migrations unless recreating the type.
