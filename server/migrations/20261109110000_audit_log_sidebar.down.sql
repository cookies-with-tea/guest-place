UPDATE microfrontends
SET config = config || jsonb_build_object('subRoutes', '[
    {"path": "/users", "title": "Список пользователей"},
    {"path": "/users/rights", "title": "Права и роли"}
]'::jsonb)
WHERE name = 'users';

DELETE FROM i18n_translations WHERE key = 'general.audit_log';
