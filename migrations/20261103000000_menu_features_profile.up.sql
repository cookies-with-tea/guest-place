INSERT INTO i18n_translations (key, locale, value) VALUES
('menu.features', 'en', 'Features'),
('menu.features', 'ru', 'Возможности'),
('menu.profile', 'en', 'Profile'),
('menu.profile', 'ru', 'Профиль')
ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
