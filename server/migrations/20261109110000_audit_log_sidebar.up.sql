INSERT INTO i18n_translations (key, locale, value) VALUES
('general.audit_log', 'en', 'Audit Log'),
('general.audit_log', 'ru', 'Журнал действий')
ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;

-- Добавляет /users/audit в сайдбар MFE users рядом со списком пользователей и правами
-- (config.subRoutes перезаписывается целиком через ||, см. 20261103030000_mfe_sub_routes).
UPDATE microfrontends
SET config = config || jsonb_build_object('subRoutes', '[
    {"path": "/users", "title": "Список пользователей"},
    {"path": "/users/rights", "title": "Права и роли"},
    {"path": "/users/audit", "title": "Журнал действий"}
]'::jsonb)
WHERE name = 'users';
