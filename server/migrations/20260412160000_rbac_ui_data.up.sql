INSERT INTO i18n_translations (key, locale, value) VALUES
('general.access_control', 'en', 'Access Control'),
('general.access_control', 'ru', 'Управление правами')
ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;

-- Ensure default access permissions exist
INSERT INTO permissions (id, name) VALUES
('users.view', 'View Users'),
('users.manage', 'Manage Users'),
('content.edit', 'Edit Content'),
('settings.manage', 'Manage Settings'),
('access.manage', 'Manage Access Control')
ON CONFLICT (id) DO NOTHING;
