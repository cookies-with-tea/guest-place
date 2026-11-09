-- Админские действия (создание/удаление/смена роли пользователя, изменение прав роли,
-- удаление медиа, login/logout) нигде не логировались — см. IDEAS.md. Версионировались
-- только content_entries/i18n_translations, остального не было вообще.
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- NULL, если актёра определить не удалось (например login с невалидными
    -- credentials — но такие попытки сюда и не пишутся, см. src/audit/mod.rs) или
    -- пользователь-актёр был позже удалён (ON DELETE SET NULL — сама запись audit
    -- важнее ссылочной целостности на уже не существующего пользователя).
    actor_user_id UUID REFERENCES guest_user(uuid) ON DELETE SET NULL,
    -- Денормализованный снимок на момент действия — переживает удаление/переименование
    -- пользователя, не нужно JOIN'ить guest_user только чтобы показать, кто это был.
    actor_email TEXT,
    -- 'user.create' | 'user.update' | 'user.delete' | 'role.permissions_update' |
    -- 'media.delete' | 'media.delete_all' | 'auth.login' | 'auth.logout'
    action TEXT NOT NULL,
    entity_type TEXT,
    -- TEXT, не UUID: entity_id роли — её имя ('admin', 'editor'), не UUID.
    entity_id TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor_user_id ON audit_log(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);

-- Просмотр журнала — самая чувствительная read-операция в системе (история всех
-- админских действий): выдаётся только superadmin, по аналогии с access:write/
-- system:write/features:write (см. 20261108120000_rbac_hardening).
INSERT INTO permissions (id, name, description) VALUES
('audit:read', 'Read Audit Log', 'Allow viewing the admin action audit log')
ON CONFLICT (id) DO NOTHING;

INSERT INTO roles_permissions (role, permission_id) VALUES
('superadmin', 'audit:read')
ON CONFLICT DO NOTHING;
