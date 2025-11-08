CREATE TABLE IF NOT EXISTS i18n_translations (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    key TEXT NOT NULL,
    locale TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(key, locale)
);

INSERT INTO i18n_translations (key, locale, value) VALUES
('user.created', 'en', 'User successfully created'),
('user.created', 'ru', 'Пользователь успешно создан'),
('user.phone_exists', 'en', 'User with this phone number already exists'),
('user.phone_exists', 'ru', 'Пользователь с таким номером телефона уже существует'),
('general.internal_error', 'en', 'Internal server error'),
('general.internal_error', 'ru', 'Внутренняя ошибка сервера')
ON CONFLICT (key, locale) DO NOTHING;
