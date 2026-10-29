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
- [ ] **Токены не httpOnly** — отмечено самим автором в коде
      (`// TODO: Переписать на set-cookie. HttpOnly` на `login`). Сейчас
      `access_token`/`refresh_token` уходят в JSON body → хранятся на
      фронте в localStorage → украдены любым XSS. Перевести на
      `Set-Cookie: HttpOnly; Secure; SameSite=Strict`. **Не сделано в этом
      проходе** — требует согласованных правок на фронте (admin-panel
      должен перестать читать токены из body и слать их как `Bearer`,
      плюс нужна CSRF-защита для cookie-flow) и решения по CORS
      (`allow_credentials`), это отдельная, более крупная задача.
- [x] **`REFRESH_TOKEN_TTL_MINUTES=1` в `.env.example`** — исправлено на
      `1440` (сутки), совпадает с дефолтом в коде.
- [x] **`dotenv().ok()` внутри `generate_token`** — убрано, `.env`
      грузится один раз в `main()` при старте.
- [ ] (опционально) **Account lockout / счётчик неудачных попыток логина**
      — вместе с rate limiting закрывает brute-force полностью. Не
      делал — пункт помечен опциональным, rate limiting уже даёт основную
      защиту.
- [x] **Удалить отработавшие legacy-бинарники** — `src/bin/migrate_legacy_i18n.rs`
      и `src/bin/migrate_legacy_pages.rs` удалены (`git rm`, не
      закоммичено). Оба явно документированы как "one-time migration" в
      своих doc-комментариях, не упомянуты ни в Makefile, ни в докаx, и их
      задачи отмечены выполненными в истории git (`d8b1e6f`, `90e82ab`).
      Модуль `content::legacy_i18n_migration` (чистые функции + юнит-тесты)
      не тронут — используется только этими бинарниками, но сам по себе не
      содержит доступа к БД.

**Проверено после всех правок**: `cargo build --release` — чисто, без
`TestBearer`; `make test-server` (`cargo test --features test-auth`) — 29
unit + 26 integration тестов, все `ok`; живой smoke-test сервера (login
rate limit, refresh не задет, восстановление лимита) — вручную curl'ом.
Изменения не закоммичены.

---

## 2. Admin Panel — технический долг (найден при редизайне, не закрыт)

- [ ] **~20 файлов с хардкодженным `#42b883`** вместо CSS-переменной в
      `admin-content`/`admin-orchestrator`/`admin-statistics` — осталось
      после смены primary-цвета на фиолетовый, не аудировано.
- [ ] **5 файлов в `admin-orchestrator`** (Monitoring/Topology/Features,
      `OrchestratorLayout`, `SparklineMetric`) с паттерном "используется
      необъявленная CSS-переменная → резолвится в `initial`" — тот же баг,
      что уже дважды ловили в сайдбаре/хедере.
- [ ] **D3-спарклайн в `admin-orchestrator` не перенесён** на новый
      `UiSparkline` из `@admin-panel/ui` — виджет готов, переноса не было.

---

## 3. CI / инфраструктура

- [ ] **`security` job в `admin-panel/.github/workflows/ci.yml`** —
      закомментирован (нет `SNYK_TOKEN`). Рассмотреть более лёгкую замену:
      `cargo audit` для server + `pnpm audit` для admin-panel без внешнего
      сервиса.
- [ ] **`dependency-check` job** — закомментирован, т.к.
      `dependency-cruiser@15.5.0` крашится на Node 22/24
      (`node:fs does not provide an export named 'R_OK'`, баг пакета).
      Следить за фиксом в апстриме, либо откатиться на рабочую версию.
- [ ] **`make check-api-drift` / `make smoke-test` не подключены к GitHub
      Actions** — инструменты контроля API-контракта и smoke-проверки уже
      есть локально, но CI их не гоняет. Требует решения по единой ветке
      монорепо (сейчас на GitHub несколько ad hoc веток вместо одной).

---

## Как использовать этот файл

Обновляйте по ходу работы — отмечайте закрытые пункты, добавляйте новые,
если по пути найдёте ещё один источник проблем (как это было заведено в
`ROADMAP.md`).
