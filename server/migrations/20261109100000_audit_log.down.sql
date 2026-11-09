DELETE FROM roles_permissions WHERE permission_id = 'audit:read';
DELETE FROM permissions WHERE id = 'audit:read';

DROP TABLE IF EXISTS audit_log;
