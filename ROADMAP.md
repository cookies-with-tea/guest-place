# Guest Place — Roadmap

Этот документ фиксирует план дальнейшей разработки по трём частям проекта
(`admin-panel`, `client`, `server`) с учётом приоритетов:

- **admin-panel** — приоритет качества кода и UX. Основной рабочий инструмент.
- **client** — черновик, намеренно не дотянут, дорабатывается после admin-panel.
- **server** — должен работать и давать admin-panel нужные API; архитектурная
  чистота бэкенда вторична по сравнению с frontend-частями.

Обновляйте этот файл по ходу работы — вычёркивайте закрытые пункты, добавляйте
новые, если находите по пути ещё один источник проблем (так уже было с багами,
описанными в разделе 1).

---

## 0. Статус на сейчас (после сессии рефакторинга мега-страниц)

Сделано:

- Убрано дублирование `ContentFormGenerator` — единая schema-driven реализация
  в `@admin-panel/ui`, вместо захардкоженной копии в `admin-content`.
- Разобраны 6 "мега-страниц" admin-content на композаблы + компоненты:

  | Файл | Было | Стало |
  |---|---|---|
  | `PageConstructorPage.vue` | 3018 | 105 |
  | `VenuesPage.vue` | 2905 | 63 |
  | `SchemaBuilderPage.vue` | 1594 | 85 |
  | `HomePageEditor.vue` | 1219 | 228 |
  | `MenusPage.vue` | 945 | 157 |
  | `PageListPage.vue` | 983 | 47 |

- Вынесена повторяющаяся карточка (иконка + заголовок + описание) в
  `@admin-panel/ui` как `UiGlassCard` — переиспользуется в Venues и Home Page
  вместо копипасты.
- Найдены и исправлены реальные баги, не просто стилистические проблемы:
  - `VenuesPage.vue`: переменные `venueTabs`, `splitRatio` и функция
    `generateSlugFromTitle` использовались в шаблоне, но не были объявлены —
    навигация по вкладкам редактора площадки была физически недостижима.
  - `usePageDocument` (PageConstructor): `fetchPage()` читал `snake_case`
    поля из уже camelCase-конвертированного ответа API — при редактировании
    страницы поля публикации/SEO никогда не подгружались.
  - Несоответствие типов `Menu`/`MenuItem` (интерфейс в `snake_case`, реальный
    ответ API-клиента в `camelCase`) — не баг в поведении, но источник похожих
    ошибок, если продолжать копировать паттерн не глядя.

Не сделано (годится как первые пункты следующего трека):

- [x] `ModulesPage.vue` (`admin-orchestrator`, было 1178 строк, стало 61) —
  разобран той же методикой. Два новых композабла в
  `apps/admin-orchestrator/src/features/modules/composables/`:
  `useModuleHealth.ts` (пинг MFE, авто-пинг, дашборд-метрики, hot reload) и
  `useModuleRoutes.ts` (drawer включения/отключения пунктов меню per-MFE).
  Четыре компонента в `.../features/modules/ui/`: `ModulesStatsGrid.vue`,
  `ModulesTable.vue`, `ModuleRoutesDrawer.vue`, `ModuleFormDialog.vue`.
  Важный нюанс конвенции, не вполне очевидный заранее: оба новых композабла
  оборачивают возврат в `reactive({...})` (как уже делали `useCurrentMenu`/
  `useUnifiedPageList` до этого) — без этого рефы внутри не разворачиваются
  автоматически при передаче всего объекта композабла как единого пропа в
  дочерний компонент (`:health="health"`), и двусторонние биндинги
  (`v-model`) в детях молча ломаются. Существующий `useMfe()` НЕ обёрнут в
  `reactive()` (он используется в 2 других местах через деструктуризацию,
  трогать нельзя) — обёрнут только в месте передачи, в самой `ModulesPage.vue`
  (`const mfe = reactive(useMfe())`), а исходный `ComputedRef` для
  `microfrontends` передан в `useModuleHealth()` до обёртки, напрямую.
- [x] `TiptapEditor.vue` (`admin-content`, было 1133 строки, стало 207) —
  разобран. Уточнение по факту (предположение в этом пункте не подтвердилось):
  в файле **не было** кастомных Tiptap extensions (`Mark.create()`) — все
  используемые расширения (`StarterKit`, `Underline`, `Highlight`, `TextStyle`,
  `TextAlign`, `Link`, `Placeholder`, `CharacterCount`) готовые, из пакетов.
  Кастомные marks `translationKey`/`nonTranslatable`/`currency` из раздела 4.2
  ещё не существуют — это будущая работа, не текущая. Реальная причина
  раздутости файла — ~670 строк разметки тулбара (20+ кнопок с инлайновыми
  SVG-иконками). Разобран той же методикой, что и остальные мега-файлы:
  композабл `apps/admin-content/src/features/content-editor/composables/useTiptapEditor.ts`
  (создание `Editor`, синхронизация внешних изменений, диалог вставки ссылки,
  lifecycle) + два компонента в `.../ui/components/tiptap/`: `TiptapToolbar.vue`
  (вся кнопочная панель) и `TiptapLinkDialog.vue`. `TiptapEditor.vue` стал
  тонкой оболочкой, собирающей композабл + компоненты + `EditorContent`.
  Нюанс: `editor` — не обычный `ref`, а результат `useEditor()` из
  `@tiptap/vue-3`; при передаче через `reactive()`-обёрнутый композабл он
  корректно разворачивается в сам `Editor`-инстанс (не в Proxy вокруг него —
  `reactive()` не рекурсивно оборачивает значение, которое достаёт через
  `unref()` у вложенного рефа), поэтому `:editor="controller.editor"` и
  `controller.editor?.chain()...` в дочерних компонентах работают как и
  раньше. Для DOM-рефа поля ввода ссылки (`linkInputRef`, нужен для
  автофокуса) пришлось использовать функциональный `:ref="(el) => controller.linkInputRef = el"`
  вместо строкового `ref="linkInputRef"` — последний не работает для
  вложенного в `reactive()`-проп рефа. Проверено живым браузерным харнессом:
  печать текста, bold/italic форматирование, счётчик символов, диалог вставки
  ссылки (открытие, автофокус инпута, вставка, активное состояние кнопки
  Link/Remove Link) — всё работает, консоль чистая.
  - Новая находка по пути (не чинили, вне скоупа этой задачи): у `admin-content`
    — единственного приложения, где это пока проверено — `vue-tsc --build`
    падает примерно на 40 ошибках `TS2304: Cannot find name 'field'` в
    `packages/ui/.../ContentFormGenerator.vue` (переменная `v-for="field in fields"`
    объявлена корректно, это похоже на лимит/баг `vue-tsc`/Volar на очень
    большом шаблоне с глубокой вложенностью `v-if`/`v-else-if`, а не реальная
    ошибка — компонент работает в проде). Плюс в `RedirectsPage.vue` —
    реальный повтор уже знакомого класса бага: интерфейс в `snake_case`
    (`source_path`, `target_path`, `status_code`...), а данные от API в
    `camelCase` (см. аналогичный баг `Menu`/`MenuItem` в разделе 0). Обе
    находки — кандидаты в следующую сессию по разделу 0/2.
- [x] `admin-media/MediaUploadDialog.vue` (было 828 строк, стало 75) — разобран.
  Четыре композабла в `features/media-dialogs/composables/`: `useUploadFilesList.ts`
  (стейджинг-список файлов на загрузку), `useUploadPreview.ts` (диалог
  предпросмотра файла перед загрузкой), `useImageCrop.ts` (встроенный в
  браузере кроп/ресайз изображения, принимает `useUploadFilesList` как
  зависимость — читает/мутирует элемент после кропа), `useMediaUploadSubmit.ts`
  (глобальные метаданные формы + сабмит, принимает список файлов + `createMedia`/
  `closeUploadModal`/`isSubmitting` из существующего `useMedia()`). Четыре
  компонента в `ui/media-upload/`: `MediaUploadGlobalSettings.vue`,
  `MediaUploadFilesGrid.vue`, `MediaUploadPreviewDialog.vue`, `MediaCropDialog.vue`.
  Попутно убрал дублирование: вместо локальных `isImageFile`/`isVideoFile` —
  уже существовавшие `mediaUtils.isImage`/`mediaUtils.isVideo` из
  `entities/media/utils/media.utils.ts` (были определены, но не использовались
  в этом файле). Ещё один нюанс в духе `reactive()`-паттерна: `cropperRef`
  (компонентный реф на `VueCropper`, нужен для `rotateLeft()`/`getCropBlob()`)
  живёт внутри `reactive()`-обёрнутого `useImageCrop()` и передаётся в
  `MediaCropDialog.vue` пропом — строковый `ref="cropperRef"` в такой
  ситуации не работает (см. аналогичный случай с `linkInputRef` в
  `TiptapEditor.vue` выше), использован функциональный `:ref="(el: any) => (crop.cropperRef = el)"`.
  Проверено живым браузерным харнессом (с `VueQueryPlugin`, без бэкенда —
  запросы `folders`/`tags`/`config` падают 500, это ожидаемо и обрабатывается
  graceful fallback'ом): диалог открывается, чекбокс "Apply to all files"
  корректно блокирует/разблокирует глобальные поля через всю цепочку
  `reactive()` → проп → шаблон, консоль чистая (кроме ожидаемых сетевых 500).
- [x] `admin-translations/TranslationEditor.vue` (было 825 строк, стало 48) —
  разобран. Это "свой tag-формат для rich-текста" из `packages/i18n` (раздел
  4.1, пункт 1) — визуальный/исходный редактор `{b}жирный{/b}`, `{span}`,
  `{slotName}` с live-предпросмотром. Два композабла в
  `features/translation-editor/composables/`: `useTagEditor.ts` (ядро
  редактора — переключение visual/source режима, применение тегов через
  `document.execCommand` в visual-режиме и через `wrapWithTag`/`unwrapTag` из
  `@admin-panel/i18n` в source-режиме, попапы вставки слота/кастомного тега,
  валидация) и `useTagPreview.ts` (детект слотов регэкспом, mock-значения
  для теста, рендер через `h()` из распарсенных `I18nNode`, принимает
  `useTagEditor` как зависимость). Четыре компонента в `ui/components/`:
  `TagEditorToolbar.vue`, `TagEditorBody.vue`, `TagEditorFooter.vue`,
  `TagEditorPreviewPanel.vue`. Тот же приём с функциональным рефом, что и в
  `TiptapEditor`/`MediaUploadDialog`: `visualEditorRef`/`textareaRef` (DOM-рефы
  contenteditable-дива и textarea) передаются через `reactive()`-обёрнутый
  композабл, поэтому `:ref="(el) => (editor.visualEditorRef = el)"`, а не
  строковый `ref=`. Проверено живым браузерным харнессом: переключение
  visual/source режимов, bold/подсветка span, вставка слотов (чипы в visual,
  `{name}` в source), live-предпросмотр с детектом слотов и реактивным
  обновлением mock-значений (`count: 5` → `42` сразу отразилось в рендере) —
  всё работает, консоль чистая.
- [x] `admin-media/MediaFilters.vue` (было 775 строк, стало 92) — разобран.
  Два композабла в `features/media-filters/composables/`:
  `useMediaFilterControls.ts` (поиск/папка/тип/категория/теги/размер/дата —
  вся логика фильтрации + производные "активные фильтры"-бейджи) и
  `useMediaFolderDialog.ts` (создание/редактирование/удаление папки). Шесть
  компонентов в `ui/components/`: `MediaFiltersHeader.vue`,
  `MediaFoldersBar.vue`, `MediaTypeFilterBar.vue`, `MediaFilterControlsRow.vue`,
  `MediaActiveFilterTags.vue`, `MediaFolderDialog.vue` — самая мелкая
  гранулярность среди всех разобранных на сегодня мега-файлов, т.к. шаблон
  состоял из 6 явно разделённых, не связанных друг с другом визуально блоков.
  `:deep()`-переопределения стилей Element Plus (`.el-input__wrapper` и т.п.)
  оставлены в корневом `MediaFilters.vue` — `:deep()` пробивает границы
  компонентов по DOM-вложенности, а не по границам Vue-компонента, так что
  работает независимо от того, в каком дочернем компоненте реально
  рендерится `<el-input>`/`<el-select>`. Проверено живым браузерным
  харнессом (с `VueQueryPlugin`, без бэкенда): поиск корректно обновляет
  query-параметр и триггерит перезапрос, клик по типу подсвечивает пилюлю и
  добавляет бейдж в "Active filters", Reset Filters корректно всё сбрасывает
  — вся цепочка `reactive()` → проп → шаблон → обратно в `filters` от
  `useMedia()` работает, консоль чистая (кроме ожидаемых сетевых 500).
- [x] `admin-content/ContentDocsPage.vue` (было 772 строки после сегодняшнего
  расширения вкладкой "0. Обзор", стало 441) — разобран, с оговоркой: это не
  такое резкое сокращение, как у остальных файлов сегодня, и так и должно
  быть. Страница — чистая документация (не бизнес-логика): пять вкладок с
  текстом/диаграммами и общий набор презентационных классов
  (`.info-card`, `.styled-list`, `.split-card`, `.code-block-card`,
  `.comparison-cards` и т.п.), используемых сразу в 2-3 вкладках. Контент
  каждой вкладки вынесен в отдельный компонент без логики и без собственных
  стилей в `ui/tabs/` (`DocsOverviewTab.vue`, `DocsSchemasTab.vue`,
  `DocsSplitViewTab.vue`, `DocsLivePreviewTab.vue`,
  `DocsTroubleshootingTab.vue`) — но общие стили сознательно оставлены в
  родительском `ContentDocsPage.vue` одним блоком `:deep() { ... }`, а не
  задублированы в каждой вкладке: `:deep()` пробивает границу дочернего
  компонента по DOM-вложенности (а не только "глубокую" CSS-вложенность, как
  можно подумать по названию), поэтому стили из родителя продолжают работать
  независимо от того, что соответствующая разметка теперь физически лежит в
  другом файле — предпочёл это дублированию ~150 строк общих стилей в 2-5
  компонентах. Итоговый суммарный объём (794 строки по всем файлам) почти не
  изменился против исходных 772 — выигрыш не в сокращении кода, а в том, что
  контент каждой вкладки теперь редактируется независимо, без скролла по
  772-строчному файлу. Проверено живым браузерным харнессом (с mock vue-router):
  переключение между всеми 5 вкладками, раскрытие FAQ-аккордеона — стили
  корректно долетают до вложенных компонентов через `:deep()`, включая
  вложенный случай (`:deep()` родителя поверх `:deep()` Element Plus
  внутри дочернего `DocsTroubleshootingTab.vue`), консоль чистая.
- [x] `admin-content/ContentEditorPage.vue` (было 710 строк, стало 93) —
  разобран. Два композабла в `pages/content-editor-page/composables/`:
  `useContentEntry.ts` (загрузка схемы/записи, soft-lock через
  `useEntityLock`, сохранение, навигация назад) и `useSplitPreview.ts`
  (сплит-панель живого предпросмотра: URL/device контролы, мост
  `postMessage` с iframe/открытой вкладкой). Два компонента:
  `EntryLockBanner.vue` и `SplitPreviewPanel.vue`. Нюанс: эти два композабла
  не независимы — `useSplitPreview` читает `schema`/`formData` из
  `useContentEntry`, а `useContentEntry`'s `fetchData`/`onSave` должны
  вызывать `autoDetectPreset`/`sendPreviewData` из `useSplitPreview`, что
  создаёт циклическую на первый взгляд зависимость конструирования. Решено
  передачей колбэков не в момент создания композабла, а в момент вызова
  функции (`entry.fetchData(preview.autoDetectPreset)`,
  `entry.onSave(seoData, { onSaved: preview.sendPreviewData, shouldGoBack: ()
  => !preview.isSplitPreview })`) — `useContentEntry` создаётся первым и ничего
  не знает о preview на этапе конструирования, `useSplitPreview` создаётся
  вторым, получая уже готовый `entry`; сама оркестровка (кто кого вызывает)
  осталась в `ContentEditorPage.vue` — это не бизнес-логика страницы, а
  клей между двумя уже независимыми концернами, та же природа, что и
  `watch` с query-параметром в `ModulesPage.vue` ранее. Проверено живым
  браузерным харнессом (мок `useContentEntry`, реальный `useSplitPreview` +
  `SplitPreviewPanel.vue`): переключение пресетов `/about`/`/guests`,
  переключение Desktop/Tablet/Mobile, автодетект пресета по slug схемы —
  всё работает; ошибки в консоли оказались из постороннего Nuxt-приложения,
  запущенного на localhost:3000 на этой машине (внутри iframe), не из кода
  компонента.
- [x] `admin-content/ContentEditor.vue` (было 689 строк, стало 117) —
  разобран. Не путать с `ContentEditorPage.vue` из предыдущего пункта: это
  вложенный компонент самого редактора записи (тулбар/вкладки/история),
  а тот — страница-обёртка со сплит-превью. Два композабла в
  `features/content-editor/composables/`: `useTranslationMode.ts`
  (source/target колонки для перевода полей схемы) и `useEntryHistory.ts`
  (история версий + diff/rollback). Четыре компонента в `ui/components/`:
  `ContentEditorHeader.vue`, `EntryContentTab.vue`, `EntryHistoryTab.vue`,
  `VersionDiffDrawer.vue`. Как и в `TranslationEditor.vue` раньше,
  композаблы не независимы (`useEntryHistory`'s `handleRollbackDiff`
  вызывает её же `onRollback`, что нормально — это один композабл; но
  `useTranslationMode` читает `modelValue`/`i18n`, которые в этом файле —
  настоящие `defineModel()`-рефы родителя, не часть другого композабла).
  `<el-tab-pane>` и `<el-drawer>` сознательно оставлены прямыми детьми
  `<el-tabs>` в `ContentEditor.vue`, а не вынесены в компоненты-обёртки —
  вынесено только содержимое каждой вкладки: Element Plus регистрирует
  `ElTabPane` через `provide`/`inject` от ближайшего `ElTabs`-предка, а не
  сканированием vnode'ов default-слота, так что обёртка in theory не должна
  ломать регистрацию, но это не стал проверять эмпирически — решил не
  рисковать и оставить сам `<el-tab-pane>` на месте (тот же приём уже
  использован в `ContentDocsPage.vue` и подтверждён там в браузере).
  Проверено живым браузерным харнессом: переключение статуса записи,
  Translation Mode (появляются source/target колонки, source — readonly),
  Live Preview toggle (двусторонний `v-model` через `ContentEditorHeader`
  работает), переключение на вкладку History триггерит реальный fetch
  истории версий (сломан только из-за отсутствия бэкенда, это ожидаемо) —
  всё работает, консоль чистая (кроме ожидаемых сетевых 500).
- [x] `admin-content/SettingsPage.vue` (было 676 строк после добавленного
  сегодня текста про global-settings, стало 75) — разобран. Один композабл
  `pages/settings-page/composables/useGlobalSettingsEntry.ts` (schema/entry
  загрузка, сохранение, инициализация схемы в 1 клик) + три компонента в
  `ui/components/`: `SettingsPageHeader.vue`, `SettingsSchemaEditor.vue`
  ("State 1" — схема есть), `SettingsOnboarding.vue` ("State 2" — 404,
  онбординг). Нюанс типизации: `SettingsSchemaEditor.vue` рендерится
  родителем только когда `entry.schema` truthy (`v-else-if="entry.schema"`),
  но TS не переносит это сужение типа через границу компонента — пришлось
  добавить `entry.schema!` (non-null assertion) в двух местах, инвариант тот
  же, что держал исходный инлайновый `v-else-if`. По стилям — третий разный
  случай переиспользования (после `:deep()` в ContentDocsPage и дублирования
  мелких правил в MediaFilters): `.glass-card` (общая база карточки, ~7
  строк) продублирован в 3 местах вместо `:deep()`, а дублировавшиеся в
  оригинале `.is-dark`-переопределения убраны полностью — каждый дочерний
  компонент сам зовёт `useTheme()` и навешивает класс `is-dark` на свой же
  корневой элемент, а не получает его от родителя через общий класс на
  `.settings-page` — так тёмная тема не требует вообще никакого
  кросс-компонентного шаринга стилей. Проверено живым браузерным харнессом
  (с vue-router, без бэкенда → состояние 404/онбординг): хедер, карточки
  features/default-fields, клик "Инициализировать схему в 1 клик"
  корректно триггерит POST-запрос — всё работает, консоль чистая (кроме
  ожидаемых сетевых 500).
- [x] `admin-orchestrator/MonitoringPage.vue` (было 651 строка, стало 127) —
  разобран. Композабл `pages/monitoring-page/composables/useSystemStats.ts`
  (SSE-подписка на `/api/v1/system/stats/stream`, история для спарклайнов,
  производные метрики) + три компонента в `components/`: `MfeMetricsTab.vue`,
  `SystemMetricsTab.vue` и — в отличие от остальных сегодняшних разборов —
  переиспользуемый `SparklineMetric.vue`, который не просто переносит
  разметку, а убирает реальное дублирование: в оригинале один и тот же блок
  "лейбл + hero-значение + SVG-спарклайн" был скопирован 4 раза (CPU/Memory
  × MFE-карточка/системный процесс), теперь это один параметризуемый
  компонент (`label`, `heroValue`, `historyValues`, `gradientId`,
  `strokeColor`, `max`) на 4 места использования. SVG `<linearGradient
  id="grad-cpu">` остался в корневом `MonitoringPage.vue` (рендерится один
  раз) — `fill="url(#grad-cpu)"` внутри `SparklineMetric.vue` всё равно
  резолвится, т.к. `url(#id)`-ссылки в SVG работают на уровне DOM-документа,
  а не границ Vue-компонента. Четвёртый вариант обращения со стилями за
  сегодня: `.panel-card`/`.panel-header`/`.equal-height-row` и т.п. —
  реально используются в ОБОИХ вкладках (MFE-грид и системный грид), это
  достаточно большой объём (~70 строк), чтобы не дублировать — вынесены в
  `:deep()`-блок родителя, тот же приём, что в ContentDocsPage, но здесь
  применён только к части стилей, а не ко всем (мелкие стили, специфичные
  для одной вкладки, остались локально в ней). Проверено живым браузерным
  харнессом: `SparklineMetric.vue` отдельно (с фиктивными данными —
  спарклайн и градиентная заливка рендерятся верно) и вся `MonitoringPage`
  целиком (переключение вкладок, гейджи CPU/Memory/Uptime с дефолтными
  нулевыми значениями при пустом стриме) — всё работает, консоль чистая
  (кроме ожидаемых сетевых 500).
- [x] `admin-about/AboutPage.vue` (было 651 строка, стало 137) — разобран.
  Композабл `pages/composables/useAboutData.ts` (fetch/save формы из 5 секций
  + авто-сохранение при смене превью-картинки каждой секции). Шесть
  компонентов в `pages/components/`: `AboutPageHeader.vue`,
  `GeneralSettingsCard.vue`, `OpportunitiesSection.vue`, `LeadershipCard.vue`,
  `WhoWeAreSection.vue`, `NewsCard.vue` — и седьмой, `KeyIconItemList.vue`,
  который, как и `SparklineMetric.vue` в `MonitoringPage.vue` ранее, убирает
  реальное дублирование: блок "текст-инпут + медиа-пикер + кнопка удаления +
  кнопка добавления" был идентично скопирован для Leadership items и News
  items (включая одинаковый дефолт нового элемента `{text: '', iconUuid:
  null}`) — теперь это один компонент на оба места, мутирующий переданный
  `items`-проп напрямую (`push`/`splice`), без лишнего `v-model`/emit.
  Нюанс типизации: вместо `Record<string, any>` для пропа `form` в дочерних
  компонентах экспортирован точный тип `AboutForm = AboutData['form']` — с
  `Record<string, any>` терялась конкретность типов массивов, и
  `v-for="(opp, index) in form.opportunities"` давал `index: string |
  number` вместо `number` (2 реальные новые ошибки TS2365 от этого). По
  стилям — тот же путь, что в `ContentDocsPage`/`MonitoringPage`: почти все
  классы (`.section-card`, `.card-header`, `.guide-hint`, `.mb-*`/`.mt-*`,
  `:deep(.el-form-item__label)`) используются в 3-5 из 6 секций, поэтому
  вынесены в `:deep()`-блок родителя целиком; уникальные для одной секции
  классы (`.section-guide-embed`, `.sub-item`) остались локально. Проверено
  живым браузерным харнессом: все 5 секций рендерятся с полями/медиа-пикерами,
  клик "Add New Opportunity Card" и "Add Leadership Item" корректно добавляют
  элементы в списки через границу компонента — консоль чистая (кроме
  ожидаемого сетевого 500 на фейковом fetch).
- Крупные файлы, не входившие в исходный список, но страдающие тем же:
  `admin-media/MediaPreviewDialog.vue` (632),
  `admin-media/MediaTable.vue` (620), `admin-guests/GuestsPage.vue` (579),
  `admin-platforms/PlatformsPage.vue` (511), `admin-content/RedirectsPage.vue` (554).
  [x] Все пять разобраны той же методикой (детали ниже).
- [x] `admin-guests/GuestsPage.vue` (579 → 44) и `admin-platforms/PlatformsPage.vue`
  (511 → 41) — разобраны той же методикой, что и `admin-about/AboutPage.vue`
  (которая и послужила эталоном): композабл `use<Name>Data.ts` (fetch/save/
  autoSave + watch по guide UUID полям) + компоненты-секции в `pages/components/`.
  Нюанс конвенции, подтверждённый по факту: дочерние компоненты мутируют
  переданный `form` (reactive-объект из композабла) напрямую через
  `form.list.push(...)`/`splice(...)` прямо в шаблоне — а не через
  generic `addItem`/`removeItem` хелперы композабла, как можно было бы
  предположить. В `AboutPage.vue` такие generic-хелперы есть в композабле, но
  фактически не используются ни одним компонентом (мёртвый код) — в новых
  композаблах (`useGuestsData`, `usePlatformsData`) их решил не заводить
  вовсе, раз паттерн — прямая мутация пропа. `PlatformsPage.vue` дополнительно
  использует `useI18n()`/`<T>` (глобальный компонент, без импорта) — перенесено
  как есть в `PlatformsPageHeader.vue`/`GeneralSettingsCard.vue`. Проверено
  живым браузерным харнессом (с реальным бэкендом и БД): обе страницы
  рендерятся с сид-данными, `Add Opportunity Card`/`Add Feature (Key)`
  корректно мутируют вложенные массивы через границу компонента, консоль чистая.
- [x] `admin-media/MediaPreviewDialog.vue` (632 → ~75) — разобран. Композабл
  `features/media-dialogs/composables/useMediaPreview.ts` (variant/background
  switching, copy URL/hex, EXIF-детект, WebP re-optimize — сам вызывает
  `useMedia()` изнутри, как и остальные композаблы фич). Пять компонентов в
  новой `ui/media-preview/`: `MediaPreviewViewer.vue`, `MediaPreviewDetails.vue`,
  `MediaPreviewPalette.vue`, `MediaPreviewExif.vue`, `MediaPreviewVariants.vue` —
  гранулярность по визуально обособленным блокам, как в `MediaFilters.vue` ранее.
- [x] `admin-media/MediaTable.vue` (620 → ~90) — разобран. Композабл
  `features/media-table/composables/useMediaTableBulkActions.ts` (выбор строк,
  move-to-folder диалог, подтверждения удаления, "Групповые операции"
  dropdown — сам вызывает `useMedia()`). Три компонента в новой
  `ui/components/`: `MediaBulkActionsBar.vue`, `MoveToFolderDialog.vue` и
  `MediaTableColumns.vue` (все `<el-table-column>`/`<UiTableColumn>` целиком).
  Важная находка, которую пришлось проверить, а не предполагать: в отличие от
  `<el-tab-pane>`/`<el-tabs>` (где в `ContentEditor.vue` ранее сознательно не
  стали выносить колонку-обёртку в дочерний компонент, не проверив эмпирически),
  регистрация `<el-table-column>` в Element Plus идёт не сканированием vnode's
  прямых детей `<el-table>`, а через `instance.parent`-цепочку инстансов
  (`core/db.rs`-аналогия не при чём, это фронтенд) плюс поиск DOM-элемента
  колонки внутри `parent.refs.hiddenColumns` — то есть колонки можно безопасно
  обернуть в дочерний компонент, DOM-позиция не меняется. Проверено не только
  чтением исходников `element-plus/table-column`, но и живым браузерным
  харнессом: таблица на `/media` рендерит все колонки (Name/Type/Category/
  Tags/Folder/Preview/Size/Source/Added/Actions) через `MediaTableColumns.vue`,
  сортировка/фильтры по колонкам работают, консоль чистая.
- [x] `admin-content/RedirectsPage.vue` (554 → ~30) — разобран, и заодно
  исправлен реальный баг того же класса, что уже был найден в `Menu`/`MenuItem`
  (раздел 0) и ожидался здесь по плану (раздел 2): `RedirectItem`/
  `CreateRedirectDTO`/`UpdateRedirectDTO`/`CheckRedirectResponse` в
  `entities/redirects/api/index.ts` были объявлены в `snake_case`
  (`source_path`, `target_path`, `status_code`, `is_active`), а `createApi`
  (`packages/lib/src/api/fetch.ts`) гоняет каждый ответ через `snakeToCamel` —
  то есть реальные данные в рантайме были `camelCase`
  (`sourcePath`/`targetPath`/...), а шаблон читал `row.source_path` и т.п.,
  что на рантайме давало `undefined` для каждой колонки таблицы. Сервер
  (`server/src/redirects/model.rs`) остаётся в `snake_case` — конвертация
  происходит только на границе клиента, так что фикс — чисто в TS-интерфейсах
  и в компоненте, бэкенд не трогали. Проверено только по одному потребителю
  (`RedirectsPage.vue` — единственный импортёр `entities/redirects` во всём
  репозитории, проверено grep'ом). Разбор на композабл
  `pages/redirects-page/composables/useRedirectsData.ts` + пять компонентов в
  `ui/components/`: `RedirectsPageHeader.vue`, `RedirectsInfoStrip.vue`,
  `RedirectsFilterBar.vue`, `RedirectsTable.vue`, `RedirectFormDialog.vue`.
  Проверено живым браузерным харнессом с реальными сид-данными
  (`/about-us → /about`, `/venues → /platforms`, `/old-promo → /p/promo`):
  таблица отображает реальные значения (не `undefined`), кнопка "Проверить"
  триггерит `GET /check` и инкрементит счётчик переходов (42 → 43), диалог
  "Изменить" корректно предзаполняется и сохраняет через `PATCH`, консоль чистая.
- Попутная инфраструктурная находка (не по плану, но блокировала живую
  проверку в браузере): `compose.yaml`'s сервис `server` передавал контейнеру
  `DATABASE_URL`/`REDIS_URL`, которые Rust-бэкенд не читает вообще — он читает
  `POSTGRES_HOST`/`POSTGRES_PORT`/`POSTGRES_USER`/... и `REDIS_HOST`/
  `REDIS_PORT`/... по отдельности (`server/src/core/db.rs`,
  `server/src/core/app.rs`), плюс `APP_HOST` не был передан вообще —
  контейнер падал с паникой `APP_HOST must be set` сразу при старте.
  Поправлено: `server`-сервис теперь получает `env_file: server/.env` (как
  `db`/`redis` уже делали) и переопределяет только сетевые ключи
  (`APP_HOST=0.0.0.0`, `POSTGRES_HOST=db`, `REDIS_HOST=redis` и порты) —
  остальные переменные (`JWT_SECRET`, `SMTP_*`, `FRONTEND_URL` и т.д.,
  тоже обязательные через `.expect(...)`) подтягиваются из `.env`.

---

## 1. Гигиена репозитория admin-panel (дёшево, делать в первую очередь)

- [x] В git были закоммичены build-артефакты: `stats.html` в 12 приложениях,
  `tsconfig.tsbuildinfo` в 8 местах, несмотря на то что `*.tsbuildinfo` уже
  есть в `.gitignore` — файлы были закоммичены до правила и игнор на них не
  действовал. Сделано: `git rm --cached` на все отслеженные файлы + добавлен
  `stats.html` в `.gitignore`. Не закоммичено — закоммитить отдельно по
  готовности.
- [x] `vue-tsc` в проекте был сломан: `vue-tsc@3.3.11/3.3.12` несовместим с
  `typescript@7.0.2` (новый "native"-движок TypeScript — другая структура
  пакета без `typescript/lib/typescript.js`, которую требует shim
  `@volar/typescript`), падал с `Error: Failed to locate tsc module path
  from shim`. Из-за этого `.vue`-файлы не тайпчекались вообще. Исправлено:
  `typescript` зафиксирован на `^5.9.3` (последняя стабильная "классическая"
  версия) во всех 16 `package.json` (`admin-panel`, все `apps/*`,
  `packages/lib`, `packages/i18n`, `packages/typescript-config`), `pnpm
  install` обновил лок-файл, `vue-tsc --build` в `admin-shell` теперь
  реально типчекает `.vue`-файлы. Не закоммичено.
  - Новая находка: корневой скрипт `"type-check": "tsc --build"` фактически
    **не тайпчекает код приложений вообще** — корневой `tsconfig.json`
    includes только `vitest.workspace.ts`/`stylelint.config.mjs`, без
    project references на `apps/*`/`packages/*`. Реальное покрытие даёт
    только `vue-tsc --build` внутри `apps/admin-shell` (его tsconfig
    references покрывает большую часть графа через `packages/ui` и
    смежные пакеты) — но это не wired ни в один общий `pnpm`-скрипт.
    Нужно явно завести `type-check`, который реально гоняет `vue-tsc`
    по всем приложениям (раздел 6).
  - После того как `vue-tsc` заработал, он сразу вскрыл несколько реальных,
    ранее невидимых багов — все найдены и исправлены в этой сессии:
    - `packages/lib/dist/*.d.ts` был устаревшим (собран 9 окт, когда в
      `FieldDefinition` ещё не было поля `multiline`, добавленного 25 окт) —
      `ContentFormGenerator.vue` типизировался против старого `dist` и падал
      на `multiline`. Пересобран (`pnpm --filter @admin-panel/lib build`).
      Это отдельный системный риск: `@admin-panel/lib` резолвится через
      `dist/*.d.ts` (не напрямую из `src`), значит после любого изменения
      типов в `packages/lib` нужен ребилд пакета, иначе typecheck врёт —
      стоит добавить это в `pnpm dev`/watch-пайплайн или CI-проверку свежести.
    - `apps/admin-shell/src/app/layouts/MainLayout.vue`: `$T(...)` не
      типизировался — у `admin-shell` не было локального augmentation-файла
      `declare module 'vue' { interface ComponentCustomProperties { $T... } }`
      (есть в `packages/i18n/vue-augmented.d.ts`, но он не включён
      автоматически — другие приложения, например `admin-users`, дублируют
      эту декларацию у себя в `src/global.d.ts`). Добавлен
      `apps/admin-shell/src/global.d.ts` по тому же паттерну.
    - `apps/admin-shell/.../GlobalSearch.vue`: пушил `parent: ...` в массив,
      типизированный как `SearchResult[]`, у которого не было поля `parent` —
      хотя шаблон того же компонента читает `item.parent` для рендера
      breadcrumb'а "Родитель / Подраздел". На runtime это работало (TS не
      удаляет лишнее поле из литерала), но тип был неполным. Добавлено
      `parent?: string` в `apps/admin-shell/src/entities/system/model/index.ts`.
    - Осталась одна некритичная typecheck-ошибка — `TS7022` на `slotScope` в
      `packages/ui/.../ContentFormGenerator.vue` (динамический forwarding
      слотов через `v-for` по `$slots`). Известное ограничение vue-tsc для
      такого паттерна, не влияет на runtime; не стали трогать структуру ради
      тайпчекера.
- Новая находка (не чинили — вне скоупа этой сессии): `.github/workflows/ci.yml`
  в `admin-panel` **полностью закомментирован** целиком (lint/type-check/build/
  test/security/dependency-check jobs). CI не запускается вообще ни на один PR.
  Отдельная задача — раскомментировать и поэтапно включить джобы (вероятно,
  по одной, т.к. неизвестно, какие из них сейчас реально проходят).
- [x] `stylelint` по всему `admin-panel` — 136 ошибок (`pnpm stylelint`), все
  кроме одной чисто механические (`order/properties-order` — порядок
  CSS-свойств внутри правила; `color-function-alias-notation` —
  `rgba(...)` → `rgb(...)`; `color-hex-length` — `#ff9999` → `#f99`),
  накопившиеся за всю историю проекта, т.к. никто (ни CI — он выключен, см.
  пункт выше, — ни кто-либо локально) не гонял `stylelint` по всему
  репозиторию разом. Исправлено `pnpm stylelint --fix` — все 135 авто-
  исправились без ручного вмешательства, итоговый CSS вычисляется в те же
  стили (только порядок деклараций/нотация цвета, не значения), проверено
  пересборкой `packages/ui`/`admin-content` после фикса (чисто, размер
  бандла не изменился, кроме небольшой экономии на `rgba→rgb`). Единственная
  неавтоматическая — `apps/admin-content/.../DiffCellContent.vue`:
  `word-break: break-word` помечен deprecated-правилом
  (`declaration-property-value-keyword-no-deprecated`) — значение не
  стандартизовано спеком; заменено на `overflow-wrap: anywhere` (актуальная
  замена для того же эффекта "переносить даже непереносимые длинные слова/
  URL", рекомендуемая MDN/спекой CSS Text), функционально эквивалентно.
  Заодно прогнал `pnpm oxfmt --check` по всему репозиторию (тот же "никто
  не гонял целиком" класс накопленного долга) — 24 файла с расхождениями
  по форматированию (пробелы/кавычки/переносы строк, не логика), исправлено
  `pnpm oxfmt`. После обоих прогонов — полный `pnpm type-check` по всему
  воркспейсу не показал ни одной новой ошибки за пределами уже известной
  `ContentFormGenerator.vue`-находки (сравнено построчным grep'ом с
  зафиксированным ранее в этой сессии базовым состоянием), `vite build`
  `packages/ui`/`admin-content` чистый — оба прохода (`stylelint --fix`,
  `oxfmt`) подтверждённо не задели логику, только форматирование.

---

## 2. Структура и качество admin-content (продолжение начатого)

- Разобрать оставшиеся мега-файлы из списка в разделе 0 той же методикой:
  композаблы (`useXxx.ts`, без вёрстки) + компоненты (вёрстка без логики) в
  `features/<name>/`. [x] `TiptapEditor.vue` разобран на композабл + компоненты
  (детали в разделе 0) — но это только файловый рефакторинг; превращение в
  базу единого текстового редактора с custom marks (раздел 4.2/5) — отдельная,
  не начатая задача, использующая этот же, уже разобранный `useTiptapEditor.ts`
  как точку расширения.
- Унифицировать Element Plus vs `@admin-panel/ui`: сейчас большинство страниц
  используют `<el-*>` напрямую (в `admin-content` — 16 из 19 файлов), минуя
  собственный UI-кит. Нужна явная политика (когда писать `UiInput`, когда
  `<el-input>` оправдан) и постепенная миграция, иначе каждая новая страница
  продолжит плодить несогласованную вёрстку.
- Добавить в `@admin-panel/ui` layout-примитивы, которых сейчас нет совсем:
  `Container`/`Grid`/`Stack`, что-то вроде `UiFilterBar` [x] (сейчас
  `admin-media/MediaFilters.vue`, `admin-content` фильтры и т.п. верстают
  фильтр-бар с нуля каждый раз).
  - `UiFilterBar` сделан — `packages/ui/src/components/ui-filter-bar/`:
    тонкая обёртка (`flex`, `space-between`, тот же `border`/`bg-card`/
    `text-muted` набор переменных, что уже использовал `RedirectsFilterBar`
    и генератор из раздела 6) с дефолтным слотом под контролы фильтров и
    пропом `totalLabel` под правый "Total: N" (плюс слот `actions`, если
    нужно что-то ещё правее бейджа). Реальных дублирующих мест на момент
    правки было всего два (`RedirectsFilterBar.vue`,
    `VenuesCatalogView.vue`'s фильтр-блок — проверено grep'ом по всем
    `apps/*/src`, не предположением) — `Container`/`Grid`/`Stack` не делал,
    под них пока нет такого же явного, подтверждённого кодом повторения.
  - Переведён `RedirectsFilterBar.vue` на `UiFilterBar` — убрано ~20 строк
    дублирующегося CSS, логика/вёрстка контролов не трогалась.
    `VenuesCatalogView.vue` не трогал — там `el-card`+`filter-row`, не тот же
    layout 1-в-1 (две независимые структуры, не стоит подгонять насильно).
  - Генератор `scripts/create-mf`'s CRUD-шаблон (раздел 6, эта же сессия)
    тоже переведён на `UiFilterBar` — новые CRUD-страницы сразу используют
    компонент, а не копируют вёрстку фильтр-бара с нуля.
  - Добавлена `apps/admin-docs/stories/UiFilterBar.stories.ts` (2 сценария:
    с контролами и totalLabel, без totalLabel) — постоянная, как и остальные
    `*.stories.ts` в репозитории. Проверено: `vue-tsc --build`/`vite build`
    чисты для `packages/ui` и `admin-content` (кроме уже известной
    `ContentFormGenerator.vue`-находки), живая проверка в Storybook — обе
    истории рендерятся корректно (controls слева, "Total: 12" справа; без
    `totalLabel` правая часть не рендерится вовсе), консоль чистая.
- Общий паттерн "список + фильтры + диалоги создания/редактирования"
  повторяется в `admin-media`, `admin-guests`, `admin-platforms`,
  `admin-about` почти так же, как он повторялся в `VenuesPage`/`MenusPage`
  до разбора. [x] Расширение генератора `scripts/create-mf` шаблоном
  "CRUD-страница со списком" сделано (раздел 6) — новые страницы рождаются
  в правильной структуре сразу. Вынесение общего композабл-шаблона
  (`useVenuesCatalog`-подобного) для уже существующих `admin-media`/
  `admin-guests`/`admin-platforms`/`admin-about` не делал — это рефакторинг
  уже написанного кода (другая, более крупная и рискованная задача), а не
  DX-инструмент для нового кода; сам паттерн-то теперь явно задокументирован
  как генератор, если потребность в ретроактивном рефакторинге подтвердится.

---

## 3. UI / UX

- Почти нет медиа-запросов в `admin-content` (на момент начала работы — 1 файл
  из 19). После разбора мега-страниц часть блоков получила `flex-wrap`, но
  полноценный аудит mobile-first вёрстки не проводился — многие редакторы
  (Venues, PageConstructor, HomePage) рассчитаны на широкий десктоп и это
  осознанный выбор для power-user тулов, но стоит явно решить, какие экраны
  должны быть удобны на узких окнах (например, таблицы в `admin-media`).
- После того как в разделе 2 будут выделены общие layout-примитивы и
  `UiFilterBar`, повторно пройтись по карточкам/формам, которые сейчас
  используют немного разные отступы/радиусы на разных страницах (так было с
  `.editor-glass-card`, пока не стал `UiGlassCard` — наверняка есть ещё такие
  кандидаты).

---

## 4. Единая система текстов и переводов

Это отдельный большой трек — ниже то, что реально обнаружено в коде (не
предположения), и из этого выводится план.

### 4.1 Что уже есть и почему сейчас неудобно

На проекте одновременно существуют **три несовместимых формата rich-текста**,
и ни один не доведён до пользователя целиком:

1. **`packages/i18n`** (`admin-panel/packages/i18n`) — на самом деле самый
   продвинутый кусок. Там уже есть:
   - `useI18n()` — `t()`, `loadDict()`, `setLocale()`, кэш словаря по локали;
   - компонент `<T path="..." :params="..." />` и плагин `i18nPlugin`;
   - **свой tag-формат для rich-текста** в `parser.ts`: `{b}жирный{/b}`,
     `{i}курсив{/i}`, `{span}выделение{/span}`, слоты-подстановки `{userName}`,
     самозакрывающиеся `{br}`/`{hr}`, плюс `parseTranslation`/`serializeTranslation`/
     `validateTranslation`, `wrapWithTag`/`unwrapTag` (оборачивание/снятие тега
     по выделению) и конвертеры `translationToHtml`/`htmlToTranslation` для
     WYSIWYG-редактирования.
   - Используется **только** внутри `admin-translations`, для редактирования
     значения уже существующего ключа перевода. Из контента (Venues, Pages,
     Home) до него не дотянуться.
2. **`ContentFormGenerator`** (поля типа `Text` в CMS-схемах) — свой,
   примитивный механизм: весь текст целиком оборачивается в строку
   `$t('page.title')`. Нет частичного выделения, нет bold/italic, работает
   только для одного типа поля.
3. **`TiptapEditor.vue`** (поля типа `RichText`) — хранит и отдаёт сырой HTML
   через `StarterKit`/`Highlight`/`Link`/`TextAlign`/`TextStyle`/`Underline`.
   Bold/italic там есть, но это третий, никак не связанный с двумя другими
   формат. Своих custom marks (`Mark.create()`) нет вообще — нет зацепки для
   "эта часть — ключ перевода" или "эта часть — валюта".

Отдельно, и это важнее любой непоследовательности: **клиент (`client`) вообще
не содержит кода для разбора `$t('...')`** — ни `@nuxtjs/i18n`, ни
`vue-i18n`, ни самописного резолвера (проверено прямым поиском по всему
`client/app`). Это означает, что любое поле, обёрнутое сегодня через
"В перевод ($t)" в `ContentFormGenerator`, **показывает гостям сайта
буквальную строку `$t('page.title')`** — функциональность не просто
неполная, она не работает в проде вообще. Это надо чинить отдельно и быстро,
не дожидаясь большого редизайна (см. 4.4, пункт 0).

Плюс:

- В `admin-translations` **нет** функции "где используется этот ключ" (grep
  по коду ничего не нашёл) и **нет** способа создать ключ, отталкиваясь от
  места в контенте — только отдельный экран, где ключ надо знать заранее.
- На сервере (`server/src/i18n`) есть нормальное хранилище:
  `i18n_translations` (`key, locale, value`, уникальность по `(key, locale)`),
  `i18n_translation_versions`, `i18n_namespaces` — этим можно и нужно
  пользоваться. Но **нет** связи "это поле этой записи контента — переводимое
  и ссылается на такой-то ключ". `content_translations`/`media_translations`
  в миграциях — это просто сид-данные подписей самой админки, а не механизм
  связывания.
- Валюты/числа: единого форматтера нет. `packages/lib/src/utils/formatNumbers.ts`
  — заглушка (`numbers.map(n => n * 2)`, не имеет отношения к форматированию).
  Каждая страница, где нужны деньги, пишет свой `new Intl.NumberFormat('ru-RU')`
  (так было и в `VenuesPage`, и в `HomePageEditor`, и т.д. до рефакторинга).

### 4.2 Целевая модель

Не плодить четвёртый формат — **достроить `packages/i18n`'s tag-формат** до
полноценного редактора для **любого** текстового поля в CMS, и завести явную
связь между полем контента и ключом перевода.

1. **Один UI-компонент** — условно `UiRichTextField` (место: `@admin-panel/ui`,
   рядом с `UiInput`), который:
   - рендерит WYSIWYG через Tiptap (bold/italic уже есть готовые через
     `StarterKit`), но **на выходе и входе работает с tag-форматом
     `packages/i18n`**, используя уже написанные `htmlToTranslation`/
     `translationToHtml` как мост Tiptap HTML ↔ канонический формат;
   - добавляет в Tiptap два новых custom mark'а (`Mark.create()`), которых
     сегодня нет: mark "ключ перевода" (хранит `key`/`namespace`) и mark
     "не переводить" (литерал/слот);
   - по выделению текста показывает контекстное меню с действиями:
     - **"Отправить в перевод"** — создаёт/привязывает ключ (через API
       `i18n_translations`, авто-имя вида `<schema>.<field>.<counter>` с
       возможностью переименовать), подсвечивает выделение, остальной текст
       поля остаётся обычным текстом — то есть **одно поле может быть
       частично переводимым, а частично нет** (сегодня это невозможно —
       только всё целиком через `$t()` или ничего);
     - **"Исключить из перевода"** — превращает выделение в слот/плейсхолдер
       (переиспользует существующий механизм `{slotName}` из `parser.ts`,
       который уже умеет `{userName}` и т.п.) — то, что не должно переводиться
       при автопереводе остального блока;
     - **Bold / Italic** — штатные Tiptap marks, уже готовы;
     - **Валюта** — новый mark/слот с типом `currency`, рендерится через
       новый (реальный, не заглушку) `formatCurrency(amount, locale)` в
       `@admin-panel/lib`, использующий `Intl.NumberFormat`.
2. **Связь контент ↔ перевод на сервере**: новая таблица
   `content_translation_refs` (`content_entry_id`, `field_path`,
   `translation_key`), автоматически пересобираемая при сохранении записи
   (сканируем `data` на вхождения `{key:...}` и upsert'им). Это даёт
   "где используется этот ключ" в `admin-translations` почти бесплатно —
   обратный запрос по этой таблице.
3. **`admin-translations`**: добавить в `TranslationsTable`/`TranslationEditor`
   показ обратных ссылок (где ключ используется — ссылка на схему/страницу),
   и принимать запросы на создание ключа "снаружи" (из `UiRichTextField`),
   а не только вручную с экрана переводов.
4. [x] **Клиент**: резолвер tag-формата для гостевого сайта — сделано частично,
   для Venues (единственного места, где `UiRichTextField`-поля реально дошли
   до живого клиентского рендера — HomePage/Menus на клиенте ещё не
   существуют вообще, раздел 7). Не отдельный Vue-компонент `ContentRichText`,
   как предполагал этот пункт изначально, а набор функций в уже существующем
   `client/app/shared/lib/composables/useContentI18n.ts` (тот же файл, что
   уже резолвил `$t()` для CMS-страниц, раздел 4.3 шаг 1) — решение по факту:
   - `resolveContentText(text, locale)` — резолвит tag-формат `{key:...}`
     (значение из словаря или, если перевода ещё нет, текст-фолбэк,
     зашитый в сам тег — лучше, чем просто голый ключ), `{currency:N}`
     (реальное форматирование через `Intl.NumberFormat`, не заглушка),
     `{nontranslatable}x{/nontranslatable}` → `x`, `{br}` → пробел. Выход —
     обычный текст, безопасно для `{{ }}`-интерполяции и атрибутов `alt`.
   - `resolveContentHtml(html, locale)` — резолвит `data-i18n-key`-спаны
     RichText-полей (`UiRichTextField`'s `mode="full"` хранит их как сырой
     HTML, не как tag-формат — то же решение, что и на сервере, раздел 4.3
     п.6: `data-i18n-key`-атрибут, не `{key:...}`). Выход — HTML, для `v-html`.
   - `resolveContentTree(data, locale)` — рекурсивно применяет оба резолвера
     к любому дата-объекту (Venues — не Schema-driven CMS-контент с известной
     произвольной структурой полей, а "жёсткая" сущность с фиксированным
     TS-типом, раздел 9.1; `interpolateValue` в `useCmsPage.ts` для CMS
     трогать не стал — разные форматы полей, разные решения уже приняты
     раньше). Безопасно применять ко всем строковым полям без разбора: оба
     резолвера — no-op на строках, не содержащих их паттерн.
   - Подключено в `client/app/pages/venues/[slug].vue` (`loadVenue()`):
     `preloadContentTranslations` → `resolveContentTree` перед присвоением
     `venue.value`/`nearbyVenues.value`, так что `venue.title`/
     `venue.descriptionHtml` и переиспользующие их `VenueHero.vue`/
     `VenueCardBig.vue`/`VenueCardSmall.vue` получают уже готовый текст, без
     собственных правок.
   - Почему вообще понадобилось делать это сейчас, а не позже: после раздела
     4.3 п.5 (`UiRichTextField` расставлен по Venues) выяснилось, что
     `venue.title` рендерился на клиенте голой интерполяцией
     (`{{ venue.title }}`) без какого-либо резолвера — т.е. контент-менеджер,
     нажавший "В перевод" на названии площадки, показал бы гостям буквальный
     `{key:venues.title.1}...{/key:...}`. Реальный, а не гипотетический
     риск регрессии от уже сделанной работы, а не просто "неплохо бы".
   - 13 новых тестов (`useContentI18n.spec.ts`) на оба резолвера и дерево,
     плюс живая проверка через реальный Postgres + Rust-сервер + Nuxit dev
     (не моками): тестовая площадка с `{key:...}` в title (с переводом в
     словаре и без) и `data-i18n-key`-спаном с вложенным `{currency:...}` в
     description — заголовок и хлебная крошка показали значение из словаря,
     описание показало текст-фолбэк с корректно отформатированной ценой
     "1 990,50 ₽", консоль чистая. `eslint`/тесты (36/36) зелёные.
   - Не делал (следующий кандидат, если понадобится): HomePage/Menus —
     на клиенте для них пока вообще нет виджетов (раздел 7, `client/app/widgets`
     — только `README.md`), резолвить там нечего; FAQ/отзывы Venues — сами
     поля ещё не переведены на `UiRichTextField` (раздел 4.3 п.5, оставлено
     осознанно); `{b}/{i}` в `resolveContentText` не реализован, т.к.
     `mode="simple"` (Text-поля) их не поддерживает в принципе (осознанное
     решение, раздел 4.3 п.4) — нечего резолвить.

### 4.3 Миграция (по шагам, не одним PRs)

1. [x] Починить критичную дырку — сделано. Уточнение по факту (описание в
   начале раздела 4.1 было не совсем точным): на клиенте уже существовали
   два похожих композабла (`useCmsPage.ts`, `useCmsBlocks.ts`), которые
   распознавали `$t('key')` и **срезали обёртку до голого ключа** — то есть
   гость видел не буквальную строку `$t('page.title')`, а непереведённый
   `page.title`. Сам перевод не происходил ни в одном случае. Добавлен
   `client/app/shared/lib/composables/useContentI18n.ts`: минимальный
   резолвер без `@nuxtjs/i18n`/`vue-i18n` — перед интерполяцией данных
   собирает все `$t('key')` из ответа, вычисляет неймспейсы (`key.split('.')[0]`),
   параллельно подгружает их через уже существующий публичный эндпоинт
   `GET /api/v1/i18n/{namespace}` (тот же, которым пользуется админка;
   `Accept-Language` сейчас жёстко `ru` — в клиенте вообще нет механизма
   выбора локали, это отдельная, более крупная задача) с кэшем по
   `locale:namespace`, и только потом подставляет `dict[key] ?? key`
   (fallback на голый ключ, как в `packages/i18n`'s `t()`). Подключено в оба
   композabla вместо строки, которая просто срезала обёртку. Live-preview
   путь (`postMessage` из админки) не трогали — он синхронный и
   преднамеренно не покрыт, это инструмент редактора, не то, что видят
   гости; если понадобится — отдельная, более инвазивная правка с
   реактивным кэшем.
2. [x] Добить Tiptap custom marks (`translationKey`, `nonTranslatable`, `currency`)
   и мост `htmlToTranslation`/`translationToHtml` — сделано, без изменения
   того, как сегодня хранятся обычные RichText-поля (`useTiptapEditor.ts`/
   `TiptapEditor.vue` не тронуты). Формат тега решён так: любой `{tag}`/`{slot}`
   теперь может содержать `:` в имени (`packages/i18n/parser.ts` — обе regex
   обновлены, плюс regex в `unwrapTag`'s "strip all tags" ветке), что
   добавочно и не ломает существующий контент (там `:` никогда не
   встречается). На этом держатся три новых формата:
   - `{key:namespace.key}fallback{/key:namespace.key}` — тег; `translationToHtml`
     рендерит как `<span class="gp-i18n-key" data-i18n-key="...">fallback</span>`,
     `htmlToTranslation` — обратно. Резолвить `key` на клиенте (вместо
     fallback-текста) будет будущий `ContentRichText` (п. 4 ниже, ещё не
     существует) — сам парсер/мост про резолвинг не знает, только про
     обёртку/разобёртку.
   - `{nontranslatable}literal{/nontranslatable}` — тег, рендерится как
     `<span class="gp-i18n-literal" data-gp-literal="true">literal</span>`.
   - `{currency:1990.5}` — слот (самозакрывающийся, т.к. без закрывающей пары).
     Оказалось, что это **не потребовало новой логики моста** — существующий
     generic slot-chip механизм (`data-slot="<имя>"`) уже реверсируется любым
     классом благодаря fallback-регулярке в `htmlToTranslation`; добавлен
     только собственный CSS-класс `gp-currency-chip` для редакторской
     стилизации, `data-slot` остался тем же.
   - `formatCurrency(amount, locale = 'ru-RU', currency = 'RUB')` — реальная
     реализация на `Intl.NumberFormat` добавлена в `@admin-panel/lib`
     (`packages/lib/src/utils/formatCurrency.ts`), рядом с существующим
     (нетронутым) `formatNumbers.ts`-заглушкой — это разные функции, не
     рефакторинг заглушки. Понадобится `ContentRichText` (п. 4) для рендера
     `{currency:...}` на клиенте.
   - Два Tiptap `Mark.create()` — `TranslationKeyMark` (атрибут `key`,
     команды `setTranslationKey`/`unsetTranslationKey`) и `NonTranslatableMark`
     (`setNonTranslatable`/`unsetNonTranslatable`).
   - **Важная находка по размещению, стоившая отдельной итерации**: marks
     изначально положил в `packages/i18n` (по формулировке раздела 4.2 —
     "достроить packages/i18n's tag-формат"), добавив `@tiptap/core` в его
     `dependencies`. Это оказалось реальным регрессом: `@admin-panel/i18n`
     шарится через Module Federation как `singleton: true` **во всех** MFE
     (`packages/lib/src/vite/config.ts`'s `createConfig`), и в отличие от
     обычного tree-shaking внутри одного бандла, федерация включает в
     шаренный чанк весь граф модуля целиком независимо от того, использует
     ли приложение новый экспорт — федерированный чанк `@admin-panel/i18n`
     у `admin-guests` (приложение, которому Tiptap вообще не нужен) вырос с
     ~18 КБ до **357 КБ** (gzip 81 КБ) после пересборки, несмотря на то что
     ничего в `admin-guests` эти marks не импортирует. Обнаружено эмпирически
     пересборкой и сравнением размеров чанков, не предположением. Исправлено
     переносом marks в `apps/admin-content/src/features/content-editor/tiptap/marks.ts`
     (единственный потребитель Tiptap сейчас, `@tiptap/core` добавлен туда
     явной зависимостью) — после переноса федерированный чанк `i18n` у
     `admin-guests` вернулся к 18 КБ. Урок для шага 4 (когда `UiRichTextField`
     переедет в `@admin-panel/ui`, который **тоже** `singleton: true`,
     152 КБ уже сейчас): либо проверять размер шаренного чанка пересборкой
     после каждого добавления тяжёлой зависимости в `packages/i18n`/`packages/ui`,
     либо заранее выносить Tiptap-специфичный код за пределы singleton-пакетов.
   - Проверено: 5 новых тестов на marks (реальный `@tiptap/core` `Editor`,
     не моки) в `admin-content/src/__tests__/content-editor/marks.test.ts`
     (пришлось попутно завести `test:unit` в `admin-content/package.json` —
     у приложения вообще не было unit-тестовой инфраструктуры, хотя
     `vitest.workspace.ts` его уже включает, а `createConfig` уже настраивает
     `test: {...}` блок; `vitest`/`jsdom` берутся из корневых devDependencies,
     как и у остальных MFE); 9 новых тестов на формат тегов в
     `packages/i18n/__tests__/translation-cases.test.ts` (раздел 5); 3 теста
     на `formatCurrency` в `packages/lib`. Полная пересборка `admin-content`
     и `admin-guests` проверена — бандлы собираются, размер `i18n`-чанка
     восстановлен, `vue-tsc --noEmit` в `admin-content` не добавил новых
     ошибок сверх уже известной (раздел 1) `ContentFormGenerator.vue`.
3. [x] Завести `content_translation_refs` на сервере + эндпоинт "создать ключ по
   выделению" — сделано. Новая таблица (миграция
   `20261027120000_content_translation_refs`): `content_entry_id` (FK на
   `content_entries`, `ON DELETE CASCADE` — значит удаление записи само
   чистит её refs, отдельный код не нужен), `field_path`, `translation_key`,
   `UNIQUE(content_entry_id, field_path, translation_key)`. Логика —
   `server/src/content/translation_refs.rs`: `extract_translation_key_refs`
   рекурсивно обходит `data` (`serde_json::Value`, формат записи схема-билдера
   не ограничивает структуру) и регэкспом `\{key:([a-zA-Z0-9_.:-]+)\}` достаёт
   все вхождения тега `{key:...}` из строковых значений (намеренно не трогает
   `{currency:...}`/`{nontranslatable}` — это другие теги из того же формата,
   раздел 4.3 п.2); `sync_refs` целиком пересобирает refs одной записи
   (DELETE WHERE content_entry_id = ... затем INSERT) внутри транзакции.
   Вызывается из `create_entry`, `update_entry` и `rollback_entry_version` —
   все три места, которые реально меняют `data` записи — не блокируя ответ
   при ошибке синка (`eprintln!` и запрос всё равно возвращает успех: это
   вторичный индекс, не часть основной записи). Эндпоинт "создать ключ по
   выделению" — решил не заводить отдельный: `POST /api/v1/i18n`
   (`create_or_update` в `i18n/handlers.rs`) уже делает ровно это
   (upsert по `key`+`locale`, с версионированием) и ничего в "создании ключа
   по выделению" не специфично для контента — сам выбор, какой ключ
   генерировать (`<schema>.<field>.<counter>`) и когда его вызывать, это
   клиентская логика будущего `UiRichTextField` (п. 4), не новый серверный
   контракт. Проверено: 5 юнит-тестов на `extract_translation_key_refs`
   (пустой текст, один реф, несколько в одном поле, вложенные объекты/массивы,
   что `currency`/`nontranslatable` не захватываются) — все зелёные
   (`cargo test translation_refs`); полный `cargo test` после изменений — все
   существующие тесты тоже зелёные, регрессий нет. Живая проверка через
   реальный Postgres (пересобранный Docker-контейнер `server`, применённая
   миграция): создание записи с `{key:catalog.price_label}...{/key:...}` даёт
   ровно одну строку в `content_translation_refs`; обновление записи на новые
   ключи корректно удаляет старые refs и вставляет новые (проверено
   `psql`-запросом до/после); удаление записи каскадно чистит refs до нуля
   строк; `{currency:1990.5}` в том же поле подтверждённо НЕ создаёт ref.
   "Где используется этот ключ" (обратный запрос по этой таблице для
   `admin-translations`) — не делал, это явно шаг 6, не 3.
4. [x] Подключить `UiRichTextField` в `ContentFormGenerator` для типов `Text` и
   `RichText` — убрать старый `isTranslationKey`/`toggleWrapTranslationKey`
   хак. Сделано. Компонент — `packages/ui/src/components/ui-rich-text-field/`,
   два режима:
   - `mode="simple"` (поля `Text`) — **без Tiptap**: однострочный/многострочный
     `contenteditable` на нативном DOM Range API (тот же приём, что уже был в
     `useTagEditor.ts`'s visual-mode `applyTag`/`insertSlot`), мост
     HTML↔tag-формат через уже существующие `htmlToTranslation`/
     `translationToHtml`. Инструменты — только «В перевод» / «Исключить» /
     «Валюта» (без Bold/Italic — осознанное решение, Text это короткие строки,
     форматирование не нужно, согласовано с пользователем перед стартом).
   - `mode="full"` (поля `RichText`) — весь Tiptap-редактор, который раньше
     жил в `admin-content` (`TiptapEditor.vue`/`useTiptapEditor.ts`/
     `TiptapToolbar.vue`/`TiptapLinkDialog.vue`), перенесён целиком в
     `packages/ui/.../ui-rich-text-field/` (единственный потребитель —
     `ContentFormGenerator`, других мест использования не было, проверено
     grep'ом) и дополнен двумя marks из раздела 4.3 п.2
     (`TranslationKeyMark`/`NonTranslatableMark`, ранее написанными, но
     **не подключёнными** ни к `extensions`, ни к тулбару — это и обнаружилось
     при разборе перед стартом) плюс той же тройкой инструментов.
   - **Важное архитектурное решение по размещению** (согласовано с
     пользователем через вопрос перед стартом): компонент целиком живёт в
     `@admin-panel/ui`, но `mode="full"`-часть (Tiptap/ProseMirror, тяжёлая)
     подключена через `defineAsyncComponent(() => import('./RichTextFullEditor.vue'))`,
     а не напрямую — чтобы не повторить уже случившийся в этой сессии-ранее
     регресс шаренного чанка (раздел 4.3 п.2: 18 КБ → 357 КБ у `admin-guests`
     после добавления Tiptap в singleton `packages/i18n`). Проверено пересборкой
     `admin-guests` (не использует RichText вовсе) и `admin-content`: шаренный
     федерированный чанк `__federation_shared_@admin-panel/ui` остался
     ~152-156 КБ (почти не изменился против зафиксированного ранее базового
     значения), а весь Tiptap/ProseMirror (~1 МБ, gzip ~230 КБ) вынесен в
     отдельный `RichTextFullEditor-*.js`-чанк, догружаемый только при реальном
     рендере RichText-поля — ни один MFE, который не использует
     `ContentFormGenerator`/`UiRichTextField`, больше не платит за Tiptap в
     eager-бандле.
   - Автогенерация имени ключа `<namespace>.<fieldPath>.<counter>`
     (`lib/translationKey.ts`'s `suggestTranslationKey`) — сканирует текущее
     содержимое поля (HTML или tag-формат, не важно, ключ встречается в обоих
     как обычная подстрока) на уже использованные счётчики под тем же
     префиксом. `namespace` — новый проп `translationNamespace` у
     `ContentFormGenerator` (по умолчанию `'content'`), пробрасывается от
     `EntryContentTab.vue` как `schema.slug` (есть под рукой) и рекурсивно
     как `${namespace}.${field.name}` в Repeater/Group.
   - Создание ключа на сервере — переиспользован существующий
     `POST /api/v1/i18n` (`createApi('i18n')` из `@admin-panel/lib`, вызван
     прямо из `packages/ui` — тот же паттерн, что уже использует
     `UiMediaPicker` для `createApi('media')`, так что `packages/ui`,
     зовущий API напрямую, не новый прецедент). Ошибка сети не блокирует
     локальную разметку (мета уже применена к тексту), а показывается через
     `ElMessage.error` — иначе контент-менеджер не узнал бы, что ключ
     реально не создан на сервере.
   - **Найденный и исправленный по пути баг** (не в проде, пойман ещё на
     этапе ручной проверки через Storybook, см. ниже): диалоги ввода имени
     ключа/суммы валюты сначала не отображали значение по умолчанию —
     `RichTextActionDialog.vue` биндил его как `:model-value` на нативный
     `<input>`, а не `:value`; `model-value` — не распознаваемый браузером
     атрибут для `<input>`, значение просто не отображалось (хотя
     логика-то была верной). Поймано визуально, не предположением.
   - **Второй найденный и исправленный баг**, специфичный для `mode="simple"`:
     диалоги крадут фокус на свой `<input>` (`nextTick(() => keyInputRef.value?.focus())`),
     что схлопывает `window.getSelection()` внутри `contenteditable` —
     if запрашивать выделение заново в момент подтверждения диалога, оно уже
     пустое. Исправлено захватом `Range` (`cloneRange()`) в момент нажатия
     кнопки действия, *до* открытия диалога, и повторным использованием этого
     `Range` на confirm, а не повторным чтением `window.getSelection()`.
     `mode="full"` (Tiptap) этой проблемы не имеет — ProseMirror держит
     выделение в своём `EditorState`, не в браузерном Selection API, оно
     переживает временную потерю DOM-фокуса без дополнительного кода.
   - Серверная находка по пути: `content_translation_refs`'s
     `extract_translation_key_refs` (раздел 4.3 п.3) регэкспом искала только
     `{key:...}` — работает для `mode="simple"` (Text хранится в tag-формате),
     но `mode="full"` сознательно **не** переводит RichText целиком в
     tag-формат (парсер не знает про `<p>`/`<ul>`/`<a href>`/заголовки — перевод
     всего документа через `htmlToTranslation` стёр бы существующее
     форматирование; решено оставить RichText как сырой HTML, как и было до
     этой сессии). Чтобы ссылки на ключи всё равно индексировались и для
     RichText-полей, в `server/src/content/translation_refs.rs` добавлена
     вторая регэксп-ветка на `data-i18n-key="..."` (атрибут, который рендерит
     `TranslationKeyMark`), обе ветки объединены с дедупом. 2 новых теста
     (`test_extract_ref_from_richtext_html_mark`,
     `test_extract_both_tag_format_and_html_refs_in_same_field`), все 7
     тестов модуля зелёные.
   - Проверено живым браузерным харнессом — не через `admin-shell`/бэкенд (это
     подняло бы весь стек Docker-сервисов ради проверки одного компонента), а
     через `admin-docs` (уже существующий в репозитории Storybook для
     разработчиков, раздел 10 его явно отделяет от требующих справки MFE).
     Добавлена `apps/admin-docs/stories/UiRichTextField.stories.ts` (4 сценария:
     simple-текст, simple-многострочный с уже проставленными `{br}`/`{key:...}`,
     full Tiptap, disabled) — не одноразовый скрипт, остаётся в репозитории как
     документация компонента, по тому же принципу, что уже существующая
     `UiButton.stories.ts`. Проверено: ввод текста, выделение слова, кнопка
     «В перевод» → диалог с корректным автосгенерированным именем ключа →
     подтверждение → слово получает визуальный pill и
     `data-i18n-key`-атрибут (в обоих режимах — simple и full, включая внутри
     `<strong>` в full-режиме); «Валюта» → диалог с суммой → чип `{currency:N}`
     вставляется в позицию курсора; переключение между сценариями, disabled-
     состояние без тулбара. Консоль чистая кроме ожидаемого `404` на
     `POST /api/v1/i18n` (в Storybook нет бэкенда) — подтвердило, что обработка
     этой ошибки (`ElMessage.error`, без краша UI) работает.
   - Не делал (вне скоупа этого пункта, пойдёт в следующие шаги 4.3): кнопка
     «Валюта» для `mode="full"` ещё не проверена live в браузере (логика та
     же, что в simple, и то же `insertContent`, что уже использует
     `confirmLink`, но отдельно не кликал) — стоит проверить в начале
     следующей сессии, если будут правки рядом. Реальная интеграция в
     страницу редактирования записи (`EntryContentTab.vue`/`ContentEditor`)
     не проверялась живьём с реальным бэкендом — только Storybook-изоляция
     компонента; `vue-tsc --build` в `admin-shell` и прод-сборка
     `admin-content`/`admin-guests` проходят чисто (кроме двух уже известных
     pre-existing находок раздела 1 — `TS7022 slotScope` и `TS2304 'field'`
     в `ContentFormGenerator.vue`, не новых).
5. [x] Расставить `UiRichTextField` по остальным местам: Venues (`VenueBasicInfoTab`,
   `VenueDescriptionTab` и т.п.), HomePage, Menus (названия пунктов меню). Сделано
   для полей, явно названных в этом пункте, плюс их прямых аналогов:
   - `VenueBasicInfoTab.vue`: `title`, `subtitle` — `mode="simple"`,
     `namespace="venues"`.
   - `VenueDescriptionTab.vue`: `description_html` — `mode="full"` (было
     название поля `*_html`, а по факту обычная `<textarea>` без какого-либо
     форматирования вообще — реальный UX-выигрыш, не просто смена компонента).
   - `HomeHeroTab.vue`: `title`, `subtitle`, `heroMapButtonText`,
     `heroListButtonText` — `mode="simple"`, `namespace="home"`.
   - `HomeBannerTab.vue` (прямой аналог Hero, не был явно назван в пункте, но
     тот же паттерн "заголовок + текст баннера"): `bannerTitle`, `bannerText`
     — `mode="simple"`, `namespace="home"`.
   - `MenuItemDialog.vue`: `itemForm.title` (название пункта меню) —
     `mode="simple"`, `namespace="menus"`. Здесь без `onChange`-автосейва
     (диалог сохраняет по явной кнопке, как и раньше) — просто обычный
     `v-model`.
   - Везде переиспользован уже установленный в этих файлах паттерн
     `v-model="x" @update:model-value="onChange"` (тот же, что уже
     использовал `UiMediaPicker` в `HomeHeroTab`/`HomeBannerTab` до этой
     правки) — `defineModel`'s `update:modelValue` и явный доп. листенер на
     то же событие комбинируются штатно, спец. код не понадобился.
   - **Осознанно не трогал** в этой сессии: `VenueReviewsFaqTab.vue` (текст
     отзывов, вопросы/ответы FAQ), `VenueFeedTab.vue`, остальные поля
     `VenueBasicInfoTab` (адрес, телефон, часы работы — структурные данные,
     не настолько очевидные кандидаты на перевод) — кандидаты для следующего
     прохода, если вопрос реально возникнет на практике (та же логика
     "не закрывать всё сразу", что уже применялась в разделе 10).
   - [x] **Добавлено позже, после того как появился клиентский резолвер
     (раздел 4.2 п.4)**: `VenueReviewsFaqTab.vue` (`rev.text`, `item.question`,
     `item.answer`) и `VenueFeedTab.vue` (`item.text`) переведены на
     `UiRichTextField` тем же паттерном. Это стало особенно дёшево именно
     сейчас: `reviews`/`faq`/`feed` — часть того же объекта `venue`, что уже
     проходит через `resolveContentTree` в `[slug].vue` (раздел 4.2 п.4) —
     клиентский рендер (`VenueTabs.vue`'s `rev.text`/`item.question`/
     `item.answer`/`item.text`) заработал без единой правки на клиенте.
     Проверено `vue-tsc --noEmit` и прод-сборкой (чисто, размер чанка не
     изменился); живую Storybook-проверку в этот раз не сделал — смоук-стори
     для `VenueReviewsFaqTab.vue` не завёлся в изоляции `admin-docs`
     (компонент тянет `useVenueForm.ts` → `#entities/venues/api`,
     app-внутренний алиас tsconfig, не настроенный в `admin-docs`'s
     Vite-конфиге — в отличие от `HomeHeroTab.vue`, чей единственный
     рантайм-импорт был просто типом). Решил не расширять алиасы `admin-docs`
     ради одноразовой проверки — вместо этого опёрся на typecheck/сборку
     плюс то, что паттерн к этому моменту уже проверен живьём трижды
     (`VenueBasicInfoTab`, `HomeHeroTab`, `MenuItemDialog`).
   - Проверено: `vue-tsc --noEmit` и прод-сборка `admin-content` чистые (кроме
     уже известных pre-existing находок в `ContentFormGenerator.vue`), размер
     шаренного чанка `@admin-panel/ui` не изменился. Живая проверка через
     одноразовый smoke-стори в `admin-docs` (не оставлен в репозитории,
     только для проверки) — `HomeHeroTab.vue` с мок-формой: поля рендерятся,
     выделение текста → «В перевод» → диалог с верным автосгенерированным
     именем ключа `home.hero.mapButtonText.1` → подтверждение → `onChange`
     получает форму с полем в корректном tag-формате
     `{key:home.hero.mapButtonText.1}Показать{/key:...} на карте` — вся
     цепочка `v-model` → `UiRichTextField` → `onChange` → родительская форма
     подтверждена работающей.
6. [x] В `admin-translations` добавить "где используется" и приём ключей "снаружи".
   Сделано. "Приём ключей снаружи" (из `UiRichTextField`) закрыт ещё в пункте 4 —
   это тот же `POST /api/v1/i18n`, переиспользованный напрямую, без нового
   контракта; отдельно здесь делать было нечего. "Где используется" — новое:
   - **Сервер**: `GET /api/v1/i18n/{key}/refs` (`server/src/i18n/handlers.rs`,
     `get_refs`) — join `content_translation_refs` → `content_entries` →
     `content_schemas` по `translation_key`, возвращает `TranslationRefDTO[]`
     (`content_entry_id`, `entry_slug`, `field_path`, `schema_name`,
     `schema_slug`). Защищён тем же `bearer_auth`, что и остальные
     admin-эндпоинты `i18n` (`versions`/`rollback`) — зарегистрирован в
     `protected_router()`. Уже существующий индекс
     `idx_content_translation_refs_key` (миграция раздела 4.3 п.3) делает
     запрос дешёвым без дополнительной миграции.
   - **admin-translations**: композабл `useTranslations()` (singleton-стейт,
     тот же паттерн, что уже был у `translationHistory`/`isHistoryOpen`)
     получил `translationRefs`/`isRefsOpen`/`isRefsLoading`/`openRefs`/`closeRefs`.
     Новый компонент `features/translations-refs/ui/TranslationsRefsDialog.vue`
     — прямой клон уже существующего `TranslationsHistoryDialog.vue` (тот же
     `UiModal` + `el-table` паттерн), с кнопкой "Открыть" на
     `<router-link :to="/content/{schemaSlug}/edit/{contentEntryId}">`
     (та же схема роутов, что уже использует `admin-content`'s router,
     `/content/:schemaIdentifier/edit/:id` — рабочая ссылка, т.к. `vue-router`
     в MF-конфиге шарится как singleton между всеми MFE одним инстансом).
     В `TranslationsTable.vue` добавлена 4-я кнопка действия ("Где
     используется", иконка `Link`) рядом с уже существующими Edit/History/Delete.
   - Проверено: `vue-tsc --noEmit` и прод-сборка `admin-translations` чистые.
     Серверная логика проверена не unit-тестом (join трёх таблиц сложнее
     гонять как изолированный Rust-тест без лишней обвязки), а вручную через
     реальный Postgres (поднят `docker compose up -d db redis`, сервер
     запущен напрямую, тестовые `content_schemas`/`content_entries`/
     `content_translation_refs` вставлены и удалены через `psql`): SQL-запрос
     обработчика, прогнанный напрямую, вернул ожидаемую строку (имя/slug
     схемы, slug записи, field_path); `GET /api/v1/i18n/venues.title.1/refs`
     без токена вернул `401` (не `404`/`405`) — подтверждает, что маршрут
     `/{key}/refs` зарегистрирован корректно и не конфликтует с соседним
     `/{key}/{locale}` (DELETE) на том же уровне вложенности. Полный `cargo
     test` (34 теста) зелёный. Живую проверку самого UI-диалога в браузере не
     делал — это единственное, что проверено только по established-паттерну
     (`TranslationsHistoryDialog`), а не напрямую; candidate для живой
     проверки, если в следующей сессии будут смежные правки в
     `admin-translations`.
7. [x] Написать скрипт миграции существующих `$t('key')`-строк и сырого
   RichText-HTML в новый формат (разово, на существующих данных). Сделано —
   с уточнением по факту, то же самое, что уже встречалось в пункте 4:
   реальной "миграции RichText-HTML" не существует, потому что переводить
   RichText целиком в tag-формат — осознанно отвергнутое решение (раздел
   4.3 п.4: парсер не знает про `<p>`/`<ul>`/`<a href>`/заголовки, перевод
   всего документа стёр бы форматирование). RichText как хранился сырым
   HTML, так и хранится — миграция ему не нужна, он просто пока без меток
   перевода, и это нормально (можно расставить метки позже прямо в
   редакторе). Реальная миграция нужна была только для legacy-строк `Text`
   полей, оставшихся от старого хака `isTranslationKey`/
   `toggleWrapTranslationKey`, убранного в п.4.
   - Новый бинарник `server/src/bin/migrate_legacy_i18n.rs`
     (`cargo run --bin migrate_legacy_i18n -- [--locale=ru] [--dry-run]`):
     сканирует все `content_entries`, находит строковые поля в формате
     `$t('key')`/`$t("key")`/`@t:key`/`i18n:key` (три явных формата старого
     хака — **сознательно не** его нечёткая эвристика "похоже на ключ",
     которая в старом коде служила только для подсветки UI, а не для
     однозначной идентификации; использовать её в разрушающей миграции
     данных было бы риском ложно сконвертировать обычный текст), и
     переписывает в `{key:key}fallback{/key:key}`. Fallback — текущее
     значение перевода из `i18n_translations` для указанной локали (по
     умолчанию `ru`, тот же дефолт, что уже хардкожен в клиентском
     `useContentI18n.ts`, раздел 4.3 п.1), либо голый ключ, если перевода
     нет (тот же fallback, что уже использует `t()` в `packages/i18n`).
     После каждой изменённой записи вызывается уже существующий `sync_refs`
     (раздел 4.3 п.3), так что `content_translation_refs` остаётся
     консистентным без отдельного шага. `--dry-run` показывает, что
     изменилось бы, без записи в БД.
   - Чистая трансформирующая логика вынесена в
     `server/src/content/legacy_i18n_migration.rs` отдельно от
     DB-оркестровки в бинарнике — 12 юнит-тестов (извлечение каждого из
     3 форматов, игнорирование обычного текста и уже мигрированного
     tag-формата, fallback на перевод/голый ключ, рекурсивный обход
     вложенных объектов/массивов, "ничего не менять, если легаси-строк
     нет").
   - Проверено не только юнит-тестами, но и живьём на реальном Postgres:
     вставлена тестовая запись с полями в обоих legacy-форматах (одно с
     существующим переводом, другое без) — `--dry-run` корректно нашёл 1
     запись и ничего не изменил в БД; реальный прогон переписал оба поля
     в tag-формат (с переводом — текст перевода как fallback; без
     перевода — голый ключ) и создал 2 строки в `content_translation_refs`;
     повторный прогон нашёл 0 записей для миграции (идемпотентность
     подтверждена). Полный `cargo test` (29 юнит + остальные интеграционные)
     зелёный.
   - В этом dev-окружении реальных legacy-данных для миграции нет (сид-скрипт
     `seed.rs` никогда не использовал старый хак) — скрипт готов к разовому
     запуску против настоящей продакшен-БД, если/когда она появится.

Этим закрыт весь трек 4.3 (разделы 4.1-4.3 полностью реализованы) — раздел 4
целиком завершён, кроме нерешённого открытого вопроса 4.4 (владелец продукта)
и будущих, не входивших в explicit scope треков: расширение `UiRichTextField`
на оставленные места (FAQ/отзывы Venues, раздел 4.3 п.5) и `ContentRichText`
(клиентский рендер tag-формата на гостевом сайте, раздел 4.2 п.4 — пока не
существует, следующий большой шаг для раздела 7 "Client").

### 4.4 Что решить до старта

- Формат хранения: поле `Text` в схеме сейчас — плоская строка. После
  внедрения оно должно хранить tag-формат даже для "простого" текста без
  переводов (строка без тегов — валидный tag-формат, это не breaking change
  для уже существующих значений, парсер должен съедать обычный текст как есть
  — стоит явно проверить это тестом на реальных данных перед миграцией).
- Именование автогенерируемых ключей — избежать коллизий между разными
  схемами/языками страниц.
- Нужно ли здание поддерживать автоматический (машинный) перевод остальных
  локалей при создании ключа, или это всегда ручной шаг редактора — влияет на
  то, зачем вообще нужен "слот/исключить из перевода" (если перевод всегда
  ручной, "исключить" нужен в первую очередь для брендовых названий и чисел,
  а не для защиты от машинного перевода).

---

## 5. Автоматизация для контент-менеджеров

- Главный пункт — раздел 4 целиком: contet-менеджер должен работать с текстом
  в одном месте одним способом, независимо от того, это поле Venue, страница
  Home или кастомная CMS-схема.
- `SchemaBuilder` уже задаёт метаданные полей (`FieldType`, `required`,
  `multiline` и т.д.) — рендер формы должен на 100% управляться этими
  метаданными, без ручного кода под каждую сущность (отчасти это уже так
  после дедупликации `ContentFormGenerator`, но Venues/Home/Menus всё ещё
  описаны руками в своих composables, а не через схему — унификация с CMS
  схемами отдельный вопрос, возможно не нужный, если эти формы и так
  фиксированные по бизнес-смыслу).
- Массовые операции (bulk status change, bulk delete) пока нет ни на одном
  списке страниц/площадок — стоит добавить после унификации списковых страниц
  (раздел 2).

---

## 6. Автоматизация и DX для разработчиков

- [x] **Расширить `scripts/create-mf` шаблоном "список + фильтры +
  CRUD-диалоги"** — сделано.
  - Новый шаг в интерактивном CLI: выбор шаблона страницы ("Basic page" /
    "List + filters + CRUD dialogs"); при выборе CRUD — ввод имени сущности
    (singular, PascalCase, например "Widget"). Генерирует: `entities/<slug>/api`
    (интерфейсы + `createApi()`-обёртка, тот же паттерн, что уже используют
    `entities/redirects`, `entities/media` и т.п.), композабл
    `use<Entity>Data.ts` (`reactive({...})`-возврат, тот же паттерн, что
    `useRedirectsData`/`useGuestsData` и другие композаблы, разобранные в
    разделе 0) и 4 компонента (`PageHeader`/`FilterBar`/`Table`/`FormDialog`),
    плейсхолдер-поля `name`/`description`/`status` — по образцу уже
    существующего `RedirectsPage` (`apps/admin-content/.../redirects-page/`),
    который и послужил прямым эталоном вёрстки/стилей.
  - **Побочная находка, важнее самого пункта**: пока проверял результат живой
    сборкой (не поверил на слово, что текстовые шаблоны правильные), всплыло,
    что **сам генератор был сломан ещё до этой правки, независимо от CRUD** —
    `main-ts.js`'s шаблон импортировал несуществующий `initRouter` из
    `./app/router`, а `router.js`'s шаблон не создавал инстанс роутера вообще
    (экспортировал только `routes`/неиспользуемый нигде `hooks`/
    `MFLifecycleHooks` — проверено grep'ом по всему репозиторию, эта
    конвенция не читается ни одним реальным приложением, включая
    `admin-shell`'s загрузчик федерированных роутов, который берёт только
    `.routes`). Любой сгенерированный этим скриптом МФ до сих пор не
    скомпилировался бы вообще (ни `vue-tsc`, ни `vite build`) — похоже,
    генератор никогда не прогонялся до конца после того, как реальная
    конвенция бутстрапа (`createRouter()` + экспорт `router`-инстанса,
    `main.ts` = `import { app } from '#app/index'; app.mount(...)`,
    подтверждено чтением `admin-users`'s реальных файлов) где-то разошлась с
    шаблонами. Исправлено: `router.js` теперь реально вызывает
    `createRouter({history: createWebHistory(), routes})` и экспортирует
    `router`; мёртвый `hooks`/`MFLifecycleHooks` убран; `main-ts.js` переписан
    на реальный паттерн с правильным `mountId` (тем же, что уже верно
    генерировал `index-html.js`, но `main-ts.js` его игнорировал).
  - Ещё одна находка по пути: `package-json.js`'s шаблон фиксировал
    `typescript: '^7.0.2'` — ровно ту несовместимую с `vue-tsc` версию,
    которую раздел 1 нашёл и исправил по всему остальному репозиторию (новый
    МФ тихо воскресил бы уже решённый баг). Исправлено на `^5.9.3` + добавлен
    `vue-tsc` в devDependencies + `"type-check": "vue-tsc --build"` в scripts
    (раздел 6, пункт выше про type-check — теперь генератор тоже ему
    соответствует, а не остаётся единственным местом без него).
  - Проверено не предположением, а полным прогоном вживую: одноразовый
    скрипт (не оставлен в репозитории) сгенерировал тестовый МФ
    `admin-test-crud-scaffold` с сущностью "Widget" тем же кодом, что и
    реальный `index.js` (включая настоящую регистрацию в `routes.ts`/
    `ports.ts` через `updateRoutesFile`/`updatePortsFile`, с гарантированным
    откатом этих двух файлов после) — `pnpm install`, `vue-tsc --build`
    (обнаружил и подтвердил нужность ребилда `@admin-panel/lib` перед
    тайпчеком — тот же риск из раздела 1/6, что уже был учтён в
    `turbo.json`), `vite build` (чисто, федерация/shared-чанки собрались
    штатно), `oxlint` — всё прошло чисто. Живая проверка в браузере
    (`vite dev`, открыто в browser pane): страница рендерится (хедер, фильтры,
    пустая таблица, "No Data"), ожидаемая `500`-ошибка от отсутствующего
    бэкенда корректно поймана и показана через `ElMessage.error`
    ("Failed to load widgets"), консоль чистая кроме этой сетевой ошибки;
    диалог "Create Widget" открывается по клику, поля/radio/disabled-кнопка
    "Create" (до ввода имени) работают. После проверки: тестовое приложение,
    `routes.ts`/`ports.ts`-регистрация и `packages/lib/dist` полностью
    откачены до исходного состояния (`git status`/`git diff` чистые).
  - Не делал: generic-типизация полей сущности (сейчас фиксированный набор
    `name`/`description`/`status` — осознанный плейсхолдер, который
    разработчик меняет под реальную сущность, не часть этой задачи делать
    конфигурируемым набором полей через CLI-промпты — усложнение, не
    подтверждённое реальной потребностью).
- В корне монорепо (`guest-place/`) сейчас нет CI вообще — есть только в
  `admin-panel` (`ci.yml`, `lint.yml`, `cd.yml`). Нужен хотя бы smoke-тест,
  поднимающий все три сервиса вместе (`make dev-full`/`docker-up-all`) на PR.
  - [x] **Smoke-тест** — сделано как `make smoke-test` /
    `scripts/smoke-test.mjs`: поднимает `db`/`redis` через Docker Compose
    (корневой `compose.yaml`), затем параллельно `server` (`cargo run`),
    `admin-shell` (`pnpm dev:shell`) и `client` (`pnpm dev` в `client/`) —
    тот же набор процессов, что уже поднимает `dev-full.mjs`, но как разовый
    скрипт с чётким pass/fail, а не интерактивный оркестратор без выхода.
    Каждый сервис опрашивается по HTTP до ответа или таймаута (любой статус
    засчитывается — это smoke-тест "процесс жив и слушает порт", не глубокий
    health-check); падает (ненулевой код) и гарантированно глушит все дочерние
    процессы + `docker compose down`, если хоть один не поднялся.
    - **Побочная находка по пути**: `scripts/dev-full.mjs` (тот самый скрипт,
      на который ссылается этот пункт роадмапа и `make dev-full`) был сломан —
      запускал `docker compose -f server/compose.yaml up -d db redis`, но
      `server/compose.yaml` — orphaned legacy-файл (версия `3.8`, другие имена
      контейнеров, без `admin-panel`/`client`), оставшийся с до-рефакторинга
      времён (раздел 0 этой сессии добавил актуальный корневой `compose.yaml`
      с пятью сервисами) и расходящийся с ним: у обоих файлов одинаковые
      хостовые порты `5432`/`6379`, то есть параллельный запуск `make
      dev-full` и `make dev-admin`/`docker-up` реально столкнул бы два разных
      набора контейнеров на одних портах. Проверено grep'ом по всему
      репозиторию — `server/compose.yaml` не использовался больше нигде.
      Исправлено: `dev-full.mjs` переключён на корневой `compose.yaml` (без
      `-f`, как уже делают все остальные таргеты `Makefile`), стрей-файл
      `server/compose.yaml` удалён (`git rm`).
    - Проверено не на словах: `node scripts/smoke-test.mjs` и отдельно `make
      smoke-test` прогнаны вживую по разу каждый — оба раза все три сервиса
      ответили (`client` за 0с, `admin` за 2-4с, `server` за 4с), скрипт
      корректно напечатал "✅ All three services are up." и код возврата 0;
      после завершения — `docker compose ps -a` пустой, зависших
      `cargo`/`vite`/`nuxt`-процессов от этого прогона не осталось.
    - **Не завёрнуто в GitHub Actions** — осознанно, не забыл. У репозитория
      необычная структура: `root`, `admin-panel`, `server`, `client` — это
      **один и тот же** GitHub-репозиторий (`cookies-with-tea/guest-place`),
      но каждый подпроект живёт в своей собственной долгоживущей ветке
      (`main`/`admin-panel`/`server`/`client` — подтверждено `git ls-remote`),
      а не в одной ветке монорепо. Корректный CI-workflow для `make
      smoke-test` должен был бы чекаутить все четыре ветки в один джоб (через
      несколько шагов `actions/checkout` с разными `ref` в разные
      подпапки) — механически я могу такой YAML написать, но не могу его
      реально прогнать и проверить (нет GitHub Actions раннера в этой среде),
      и больше того — не знаю, как устроен реальный PR-флоу команды для такой
      необычной структуры (ветка с PR обновляется, а что в это время берётся
      для трёх остальных: `main`/`admin-panel`/`server`/`client` HEAD или
      что-то более стабильное/запинненное — этого нигде не документировано).
      Писать и коммитить непроверяемый workflow с угаданными триггерами хуже,
      чем не писать его вообще. `make smoke-test` уже сам по себе — рабочий,
      проверенный кирпичик; подключение к реальному CI — следующий шаг,
      как только определится, на какое событие и с каким чекаутом веток он
      должен срабатывать (решение, а не чисто техническая правка).
  - [x] **Drift-check для `generate:api`** — сделано как `make check-api-drift`
    (не завёрнуто в GitHub Actions — в репозитории нет работающего CI вообще,
    куда это можно было бы включить и реально проверить; сам
    `.github/workflows/ci.yml` в `admin-panel` целиком закомментирован, см.
    ниже). Таргет: `generate-api` (перегенерирует `server/openapi.json` и
    `admin-panel/packages/lib/src/api/types.ts` из текущего кода сервера),
    затем `git diff --exit-code` на оба файла **в их собственных репозиториях**
    (`server/` и `admin-panel/` — отдельные git-репозитории, не подкаталоги
    одного). Падает, если регенерация отличается от закоммиченного — то есть
    ровно тот класс дрифта, который уже реально случился в этом репозитории
    (см. пункт выше про `operation_id`/путь экспорта) и оставался невидимым
    месяцами.
    - Проверено не на синтетическом примере, а на реальных данных: committed
      `server/openapi.json` оказался от 27 сентября, а код сервера с тех пор
      заметно выросс (Home, Redirects и другие эндпоинты) — `make
      check-api-drift` корректно упал с полным diff'ом и ненулевым кодом
      возврата, подтверждая, что механизм действительно детектирует именно
      такой дрифт, а не просто теоретически должен. После того как текущая
      сессия будет закоммичена, `server/openapi.json` и `types.ts` нужно
      коммитить в том же коммите/PR, что и серверные правки — иначе этот же
      check будет (справедливо) падать и дальше.
    - Не стал заводить сам GitHub Actions workflow для этого — без рабочего
      CI в репозитории (ни в корне, ни рабочего в `admin-panel`) нет способа
      реально проверить, что YAML запускается и проходит; `make
      check-api-drift` готов к подключению, когда CI будет раскомментирован/
      заведён (следующий, не входивший в этот пункт шаг).
- [x] **`type-check`, который реально гоняет `vue-tsc` по всем приложениям** —
  сделано (этот пункт уже был отмечен как нужный в разделе 1). До этой правки
  работал только `admin-shell`'s локальный `"type-check": "vue-tsc --build"` —
  корневой `pnpm type-check` был `tsc --build` без project references на
  `apps/*`/`packages/*`, то есть реально не делал ничего, и никто его не
  запускал как единую команду на весь воркспейс.
  - Добавлен `"type-check": "vue-tsc --build"` во все 11 `apps/*`
    (`admin-about`, `admin-content`, `admin-docs`, `admin-guests`,
    `admin-media`, `admin-orchestrator`, `admin-platforms`, `admin-profile`,
    `admin-statistics`, `admin-translations`, `admin-users`) и в
    `packages/ui`/`packages/i18n` (оба содержат `.vue`-файлы); в
    `packages/lib` (без `.vue`) — `"type-check": "tsc --noEmit"`, т.к. его
    `build` идёт через `unbuild`, который вообще не тайпчекает.
  - `vue-tsc`/`typescript` добавлены в `devDependencies` туда, где их не было:
    `admin-about`, `admin-content`, `admin-guests`, `admin-platforms`,
    `packages/ui`.
  - Корневой `package.json`'s `"type-check"` переписан на
    `"turbo run type-check"` (был плоский `tsc --build`, ничего не фанаутил) —
    теперь ведёт себя как остальные агрегирующие скрипты (`lint:all` и т.п.).
  - `turbo.json`'s задача `type-check` получила `"dependsOn": ["^build"]` —
    без этого приложения тайпчекались бы против возможно устаревших
    `packages/lib/dist/*.d.ts` (ровно риск, уже описанный в разделе 1:
    `@admin-panel/lib` резолвится через `dist`, не напрямую из `src`).
  - Проверено: `pnpm type-check` (через `pnpm exec turbo run type-check
    --continue`, чтобы увидеть все проекты сразу, не только первый упавший) —
    7 из 15 проектов полностью чистые (`@admin-panel/lib`, `@admin-panel/i18n`,
    `admin-orchestrator`, `admin-profile`, `admin-statistics`,
    `admin-translations`, `admin-users`), 8 падают **исключительно** на уже
    задокументированной (раздел 1) находке — `ContentFormGenerator.vue`'s
    `TS2304 'field'`/`TS7022 'slotScope'` — проверено построчным grep'ом всего
    лога на `error TS`, кроме этого файла ничего не всплыло ни в одном из 15
    проектов. Не стал трогать структуру `ContentFormGenerator.vue` ради
    тайпчекера — то же решение, что было принято в разделе 1 изначально.
  - **Побочная, более ценная находка**: пока проверял `packages/lib`'s
    typecheck (у него раньше вообще никогда не запускался `tsc` — `unbuild` не
    тайпчекает), всплыли два реальных, не-косметических бага, оба исправлены:
    1. `src/api/types.ts` (генерируется из `server/openapi.json` через
       `openapi-typescript`) — **`TS2300: Duplicate identifier 'get_all'`/
       `'delete_one'` с конфликтующими типами** (`TS2717`). Причина — в
       `server/src/i18n/handlers.rs` и `server/src/mfe/handlers.rs` обработчики
       `get_all`/`delete_one` не задавали явный `operation_id` в
       `#[utoipa::path(...)]`, и utoipa по умолчанию брал именем операции имя
       Rust-функции — у обоих модулей оно совпало (`user`/`media` это уже
       делали правильно, с явными `get_all_users`/`get_all_media` и т.п.). Это
       не просто ошибка тайпчекера: `paths['...']['get'] = operations['get_all']`
       в сгенерированном файле означает, что **оба** эндпоинта (i18n и MFE)
       резолвились в один и тот же, взаимно конфликтующий тип — реальный риск
       получить неверную подсказку/тип при вызове через `createApi`, просто
       никто не видел ошибку, т.к. `tsc` по этому файлу никогда не гонялся.
       Исправлено: добавлены явные `operation_id` по уже принятой в проекте
       конвенции (`get_all_translations`, `delete_translation_by_key_locale`,
       `get_all_mfes`, `delete_mfe_by_id`) — и по пути же, хоть и без текущей
       коллизии, `create`/`update` в `mfe/handlers.rs` тоже получили явные
       `create_mfe`/`update_mfe` (были единственными `create`/`update`
       без явного id в целом сервере — не коллизия сейчас, но та же мина на
       будущее, если появится ещё один модуль с хендлером `create`/`update`).
    2. **`make generate-api`/`cargo run -- --export-openapi` писал
       `openapi.json` не туда** — `server/src/main.rs` писал по относительному
       пути `"openapi.json"`, который резолвится от текущей директории
       процесса; `Makefile`'s `generate-api`-таргет запускает `cargo run
       --manifest-path server/Cargo.toml` из корня репозитория (не делает
       `cd server`), так что файл годами писался в корень репозитория, а не
       в `server/openapi.json`, который реально читает `admin-panel`'s `pnpm
       generate:api` (`openapi-typescript ../../../server/openapi.json`).
       Итог: `make generate-api`/`generate-api`-пайплайн молча не обновлял
       клиентские типы вообще — `admin-panel` тайпчекался против спеки от
       27 сентября, пока в репозитории тихо копился неиспользуемый
       `openapi.json` в корне (это и был необъяснённый `?? openapi.json` в
       `git status` в начале этой сессии). Исправлено: путь записи заменён на
       абсолютный, якорённый на `CARGO_MANIFEST_DIR` (`server/src/main.rs`) —
       теперь корректно пишет в `server/openapi.json` независимо от текущей
       директории запуска. Стрей-файл в корне удалён. Перегенерировано и
       проверено: `server/openapi.json` обновлён, `pnpm --filter
       @admin-panel/lib generate:api` пересобрал `types.ts` без дублей.
    3. `packages/lib/src/utils/mappers.ts` (`snakeToCamel`/`camelToSnake` —
       центральная утилита конвертации регистра, та самая, что лежит в основе
       уже нескольких найденных в этой сессии snake_case/camelCase багов) —
       generic-constraint ошибки (`TS2322`) на промежуточной переменной
       `value`, вытекающие из того же "никогда не тайпчекался" факта.
       Исправлено минимально: `value` явно типизирована как `any`
       (переменная и так прогрессивно трансформируется и кладётся в
       `Record<string, any>`, это не меняет поведение, только убирает ложную
       строгость на промежуточном шаге) — поведение не изменилось, все 30/30
       существующих unit-тестов `packages/lib` зелёные после правки.
    4. `src/api/fetch.ts` (`TS7053`, индексация `messages[0]`) и
       `src/vite/config.ts` (`TS2353` на `singleton` в MF `shared`-конфиге) —
       тоже впервые всплывшие. Первое — явный каст результата к `string[]`
       (значение всегда массив строк по конвенции, см. `messages?: string[]`
       в серверных DTO). Второе — **не баг в коде**: `singleton` реально
       поддерживается `@originjs/vite-plugin-federation@1.4.1` в рантайме
       (на этом держится весь механизм из раздела 4.3 п.2/4 —
       `@admin-panel/ui`/`@admin-panel/lib` помечены `singleton: true`), но
       закомментирован в собственном `SharedConfig`-типе этой версии пакета
       (проверено чтением его `.d.ts` напрямую, не предположением) — явный
       upstream-баг в тайпах зависимости. Исправлено кастом `as any` с
       комментарием, объясняющим причину (не `as SharedConfig`, т.к. тип не
       экспортирован из модуля пакета).
  - Не стал (вне скоупа этого пункта, кандидат на отдельную задачу): сам
    `ContentFormGenerator.vue`'s `TS2304`/`TS7022` — реальная причина, судя по
    всему, глубина `v-if`/`v-else-if` в шаблоне и известная слабость
    vue-tsc/Volar на такой структуре (раздел 1 уже это документировал);
    рефакторинг структуры компонента ради тайпчекера уже был сознательно
    отклонён раньше в этой же сессии.
- Починить `vue-tsc` (раздел 1) — [x] сделано ранее; реальное покрытие по
  всем приложениям — см. пункт выше.

---

## 7. Client (черновик — делать после admin-panel)

- `client/app/widgets/` содержит только `README.md`, `uikit` — заглушки
  `Comp1..5.vue`. Это осознанный черновик, не трогать до готовности
  admin-panel-трека, но держать в уме: как только появится `ContentRichText`
  (раздел 4), именно отсюда стоит начинать настоящую вёрстку виджетов.
- TODO в коде (`UiTabs.vue`, `UiInput.vue`, `fetch.ts`) — по ним нет
  голосового сигнала срочности, пересмотреть, когда начнётся предметная
  работа над клиентом.
- **Найден живой баг при миграции About/Guests/Platforms (раздел 9.3,
  решение по п.2)**: `client/app/pages/about/index.vue` и
  `.../pagePlatforms/index.vue` уже вызывают `useCmsPage('page_about'|
  'page_platforms', ...)`, но схем с такими слагами в БД нет вообще — обе
  страницы гостям всегда показывают зашитый в код фолбэк-контент, никогда
  CMS. Поля у этих ожидаемых схем плоские
  (`hero_title`/`guest_features`/`mission_text`/...), совсем другой формы,
  чем у мигрированных структурированных `about`/`guests`/`platforms`
  (`opportunities`/`leadership`/`news` с `Repeater`/`Group`) — 1:1 не
  смэппить. Когда дойдёт очередь до раздела 7: либо создать `page_about`/
  `page_platforms` как отдельные схемы с полями под уже свёрстанный (пока
  черновой) клиентский шаблон, либо — вероятно лучше — переверстать
  `about`/`pagePlatforms` страницы клиента так, чтобы читать уже
  мигрированные `about`/`guests`/`platforms` схемы напрямую (тогда не нужно
  две параллельные схемы на одну и ту же страницу).

---

## 8. Server

- Приоритет — "работает и даёт то, что нужно admin-panel", не рефакторинг
  ради архитектуры.
- Единственное обязательное изменение, вытекающее из раздела 4: таблица
  `content_translation_refs` + эндпоинт создания ключа по выделению (или
  расширение существующего `CreateTranslationDTO`). Остальное на сервере не
  требует немедленных изменений под текущие задачи.

---

## 9. Схемы, сущности и путаница в структуре контента

Отдельная от текстов/переводов, но такая же фундаментальная проблема: на
проекте одновременно живут **три не связанные друг с другом модели контента**,
и граница между ними не объяснена нигде — ни в коде, ни в UI. Дальше — то,
что подтверждено в коде, не предположения.

### 9.1 Три параллельные системы

1. **Жёсткие "сущности" — отдельные MFE-приложения**: Venues, Menus, Media,
   Guests, Platforms, About, Redirects. Каждая — свой Rust/TS-модель с
   фиксированным набором полей и своя CRUD-вёрстка (то, что мы и разбирали на
   мега-страницы весь этот трек). Схемами тут и не пахнет — поля захардкожены
   в коде обеих сторон.
2. **SchemaBuilder-контент** (`admin-content`, сущности `entities/content`):
   `ContentSchema` (определение — `id, name, slug, isSingleton, fields[]`) и
   `ContentEntry` (данные — `schema_id, slug, data, status`) — это две
   отдельные таблицы/модели. `isSingleton: true` — схема с одной записью
   (страница-одиночка типа `page_about`), `false` — коллекция с произвольным
   числом записей. Рендерится всё через один и тот же generic
   `ContentFormGenerator`/`ContentEditor`, независимо от того, что это за
   схема.
3. **PageConstructor** — блочные страницы (`PageItem` с массивом `blocks[]`,
   типы блоков из `pagesApi.getBlockTypes()`). Визуальный конструктор,
   вообще не связан с `ContentSchema`/`ContentEntry`.

### 9.2 "Глобальная схема" — и почему она не ощущается как что-то отдельное

Она реально существует, но это **не отдельный механизм**, а всего один
`ContentSchema` с магической строкой-slug `global-settings`:
`SettingsPage.vue` (роут `GlobalSettings`, путь `/settings`) просто делает
`contentApi.getSchemaByIdentifier('global-settings')` и рисует её тем же
самым `ContentEditor`, что и любую другую схему. Ничего в интерфейсе не
говорит пользователю "это специальная, глобальная схема, отличная от схемы
страницы „О платформе“" — разница есть только в адресной строке и пункте
меню. Отсюда и ощущение "где-то глобальная схема, где-то другие схемы,
где-то сущности" — это буквально так и есть, граница проведена только в
голове разработчика, не в продукте.

Подтверждённый пример путаницы: `PageListPage` (после рефакторинга —
`useUnifiedPageList`) **склеивает блочные страницы и singleton-схемы в одну
общую сетку карточек**, различая их только маленькой плашкой "БЛОЧНЫЙ
КОНСТРУКТОР" / "СХЕМА ПОЛЕЙ" на карточке. То есть сам продукт на уровне
витрины говорит пользователю "вот список твоих страниц", а на самом деле это
список из двух никак не связанных систем хранения, подсунутых рядом.

### 9.3 Что делать

Полный переезд на одну модель — дорогой и рискованный рефакторинг (Venues и
похожие MFE несут нетривиальную бизнес-логику, которую не всегда стоит тащить
через generic-схему). Предлагается в два слоя:

1. [x] **Дёшево и сразу** — сделано целиком:
   - `PageListPage`/`PagesGrid.vue`: при фильтре "Все" сетка теперь рендерит
     две подписанные секции ("📋 Схемные страницы" / "📦 Блочные страницы")
     вместо одной перемешанной грид с мелкой плашкой на карточке (плашка на
     карточке осталась — не мешает, просто сетка теперь дополнительно
     разделена секциями). `useUnifiedPageList.ts` получил отдельный
     `filteredBlockItems` computed, чтобы фильтр по статусу продолжал
     работать внутри секции "Блочные".
   - `SettingsPage.vue`: добавлен текстовый блок прямо над активной схемой
     (а не только в онбординге для 404-состояния, которое и так было
     неплохо объяснено) — explicitly говорит, что `global-settings` это
     обычная singleton-схема Schema Builder с зарезервированным slug'ом, а
     не отдельный механизм.
   - `ContentDocsPage.vue`: добавлена новая вкладка "0. Три модели контента
     (Обзор)" (сделана активной по умолчанию) — сравнивает PageConstructor,
     Schema Builder и жёсткие MFE-сущности (Venues/Menus/Media/Guests/
     Platforms/About/Redirects), когда что использовать и почему, плюс явно
     называет оба подтверждённых источника путаницы (смешанная витрина
     `/content`, `global-settings` как обычная схема).
2. **Дороже, решать осознанно, не по умолчанию** — пересмотреть, нужны ли
   все три системы одновременно. Открытые вопросы для владельца продукта
   (не технические, решать не мне одному):
   - [x] Должны ли About/Guests/Platforms быть singleton-схемами CMS вместо
     отдельных MFE с захардкоженными полями — **решено: да**, сделано
     целиком (детали и обоснование в конце раздела 9.3). Три системы
     превратились в две: Entities с настоящей бизнес-логикой (Venues,
     Menus, Media, Redirects) — и Schema-driven контент для всего, что по
     сути "страница с полями" (теперь включая About/Guests/Platforms;
     "Guests-as-CRM" из первоначальной формулировки вопроса не
     подтвердилось кодом — на деле это такая же маркетинговая страница с
     фиксированными секциями, как About/Platforms, не список гостей).
   - Стоит ли **составление** самой схемы (SchemaBuilder UI) сделать удобнее
     — сейчас это плоский список полей без группировки, вложенности
     (кроме `group`/`repeater` как типов полей, но без визуальной иерархии в
     canvas) и без переиспользования кусков схемы между разными схемами
     (нет понятия "общий блок полей", который можно вставить в несколько
     схем сразу — например, SEO-блок сейчас либо копируется в каждую схему
     вручную, либо не предусмотрен вовсе). Это отдельная, более узкая
     задача по UX самого конструктора схем, независимая от вопроса "сколько
     систем контента нам вообще нужно".

**Детали миграции About/Guests/Platforms (решение по пункту 2 выше):**

Проверено чтением кода всех трёх MFE (`admin-about`/`admin-guests`/
`admin-platforms`) и их Rust-бэкендов: у всех трёх — идентичная форма
(`createApi('about'|'guests'|'platforms')`, один GET + один PUT, ни CRUD
нескольких записей, ни связей с другими сущностями, только
hero/opportunities/медиа-гайды), backed by 6-8 выделенных SQL-таблиц на
страницу (`about`, `about_opportunities`, `about_opportunity_items`,
`about_leadership`, ... — суммарно 19 таблиц на три страницы). Ровно то, что
`content_schemas`/`content_entries` + `Repeater`/`Group`/`Media` field types
уже умеют делать generic-механизмом (как `global-settings`).

Сделано:
- `server/src/bin/migrate_legacy_pages.rs` — одноразовый мигратор (по
  образцу уже существующего `migrate_legacy_i18n`): создаёт 3 singleton
  `ContentSchema` (`about`/`guests`/`platforms`, поля `Group`/`Repeater`/
  `Media` 1:1 повторяют старую форму) и переносит данные из legacy-таблиц в
  `content_entries.data`. Прогнан на дев-БД, проверено напрямую в Postgres и
  через API — данные перенеслись без потерь.
- `migrations/20261028110000_retire_legacy_pages` — удаляет 19 legacy-таблиц,
  3 записи в `microfrontends` (MFE-реестр: `about`/`guests`/`platforms`) и
  мёртвую RBAC-запись `about:write`.
- `server/src/lib.rs`/`main.rs`: убраны `/api/v1/about`, `/api/v1/guests`,
  `/api/v1/platforms`, модули `about`/`guests`/`platforms`, их OpenAPI-
  метаданные. `openapi.json`/admin-panel's `types.ts` пересобраны
  `make generate-api`.
- `admin-panel/apps/admin-about`, `admin-guests`, `admin-platforms` удалены
  целиком (были 3 отдельных MFE-приложения, ~9 портов в `ports.ts`,
  3 записи в module federation registry) — контент редактируется тем же
  generic `ContentEditor`, что и любая другая singleton-схема, появляется в
  `PageListPage`'s секции "Схемные страницы" автоматически, без отдельного
  пункта в навигации.
- Попутная находка при проверке `/api/v1/about` до удаления: роуты были на
  `public_router` вообще без `auth_middleware` — `PUT /api/v1/about` был
  доступен без аутентификации кому угодно. Удаление модулей закрывает и эту
  дыру, отдельно не патчил (компонент удалён целиком).
- Проверено живым браузерным харнессом и напрямую через API (до удаления
  легаси-таблиц): редактор схемы `about` рендерит и сохраняет все
  вложенные `Group`/`Repeater`/`Media` поля идентично старой форме —
  добавление элемента в `opportunities` (вложенный `Repeater` с вложенным
  `Repeater` пунктов списка) через UI, PATCH через API, перезагрузка
  страницы — данные сохраняются и перечитываются корректно.
- Попутно найден и исправлен реальный vue-tsc/Volar-баг (`TS2304` на
  `field` под глубокой вложенностью `v-if`/`v-else-if` внутри `v-for`),
  годами числившийся в разделе 1 как "известное ограничение, не трогать
  структуру ради тайпчекера" — он был смысловым триггером "не трогать этот
  компонент", и миграция About/Guests/Platforms требовала трогать именно
  `ContentFormGenerator.vue`. Разобран на тонкий `ContentFormGenerator`
  (цикл по полям) + новый `ContentFieldControl.vue` (вся цепочка
  `v-if`/`else-if` по `FieldType`, уже не внутри `v-for`) — `field` стал
  обычным пропом, а не v-for-scoped переменной, что и убрало баг.
  `pnpm type-check` по всему воркспейсу (18 пакетов) теперь реально зелёный
  впервые с тех пор, как эта находка вообще была задокументирована.

**Важная находка, не в скоупе этой миграции** (задокументирована для
раздела 7, когда дойдут руки до клиента): клиентские страницы `/about` и
`/platforms` (`client/app/pages/about`, `.../pagePlatforms`) **уже** читают
СВОИ собственные схемы — `page_about`/`page_platforms` через `useCmsPage` —
не те, что только что мигрированы (`about`/`guests`/`platforms`). Ни
`page_about`, ни `page_platforms` не существуют в БД (проверено — нет ни
одной сид-миграции на эти слаги), так что обе страницы сейчас всегда
показывают гостям зашитый в код фолбэк, а не что-либо из CMS. Поля там и
вовсе другой формы (плоские `hero_title`/`guest_features`/`mission_text` у
клиента vs структурированные `opportunities`/`leadership`/`news` у
мигрированных схем) — связать их 1:1 не получится, нужно отдельное решение,
когда начнётся реальная вёрстка клиента (раздел 7). Итог: контент, который
кто-либо вводил через старые `admin-about`/`admin-guests`/`admin-platforms`
MFE, никогда не попадал на гостевой сайт вообще — живой, подтверждённый баг,
не гипотетический риск, появившийся независимо от этой сессии.

---

## 10. Контекстная справка "для чего это" по каждому МФ и странице

Сейчас в админке нет ни одного места, которое объясняет **назначение**
раздела — только сама форма/таблица, без единого слова зачем она нужна. Есть
один частичный прецедент и больше ничего:

- `ContentDocsPage.vue` (`/docs`, 689 строк) — полноценная страница с
  объяснением модели Schema/Entry, диаграммами таблиц БД. Хорошо написана,
  но покрывает только Schema Builder, это целая страница (не модалка) и на
  неё можно попасть только зная, что она существует — ссылки на неё с других
  страниц нет.
- Больше ничего: ни у одной из MFE (Venues, Menus, Media, Guests, Platforms,
  About, Redirects, PageConstructor, Home) нет и близко похожего объяснения.
- Канала данных для такой справки тоже нет ни на одном уровне: роуты
  `admin-content` несут только `title`/`hideInSidebar` в `meta` — поля под
  описание/помощь нет. MFE-манифест, который `admin-shell` получает с сервера
  (`GET /api/v1/mfe/manifest`, форма `{ url, scope, module, order, category }`
  по каждому MFE), тоже не содержит описания — его придётся добавлять по всей
  цепочке сервер → shell → sidebar, с нуля.

### Предложение

1. [x] **Один МФ — одна короткая справка.** Сделано. Кнопка "?" теперь стоит
   рядом с названием каждого МФ в сайдбаре (все три ветки шаблона —
   одиночный пункт, группа с вложенными роутами, simple-режим) и открывает
   модалку "Что это и зачем" с 3-5 предложениями простым языком. Список МФ
   со справкой: `content`, `about`, `guests`, `platforms`, `media`,
   `translations`, `users`, `statistics`, `orchestrator`, `profile` — ровно
   10, как и предполагалось (проверено по реальной регистрации MFE на
   сервере, `server/migrations/*mfe*.sql`; `admin-docs` — это Storybook для
   разработчиков, не зарегистрирован как remote в `admin-shell` и
   справки не требует).
2. [x] **Общий компонент** — `UiInfoButton` в `@admin-panel/ui`
   (`packages/ui/src/components/ui-info-button`), обёртка над уже
   существующим `UiModal`: кнопка-иконка + модалка с заголовком/текстом,
   открывает/закрывает себя сама (`v-model` внутри), снаружи только
   `:title`/`:description`. Один компонент на все МФ, как и `UiGlassCard`.
3. [x] **Канал данных** — без сервера/манифеста, как и предполагалось:
   словарь `MFE_HELP` в `packages/lib/src/constants/mfeHelp.ts`, ключ —
   module federation `name` МФ (тот же slug, что уже используется в
   `ROUTES` из `routes.ts`). `ISidebarItem` получил новое поле `mfeName`,
   которое `routesToSidebar()` в `admin-shell/src/app/router/index.ts`
   теперь прокидывает из `group.name` на верхнеуровневые пункты меню.
   Если понадобится редактировать тексты без деплоя — переносить в
   БД/манифест по факту, не заранее (как и было решено).
4. **Расширение до уровня страниц внутри MFE** — не делали, следующий шаг
   по мере появления конкретных точек путаницы (например, разница между
   вкладками в `VenueEditorView`, или чем Pricing-таб отличается от
   Deposits) — не нужно сразу закрывать каждую страницу, только те, где
   вопрос реально возникает на практике.
5. [x] Тон и уровень подробности текстов — короткие 2-3 предложения на
   МФ, язык для контент-менеджера, не для разработчика; `ContentDocsPage`
   не трогали как формат-образец (осталась полноценной страницей только
   для Schema Builder).

---

## Предлагаемый порядок выполнения

1. [x] **Гигиена репозитория** (раздел 1) — дёшево, разблокирует нормальный CI/typecheck.
2. [x] **Критичный фикс перевода на клиенте** (раздел 4.3, шаг 1) — сейчас контент
   для гостей буквально ломается, это не терпит до большого редизайна.
3. [x] **Дешёвая часть раздела 9** (9.3, пункт 1) — разделить сетку в
   `PageListPage`, объяснить `global-settings` текстом, расширить
   `ContentDocsPage` — пара вечеров работы, сразу снимает часть путаницы
   без большого рефакторинга.
4. [x] **Справка "что это и зачем" по MFE** (раздел 10, пункты 1-3) — общий
   компонент + 10 коротких текстов. Дёшево, высокий эффект на "я не понимаю".
5. [x] **Разбор оставшихся мега-файлов** (раздел 0/2) — та же методика, что уже
   отработана. `ModulesPage.vue`, `TiptapEditor.vue`, `MediaUploadDialog.vue`,
   `TranslationEditor.vue`, `MediaFilters.vue`, `ContentDocsPage.vue`,
   `ContentEditorPage.vue`, `ContentEditor.vue`, `SettingsPage.vue`,
   `MonitoringPage.vue`, `AboutPage.vue` сделаны ранее (раздел 0). Оставшиеся
   5 файлов 500+ строк разобраны в этой сессии: `admin-media/MediaPreviewDialog.vue`
   (632 → ~75), `admin-media/MediaTable.vue` (620 → ~90),
   `admin-guests/GuestsPage.vue` (579 → 44), `admin-platforms/PlatformsPage.vue`
   (511 → 41), `admin-content/RedirectsPage.vue` (554 → ~30) — детали и попутно
   найденный/исправленный баг (snake_case/camelCase в `RedirectItem`) в разделе 0.
   Раздел 0/2 этого трека закрыт полностью.
6. [x] **Единая система текстов и переводов** (раздел 4) — самый большой трек,
   бить на этапы из 4.3, не делать одним PR. Все 7 шагов 4.3 сделаны (детали —
   раздел 4.3, пункты 1-7): критичный фикс перевода на клиенте, Tiptap custom
   marks + мост, `content_translation_refs` на сервере, `UiRichTextField`
   подключён в `ContentFormGenerator` и расставлен по Venues/HomePage/Menus,
   `admin-translations` показывает "где используется ключ", скрипт миграции
   legacy-данных. Трек 4.3 закрыт полностью.
6.1. [x] **Клиентский резолвер tag-формата для Venues** (раздел 4.2 п.4) —
   сделано, детали в разделе 4.2 п.4. Закрывает реальный, не гипотетический
   риск регрессии: после раздела 4.3 п.5 `venue.title` мог показывать
   гостям буквальный `{key:...}` без резолвера.
6.2. [x] **`UiRichTextField` на оставленные места Venues** (раздел 4.3 п.5,
   FAQ/отзывы/лента) — сделано сразу вслед за 6.1, детали в разделе 4.3 п.5
   (подпункт "добавлено позже"). Раздел 4.3 теперь закрыт по всем изначально
   названным местам полностью (Venues/HomePage/Menus), не только по трём
   явно перечисленным в формулировке пункта.
7. [x] **Решение по разделу 9.3, пункт 2** (сколько систем контента нужно
   на самом деле) — принято и выполнено: About/Guests/Platforms переведены
   на Schema Builder, три системы контента стали двумя. Детали, найденный
   попутно vue-tsc-баг и обнаруженный (не в скоупе) баг отсутствующей связи
   client's `page_about`/`page_platforms` со свежемигрированными схемами —
   в разделе 9.3, после пункта 2.
7.1. [x] **`type-check` по всем приложениям** (раздел 6) — сделано вместо
   раздела 9.3 п.2, т.к. тот требует решения владельца продукта. Детали —
   раздел 6: `vue-tsc --build`/`tsc --noEmit` заведён во все 11 `apps/*` и
   3 `packages/*`, корневой `pnpm type-check` реально фанаутит через turbo
   (раньше не делал ничего). Попутно найдены и исправлены два реальных бага,
   не только DX-обвязка: дублирующиеся `operation_id` в `server/src/i18n` и
   `server/src/mfe` (ломали сгенерированные TS-типы `operations['get_all']`/
   `['delete_one']` молча), и `make generate-api` писавший `openapi.json` не
   туда (в корень репозитория вместо `server/`) — клиентские типы могли
   месяцами тихо не обновляться. Плюс мелкие typecheck-находки в
   `packages/lib` (`mappers.ts`, `fetch.ts`, `vite/config.ts`), у которого
   `tsc` никогда не запускался (его `build` — `unbuild`, без тайпчека).
7.2. [x] **Drift-check для `generate:api`** (раздел 6) — `make check-api-drift`,
   детали в разделе 6. Проверено на реальных данных: закоммиченный
   `openapi.json` оказался от 27 сентября, таргет корректно это поймал.
7.3. [x] **`create-mf`-шаблон "список + фильтры + CRUD"** (раздел 6) — сделано,
   детали в разделе 6. Попутно нашёл и исправил более серьёзный баг — сам
   генератор был сломан (несуществующий `initRouter`, роутер без
   `createRouter()`, устаревшая версия `typescript` в шаблоне package.json) —
   любой МФ, сгенерированный им раньше, не собрался бы вообще, CRUD тут ни при
   чём. Проверено живой сборкой/тайпчеком/браузером, тестовый МФ и правки
   `routes.ts`/`ports.ts` откачены.
7.4. [x] **Root-level smoke-тест** (раздел 6) — `make smoke-test`, детали в
   разделе 6. Прогнан вживую дважды (напрямую и через `make`) — все три
   сервиса поднимаются и отвечают, teardown чистый. Не подключён к GitHub
   Actions осознанно — у репозитория нестандартная структура (4 ветки одного
   GitHub-репо вместо единой монорепо-ветки), писать непроверяемый workflow
   с угаданными `ref` хуже, чем не писать вовсе; решение, на какое событие
   и чьи ветки он должен чекаутить, не техническое. Попутно нашёл и исправил
   отдельный баг: `dev-full.mjs` ссылался на orphaned `server/compose.yaml`
   (до-рефакторинговый дубликат с другими портами/именами контейнеров),
   удалён, скрипт переключён на актуальный корневой `compose.yaml`.
8. **DX-автоматизация, оставшееся** — в разделе 6 явных пунктов не осталось.
8.1. [x] **`UiFilterBar` + CRUD-шаблон генератора** (раздел 2) — сделано,
   детали в разделе 2. Единственный явный, подтверждённый кодом layout-
   примитив из "UI-унификации", который был готов сделать сразу; остальное
   в разделах 2-3 — политика Element Plus vs `@admin-panel/ui` и mobile-first
   аудит — требует более широкого, не однозначно техническое решения
   (где проводить границу, какие экраны вообще должны быть responsive).
8.2. [x] **`stylelint`/`oxfmt` по всему репозиторию** (раздел 1) — сделано,
   детали в разделе 1 (136 stylelint + 24 oxfmt, авто-исправлено, один ручной
   фикс deprecated-значения).
8.3. [x] **Полный прогон тестов** (server + admin-panel + client) — сделано,
   не в роадмапе отдельным пунктом, просто финальная проверка здоровья
   проекта после всех правок этой сессии. `cargo test` (с реальным Postgres/
   Redis через `docker compose up db redis`, не только `--lib`) — 29 юнит +
   все интеграционные (`auth`/`features`/`home`/`i18n`/`media*`/`metadata`/
   `mfe`/`optimizer`/`venues`) зелёные, в т.ч. `test_mfe_get_all` — тест,
   который напрямую бы поймал регресс, если бы исправление `operation_id` в
   разделе 6 что-то сломало в самом хендлере (оно не ломало — чинили только
   OpenAPI-метаданные, не логику). `pnpm test:unit` в `admin-panel` — 14/14
   задач зелёные. `pnpm test:run` в `client` — 36/36 тестов зелёные. Больше
   не осталось явных, не требующих решения владельца продукта технических
   задач — нашёл два `TODO` в коде (`TopologyPage.vue`'s хардкод
   под-роутов, `routes.ts`'s "переписать на подгрузку из админки"), оба
   оставлены: первый — декоративная визуализация с низкой ценой правильного
   решения, второй — архитектурная переделка метаданных роутов по всей
   федерации, не одноразовый фикс.
9. **UI-унификация, оставшееся** (раздел 2-3 — политика Element Plus vs
   `@admin-panel/ui`, mobile-first аудит, `Container`/`Grid`/`Stack` если
   найдётся подтверждённое повторение) по мере появления свободного времени,
   либо подключение `make check-api-drift`/`make smoke-test` к реальному CI,
   когда появится решение по веткам/триггерам.
10. **Client** (раздел 7) — после того как admin-panel и система текстов
   устоялись, чтобы не верстать виджеты под формат, который ещё поменяется.
