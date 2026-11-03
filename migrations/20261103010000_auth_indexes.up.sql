-- Логин (`SELECT * FROM guest_user WHERE email = $1`) выполняется на каждый вход и делал
-- полный скан таблицы без индекса. UNIQUE заодно не даёт физически создать двух
-- пользователей с одинаковым email (до этого `fetch_optional` на дубликате молча вернул
-- бы одну из двух строк).
CREATE UNIQUE INDEX IF NOT EXISTS guest_user_email_unique_idx ON guest_user (email);

-- `/auth/refresh` (`WHERE token = $1`) и `/auth/logout/other` (`WHERE user_id = $1 AND
-- token != $2`) — оба на горячем пути аутентификации, оба делали полный скан.
CREATE UNIQUE INDEX IF NOT EXISTS refresh_token_token_unique_idx ON refresh_token (token);
CREATE INDEX IF NOT EXISTS refresh_token_user_id_idx ON refresh_token (user_id);
