-- no-transaction
UPDATE i18n_translations SET key = 'general.access_control' WHERE key = 'general.rbac';
INSERT INTO i18n_translations (key, locale, value) VALUES
('general.access_control', 'en', 'Access Control'),
('general.access_control', 'ru', 'Управление правами')
ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
