-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
);

-- Create roles_permissions table
CREATE TABLE IF NOT EXISTS roles_permissions (
    role user_role NOT NULL,
    permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role, permission_id)
);

-- Seed default permissions
INSERT INTO permissions (id, name, description) VALUES
('mfe:read', 'Read Microfrontends', 'Allow viewing microfrontends list and details'),
('mfe:write', 'Write Microfrontends', 'Allow creating and editing microfrontends'),
('user:read', 'Read Users', 'Allow viewing users list and details'),
('user:write', 'Write Users', 'Allow creating and editing users'),
('i18n:read', 'Read Translations', 'Allow viewing translations'),
('i18n:write', 'Write Translations', 'Allow editing translations'),
('media:read', 'Read Media', 'Allow viewing media files'),
('media:write', 'Write Media', 'Allow uploading and deleting media files'),
('about:write', 'Write About', 'Allow editing about information')
ON CONFLICT (id) DO NOTHING;

-- Seed default roles permissions
INSERT INTO roles_permissions (role, permission_id) VALUES
('superadmin', 'mfe:read'), ('superadmin', 'mfe:write'),
('superadmin', 'user:read'), ('superadmin', 'user:write'),
('superadmin', 'i18n:read'), ('superadmin', 'i18n:write'),
('superadmin', 'media:read'), ('superadmin', 'media:write'),
('superadmin', 'about:write'),
('admin', 'mfe:read'), ('admin', 'mfe:write'),
('admin', 'user:read'), ('admin', 'i18n:read'), ('admin', 'i18n:write'),
('admin', 'media:read'), ('admin', 'media:write'),
('editor', 'i18n:read'), ('editor', 'i18n:write'),
('editor', 'media:read'), ('editor', 'media:write'),
('user', 'media:read')
ON CONFLICT DO NOTHING;
