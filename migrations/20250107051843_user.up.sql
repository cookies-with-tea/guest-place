CREATE TABLE IF NOT EXISTS education_user
(
    uuid        UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    first_name  TEXT             NOT NULL DEFAULT '',
    second_name TEXT             NOT NULL DEFAULT '',
    last_name   TEXT             NOT NULL DEFAULT '',
    phone       TEXT             NOT NULL DEFAULT '',
    birth_date  DATE,
    password_hash    TEXT             NOT NULL DEFAULT '',
    avatar TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMP        NOT NULL DEFAULT NOW()
);
