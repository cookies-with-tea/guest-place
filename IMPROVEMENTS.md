# Guest Place — Открытые улучшения (server + admin-panel)

Предыдущие списки (`git log -- IMPROVEMENTS.md`) закрыты полностью — детали
и доказательства в git-истории этого файла. Ниже — новый проход: полный
повторный аудит `server/` и `admin-panel/` (`client/` не в скоупе, по
решению владельца продукта). Каждая находка подтверждена чтением кода и,
где применимо, сверкой со схемой БД — не предположение.

Отмечайте выполненные пункты `[x]` по ходу работы или просто удаляйте их.

---

## Server

### 1. `PUT/PATCH /api/v1/home` — обновление главной страницы без авторизации

`src/home/mod.rs:8-14` — единственный `router()` без разделения на
public/protected, смонтирован целиком в public-блок (`src/lib.rs:71`):
```rust
pub fn router() -> Router<Arc<AppState>> {
    Router::new().route("/", get(handlers::get_home).put(handlers::update_home).patch(handlers::update_home))
}
```
`update_home` пишет в БД (баннер, категории, интеракции) — любой
неавторизованный может перезаписать главную страницу.

- [ ] Разбить на `public_router()` (`GET /`) / `protected_router()`
      (`PUT`/`PATCH /`), смонтировать по аналогии с остальными модулями.

### 2. `POST/DELETE /api/v1/locks/{entity_type}/{entity_id}` — soft-locking без авторизации + можно снять чужой лок

`src/core/lock.rs` — весь `router()` (get/post/delete) смонтирован в
public-блок (`src/lib.rs:75`). `acquire_lock`/`release_lock` берут
`user_id`/`user_name` прямо из тела/query запроса — не проверяются вообще.

Отдельно, `release_lock` (`:211-214`):
```rust
if is_force || query.user_id.as_ref().map(|uid| uid == &existing.user_id).unwrap_or(true) {
```
`.unwrap_or(true)` — если `user_id` не передан, проверка владения
пропускается и лок снимается у кого угодно. Для сравнения, `get_lock_status`
(`:85`) делает `unwrap_or(false)` — здесь логика инвертирована.

- [ ] Разбить на `public_router()`/`protected_router()`, читать
      `user_id`/`user_name` из `Claims` (request extensions), а не из
      тела/query запроса — иначе один авторизованный пользователь может
      представиться другим.
- [ ] `unwrap_or(true)` → `unwrap_or(false)` в `release_lock`.

### 3. `POST /api/v1/block-types/sync` — upsert типов блоков без авторизации

`src/pages/mod.rs:22-26`, смонтирован в public (`src/lib.rs:67`):
```rust
pub fn block_types_public_router() -> AxRouter<Arc<AppState>> {
    AxRouter::new()
        .route("/", get(handlers::get_block_types))
        .route("/sync", post(handlers::sync_block_types))
}
```
`sync_block_types` делает `INSERT ... ON CONFLICT (slug) DO UPDATE` —
произвольный неавторизованный `POST` может переопределить
`name`/`description`/`icon`/`schema` любого существующего типа блока.

- [ ] Перенести `/sync` в `block_types_protected_router()` (там уже есть
      `create_block_type`/`update_block_type`/`delete_block_type`).

### 4. `home::handlers`: 7 запросов к БД (чтение + запись главной страницы) падают молча

Сборка главной страницы (`src/home/handlers.rs:139-215`) — `home_categories`
(:146), `home_interactions` (:179), дважды `venues` (:207, :221) —
`.unwrap_or_default()` без лога. Сохранение (`update_home`, :343, 350, 369,
377) — те же четыре `let _ = sqlx::query(...).execute(...).await;` без
обработки. В обеих функциях есть соседний запрос (`:115-124` в сборке,
основной `UPDATE` в сохранении), который корректно логирует через
`tracing::error!` — паттерн известен автору, просто не применён везде.
Итог: если сохранение упадёт, админ получит `200 OK`, но изменения не
сохранятся — без единого следа в логах.

- [ ] Заменить `.unwrap_or_default()`/`let _ =` на обработку с
      `tracing::error!` (и, для `update_home`, пробросить ошибку клиенту —
      `.map_err(...)?`) на всех 7 запросах, по аналогии с уже корректным
      соседним кодом в этих же функциях.

### 5. `i18n` rollback: проглоченная ошибка `SELECT` портит историю версий, а не просто возвращает пусто

`src/i18n/handlers.rs:684-691` — `SELECT value FROM i18n_translations ...
.unwrap_or_default()`. Если строка не найдена или запрос упал,
`current_value` молча становится `""` и сразу же (`:701-708`)
`INSERT`-ится в `i18n_translation_versions` как "снимок перед откатом" —
то есть в историю версий постоянно записывается пустая строка, подписанная
как легитимный снимок. Рядом, `:693-700`, `next_version: i32 = ...
.unwrap_or(1)` — тот же паттерн, может привести к дублю `version_number`.

- [ ] На ошибке/пустом результате `SELECT value` возвращать 500 вместо
      продолжения с суррогатным значением; аналогично для `next_version`.

### 6. `content::validate_entry_data`: N+1 запрос на каждый UUID в relation-поле

`src/content/handlers.rs:378-396` — для relation-поля с массивом UUID на
каждый отдельный UUID выполняется свой `SELECT EXISTS(...)` в цикле.
Вызывается на каждый `create_entry`/`update_entry`.

- [ ] Один запрос: `SELECT e.id FROM content_entries e JOIN content_schemas
      s ON e.schema_id = s.id WHERE s.slug = $1 AND e.id = ANY($2)`, затем
      сравнение множеств для сообщения о конкретном невалидном UUID.

### 7. Multi-file upload: неудачное сохранение файла/`INSERT` молча теряет файл

`src/media/handlers.rs:266` (`if let Ok((_hash, relative_path)) =
save_result`) и `:294` (`if let Ok(row) = db_result`) — без `else`. Если из
5 загруженных файлов 2 не сохранились — ответ содержит 3 успешных элемента
без единого признака, что 2 потеряны и почему.

- [ ] `else { tracing::error!(...) }` на оба `if let`, собирать failed-файлы
      в `messages` ответа.

### 8. `GET /api/v1/content/schemas/{id}/entries` и `GET /api/v1/pages` — без пагинации вообще

`src/content/handlers.rs:464-489` (`get_entries`) и `src/pages/handlers.rs:
28-44` (`get_pages`) — без `LIMIT`, отдают всю таблицу целиком (с полным
JSONB на каждую запись). В PR #60 то же самое точечно исправлено для
venues/user/media/i18n — эти два основных CMS-хранилища тогда не попали в
скоуп.

- [ ] Добавить `page`/`limit` с `.clamp(1, 100)`, как в остальных
      list-эндпоинтах.

### 9. `get_sitemap_xml`: ручная сборка XML без escaping

`src/pages/handlers.rs:295-301` — `loc`/`lastmod` интерполируются в XML
через `format!` без escaping. `slug` (`src/pages/model.rs`) — обычный
`String` без валидации формата. Страница со slug, содержащим `&`, `<` или
`"`, сломает `sitemap.xml` (невалидный XML).

- [ ] Либо валидировать `slug` при создании/обновлении страницы
      (`[a-z0-9-/]`), либо экранировать `loc`/`lastmod` при сборке XML.

### 10. Мелкие cleanup-находки

- `src/venues/handlers.rs:961-973` — `toggle_favorite` полностью фиктивна:
  игнорирует `state`, ничего не пишет в БД, всегда возвращает `is_favorite:
  true`. Если клиент рассчитывает на персистентность — она не работает.
- `src/content/mod.rs:40-42` — `router()` (merge public+protected) мёртвый
  код, `lib.rs` вызывает `public_router()`/`protected_router()` раздельно.

---

## Admin Panel

### 11. `admin-orchestrator`: `useMfe.ts` — `deleteMutation` без `onError`, остальные только `console.error`

`apps/admin-orchestrator/src/entities/mfe/lib/composables/useMfe.ts:97-104`
— `deleteMutation` вообще без `onError`, пользователь не узнает о неудаче.
`createMutation`/`updateMutation` (:67-95) имеют `onError`, но только
`console.error` — слабее уже применённого в admin-users/media/translations
паттерна `ElMessage.error`.

- [ ] Добавить `onError: (err) => ElMessage.error(err?.message || '...')`
      на все три мутации.

### 12. `admin-shell`: `GlobalSearch.vue` — `isLoading` зависает в `true` навсегда при ошибке API

`apps/admin-shell/src/features/global-search/ui/GlobalSearch.vue:124-201` —
`isLoading.value = true` → `await systemApi.search(...)` без try/catch →
`isLoading.value = false`. При падении запроса спиннер висит вечно, уже
собранные локальные (sidebar nav) результаты теряются, ошибка не показана.

- [ ] Обернуть в try/catch (или try/finally для `isLoading`), показать
      `ElMessage.error`, не терять локальные результаты.

### 13. `admin-shell`: бутстрап приложения без обработки ошибок — белый экран при сбое

`apps/admin-shell/src/app/index.ts:78-92` — цепочка `await loadDict(...)`
×5 и `await initRouter(app)` без единого try/catch. `initRouter` →
`loadRemoteRoutes` → `await mfeApi.getManifest()`
(`app/router/index.ts:101`) тоже без try/catch. Любая ошибка на старте
(сеть, 401, 500) — необработанный reject, админка не инициализируется,
белый экран без сообщения. Отдельно, `on(GP_EVENTS.UPDATED, async () => {
await loadRemoteRoutes(app) ... })` (`router/index.ts:256`) — тихо роняется
как unhandled rejection при обновлении списка MFE.

- [ ] Обернуть бутстрап-цепочку в try/catch с экраном ошибки вместо белого
      экрана; обернуть обработчик `GP_EVENTS.UPDATED`.

### 14. `admin-statistics`: 6 виджетов без try/catch — `loading` зависает, ошибка не видна

Идентичный паттерн (видимо скопирован) в:
`features/retention-cohorts/ui/RetentionCohorts.vue:68-72`,
`features/conversion-funnel/ui/ConversionFunnel.vue:48-52`,
`features/referral-sources/ui/ReferralSources.vue:39-43`,
`widgets/traffic-chart/ui/TrafficChart.vue:32-38`,
`widgets/engagement-stats/ui/EngagementStats.vue:34-38`,
`widgets/analytics-summary/ui/AnalyticsSummary.vue:~71-78` (без `loading`,
но то же самое — при ошибке карточки просто не обновляются молча).

- [ ] Обернуть `await analyticsApi.getX(...)` в try/catch/finally во всех 6
      файлах, сбрасывать `loading` в `finally`, `ElMessage.error`/
      `console.error` на неудаче.

### 15. `admin-content`: `ContentPage.vue` — импорт показывает "успех" даже если все записи упали

`apps/admin-content/src/pages/content-page/ui/ContentPage.vue:120-158`
(`onImport`) — `for (const item of importedData) { try {
await contentApi.createEntry(...) } catch { /* Error handled per item if
needed */ } }` — комментарий лжёт, ошибка просто проглочена. После цикла
всегда `ElMessage.success('Successfully imported ${successCount}
entries')` — даже если `successCount === 0`.

- [ ] Считать count ошибок, показывать `ElMessage.warning`/`error` с числом
      неудачных записей, если `successCount < importedData.length`.

### 16. Accessibility: icon-only кнопки без `aria-label`

13 self-closing `<el-button :icon="..." />` без текста/`aria-label`/`title`:
`admin-content` — `HomeInteractionsTab.vue:26`,
`VenuesCatalogView.vue:195`, `VenueReviewsFaqTab.vue:20,58`,
`VenueFeedTab.vue:24`, `VenueHallsRoomsTab.vue:68,113`,
`PageListCard.vue:77`, `RedirectsTable.vue:8,23`;
`admin-media` — `MediaEditorDialog.vue:42-43`, `MediaCropDialog.vue:40-41`.
Плюс 2 места с `title`, но без `aria-label` (слабее для screen reader):
`VenueMenuTab.vue:22`, `FieldsCanvas.vue:110`.

- [ ] Добавить `aria-label`, по аналогии с уже исправленными в PR #60
      местами (`SettingsPageHeader.vue:22`, `FeaturesPage.vue:26`,
      `UiMediaPicker.vue:26,36`).

### 17. `as any`-касты, маскирующие реальные несоответствия типов (3 из ~55 найденных)

- `apps/admin-content/src/features/page-constructor/composables/useLivePreview.ts:16,40`
  — тип параметра не объявляет поле `blocks`, `(pageForm as any).blocks`
  маскирует неполный тип. Фикс: добавить `blocks: any[]` в тип, убрать каст.
- `apps/admin-translations/.../composables/index.ts:203` —
  `createMutation.mutate(data as any)`, хотя `createTranslation` уже
  типизирован как union с массивом — каст избыточен после `Array.isArray`.
- `apps/admin-users/.../composables/index.ts:150` — `update(id, data as
  any)` для `Partial<IUserCreateUpdate>`, хотя `update()` объявлен как
  принимающий полный тип (backend корректно обрабатывает частичные поля —
  баг не runtime, а в сигнатуре API-функции). Фикс: изменить сигнатуру
  `update()` на `Partial<IUserCreateUpdate>`, убрать каст.

(Остальные `as any` в проекте — легитимный паттерн для federation-глобалов
`(window as any).__gp_*` и динамического lookup `(Icons as any)[name]`, не
трогать.)

### 18. `console.log` в продовом runtime-коде

- `packages/ui/src/inject-styles.ts:12,22` — логирует при каждой загрузке
  страницы в проде.
- `packages/i18n/index.ts:87,94,109` — логирует на каждый namespace
  fetch/skip с деталями ключей.

- [ ] Убрать или перевести под debug-флаг.
