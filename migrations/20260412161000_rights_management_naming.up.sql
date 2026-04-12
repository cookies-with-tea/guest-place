-- no-transaction
UPDATE i18n_translations SET key = 'general.rights' WHERE key = 'general.rbac';
INSERT INTO i18n_translations (key, locale, value) VALUES
('general.rights', 'en', 'Rights Management'),
('general.rights', 'ru', 'Управление правами')
ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
