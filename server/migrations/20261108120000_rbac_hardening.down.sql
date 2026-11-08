DELETE FROM roles_permissions WHERE permission_id IN ('access:write', 'system:write', 'features:write');
DELETE FROM permissions WHERE id IN ('access:write', 'system:write', 'features:write');

INSERT INTO permissions (id, name) VALUES
('users.view', 'View Users'),
('users.manage', 'Manage Users'),
('content.edit', 'Edit Content'),
('settings.manage', 'Manage Settings'),
('access.manage', 'Manage Access Control')
ON CONFLICT (id) DO NOTHING;
