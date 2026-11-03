-- Moves packages/lib/src/constants/mfeHelp.ts's content-manager-facing "what is this
-- section for" tooltips into i18n_translations (editable from Admin → Translations,
-- same as every other piece of admin-panel UI text) instead of a code-level dict —
-- see IMPROVEMENTS.md section 5. Only the 7 currently-registered MFEs are seeded;
-- mfeHelp.ts also had entries for about/guests/platforms, all three retired MFEs
-- (migration 20261028110000_retire_legacy_pages) — not carried over, they were dead.
INSERT INTO i18n_translations (key, locale, value) VALUES
('mfeHelp.content.title', 'ru', 'Контент'),
('mfeHelp.content.title', 'en', 'Content'),
('mfeHelp.content.description', 'ru', 'Самый большой раздел. Конструктор страниц из блоков (Page Constructor), конструктор произвольных схем контента (Schema Builder), а также специализированные подразделы Venues (площадки) и Menus (меню заведений). Если не уверены, где редактировать конкретную страницу — откройте вкладку «Документация подхода» внутри этого раздела: там объяснена разница между блочными страницами, схемами и жёсткими сущностями.'),
('mfeHelp.content.description', 'en', 'The largest section. A block-based page builder (Page Constructor), a custom content schema builder (Schema Builder), plus the specialized Venues and Menus sub-sections. If you''re unsure where to edit a specific page, open the "Approach docs" tab inside this section — it explains the difference between block pages, schemas, and hard-coded entities.'),

('mfeHelp.media.title', 'ru', 'Медиа'),
('mfeHelp.media.title', 'en', 'Media'),
('mfeHelp.media.description', 'ru', 'Общая медиабиблиотека — единое хранилище изображений и файлов для всего сайта (фото площадок, баннеры, иконки). Загружайте файл сюда один раз и переиспользуйте его в разных разделах (Venues, About, Home) вместо повторной загрузки той же картинки.'),
('mfeHelp.media.description', 'en', 'The shared media library — a single storage for images and files across the whole site (venue photos, banners, icons). Upload a file once here and reuse it across sections (Venues, About, Home) instead of uploading the same picture again.'),

('mfeHelp.translations.title', 'ru', 'Переводы'),
('mfeHelp.translations.title', 'en', 'Translations'),
('mfeHelp.translations.description', 'ru', 'Словарь системных фраз и текстов на разных языках — пары «ключ → текст» для каждой локали. Используется, когда нужно изменить формулировку, которая показывается на сайте или в самой админке, либо добавить новый язык.'),
('mfeHelp.translations.description', 'en', 'The dictionary of system phrases and texts in different languages — "key → text" pairs per locale. Use it to change wording shown on the site or in the admin panel itself, or to add a new language.'),

('mfeHelp.users.title', 'ru', 'Пользователи'),
('mfeHelp.users.title', 'en', 'Users'),
('mfeHelp.users.description', 'ru', 'Управление пользователями админки и их правами доступа: кто может редактировать контент, кто только просматривать, кто администратор. Используйте, чтобы выдать доступ новому сотруднику или ограничить то, что может менять конкретный человек.'),
('mfeHelp.users.description', 'en', 'Manage admin panel users and their access rights: who can edit content, who can only view, who is an administrator. Use it to grant access to a new team member or restrict what a specific person can change.'),

('mfeHelp.statistics.title', 'ru', 'Статистика'),
('mfeHelp.statistics.title', 'en', 'Statistics'),
('mfeHelp.statistics.description', 'ru', 'Аналитика посещаемости и бронирований сайта: графики и метрики по гостям, площадкам, популярным разделам. Помогает понять, что реально интересует посетителей, и принимать решения о контенте на основе данных, а не предположений.'),
('mfeHelp.statistics.description', 'en', 'Site traffic and booking analytics: charts and metrics on guests, venues, popular sections. Helps you understand what visitors actually care about and make content decisions based on data, not guesses.'),

('mfeHelp.orchestrator.title', 'ru', 'Оркестратор'),
('mfeHelp.orchestrator.title', 'en', 'Orchestrator'),
('mfeHelp.orchestrator.description', 'ru', 'Техническая панель системы: включение/выключение функций (feature flags), состояние подключённых модулей, логи и топология. Контент-менеджеру обычно не нужен — заходите сюда, если что-то не загружается или нужно проверить, включена ли новая функция.'),
('mfeHelp.orchestrator.description', 'en', 'The system''s technical panel: toggling features (feature flags), connected module status, logs and topology. A content manager usually doesn''t need this — come here if something isn''t loading or you need to check whether a new feature is enabled.'),

('mfeHelp.profile.title', 'ru', 'Профиль'),
('mfeHelp.profile.title', 'en', 'Profile'),
('mfeHelp.profile.description', 'ru', 'Ваши личные настройки аккаунта в админке — имя, аватар, пароль, уведомления. Эти изменения касаются только вас и не влияют на публичный сайт.'),
('mfeHelp.profile.description', 'en', 'Your personal account settings in the admin panel — name, avatar, password, notifications. These changes only affect you and don''t impact the public site.')
ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
