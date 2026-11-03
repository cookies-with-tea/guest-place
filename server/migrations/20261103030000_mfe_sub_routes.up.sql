-- Seeds `config.subRoutes` ([{path, title}]) for each currently-registered MFE with
-- the same list `admin-orchestrator`'s KNOWN_MFE_ROUTES used to hardcode (itself mirrored,
-- for users/orchestrator, in TopologyPage.vue's chart data with a `// TODO: Подгружать с
-- API` comment) — see IMPROVEMENTS.md section 4. Both now read this field instead.
-- Merges into existing `config` (e.g. `titleKey`, `disabledRoutes`) rather than replacing it.
UPDATE microfrontends SET config = config || jsonb_build_object('subRoutes', v.sub_routes)
FROM (VALUES
    ('orchestrator', '[
        {"path": "/orchestrator", "title": "Топология системы"},
        {"path": "/orchestrator/modules", "title": "Модули (MFE)"},
        {"path": "/orchestrator/monitoring", "title": "Мониторинг ресурсов"},
        {"path": "/orchestrator/features", "title": "Feature Flags"},
        {"path": "/orchestrator/logs", "title": "Логи системы"}
    ]'::jsonb),
    ('users', '[
        {"path": "/users", "title": "Список пользователей"},
        {"path": "/users/rights", "title": "Права и роли"}
    ]'::jsonb),
    ('content', '[{"path": "/content", "title": "Схемы контента"}]'::jsonb),
    ('translations', '[{"path": "/translations", "title": "Переводы интерфейса"}]'::jsonb),
    ('media', '[{"path": "/media", "title": "Медиабиблиотека"}]'::jsonb),
    ('profile', '[{"path": "/profile", "title": "Профиль"}]'::jsonb),
    ('statistics', '[{"path": "/statistics", "title": "Аналитика и статистика"}]'::jsonb)
) AS v(name, sub_routes)
WHERE microfrontends.name = v.name;
