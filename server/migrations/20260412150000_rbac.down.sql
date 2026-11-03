DROP TABLE IF EXISTS roles_permissions;
DROP TABLE IF EXISTS permissions;

-- Note: user_role enum values cannot be easily removed in PostgreSQL without recreating the type or using complex hacks.
-- We keep them as is for safety.
