-- Отложенная публикация контента (IDEAS.md): status='scheduled' + scheduled_at,
-- переводится в 'published' периодическим джобом (core::scheduler::spawn_scheduled_publish_job)
-- по аналогии с уже существующим auth::handlers::spawn_expired_refresh_token_cleanup.
ALTER TABLE pages ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE content_entries ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

-- Частичный индекс — джоб сканирует только status='scheduled' раз в минуту.
CREATE INDEX IF NOT EXISTS idx_pages_scheduled_at ON pages(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_content_entries_scheduled_at ON content_entries(scheduled_at) WHERE status = 'scheduled';
