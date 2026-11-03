-- Seeds `config.titleKey` for each currently-registered MFE with the same i18n key
-- ROUTES.ts used to hardcode, so the sidebar shows nothing new by default — but the
-- value is now admin-editable (Orchestrator → Modules → "Заголовок в сайдбаре"),
-- read by admin-shell's loadRemoteRoutes() in preference to the ROUTES.ts default.
-- Merges into existing `config` (e.g. `disabledRoutes`) rather than replacing it.
UPDATE microfrontends SET config = config || jsonb_build_object('titleKey', v.title_key)
FROM (VALUES
    ('orchestrator', 'menu.orchestrator'),
    ('statistics', 'menu.dashboard'),
    ('translations', 'menu.translations'),
    ('users', 'menu.users'),
    ('media', 'menu.media'),
    ('content', 'menu.schemas'),
    ('profile', 'menu.profile')
) AS v(name, title_key)
WHERE microfrontends.name = v.name;
