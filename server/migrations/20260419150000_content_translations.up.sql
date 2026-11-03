-- Content & Schema Builder Translations
INSERT INTO i18n_translations (key, locale, value) VALUES
('general.content', 'en', 'Content Manager'),
('general.content', 'ru', 'Контент-менеджер'),
('content.schema_builder', 'en', 'Schema Builder'),
('content.schema_builder', 'ru', 'Конструктор схем')
ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
