INSERT INTO i18n_translations (key, locale, value) VALUES
('general.rbac', 'en', 'RBAC'),
('general.rbac', 'ru', 'Управление правами')
ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;

-- Ensure default permissions exist
INSERT INTO permissions (id, name) VALUES
('users.view', 'View Users'),
('users.manage', 'Manage Users'),
('content.edit', 'Edit Content'),
('settings.manage', 'Manage Settings'),
('rbac.manage', 'Manage RBAC')
ON CONFLICT (id) DO NOTHING;
