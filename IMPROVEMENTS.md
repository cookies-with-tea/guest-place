# Guest Place — Открытые улучшения (server + admin-panel)

Предыдущий список (`git log -- IMPROVEMENTS.md`) закрыт полностью — детали и
доказательства по пунктам 1–5 в git-истории этого файла. По дороге также
найден и закрыт незадокументированный критический баг (CRUD пользователей
без авторизации) — см. коммит, закрывающий этот проход.

Следующий проход по дороге закрыл ещё несколько находок: управление
ролями/правами (`POST /roles/{role}/permissions`), module reload/system
alert и feature flags были защищены только `auth_middleware` без
permission-кода — добавлены `access:write`/`system:write`/`features:write`
(миграция `20261108120000_rbac_hardening`, выданы только `superadmin`); та же
миграция убрала орфанные dot-style permission-коды (`users.manage` и др.),
никогда не привязанные ни к одной роли. Плюс `handleRollback` в
admin-translations обёрнут в try/catch, `.turbo/` добавлен в `.gitignore`.

Сейчас открытых пунктов нет. `client/` не в скоупе (по решению владельца
продукта).

Отмечайте выполненные пункты `[x]` по ходу работы или просто удаляйте их.
