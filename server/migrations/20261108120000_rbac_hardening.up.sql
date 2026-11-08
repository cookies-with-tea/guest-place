-- До сих пор следующие операции проверялись только auth_middleware (валидный
-- JWT), без permission-кода — любой залогиненный пользователь мог управлять
-- ролями/правами, перезагружать модули, слать системные алерты и переключать
-- feature flags ровно как Superadmin. См. IMPROVEMENTS.md.
INSERT INTO permissions (id, name, description) VALUES
('access:write', 'Manage Roles & Permissions', 'Allow changing which permissions a role has'),
('system:write', 'Manage System', 'Allow reloading modules and sending system alerts'),
('features:write', 'Write Feature Flags', 'Allow toggling feature flags')
ON CONFLICT (id) DO NOTHING;

-- Это самые чувствительные операции в системе (управление доступом, reload
-- модулей, системные алерты, feature flags) — выдаются только superadmin,
-- остальные роли их не получают по умолчанию.
INSERT INTO roles_permissions (role, permission_id) VALUES
('superadmin', 'access:write'),
('superadmin', 'system:write'),
('superadmin', 'features:write')
ON CONFLICT DO NOTHING;

-- Орфанные permission-коды из более старой (dot-style) схемы именования —
-- ни одна миграция никогда не привязывала их ни к одной роли в
-- roles_permissions, а текущая colon-style схема (mfe:write, media:write, ...)
-- их не использует. Мёртвый груз, путающий админку/аудит доступа.
DELETE FROM roles_permissions
WHERE permission_id IN ('users.view', 'users.manage', 'content.edit', 'settings.manage', 'access.manage');

DELETE FROM permissions
WHERE id IN ('users.view', 'users.manage', 'content.edit', 'settings.manage', 'access.manage');
