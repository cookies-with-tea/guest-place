# Guest Place — План улучшений (server + admin-panel)

Составлено по итогам ревью кода `server` и `admin-panel` на 2026-10-29.
В отличие от закрытого `ROADMAP.md` (редизайн/UX/CI) — здесь фокус на
безопасности и техдолге, найденном при чтении актуального кода.

Отмечайте выполненные пункты `[x]` по ходу работы.

---

## 0. Критично — сделать первым

- [x] **`TestBearer`-бэкдор в проде**
      ([`server/src/auth/middlewares.rs`](server/src/auth/middlewares.rs)).
      Заголовок `Authorization: TestBearer` давал `superadmin`-доступ без
      какой-либо проверки, и это не было вынесено под `#[cfg(test)]` — код
      компилировался в обычный production-бинарник. Исправлено: ветка
      вынесена под `#[cfg(feature = "test-auth")]` (новая фича в
      `server/Cargo.toml`), которая не включается обычным `cargo build`/
      `cargo build --release` (и, соответственно, `Dockerfile`'ом) — только
      явно через `cargo test --features test-auth`. `make test-server`,
      `server/TESTING.md` и корневой `TESTING_GUIDE.md` обновлены на новую
      команду. Проверено: `cargo build --release` собирается без бэкдора,
      `cargo test --features test-auth` компилируется с ним.

---

## 1. Server (Rust) — безопасность и надёжность

- [x] **`verify_password` паникует на битом хэше**
      ([`server/src/auth/handlers.rs`](server/src/auth/handlers.rs)) —
      было `PasswordHash::new(hash).unwrap()`. Заменено на `let Ok(..) =
      .. else { return false; }` — битый/legacy хэш теперь просто
      "неверные учётные данные", без panic. Покрыто существующим
      `test_login_invalid_credentials`.
- [x] **Rate limiting на `/auth/login` и `/auth/register`** — добавлена
      зависимость `tower_governor` (фича `axum`, без `tonic`/`tracing`) +
      `GovernorLayer` на каждый из двух роутов отдельно (не на весь
      `auth::handlers::router()` — `/logout`/`/refresh` не лимитируются).
      Ключ — `SmartIpKeyExtractor` (X-Forwarded-For/X-Real-IP/Forwarded,
      иначе peer IP); `main.rs` переведён на
      `into_make_service_with_connect_info::<SocketAddr>()`, чтобы peer IP
      был доступен и без реверс-прокси. `/login`: burst 5, затем 1/10с.
      `/register`: burst 3, затем 1/30с (жёстче — спам писем дороже).
      Фоновая `retain_recent()` каждые 5 минут, чтобы карта по IP не росла
      неограниченно. Проверено живым сервером: 6-й/7-й подряд запрос на
      `/login` → `429`, `/refresh` в это же время не лимитируется, после
      ожидания лимит восстанавливается.
- [x] **Токены не httpOnly** — `refresh_token` (сутки по умолчанию)
      перенесён в HttpOnly-cookie; `access_token` (10 минут) остаётся в
      теле — короткого жития достаточно, чтобы не переписывать весь фронт
      на cookie-only авторизацию. Сделано через новый мост
      [`server/src/auth/cookies.rs`](server/src/auth/cookies.rs) —
      middleware на `/login`/`/refresh`/`/logout`/`/logout/other`,
      который вырезает `refresh_token` из JSON-ответа в cookie
      (`gp_refresh_token`; `Path=/api/v1/auth; HttpOnly; SameSite=Lax`,
      `Secure` если `PUBLIC_URL` на `https://`) и подставляет его обратно
      в тело запроса из cookie — сами handlers (`login`/`refresh`/
      `logout`/`logout_other_devices`) не тронуты, только `logout`
      переведён на `AuthRefreshTokenDTO` вместо избыточного
      `AuthResponseDTO` в качестве request body. На фронте (admin-panel):
      `fetch.ts` — `credentials: 'include'`; `useAuth.ts`/`auth.ts`/
      `useAuthWidget.ts` — `refreshToken` убран из `IAuthTokens` и
      localStorage, `authApi.refresh()/logout()` больше не берут параметр
      (токен приходит из cookie на бэкенде). `openapi.json`/
      `packages/lib/src/api/types.ts` перегенерированы (`make
      generate-api`). Проверено: `pnpm type-check`/`pnpm test:unit` по
      всему admin-panel зелёные; живой браузер (admin-shell на 4173,
      реальный federated build) — логин, `document.cookie` пуст (cookie
      действительно HttpOnly), `gp_access_token` в localStorage,
      `gp_refresh_token` — нет нигде на фронте, `refresh_token` отсутствует
      в теле ответа `/login`, навигация и загрузка MFE (admin-users) с
      реальными данными работают, консоль чистая; curl'ом — `/refresh` с
      cookie ротирует токен и cookie, без cookie → `401`; `/logout`
      чистит cookie (`Max-Age=0`) и сразу инвалидирует refresh-токен в
      БД; `/logout/other` (защищённый роут) корректно читает cookie
      текущей сессии через `Authorization: Bearer` + `Cookie`.
- [x] **`REFRESH_TOKEN_TTL_MINUTES=1` в `.env.example`** — исправлено на
      `1440` (сутки), совпадает с дефолтом в коде.
- [x] **`dotenv().ok()` внутри `generate_token`** — убрано, `.env`
      грузится один раз в `main()` при старте.
- [x] **Account lockout / счётчик неудачных попыток логина** — по
      email, поверх IP-based rate limiting (его одного недостаточно:
      обходится ботнетом/множеством прокси). Redis (`RedisService`,
      новый метод `increment_with_ttl` — атомарный `INCR` +
      `EXPIRE`-на-первом-инкременте), не БД — это временный счётчик
      злоупотреблений: 5 неудачных попыток за 15 минут → `429` с
      `auth.too_many_attempts` независимо от правильности следующих
      попыток; счётчик сбрасывается на успешный логин. Проверено живым
      сервером (запросы разнесены по времени, чтобы не упираться в
      IP-лимитер): 3 неудачных → ещё норм, после 5-го — `429` c верным
      JSON-телом (не текстовый ответ IP-лимитера), другой email в это же
      время не заблокирован, успешный логин после — счётчик в Redis
      удаляется (`GET` возвращает пусто).
- [x] **Удалить отработавшие legacy-бинарники** — `src/bin/migrate_legacy_i18n.rs`
      и `src/bin/migrate_legacy_pages.rs` удалены (`git rm`, не
      закоммичено). Оба явно документированы как "one-time migration" в
      своих doc-комментариях, не упомянуты ни в Makefile, ни в докаx, и их
      задачи отмечены выполненными в истории git (`d8b1e6f`, `90e82ab`).
      Модуль `content::legacy_i18n_migration` (чистые функции + юнит-тесты)
      не тронут — используется только этими бинарниками, но сам по себе не
      содержит доступа к БД.

**Раздел 1 полностью закрыт.** Проверено после всех правок: `cargo build
--release` — чисто, без `TestBearer`; `make test-server` (`cargo test
--features test-auth`) — все unit + integration тесты `ok`; `pnpm
type-check`/`pnpm test:unit` по всему admin-panel — зелёные (15/15 и 11/11
тасков); живой браузер (реальный federated build admin-panel на :4173 +
live сервер) — логин, httpOnly-cookie, работа MFE под авторизацией;
curl-smoke-тесты — rate limiting (login/register), refresh/logout/logout-
other через cookie, account lockout. Изменения не закоммичены.

---

## 2. Admin Panel — технический долг (найден при редизайне, не закрыт)

- [x] **Необъявленные CSS-переменные → резолвятся в `initial`** — не
      ограничилось заявленными 5 файлами `admin-orchestrator`: прогнал
      скрипт-диф "все `var(--x)` в `*.vue`" против "все реально объявленные
      `--x` в `_tokens.scss`/`_variables.scss`" по ВСЕМУ admin-panel (не
      только orchestrator) и нашёл 21 реальное использование в 16 файлах
      (`--gp-text-muted`, `--gp-danger`, `--gp-glass-hover`, `--gp-success`,
      `--gp-bg-page`, `--gp-bg-lighter`, `--gp-surface-card`, `--gp-bg-card`,
      `--gp-text-primary`, `--text-main`, `--gp-accent`, `--color-primary`,
      `--bg-hover`, `--bg-surface-secondary`, `--gp-primary-rgb`) —
      переписаны на реально объявленные токены (`--text-muted`,
      `--el-color-danger`/`--el-color-success` с фоллбэком,
      `--gp-bg-glass-hover`, `--bg-page`, `--bg-surface`, `--bg-card`,
      `--text-primary`, `--accent-primary`, `--gp-primary`). Отдельно:
      `--gp-primary-rgb` не было ни разу объявлено ни для чего — это не
      опечатка, а отсутствующий токен (RGB-триплет для
      `rgb(var(--x), alpha)` на произвольном alpha), добавлен в
      `_tokens.scss` (light+dark). Найден попутно реальный смысловой баг:
      `ModulesStatsGrid.vue`'s `.text-success` (красит
      `health.onlineCount`) был перепутан на `--gp-primary` вместо
      success-цвета — поправлено на `--el-color-success`. Проверено:
      stylelint/oxlint чистые, live-браузер (Modules/Monitoring/Features
      страницы `admin-orchestrator`) — цвета рендерятся, консоль чистая.
- [x] **~20 файлов с хардкодженным `#42b883`** — полный аудит (не только
      заявленные директории). Реально поправлено 19 вхождений в 12
      файлах, где `#42b883` — стухший fallback/значение для primary-брендинга
      (`var(--gp-primary, #42b883)` → `#7c3aed`, плюс соседние
      `rgb(66, 184, 131, N)` glow/фон → `rgb(var(--gp-primary-rgb), N)`;
      в `TrafficChart.vue`/`EngagementStats.vue` — хардкоженный цвет
      основной серии ECharts, тоже на `#7c3aed`). **Осознанно не тронуто**
      (8 файлов) — `#42b883` там используется как самостоятельный
      status/semantic-зелёный (online/offline-дуальность, threshold-раскраска
      CPU/memory-гейджей, retention-heatmap "чем выше retention, тем
      насыщеннее зелёный", explicit preset-свотч "Vue Green" в
      `UiThemeBuilder`), не связан с primary-брендингом — тот самый случай,
      который ROADMAP сам пометил неоднозначным и не стал трогать без
      владельца продукта: `RetentionCohorts.vue`, `TopologyPage.vue`,
      `MfeStatsChart.vue`, `MonitoringPage.vue`+`MfeMetricsTab.vue` (парный
      CPU/memory-градиент), `SystemMetricsTab.vue` (green/amber/red
      threshold), `UiThemeBuilder.vue`.
- [x] **Sparkline в `admin-orchestrator` не был на `UiSparkline`** —
      уточнение: сам компонент (`SparklineMetric.vue`) на деле не D3
      (чистая SVG-математика, без d3-импорта; единственный файл с d3 в
      orchestrator — `MfeStatsChart.vue`, но это force-directed граф
      топологии, не спарклайн, `UiSparkline` для него не замена). Суть
      пункта та же: локальная реализация вместо общего виджета. Перенесено
      — `SparklineMetric.vue` теперь рендерит `<UiSparkline>` вместо
      ручной генерации SVG `<path>`; внешний API компонента (label/
      heroValue/historyValues/strokeColor/max) не менялся, оба вызывающих
      компонента (`MfeMetricsTab`, `SystemMetricsTab`) не тронуты.
      `UiSparkline` расширен необязательными `max`/`min` (фиксированный
      потолок шкалы вместо авто-масштаба под видимый диапазон данных —
      нужно для процентных гейджей типа "CPU 15-25%", чтобы мелкие
      колебания не превращались в зигзаг на всю высоту); дефолт сохраняет
      старое поведение для уже существующих мест, где `UiSparkline`
      используется (их не было — только Storybook-истории). Проверено
      живым браузером: Monitoring → System Infrastructure → карточка
      Thread CPU — спарклайн рендерится, с нужным цветом и кривой, без
      ошибок в консоли.

**Проверено после всех правок раздела 2**: `pnpm type-check` (15/15) и
`pnpm test:unit` (11/11) по всему admin-panel — зелёные; `pnpm stylelint`/
`pnpm oxlint` — чистые; живой браузер (федеративная сборка, реальный
сервер) — Monitoring (обе вкладки), Modules, Features — рендер и цвета
корректны, консоль без ошибок. Изменения не закоммичены.

---

## 3. CI / инфраструктура

- [x] **`security` job в `admin-panel/.github/workflows/ci.yml`** —
      раскомментирован, но не как 1-в-1 замена Snyk на `pnpm audit`:
      `pnpm audit` локально реально падает (exit 1) — 55 находок (5 low /
      22 moderate / 22 high / 6 critical на 2026-10-29), в основном
      транзитивные dev-only тулы (Cypress/Storybook). Включить его как
      блокирующий job прямо сейчас — наступить на те же грабли, что уже
      закомментированный `dependency-check` (красный с первого запуска
      независимо от качества кода). Job включён с `continue-on-error:
      true` и `--audit-level=high` — находки видны в логе CI при каждом
      прогоне, но не блокируют мердж; `continue-on-error` на `false` —
      отдельный шаг, после того как кто-то пройдётся по зависимостям
      предметно. YAML провалидирован (`python3 -c "import yaml; ..."`).
      Для `server`: `cargo audit` (установлен и прогнан локально — в
      репозитории `server` до сих пор нет `.github/` вообще, заводить
      CI с нуля — отдельное, более крупное решение, не часть этого
      пункта) нашёл 26 находок, из них одна реально критичная и дешёвая
      в исправлении — `lettre 0.11.19` (RUSTSEC-2026-0141, severity 9.1
      critical: TLS hostname verification отключена при Boring TLS
      backend — потенциальный MITM на SMTP-соединении для писем
      регистрации). Обновлено до `0.11.23` (`cargo update -p lettre`,
      в пределах уже заданного в `Cargo.toml` диапазона `"0.11"`, сам
      `Cargo.toml` не менялся) — 25 находок осталось, все в глубоких
      транзитивных зависимостях (`sqlx`, `redis` и т.п., часть вообще
      "No fixed upgrade is available") — предметный апгрейд этого дерева
      зависимостей не входит в рамки этого пункта. Проверено: `cargo
      build`/`make test-server` после апгрейда — чисто, все тесты `ok`.
- [x] **`dependency-check` job** — перепроверено, не изменилось:
      `dependency-cruiser@15.5.0` всё ещё падает с той же ошибкой на Node
      24.17 (`node:fs does not provide an export named 'R_OK'`) — баг
      пакета не пофикшен апстримом. Job остаётся закомментированным,
      менять нечего.
- [ ] **`make check-api-drift` / `make smoke-test` не подключены к GitHub
      Actions** — не трогал: требует решения по единой ветке монорепо
      (сейчас на GitHub несколько ad hoc веток вместо одной), это
      архитектурное решение за владельцем продукта, не код-фикс.

---

## Как использовать этот файл

Обновляйте по ходу работы — отмечайте закрытые пункты, добавляйте новые,
если по пути найдёте ещё один источник проблем (как это было заведено в
`ROADMAP.md`).
