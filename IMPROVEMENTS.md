# Guest Place — План улучшений (новый, 2026-10-31)

Предыдущий список (`git log -- IMPROVEMENTS.md`) закрыт полностью, кроме
одного архитектурного пункта, перенесённого сюда как раздел 0. Этот список
составлен по итогам нового прохода: точечный запрос — убрать "сырые" ключи
переводов (`general.about` и т.п.) из UI админки — плюс то, что нашлось
по дороге.

Отмечайте выполненные пункты `[x]` по ходу работы.

---

## 0. Перенесено из предыдущего списка — не закрыто

- [x] **`make check-api-drift` / `make smoke-test` не подключены к GitHub
      Actions** — решение (по запросу владельца продукта): создана ветка
      `main-v2` от `main`, в неё влиты `server-update` (→ `server/`) и
      `admin-panel-update` (→ `admin-panel/`) через `git read-tree
      --prefix=.../ -u` (история обеих веток сохранена полностью, не
      squash). `.gitignore` больше не исключает `/server/`/`/admin-panel/`
      — теперь трекаются напрямую на этой ветке. Добавлены три воркфлоу
      в `.github/workflows/`: `check-api-drift.yml`, `smoke-test.yml`
      (оба наконец возможны — нужны server/ и admin-panel/ в одном
      чекауте) и `admin-panel-ci.yml` (перенос
      `admin-panel/.github/workflows/ci.yml` — GitHub ищет воркфлоу
      только в `.github/workflows/` корня ветки, а `admin-panel/` теперь
      подпапка, не отдельная ветка). Ветка запушена:
      https://github.com/cookies-with-tea/guest-place/tree/main-v2

      Проверено локально (не только "написал YAML и понадеялся"):
      `make check-api-drift` — сначала упал на реальном дрифте
      (`admin-panel/packages/lib/src/api/types.ts` не совпадал с
      перегенерированным; `server/openapi.json` дрифта не имел —
      расхождение было только в порядке путей из-за более новой версии
      `openapi-typescript` в lock-файле), перегенерировал и
      закоммитил — теперь проходит чисто. `pnpm lint`/`type-check`/`build`
      в `admin-panel/` в свежем (без кеша) чекауте этой ветки — все
      15/15 задач успешны. `make smoke-test` руками не гонял — он поднял
      бы `docker compose up -d db redis` с теми же **фиксированными**
      именами контейнеров (`guest-place-db`/`guest-place-redis`), что и
      основной dev-стек на этой машине, а значит тронул бы чужую реальную
      dev-БД — вместо этого проверены по отдельности все компоненты,
      которые он оркеструет (миграции и поднятие сервера, dev-серверы
      admin-panel — оба уже гонялись живьём в этом же проходе по другим
      пунктам списка).

  **TODO на будущее (прямое указание владельца продукта, не доделано в
  этом проходе)**: `client/` сейчас НЕ влит в `main-v2` — его ветка
  (`client-update`) на момент работы содержала незакоммиченные локальные
  правки поверх своей последней версии, трогать не стал. Когда это
  готово — встроить таким же `read-tree --prefix=client/`-слиянием
  (`client-update` сначала надо откатить/привести к состоянию,
  пригодному для мержа — так и было сформулировано задание), и либо
  домержить `main-v2` в `main` и удалить старые ветки
  (`server`/`server-update`/`admin-panel`/`admin-panel-update`/`client`/
  `client-update`), либо сделать `main-v2` новым `main` через force-push
  (первое безопаснее — обычный merge, без переписывания истории
  `main`).

---

## 1. Переводы: ключи без перевода показываются как есть в UI

Проверено так: вытащен список всех `t('namespace.key')`/`title: 'namespace.key'`
ссылок по всему `admin-panel` (`packages`+`apps`, только реальные
строковые литералы, не JS property-access) и сверен с полным списком
ключей, реально засеянных в БД (`server/migrations/*.sql`, все
`INSERT INTO i18n_translations`-подобные миграции). Несовпадения — ниже.

- [x] **`packages/lib/src/constants/routes.ts`: заголовки пунктов меню
      используют несуществующий namespace `general.*`, хотя для
      большинства из них уже засеян правильный `menu.*`** — простая
      опечатка/рассинхрон, не "нет перевода":
      - `general.users` → `menu.users` (засеяно) — сделано
      - `general.translations` → `menu.translations` (засеяно) — сделано
      - `general.media` → `menu.media` (засеяно) — сделано
      - `general.orchestrator` → `menu.orchestrator` (засеяно) — сделано
      - `general.guests` → запись удалена целиком (см. пункт 2, MFE удалён)
      - `general.about` → запись удалена целиком (см. пункт 2, MFE удалён)
      - `general.features` → засеян новый ключ `menu.features` (миграция
        `20261103000000_menu_features_profile`), `ROUTES.orchestrator.features.title`
        переключён на него
      - `general.rights` → переиспользован уже существующий
        `general.access_control` (ровно то же значение — "Access
        Control"/"Управление правами" — было переименовано туда ранее
        миграцией `20260412161000_rights_management_naming`, но
        `ROUTES.ts` не обновили); новый ключ не создавал
      - `general.profile` → засеян новый ключ `menu.profile` (та же
        миграция), `ROUTES.profile.title` переключён на него
      - Доп. находка при разборе (не было в списке): `ROUTES.users` и
        `ROUTES.orchestrator` — вложенные конфиги без своего
        **верхнеуровневого** `title`; `admin-shell`'s
        `loadRemoteRoutes()` берёт заголовок ГРУППЫ в сайдбаре именно из
        верхнеуровневого `title` и, если его нет, подставляет raw
        `general.${remote.name}` — т.е. заголовок группы "Users"/
        "Orchestrator" в сайдбаре показывал бы сырой ключ, даже если
        поправить только вложенные `list.title`/`rights.title`. Добавил
        `title: 'menu.users'` и `title: 'menu.orchestrator'` на верхний
        уровень обоих конфигов.
- [x] **`admin-panel/apps/admin-statistics` вообще не упомянут в
      `ROUTES`** — добавлена запись `statistics: { name:
      'StatisticsDashboard', title: 'menu.dashboard', icon: 'TrendCharts'
      }`; `apps/admin-statistics/src/app/router/index.ts` теперь берёт
      `name`/`meta.title` из `ROUTES.statistics` вместо захардкоженного
      `'StatisticsDashboard'` без `meta.title`.
- [x] **`apps/admin-profile/src/app/App.vue:23`: `title: 'menu.profile'`**
      — решено одним переводом на оба места: `ROUTES.profile.title`
      переключён на `menu.profile` (App.vue уже использовал этот ключ,
      его не трогал), ключ засеян миграцией.
- [x] **`apps/admin-users/.../UsersPage.vue:3`: `<h1>{{ t('users.title') }}</h1>`**
      — заменено на `t('menu.users')` (тот же текст, что и в сайдбаре).
- [x] **Там же, `UsersPage.vue:4-5` — мусор от отладки** — обе строки
      удалены.
- [ ] **(шире, отдельный проход)** По коду вперемешку с переводами
      встречается хардкоженный английский/русский текст в шаблонах, мимо
      `t()`/`ContentFromCMS` — например `<el-button>Add Entry</el-button>`
      в `admin-content/.../ContentPage.vue`, `<el-checkbox>Auto-convert to
      WebP</el-checkbox>` в `admin-media/.../MediaUploadGlobalSettings.vue`.
      Не каталогизировал исчерпывающе (масштаб похож на отдельную,
      более длинную задачу) — но раз требование "вся админка должна
      быть в переводах", этот более широкий аудит стоит сделать отдельным
      проходом по каждому MFE, а не точечно.

---

## 2. `ROUTES.ts`: мёртвые записи для удалённых MFE

`packages/lib/src/constants/routes.ts` всё ещё содержит записи `about` и
`guests` (а до недавнего использовался и `platforms` — он уже переведён на
`menu.platforms` и используется для Schema Builder-страницы, не трогать).
`admin-about`/`admin-guests` как MFE удалены (раздел 9.3.2 в истории
коммитов — заменены Schema Builder), но записи в `ROUTES` остались и
сейчас просто мёртвый код (ссылаются на несуществующие пункты меню) —
заодно источник одной из переводческих дыр выше. Удалить `about`/`guests`
из `ROUTES` при фиксе раздела 1.

- [x] Удалить мёртвые `about`/`guests` записи из `ROUTES.ts`. Проверено,
      что на `ROUTES.about`/`ROUTES.guests` больше нигде нет ссылок.

---

## 3. Server: `cargo audit` — одна формально critical находка, реально
      не эксплуатируема в этом приложении

`cargo audit` (после фикса `lettre` в прошлом проходе) всё ещё находит
25 проблем в транзитивных зависимостях — большинство реально глубоко
закопаны (`sqlx`/`redis`/TLS-стек) и требуют крупного апгрейда дерева
зависимостей, не точечного фикса. Одна выделяется severity-меткой:

- [ ] **`zip` crate, severity 9.1 critical** ("ZipArchive::extract()
      применяет Unix-права через симлинки без ограничения цели" —
      classic zip-slip). НО: это **build-dependency** `utoipa-swagger-ui`
      (`cargo tree -i zip` → только `[build-dependencies]`), распаковывает
      только vendored zip с ассетами Swagger UI во время `cargo build`,
      не вызывается на пользовательском вводе ни в одном runtime
      код-пути. Реальный риск в этом приложении низкий несмотря на
      метку — но стоит проверить снова после следующего апдейта
      `utoipa-swagger-ui` (возможно подтянет пофикшенный `zip`
      автоматически), не требует немедленного действия.

---

## 4. Мелкое, перенесено из TODO-комментариев в коде

- [x] `packages/lib/src/constants/routes.ts:1` — `// TODO: Переписать на
      подрузку из админки` — по запросу владельца продукта: заголовок/иконка
      пункта меню каждого MFE в сайдбаре теперь читаются в первую очередь
      из `microfrontends.config.titleKey` / `microfrontends.icon` (уже
      существующая, уже редактируемая из админки таблица — там же раньше
      жил `disabledRoutes` для фичи "выключить пункт меню"), а
      `ROUTES.ts`-запись используется только как дефолт для
      незакастомизированного MFE. `admin-shell`'s `loadRemoteRoutes()`:
      приоритет `remote.config?.titleKey || routeConfig?.title || ...`
      (было наоборот — статика всегда побеждала БД). Добавлено поле
      "Заголовок в сайдбаре (ключ перевода)" в `ModuleFormDialog.vue`
      (диалог создания/редактирования MFE в Orchestrator → Modules),
      пишет в `config.titleKey` тем же `mfeApi.update()`, что уже
      использовался для `disabledRoutes` — бэкенд не трогал, `config`
      там и так был generic JSONB. Миграция
      `20261103020000_mfe_title_keys` засеяла `titleKey` текущими
      значениями из `ROUTES.ts` для всех 7 активных MFE (ничего не
      меняется визуально по умолчанию, но теперь редактируемо).
      Вложенные под-пункты (`list`/`rights`/`features`) остались
      статикой в коде осознанно — это `meta.title` в роутере каждого MFE,
      выставляется на этапе создания роутов синхронно; сделать и их
      динамическими означало бы переписывать бутстрап роутера каждого
      MFE на асинхронное ожидание конфига до `createRouter()` — риск
      несоразмерен ценности для вложенных пунктов, которых не так много.

      Попутно нашёл и убрал настоящий мёртвый код того же класса, что и
      раздел 2: `ROUTES.platforms` (MFE `admin-platforms`/`platforms`
      удалён миграцией `20261028110000_retire_legacy_pages`, но запись
      в `ROUTES.ts` осталась) и три таких же мёртвых записи
      (`about`/`guests`/`platforms`) в
      `useModuleRoutes.ts`'s `KNOWN_MFE_ROUTES`.

      Проверено живым Postgres (throwaway БД): после пересборки
      бинарника (новый файл миграции не подхватился без recompile —
      `sqlx::migrate!()` встраивает список на этапе компиляции) миграция
      применяется и `config.titleKey` корректно проставляется для всех 7
      MFE. `pnpm type-check` на `admin-orchestrator`/`admin-shell`/
      `@admin-panel/lib` — чисто.
- [x] `apps/admin-orchestrator/src/pages/topology-page/TopologyPage.vue:123`
      — `// TODO: Подгружать с API`. Решил не заводить отдельный
      backend-эндпоинт — переиспользовал тот же механизм, что и в пункте
      выше: `config.subRoutes` ([{path, title}]) на той же
      `microfrontends`-записи, тот же `mfeApi` (уже дёргается через
      `useMfe()`/`GET /api/v1/mfe`, так что "подгружать с API" в самом
      буквальном смысле уже выполняется). Попутно обнаружил третью копию
      той же проблемы: `useModuleRoutes.ts`'s `KNOWN_MFE_ROUTES`
      (хардкод для drawer'а "включить/выключить пункт меню") дублировал
      РОВНО тот же список routes/titles, что и хардкод в
      `TopologyPage.vue` для users/orchestrator — свёл оба потребителя
      на один источник (`config.subRoutes`), `KNOWN_MFE_ROUTES` остался
      только как дефолт для MFE, которому ещё не засеяли/не настроили
      `subRoutes`. `TopologyPage.vue`: убрал `if (m.name === 'users')`/
      `if (m.name === 'orchestrator')` спецкейсы, генерик-цикл по
      `m.config?.subRoutes` для ЛЮБОГО MFE; счётчик "Sub-route" в
      легенде (был захардкожен `6`) теперь тоже считается от реальных
      данных графа. Миграция `20261103030000_mfe_sub_routes` засеяла
      `subRoutes` тем же списком, что раньше был в `KNOWN_MFE_ROUTES`
      (ничего не меняется визуально по умолчанию). Проверено живым
      Postgres — `config` после миграции содержит и `titleKey`, и
      `subRoutes` одновременно (не затирают друг друга — не-деструктивный
      jsonb-merge). `pnpm type-check` на `admin-orchestrator` — чисто.

---

## 5. Хардкод вместо `.env`/констант — особенно где значение дублируется

Цель: в коде не должно быть "магических" значений, которые либо меняются
между окружениями (→ `.env`), либо повторяются в нескольких местах (→ одна
именованная константа). Ниже — конкретные находки, не исчерпывающий список
(для "вообще ничего" нужен отдельный построчный проход по каждому модулю).

### Server

- [x] **`"uploads"` — путь к папке медиа захардкожен буквально в 9 местах**
      — добавлена `AppConfig.upload_dir` (читает `UPLOAD_DIR`, дефолт
      `"uploads"`, тот же паттерн, что `MEDIA_QUOTA_LIMIT`); все 9 мест
      (`lib.rs`, `main.rs` ×2, `media/handlers.rs` ×6) переключены на
      `state.config.upload_dir`/`config.upload_dir`. Проверено живым
      сервером (throwaway Postgres/Redis) — поднимается и обслуживает
      `/uploads` без регрессии.
- [x] **Дефолт пагинации `.unwrap_or(10)` продублирован отдельно в 4
      хендлерах** — добавлен `pub const DEFAULT_PAGE_LIMIT: i32 = 10;` в
      `core::utils`, все 4 места (`user`, `venues`, `i18n`,
      `media/handlers.rs`) переключены на него.
- [x] **`src/media/optimizer.rs`: пороги размеров изображений (256, 800,
      1600)** — вынесены в `THUMBNAIL_MAX_PX`/`MEDIUM_MAX_PX`/`LARGE_MAX_PX`
      на уровне модуля.
- [ ] Остальное (SQL-литералы, строки статусов и т.п.) по большей части
      — легитимные значения доменной модели, не хардкод в смысле запроса
      — не включал в список намеренно, чтобы не раздувать пункт
      ложными срабатываниями.

### Admin Panel

Централизованные константы (`packages/lib/src/constants/{events,routes,ports}.ts`)
уже существуют — проблема не в их отсутствии, а в том, что несколько
мест их игнорируют и заново объявляют те же строки:

- [x] **`packages/lib/src/composables/useRealtimeNotifications.ts` и
      `packages/ui/.../UiNotificationBell.vue` заново хардкодят те же 4-6
      строковых имени SSE-событий** — оба файла переведены на
      `REALTIME_EVENTS.*`: TS-union-тип теперь выводится из значений
      константы (`(typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS]`),
      `addEventListener(...)` и сравнения `item.type === ...` берут
      значения из констант. CSS-классы в `UiNotificationBell.vue`
      (`&.guest_registered` и т.п.) оставлены как есть — это обычные CSS
      имена классов, SCSS не может ссылаться на TS-константы, это не та
      же дыра с двумя источниками истины.
- [x] **Пути внутренней навигации (`router.push(...)`) захардкожены
      россыпью по компонентам** — не стал заводить отдельную
      `ROUTE_PATHS`-константу: нашлась более глубокая причина, чем просто
      дублирование. `admin-shell`'s `addPrefixToRoute` переписывает
      только `path`/`redirect` при регистрации удалённых роутов в сторе
      шелла, но НЕ трогает `name`. При работе внутри шелла (production)
      компоненты используют инжектированный РОУТЕР ШЕЛЛА (vue-router —
      `singleton: true` в Module Federation `shared`), где реально
      зарегистрирован путь `/content/pages`, а не `/pages` — значит
      абсолютный `router.push('/pages')` там не совпал бы ни с одним
      маршрутом и улетел бы в catch-all `redirect: '/'`. Нашёл прямое
      доказательство: `SettingsPage.vue` уже обходил именно эту проблему
      вручную через `window.location.pathname.startsWith('/content')` и
      ветвление на два литерала. Вместо константы-дубликата той же
      проблемы — перевёл все такие вызовы на именованную навигацию
      (`router.push({ name: 'PageList' })` и т.п., `name` не
      префиксируется шеллом и одинаково резолвится что в standalone dev,
      что внутри шелла); убрал `isShell`-ветвление из `SettingsPage.vue`.
      14 мест в `admin-content`, 1 в `admin-orchestrator`. Проверено
      живым `admin-content` dev-сервером (`/docs`, `/settings`, `/pages`,
      `/home` — переходы по кнопкам приводят на ожидаемые маршруты).
- [x] **Выносить конфигурационно-контентные вещи в CMS** — по решению
      владельца продукта: `mfeHelp.ts` (подсказки "что это и зачем" по
      каждому MFE, показываются контент-менеджеру через кнопку "?" рядом
      с пунктом меню). НЕ стал заводить это через Schema Builder/Page
      Constructor — та CMS моделирует контент ПУБЛИЧНОГО сайта (страницы,
      venues, меню заведений), а это чисто admin-panel-внутренний UI
      chrome, архитектурно другой домен. Вместо этого — тот же механизм,
      что уже используется для ЛЮБОГО другого текста в самой админке
      весь этот проход (`i18n_translations` + страница Admin →
      Translations): это и есть уже существующий, уже рабочий "CMS для
      админ-панели" — редактируется без деплоя, из админки, той же
      системой, что и `menu.*`/`general.*` и т.д. Удалил
      `packages/lib/src/constants/mfeHelp.ts` целиком (вместе с мёртвыми
      записями `about`/`guests`/`platforms` — те же 3 ретированных MFE,
      что и везде в этом списке), `UiSidebar.vue`'s `mfeHelp()` теперь
      резолвит `t('mfeHelp.<name>.title')`/`...description`. Миграция
      `20261103040000_mfe_help_translations` засеяла 28 строк (7 MFE ×
      title/description × ru/en).

      **Побочная находка, которую стоит подчеркнуть отдельно**: пока
      разбирался, откуда `t()` реально берёт данные, обнаружил, что
      namespace `menu` (использован буквально во ВСЕХ пунктах 1 и 4
      этого прохода — `menu.users`, `menu.profile`, `menu.dashboard` и
      т.д.) **никогда не подгружался ни одним приложением** —
      `loadDict('menu')` не вызывался нигде. Это значит заголовки всего
      сайдбара в реальном окружении (с живым бэкендом) показывали бы
      сырые ключи `menu.*`, а не текст — ровно то, против чего был весь
      раздел 1, но на уровень глубже отдельных опечаток в `ROUTES.ts`.
      Добавил `loadDict('menu')` (и `loadDict('mfeHelp')`) в
      `admin-shell`'s bootstrap (это то, что реально рендерит сайдбар в
      production — остальные MFE при работе внутри шелла используют его
      же инстанс `@admin-panel/i18n`, Module Federation `singleton:
      true`) и `loadDict('menu')` в `admin-users`/`admin-profile`/
      `admin-translations` для корректности в standalone dev-режиме
      (там сайдбар сами эти приложения и рендерят). Проверено живым
      сервером: `GET /api/v1/i18n/menu` и `GET /api/v1/i18n/mfeHelp`
      с `Accept-Language: ru` отдают корректные переведённые строки.
  фиксы раздела 1.

---

## 6. Производительность: admin-panel и server должны быть быстрыми

### Admin Panel

Замерено сборкой (`pnpm --filter admin-content build`, реальные цифры,
не оценка на глаз):

- [x] **Шаренные Module Federation singleton-чанки — главный рычаг**:
      `__federation_shared_element-plus` был **2.2 МБ** (486 КБ gzip) —
      причина подтверждена (см. ниже), исправлено. `__federation_shared_@admin-panel/ui`
      остаётся **1.66 МБ** (371 КБ gzip) — проверил состав чанка
      (`grep -c echarts/zrender` по собранному файлу): вес почти
      целиком даёт `echarts`/`zrender` (используются в `UiAreaChart`,
      `UiSparkline`), не Element Plus — отдельная, не связанная с этим
      пунктом задача, не трогал.

      **Что сделано**: во всех 7 приложениях (`admin-content`,
      `admin-media`, `admin-orchestrator`, `admin-profile`, `admin-shell`,
      `admin-translations`, `admin-users`) убран
      `import ElementPlus from 'element-plus'; app.use(ElementPlus)`.
      Вместо глобальной регистрации — `unplugin-vue-components` +
      `ElementPlusResolver` (`importStyle: false`, т.к. полный CSS уже
      грузится отдельно через `packages/ui/assets/styles/bundle.scss` →
      `initUiStyles()`/`inject-styles`, дублировать не нужно) подключены
      **один раз** в общей фабрике `packages/lib/src/vite/config.ts`
      (`createConfig`), которую используют все приложения — отдельно
      каждое приложение не трогал. `dts` указывает на
      `<app>/src/components.d.ts` (генерируется автоматически, добавлено
      в `.gitignore`), чтобы `vue-tsc` видел автоимпортированные
      компоненты в шаблонах.

      **`admin-shell`** — отдельный случай: там `import * as elementPlus
      from 'element-plus'` используется не для регистрации, а для ручного
      заполнения `__federation_shared__` (shared scope для динамических
      remote-модулей) — этот импорт оставлен как есть, убран только
      отдельный `import ElementPlus from 'element-plus'` и `.use(ElementPlus)`.

      **Директивы** (`v-loading` — 14 файлов, `ElInfiniteScroll`,
      `ElPopover`) — проверил исходники `unplugin-vue-components@32.1.0`
      (та версия, что реально стоит в `node_modules`): `ElementPlusResolver`
      по умолчанию (`directives: true`) резолвит и компоненты, и
      директивы — живым тестом резолвера (`resolver.resolve('Loading')`)
      подтвердил, что `v-loading` резолвится корректно.

      **Singleton API** (`ElMessage`/`ElMessageBox`/`ElNotification`) —
      прошёлся по всем ~35 местам использования: везде уже явный
      именованный импорт (`import { ElMessage } from 'element-plus'`),
      ни одного места на глобальных `this.$message`/`app.config.globalProperties`
      не нашёл — эти вызовы не зависят от глобальной регистрации и не
      затронуты.

      **Динамические компоненты** — отдельно проверил на `:is="..."`/
      `h(ElXxx)`/`resolveComponent('el...')` паттерны (резолвер их не
      видит, т.к. работает по статическому разбору тегов в шаблоне) —
      таких мест в коде нет.

      **Проверено**:
      - `pnpm --filter @admin-panel/lib build` — пересборка общего пакета
        (апп резолвят `@admin-panel/lib/vite` из `dist`, не из `src`).
      - Живой `admin-users` dev-сервер (`localhost:4176`) — страница
        логина рендерится корректно, в DOM присутствуют настоящие классы
        `el-form`/`el-input`/`el-button`/`el-link` (проверено через
        `document.querySelectorAll('[class*="el-"]')`), в консоли нет
        предупреждений `Failed to resolve component` (500-ки — это
        отсутствие бэкенда, к делу не относится).
      - `vite build` для всех 7 приложений — ни одной ошибки/warning.
        `__federation_shared_element-plus` после сборки — **~12 КБ**
        (3.85 КБ gzip) **во всех 7 приложениях** вместо 2.2 МБ — т.е.
        падение ~99%.
      - `oxlint` по изменённым файлам — чисто.
      - `vitest` для `admin-shell` (включая `mfeFallback.spec.ts`,
        который монтирует компонент с `global: { plugins: [ElementPlus] }`
        напрямую через `@vue/test-utils`, в обход нашего изменения) и
        `admin-translations` — все тесты зелёные.
      - `vue-tsc --build` для `admin-translations` — ровно те же 4
        ошибки типов, что и на оригинальном коде (сравнил через `git
        stash`/`git stash pop`): предсуществующий косяк с типом
        `DefaultRow` в обработчиках `el-table`, к этой правке не
        относится, не трогал.
- [x] **`RichTextFullEditor.vue` (Tiptap-редактор) — 1 МБ (237 КБ gzip)
      отдельным чанком** — проверил `useRichTextEditor.ts`: все 7
      `@tiptap/extension-*` + `@tiptap/starter-kit` передаются в
      `extensions:` безусловно, одним списком, в КАЖДЫЙ инстанс редактора
      — ни один не "мёртвый"/неиспользуемый, каждый отвечает за реальную
      кнопку тулбара (Highlight, TextAlign, Link, CharacterCount и т.д.).
      Разносить по требованию (динамическая подгрузка при клике на кнопку
      тулбара) технически возможно, но добавляет сложность (пере-инициализация
      `Editor` или динамическое добавление extensions на лету) ради
      небольшой части от 237 КБ gzip — сам чанк и так уже не блокирует
      первую загрузку. Действий не предпринимал — не баг, а осознанный
      компромисс размер/сложность.
- [ ] Остальные бандлы (сами страницы MFE — `VenuesPage` 164 КБ,
      `PageConstructorPage` 130 КБ и т.п.) заметно меньше и не похожи на
      проблему — не включал в приоритет.

### Server

- [x] **Нет индекса на `guest_user.email`** — миграция
      `20261103010000_auth_indexes` добавляет `UNIQUE INDEX
      guest_user_email_unique_idx`. Проверил живым Postgres (чистая
      throwaway БД) — миграция применяется без ошибок; на реальной БД
      с историческими данными перед выкладкой стоит разово проверить
      отсутствие дублей (`SELECT email, count(*) FROM guest_user GROUP BY
      email HAVING count(*) > 1`) — оба пути вставки (`auth/init.rs`,
      регистрация) всегда передают реальный email, так что дублей не
      ожидается, но мигрция не содержит авто-дедупликации.
- [x] **Нет индекса на `refresh_token.token`/`refresh_token.user_id`**
      — та же миграция добавляет `UNIQUE INDEX` на `token` и обычный
      индекс на `user_id`. Добавлена фоновая задача очистки
      (`auth::handlers::spawn_expired_refresh_token_cleanup`, тот же
      паттерн `tokio::spawn`+`interval`, что у rate-limiter), запускается
      в `main.rs` **после** `sqlx::migrate!()` — изначально поставил её
      раньше миграций и словил race (`relation "refresh_token" does not
      exist` на первом тике, `interval.tick()` у tokio тикает сразу при
      первом вызове) — живой прогон это сразу показал, поправил порядок.
      Проверил живым сервером: login → refresh → logout работает,
      индексы и фоновая задача не мешают.
- [x] **N+1-паттерны в bulk-эндпоинтах**: `i18n/handlers.rs` (массовое
      сохранение переводов) и `media/handlers.rs` (массовая
      ре-оптимизация медиа) переписаны на пакетные запросы (`WHERE (key,
      locale) IN (SELECT * FROM unnest(...))` / `WHERE uuid = ANY($1)`)
      вместо цикла с отдельным `SELECT`/`INSERT` на каждый элемент.
      Проверил живым сервером: батч из 3 переводов (create + update)
      дал ровно одну версионную запись для реально изменившегося значения
      и ни одной — для неизменившихся/новых ключей.

---

## 7. Сайдбар занимает слишком много места

Проверено живым браузером на `/users` (1024×768): сайдбар — это
двухколоночный виджет (`packages/ui/src/widgets/ui-sidebar/ui/UiSidebar.vue`):
первая колонка 64px (свёрнута) / 240px (развёрнута) + вторая
("secondary") колонка 200px, выезжающая при клике на пункт меню с
дочерними элементами — итого **до 440px** (`.has-secondary { width: 440px }`
в стилях компонента). На скриншоте с открытой `general.users` это
занимает почти половину экрана, из-за чего таблица пользователей
(`Email` / `Full Name` / ...) обрезается по правому краю — не влезает
последняя колонка.

- [x] **Пересмотреть двухколоночную схему сайдбара** — выбран вариант
      (а), авто-сворачивание первой колонки. `UiSidebar.vue`: новый
      computed `primaryCollapsed = isCollapsed.value || !!activeSubMenu.value`
      — первая колонка визуально сворачивается в 64px (иконки без
      подписей) всегда, когда открыта вторая, независимо от того, свёрнул
      ли сайдбар сам пользователь; реальный `isCollapsed` (ручной тоггл)
      не трогается и восстанавливается, как только вторая колонка
      закрывается. CSS: `.has-secondary { width: 264px }` (было 440px).
      В `handlePrimaryClick` оставлен `if (isCollapsed.value)
      toggleCollapse()` — он всё ещё нужен (не для ширины, а чтобы
      разблокировать `v-if` вторй колонки, которому требуется `!isCollapsed`
      по-настоящему false) — без него вторая колонка не открывалась бы
      вообще, если сайдбар свёрнут вручную (проверил живым прогоном,
      сам сначала убрал эту строчку по ошибке, визуальный тест сразу
      показал регрессию). Проверено живым `admin-users` dev-сервером
      (http://localhost:4176, 1024×768): итоговая ширина 264px вместо
      440px, оба сценария (открыть вторую колонку при развёрнутом/свёрнутом
      сайдбаре, закрыть вторую колонку) ведут себя корректно.
- [x] **Таблицы на дата-плотных страницах (Users/Media/Translations) не
      готовы к сужению контентной области** — `UiTable.vue` (единая точка
      фикса — Users/Media/Translations все идут через этот компонент):
      `el-table` переключён на `:fit="false"` (раньше `fit` заставлял
      колонки сжиматься под контейнер вместо скролла), добавлена обёртка
      `.ui-table__scroll { overflow-x: auto }`. Отдельно обнаружил и
      обошёл: сам `.el-table` по умолчанию держит `overflow: hidden` и
      рассчитывает на свой внутренний кастомный скроллбар (`el-scrollbar`),
      который остаётся `display: none` в состоянии покоя и не реагирует
      на программный `scrollLeft`/`wheel` в этой версии — пришлось
      добавить `:deep(.el-table) { overflow: visible }` внутри
      `.ui-table__scroll`, чтобы переполнение доходило до внешней обёртки
      и скроллилось нативно. Проверено живым прогоном на 700px viewport:
      `el-table` корректно получает класс `el-table--scrollable-x`,
      обёртка показывает `scrollWidth > clientWidth`, программный
      `scrollLeft` реально сдвигает колонки (Email/Full Name → Role/Status).

---

## 8. Пустые/редиректящие роуты — прибраться в роутинге

Проверено живым браузером: переход на `http://localhost:4173/content/schemas`
молча редиректит на `http://localhost:4173/` (пустой "Main Shell page").
Причина найдена в коде, не предположение:
`apps/admin-shell/src/app/router/index.ts`'s `addPrefixToRoute()` берёт
маршруты каждого MFE и переписывает им `path` с префиксом (`/content/...`),
но **не трогает поле `redirect`**:

```ts
const addPrefixToRoute = (route: any, prefix: string): any => {
	const { path, ...rest } = route   // redirect уезжает в rest как есть
	...
	const modifiedRoute = { ...rest, path: newPath }  // redirect: '/' остаётся буквально '/'
	...
}
```

`admin-content/src/app/router/index.ts` объявляет `{ path: '/schemas',
redirect: '/' }` — это ОТНОСИТЕЛЬНЫЙ редирект на собственный корень MFE,
задуманный как `/content` после префиксации. Но поскольку `redirect`
не переписывается, он остаётся буквальным `'/'` — абсолютным путём в
роутере ШЕЛЛА, а не MFE. Результат — пользователь, открывший
`/content/schemas`, улетает на пустую домашнюю страницу шелла.

- [x] **Починить `addPrefixToRoute`**, чтобы относительные `redirect`
      тоже получали префикс — вынес общую логику префиксации в
      `addPrefixedPath()`, применяется и к `path`, и к строковому
      `redirect` (нестроковый `redirect`, например по имени маршрута,
      не трогается). `admin-content`'s `/schemas` теперь редиректит на
      `/content`, а не на корень шелла.
- [x] **Убрать пустую домашнюю страницу шелла** — сделал `/` алиасом на
      `/statistics` (`redirect: '/statistics'` вместо рендера
      `MainPage`), т.к. `admin-statistics` уже подключена к `ROUTES` в
      этом же проходе (раздел 1). Файлы
      `apps/admin-shell/src/pages/main-page/{MainPage.vue,index.ts}`
      удалены как мёртвый код (на них больше нет ссылок).
- [x] **Общий проход по роутам**: проверил все `apps/*/src/app/router/index.ts`
      на `redirect:` — кроме уже найденного `admin-content`'s `/schemas`
      других относительных `redirect` не нашёл. Отдельного поиска
      "заглушек" по всем страницам (а не только роутам) не делал — это
      шире, чем "роуты", и больше похоже на отдельный аудит.

---

## Как использовать этот файл

Отмечайте закрытые пункты, добавляйте новые по дороге — тот же формат,
что и в предыдущем (закрытом) списке.
