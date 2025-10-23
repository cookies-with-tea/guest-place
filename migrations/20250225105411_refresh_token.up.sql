CREATE TABLE IF NOT EXISTS refresh_token (
    user_id UUID REFERENCES education_user(uuid) ON DELETE CASCADE,  -- Ссылается на UUID
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL
);
