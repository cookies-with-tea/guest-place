BEGIN;

-- DEBT: Добавить icon
CREATE TYPE media_type AS ENUM ('video', 'image');

CREATE TABLE IF NOT EXISTS "media"
(
   uuid            UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
   media_type            media_type  NOT NULL DEFAULT 'image',
   url              TEXT,
   alt            TEXT,
   title          TEXT
);

COMMIT;
