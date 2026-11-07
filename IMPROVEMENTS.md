# Guest Place — План улучшений (новый, 2026-11-07)

Предыдущий список (`git log -- IMPROVEMENTS.md`) закрыт полностью — несколько
отложенных по итогам прошлого прохода пунктов (`zip` build-dependency,
`UiTable`/`UiTableColumn` generic, широкий i18n-аудит) остались
задокументированы там же и не переносятся сюда как открытые задачи.

Это новый, самостоятельный проход: `server/` и `admin-panel/` (по явному
решению владельца продукта — `client/` в этом проходе не трогаем, не
анализируем). Каждая находка — результат чтения кода и, где это было
возможно, проверки (grep по всему дереву, статический анализ, сопоставление
с остальными модулями), не предположение.

Отмечайте выполненные пункты `[x]` по ходу работы.

---

## Server

## 1. `/api/v1/media` — весь модуль без авторизации, включая `DELETE /` (удалить всё)

Сравнение с остальными модулями показывает чёткий паттерн: у `user`, `venues`,
`content`, `pages`, `menus`, `redirects`, `analytics`, `i18n`, `mfe`, `auth`
есть `pub fn public_router()` + `pub fn protected_router()`, и
`protected_router()` монтируется в `src/lib.rs`'s `protected_router`-блок,
обёрнутый `auth_middleware` (`src/lib.rs:86-101`). У `media` — единственного
из всех — только один `pub fn router()` (`src/media/handlers.rs:1579`), и он
целиком смонтирован в `public_router` (`src/lib.rs:63`):
`.nest("/api/v1/media", media::handlers::router())`.

Проверено, что это не компенсируется проверкой внутри хендлеров: `grep -n
"Claims" src/media/handlers.rs src/media/folders.rs` → 0 совпадений (у
остальных модулей `Extension<Claims>` — стандартный способ получить текущего
пользователя). Ни одной `security(...)` OpenAPI-аннотации в файле тоже нет.

Полный список маршрутов модуля (`src/media/handlers.rs:1579-1602`) — все 14
без исключения открыты анонимно, в том числе:
```rust
.route("/", delete(delete_all))   // src/media/handlers.rs:1601
```
а `delete_all` (`:952-957`) делает `sqlx::query("DELETE FROM media")` —
**без WHERE** — удаляет всю таблицу медиа одним запросом.

- [x] **Разбить `media::handlers::router()` на `public_router()`/`protected_router()`**
      — решение по read-эндпоинтам: публичным оставлен только `get_variant`
      (`/{uuid}/variants/{size}`) — он просто редиректит на уже
      опубликованный файл, та же доверенность, что у статики `/uploads`,
      и нужен публичным страницам для показа изображений по UUID. `get_all`
      (полный листинг с метаданными) и `get_one` переведены в
      `protected_router()` вместе со всеми операциями записи — нет
      легитимного публичного кейса для анонимного перечисления/чтения
      метаданных приватной медиа-библиотеки (размер файла, exif, тэги и
      т.д.), публичное отображение файла идёт через `get_variant`, не через
      эти эндпоинты. `src/lib.rs`: `media::handlers::public_router()` в
      `public_router`-блоке, `media::handlers::protected_router()` — в
      `protected_router`-блоке (под `auth_middleware`), по тому же паттерну,
      что `user`/`venues`/и т.д.
- [x] Проверено тем же способом `features::router()` — действительно тот же
      класс бага: `POST /api/v1/features` (`update_features`, перезапись
      ВСЕХ global feature flags) был доступен анонимно. Разбит на
      `public_router()` (только `GET /` — `get_features`, чтение флагов
      нужно публичным MFE/клиенту для фича-гейтинга) и `protected_router()`
      (`POST /` — `update_features`).

      **Проверено живым прогоном** (throwaway Postgres 15432/Redis 16379,
      НЕ трогал реальные `guest-place-db`/`guest-place-redis` — свежий
      `docker run` с другими именами/портами, снесены после проверки):
      - `cargo check` — чисто, `cargo clippy --lib` — 0 новых warning'ов в
        изменённых файлах (все 97 существующих warning'ов — в
        непричастных местах).
      - Без токена: `GET /api/v1/media` → **401**, `DELETE /api/v1/media`
        (`delete_all`) → **401**, `POST /api/v1/features` → **401**.
      - Без токена, но на том, что должно остаться публичным:
        `GET /api/v1/media/{uuid}/variants/thumbnail` → **404** (не 401 —
        маршрут прошёл мимо auth-слоя, 404 просто потому что такого media
        нет в чистой БД), `GET /api/v1/features` → **200** с реальными
        засеянными флагами.
      - Логин суперадмином (`POST /api/v1/auth/login`, сид из `.env`) →
        получен настоящий JWT; с ним `GET /api/v1/media` → **200**,
        `POST /api/v1/features` → **200**. Т.е. легитимный
        админский сценарий не сломан.

---

## 2. Глобальные `RwLock`/`Mutex` с `.unwrap()` на блокировке — один паникующий держатель лока кладёт сервер навсегда

`src/i18n/mod.rs` — живущий весь процесс кэш переводов
(`Arc<RwLock<HashMap<...>>>`), и `I18nService::t()` формирует текст
практически любого сообщения в ответах API (`grep -rn "state.i18n.t(" src` →
120+ мест в `auth`, `user`, `media`, `i18n`). Все три точки доступа к локу
паникуют при poisoning: `src/i18n/mod.rs:26` (`self.cache.read().unwrap()`),
`:62` и `:67` (`self.cache.write().unwrap()`). `std::sync::RwLock`/`Mutex` в
Rust отравляется навсегда, если держащий лок поток паникует внутри
критической секции — после этого любой следующий `.read()`/`.write().unwrap()`
тоже паникует. Поскольку кэш используется практически в каждом хендлере,
любая будущая паника внутри критической секции превращает локальный баг в
полный, неперезапускаемый отказ всего сервера (до ручного restart). Тот же
паттерн в `src/monitoring/service.rs:42` (`SYSTEM.lock().unwrap()`,
глобальный `sysinfo::System`, эндпоинт `/api/v1/system`).

- [x] **Заменены `.read().unwrap()`/`.write().unwrap()`/`.lock().unwrap()`
      на `parking_lot::RwLock`/`Mutex`** — уже был в дереве зависимостей как
      транзитивный (`cargo tree -i parking_lot` → v0.12.3, подтянут через
      `sqlx-core`/`governor`), добавлен прямой зависимостью в `Cargo.toml`
      (`Cargo.lock` изменился на 1 строку — версия не менялась, просто стал
      прямым). `src/i18n/mod.rs`: `std::sync::RwLock` → `parking_lot::RwLock`,
      все 3 места (`t()` ×2, `clear_cache()`) — `parking_lot`'s `read()`/
      `write()` не возвращают `Result`, `.unwrap()` просто исчез, не
      заменён на что-то другое. `src/monitoring/service.rs`: тем же способом
      `std::sync::Mutex` → `parking_lot::Mutex` для глобального `SYSTEM`.

      **Проверено**: `cargo check`/`cargo clippy --lib` — чисто, 0 новых
      warning'ов в обоих файлах. Написан и прогнан отдельный standalone-тест
      (`rustc` вручную, не входит в кодовую базу, удалён после проверки) —
      поток, запаниковавший ВНУТРИ критической секции `parking_lot::RwLock`
      (`panic!` между `write()` и drop гварда), не блокирует следующий
      `read()`: он успешно возвращает значение, записанное до паники
      (с `std::sync::RwLock` на этом же тесте следующий `.read().unwrap()`
      падал бы с `PoisonError`). Отдельно живым прогоном (throwaway
      Postgres/Redis, снесены после) подтверждена отсутствие регрессии:
      `GET /api/v1/features` (использует `I18nService` неявно через
      `locale_middleware`) → 200 с реальными переводами; SSE
      `GET /api/v1/system/stats/stream` (использует `get_system_stats`,
      единственный потребитель `SYSTEM`-мьютекса) → отдаёт живые
      cpu/memory-метрики каждый тик.

---

## 3. `change_password` блокирует tokio-воркер синхронным `block_on` внутри async-хендлера

`src/user/handlers.rs:1078`, внутри `.map_err(...)`:
```rust
messages: Some(vec![futures::executor::block_on(msg)])
```
`grep -rn "block_on" src` → ровно одно совпадение на весь сервер — везде
остальные ~120 вызовов `state.i18n.t(...)` (включая этот же файл, строку 1085
на 7 строк ниже) делают нормальный `.await` внутри `async fn`. Рантайм —
`#[tokio::main]` без `flavor = "current_thread"`, так что не хард-дедлок, но
синхронно блокирует воркер-поток на время SQL-запроса внутри `t()`, снижая
конкурентность под нагрузкой — анти-паттерн смешивания blocking-вызова с
async-рантаймом.

- [x] **Убрано `futures::executor::block_on`** — `.map_err(...)?`/
      `.ok_or_else(...)?` заменены на явный `match` по результату
      `fetch_optional`, с `return Err(...)` в каждой ветке; на ветке ошибки
      БД `state.i18n.t(...).await` теперь нормальный `.await` внутри `async
      fn`, тем же паттерном, что и остальные 9 мест в этом же файле (сверил
      с `src/user/handlers.rs:198` и соседними). `grep -rn "block_on" src` —
      0 совпадений на весь сервер.

      Проверено: `cargo check`/`cargo clippy --lib` — чисто, 0 новых
      warning'ов на изменённых строках. Живым прогоном (throwaway
      Postgres/Redis, снесены после): `POST /api/v1/user/me/password` с
      неверным старым паролем → 400 (ветка `verify_password`, не трогал, но
      убедился, что рядом ничего не сломал); с верным старым паролем → 200,
      успешно проходит именно переписанный `match`-блок (запрос к БД,
      `Ok(Some(user))`-ветка); повторный логин новым паролем → успешен,
      т.е. пароль реально сохранился в БД, вся цепочка работает end-to-end.
      Ветка `Err(_)` (ошибка самого SQL-запроса) не воспроизводилась живым
      прогоном — требует искусственного обрыва соединения с БД в середине
      запроса, не стал симулировать; код идентичен по форме 9 другим,
      уже проверенным местам в этом файле.

---

## 4. Пагинация: `limit` не зажат верхней границей в 3 из 4 list-эндпоинтов

`src/venues/handlers.rs:415`: `query.limit.unwrap_or(DEFAULT_PAGE_LIMIT).clamp(1, 100)`
— единственное место, где `limit` реально ограничен сверху. В остальных трёх
list-хендлерах клиентский `?limit=` идёт напрямую в SQL `LIMIT` без верхнего
предела:
- `src/user/handlers.rs:240`
- `src/media/handlers.rs:356`
- `src/i18n/handlers.rs:222-225`

Один запрос `GET /api/v1/user?limit=2000000000` заставит сервер попытаться
вернуть всю таблицу одним JSON-ответом — память/сеть пропорциональны размеру
таблицы, без защиты. То, что паттерн `.clamp(1, 100)` уже есть в одном месте,
а в трёх других того же общего паттерна (`DEFAULT_PAGE_LIMIT` — общая
константа, подключена везде) его нет, говорит об упущении при копировании,
не об осознанном решении.

- [x] **Добавлен `.clamp(1, MAX_PAGE_LIMIT)` в `user`, `media`, `i18n`
      list-хендлерах** — вынес `100` из `venues/handlers.rs:415` в именованную
      константу `pub const MAX_PAGE_LIMIT: i32 = 100;` (`core/utils.rs`,
      рядом с `DEFAULT_PAGE_LIMIT`), переключил на неё все 4 места
      (включая сам `venues`, чтобы не плодить второй источник истины для
      того же числа). Заодно `page` везде получил `.max(1)` (в `user`/
      `media`/`i18n` его не было вообще — `venues` уже это делал,
      `offset = (page - 1) * limit` мог уйти в отрицательный `OFFSET`).

      Проверено: `cargo check`/`cargo clippy --lib` — чисто, предупреждения
      на изменённых строках — те же самые pre-existing "Err-variant is very
      large" на сигнатурах функций, что были и до правки (не новые).
      Живым прогоном (throwaway Postgres/Redis, снесены после): с токеном
      админа — `GET /api/v1/user?limit=2000000000` → `pagination.limit: 100`
      (не 2 млрд), `GET /api/v1/media?limit=999999999` → `limit: 100`,
      `GET /api/v1/i18n?limit=999999999` → `limit: 100`; `GET
      /api/v1/user?page=-5&limit=-10` → `200`, `pagination: {page: 1,
      limit: 1}` (не крэш, не отрицательный `OFFSET` — `clamp(1, 100)` на
      `-10` корректно даёт `1`, не паникует).

---

## 5. `eprintln!`/`println!` вместо `tracing::` — ошибки мимо live-лог-вьюера в админке

`src/main.rs` настраивает `tracing_subscriber` с двумя слоями: `fmt::layer()`
и кастомный `LogBroadcastLayer` (`src/monitoring/service.rs:116-132`), который
транслирует `tracing::Event` в SSE на `GET /api/v1/events` — это и есть
live-просмотр логов сервера из Orchestrator → Monitoring. Но `eprintln!`/
`println!` используются в коде **143 раза** (`grep -rc` по `src/`), против
**5 файлов**, где используется `tracing::`. Любая ошибка, залогированная
через `eprintln!` (пример: `src/media/handlers.rs:971`,
`eprintln!("DB error: {:?}", e);`), уходит только в stdout/stderr процесса —
мимо и форматированного `fmt::layer()`, и мимо live-вьюера логов в админке,
который для этого и был построен.

- [x] **Переведены логи ошибок с `eprintln!`/`println!` на
      `tracing::error!`/`info!`/`debug!`** — 18 файлов (не трогая
      `bin/seed.rs`/`bin/check_redis.rs` — CLI-утилиты, там `println!` —
      нормальный вывод команды). `grep -rn "eprintln!\|println!" src | grep
      -v "/bin/"` → 0 совпадений, кроме 3 мест в `src/main.rs`, оставленных
      сознательно: `--export-openapi` (строка 255, однократная CLI-команда,
      до инициализации `tracing_subscriber`) и загрузка `.env` (260-261,
      до `tracing_subscriber::registry()...init()` на строке 268 — логировать
      туда ещё физически нечем). Большинство (почти все `eprintln!`) —
      механическая замена на `tracing::error!` с тем же форматом/аргументами
      (не точечно, но с ревью каждого файла, не вслепую). Не механически,
      по смыслу вызова: `content/handlers.rs:711` (дамп всего payload) →
      `tracing::debug!`, не `error!`; `monitoring/handlers.rs:218` (лог
      успешного действия "module reload") → `tracing::info!`;
      `auth/init.rs:39,65` (успешное создание/обновление суперадмина) →
      `tracing::info!`.

      **Важная находка по дороге, не механическая замена**:
      `core/db.rs`'s `create_pool()`/`create_redis_pool()` логировали
      `connect_url`/`redis_url` **целиком, вместе с паролем БД/Redis в
      открытом виде** (`println!("Connecting to database: {}", connect_url)`
      — URL вида `postgres://user:PASSWORD@host:port/db`). Механическая
      замена на `tracing::info!` превратила бы это в утечку секретов —
      после этого же прохода `tracing::info!`/`error!` транслируются живьём
      на `/api/v1/system/logs` (см. находку ниже про отсутствие авторизации
      там). Вместо прямой замены — логирую только host/port/db_name
      (`config.db_config.db_host`/`db_port`/`db_name`, `config.redis_host`/
      `redis_port`), без паролей.

      Проверено: `cargo check`/`cargo clippy --lib` — чисто, то же число
      warning'ов (97), что и до правки. Живым прогоном (throwaway
      Postgres/Redis, снесены после): в stdout сервера реальный
      `[2m...[0m [32m INFO[0m [2mguest_place::auth::init[0m[2m:[0m [Init]
      Superadmin created: ...` — подтверждает, что `fmt::layer()` и модульный
      путь (`target`) работают правильно. Подключился к живому
      `GET /api/v1/system/logs` (SSE, тот самый live-вьюер логов в
      админке) и вызвал `POST /api/v1/system/modules/orchestrator/reload`
      — в SSE-потоке реально появилась строка `data: Forced reload for
      module: orchestrator` — то есть именно то, ради чего затевался этот
      пункт (действие теперь видно live в админке), подтверждено end-to-end,
      не только компиляцией.

---

## 10. (Найдено по дороге, при проверке пункта 5) `/api/v1/system/*` — весь модуль мониторинга без авторизации

`src/lib.rs`: `monitoring::router()` монтируется в `app_router` **после**
`public_router.merge(protected_router)` (`.nest("/api/v1/system",
monitoring::router())`), т.е. вообще не проходит через `auth_middleware` —
ни через `public_router`, ни через `protected_router`. Тот же класс бага,
что в пункте 1 (`media`), но не входил в тот аудит, т.к. структура роутинга
здесь другая (не "один `router()` в `public_router`", а "модуль вообще
мимо обоих"). `/api/v1/events` (отдельный `.route(...)` на той же строке)
— тоже мимо auth, но это, похоже, уже осознанно (realtime bus-события для
публичных MFE — не проверял целевое назначение).

Полный список открытых анонимно эндпоинтов (`src/monitoring/mod.rs`):
- `GET /api/v1/system/health`
- `GET /api/v1/system/stats/stream` — живые CPU/memory/process-метрики сервера
- `GET /api/v1/system/logs` — **весь live-лог сервера** (ровно то, что
  проверялось выше в пункте 5 — т.е. любой в интернете может читать живые
  логи сервера, включая будущие `tracing::error!` с деталями исключений)
- `POST /api/v1/system/modules/{name}/reload` — реальное действие (чистит
  Redis-кэш модуля), подтверждено живым вызовом без токена в рамках этой же
  проверки
- `POST /api/v1/system/alert` — не проверял тело/эффект детально
- `GET /api/v1/system/search` — глобальный поиск, не проверял, по каким
  данным

- [x] **Разбит `monitoring::router()` на `public_router()`/`protected_router()`**
      по тому же паттерну, что в пункте 1. Публичным оставлен только
      `GET /health` (типичный infra-healthcheck); `stats/stream`, `logs`,
      `modules/{name}/reload`, `alert`, `search` — переведены под
      `auth_middleware`. `src/lib.rs`: `monitoring::public_router()` в
      `public_router`-блоке, `monitoring::protected_router()` — в
      `protected_router`-блоке; `/api/v1/events` (realtime bus-события,
      отдельный `.route`) не трогал — не входил в эту находку, другой
      механизм (`state.bus`, не `state.log_tx`), решение по нему отдельное.

      Проверено: `cargo check`/`cargo clippy --lib` — чисто, 0 новых
      warning'ов. Живым прогоном (throwaway Postgres/Redis, снесены после):
      без токена — `GET /api/v1/system/health` → **200** (остался
      публичным), `GET /api/v1/system/logs` → **401**, `GET
      /api/v1/system/stats/stream` → **401**, `POST
      /api/v1/system/modules/orchestrator/reload` → **401**, `GET
      /api/v1/system/search` → **401**, `POST /api/v1/system/alert` →
      **401**. С токеном суперадмина — `reload`/`logs`/`search` → **200**,
      т.е. легитимный сценарий работы админки не сломан.

---

## Admin Panel

## 6. XSS: несанитизированный `v-html` в предпросмотре версий RichText-поля + access-token в `localStorage`

`apps/admin-content/src/features/content-editor/ui/components/DiffCellContent.vue:23`:
```vue
<div class="richtext-preview" v-html="value || '<em style=\'opacity:0.4\'>empty</em>'" />
```
`value` — поле типа `RichText` из сравнения версий страницы
(`VersionDiffViewer.vue`), т.е. произвольный HTML, сохранённый через
Tiptap-редактор в прошлой версии контента. Проверка всего `admin-panel` на
`sanitize`/`DOMPurify` (`grep` по `apps`+`packages`, без `node_modules`/`dist`)
не нашла ни одной санитизации для рендера RichText — только совпадения по
*именам файлов* в `admin-media` (`useMediaPreview.ts` и т.п.), не связанные с
HTML-выводом.

Усугубляет: access-token лежит в `localStorage`
(`packages/lib/src/api/fetch.ts:28`, `packages/lib/src/composables/useAuth.ts:33,46`)
— доступен любому инлайн-скрипту. (`refresh_token` уже не в localStorage —
сервер хранит его в HttpOnly-cookie, `credentials: 'include'` — это не
проблема.) Побочно: `fetch.ts:77` — `localStorage.removeItem('gp_refresh_token')`
— мёртвый код, этот ключ больше никогда не пишется, безвредный no-op.

- [x] **Санитизирован RichText перед `v-html`** в `DiffCellContent.vue` —
      добавлена зависимость `dompurify` (прямая, в `admin-content`'s
      `package.json`, по тому же паттерну, что остальные сторонние
      зависимости приложения — не через `@admin-panel/lib`, т.к. нужна
      только здесь). Значение оборачивается в `computed(() =>
      DOMPurify.sanitize(props.value))` перед `v-html`, дефолт-заглушка
      ("empty") тоже через тот же computed, не отдельной строкой в шаблоне.

      Проверено: `pnpm --filter admin-content build`/`type-check`/`oxlint` —
      чисто. Отдельный standalone-тест (Node + `jsdom`, не входит в
      кодовую базу): прогнал через `DOMPurify.sanitize(...)` строку
      `<p>hello</p><img src=x onerror="alert(1)"><script>alert(2)</script>
      <a href="javascript:alert(3)">click</a>` — результат
      `<p>hello</p><img src="x"><a>click</a>`: `onerror`, `<script>` и
      `javascript:`-ссылка вырезаны, безопасная разметка (`<p>hello</p>`)
      осталась как есть.
- [x] Убран мёртвый `localStorage.removeItem('gp_refresh_token')`
      в `fetch.ts:77`.

---

## 7. Дублирование логики пагинации в 3 независимых composables

`apps/admin-users/src/entities/user/lib/composables/index.ts`,
`apps/admin-translations/src/entities/translation/lib/composables/index.ts`
и `apps/admin-media/src/entities/media/lib/composables/useMedia.ts` — каждый
заново объявляет один и тот же блок (ref пагинации + sync-watcher на
`data?.value?.data.pagination` + `setPage`/`setLimit` со сбросом на страницу 1
при смене лимита), байт-в-байт идентично. Тип `IPagination` уже общий
(`packages/lib/src/model/general.ts:33`), но сама логика реализована отдельно
3 раза.

- [x] **Вынесен `usePagination()` в `packages/lib/src/composables/usePagination.ts`**
      (экспортирован из пакета через существующий barrel
      `composables/index.ts`, тот же паттерн, что уже есть у
      `useAuth`/`useEvents`/и т.д. в этом пакете). Возвращает `{pagination,
      setPage, setLimit, syncFrom}`: `pagination` — тот же модуль-уровневый
      singleton `ref<IPagination>`, что был в каждом из 3 composables;
      `syncFrom(source, options?)` — обёртка над `watch` для
      синхронизации из ответа запроса (сохранил опцию `{ immediate: true }`
      — она была только у `translations`, остальные два её не использовали,
      поведение не изменилось ни для одного потребителя). Все 3 потребителя
      (`admin-users`, `admin-media`, `admin-translations`) переведены:
      убраны локальные `pagination = ref(...)`, inline `watch(...)`-блок
      синхронизации и повторные `setPage`/`setLimit` — теперь просто
      `const { pagination, setPage, setLimit, syncFrom } = usePagination()`
      + `syncFrom(() => query.data?.value?.data.pagination)` внутри
      `useX()`.

      Проверено: `pnpm --filter @admin-panel/lib build` (апп резолвят
      `@admin-panel/lib` из `dist`, не из `src` — без пересборки новый
      composable не был бы виден); `pnpm --filter admin-users --filter
      admin-media --filter admin-translations run type-check`/`build`/
      `oxlint` — все 3 чисто. Живым браузером не прогонял — чистый
      рефакторинг (тот же `watch`/`setPage`/`setLimit`, что и раньше, без
      изменения логики), риск ограничен компиляцией/типами, которые
      проверены.

---

## 8. Нулевое покрытие accessibility для icon-only кнопок и части `<img>`

`grep -rn 'aria-label'` по всему `apps/`+`packages/` — 0 совпадений во всём
admin-panel. При этом как минимум 16 мест используют `el-button circle`
(иконка без текста, например Edit/History/Refs/Delete в
`TranslationsTable.vue`) — единственное "описание" кнопки — текст
`el-tooltip`, видимый только при hover. Используемая версия `element-plus`
не проставляет `aria-describedby`/`role="tooltip"` на триггер — для
screen-reader пользователя кнопка буквально без названия.

Отдельно — 4 `<img>` без `alt`:
`apps/admin-media/src/features/media-dialogs/ui/MediaEditorDialog.vue:64`,
`.../media-upload/MediaUploadPreviewDialog.vue:4`,
`.../media-upload/MediaUploadFilesGrid.vue:22`,
`apps/admin-users/src/features/users-update-modal/ui/UsersUpdateModal.vue:65`.

- [x] **Добавлен `aria-label` на все icon-only `el-button circle`** без
      текста/`title` — не только в `TranslationsTable.vue` (пример из
      находки), а по всему admin-panel: написал скрипт (grep по всем
      `<el-button ... circle ... />`/`<el-button ...>...</el-button>` без
      видимого текста внутри, без `title=`, без уже существующего
      `aria-label=`) — нашёл **24 места в 11 файлах** (не 16, как было в
      первой оценке через `grep -c` — та оценка недосчитывала многострочные
      блоки). Исправлены все 24: `TranslationsTable.vue` (4),
      `NamespacesManagement.vue` (2), `UsersTable.vue` (2),
      `ModulesTable.vue` (4), `MfeMetricsTab.vue` (1), `FeaturesPage.vue`
      (1), `SettingsPageHeader.vue` (1), `MainLayout.vue` (2),
      `MediaTableColumns.vue` (2), `MediaUploadFilesGrid.vue` (2),
      `UiMfeFallback.vue` (1, динамический — `copied ? 'Скопировано!' :
      'Скопировать URL'`), `UiMediaPicker.vue` (2). Текст `aria-label` брал
      из соседнего `el-tooltip content`/`title`, где они были; где не было
      ни того, ни другого — из контекста обработчика клика (например
      `filesList.toggleCustom` → "Toggle custom name"). Повторный прогон
      того же скрипта после правок — 0 совпадений.
- [x] **Добавлен `alt` на все найденные `<img>` без него** — 4 из находки
      (`MediaEditorDialog.vue:64` — `currentMedia.data.name` как `alt`,
      `MediaUploadPreviewDialog.vue:4`, `UsersUpdateModal.vue:65` —
      "Аватар пользователя") **плюс пятый, найденный по дороге в том же
      файле, что и один из 4** — `MediaUploadFilesGrid.vue:22` (превью
      загружаемого файла, тот же компонент, что и его `circle`-кнопки выше
      в этой находке, но другая строка — не был в исходном списке из 4, но
      той же природы).

      Проверено на все пункты 8: `pnpm --filter admin-content --filter
      admin-users --filter admin-media --filter admin-translations --filter
      admin-orchestrator --filter admin-shell --filter @admin-panel/ui run
      type-check`/`build`/`oxlint` — все чисто, 0 новых warning'ов.
      Живым браузером не прогонял — `aria-label`/`alt` не влияют на
      визуальную раскладку (проверено разметкой, не скриншотом).

---

## 9. Мёртвые приведения `as any` на полях, типизированных как `unknown`

`apps/admin-content/src/features/venues/editor/composables/useVenueForm.ts:366-372`
— 6 полей (`halls`, `rooms`, `faq`, `reviews`, `feed`, `pricing_table`)
кастуются `as any` при сборке `CreateVenueDTO`. Реальный тип этих полей в
сгенерированных `packages/lib/src/api/types.ts` — `null |
components["schemas"]["Value"]`, а `Value` объявлен как `Value: unknown`.
Присвоение чего угодно в поле типа `unknown` не требует приведения вообще —
все 6 кастов не обходят никакую реальную проверку типов, просто лишний код,
создающий ложное ощущение, что здесь что-то нетипизированное/опасное.

- [x] Убраны `as any`, но **находка оказалась неточной для 1 из 6 полей** —
      проверил, не поверил на слово. `halls`/`rooms`/`faq`/`reviews`/`feed`
      — действительно мёртвые касты: убрал, `vue-tsc --build` прошёл сразу
      чисто, без единой ошибки. Но `pricing_table` — **не** `unknown`:
      реальный тип в локальном (не сгенерированном) `Venue`-интерфейсе
      (`apps/admin-content/src/entities/venues/api/index.ts:107`) —
      `VenuePricingTable` (`categories: {label, value?, largeHall?,
      smallHall?, allVenue?, type: 'merged' | 'split'}[]`), не общий
      `Value: unknown` из сгенерированных `packages/lib/src/api/types.ts`
      (та находка цитировала не тот тип — composable импортирует типы из
      локального `#entities/venues/api`, а не из сгенерированных). После
      удаления `as any` на этом поле `vue-tsc --build` реально упал:
      `type: string` (из объектного литерала без аннотации, виден TS как
      widened `string`, не литерал) не подходил под `'merged' | 'split'`.
      Это не было "лишним кастом" — `as any` маскировал настоящую, хоть и
      маленькую, несогласованность типов. Фикс — не возврат `as any`, а
      явная аннотация `const pricingTableData: VenuePricingTable = {...}`
      (добавил импорт типа), что даёт TS контекстный тип для литералов
      `'merged'`/`'split'` внутри массива — после этого `vue-tsc --build`
      снова чисто, без касинга.

      Проверено: `pnpm --filter admin-content run type-check`/`build`/
      `oxlint` — все чисто.

---

## Как использовать этот файл

Отмечайте закрытые пункты, добавляйте новые по дороге — тот же формат, что и
в предыдущем (закрытом) списке.
