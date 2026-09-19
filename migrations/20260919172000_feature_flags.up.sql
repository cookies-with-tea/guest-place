-- Create feature_flags table
CREATE TABLE IF NOT EXISTS feature_flags (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    enabled BOOLEAN NOT NULL DEFAULT false,
    category VARCHAR(50) NOT NULL DEFAULT 'system',
    mfe_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial feature flags
INSERT INTO feature_flags (id, name, description, enabled, category, mfe_name)
VALUES
    ('mfe_dynamic_fallback', 'Динамический Fallback для MFE', 'Отображение страницы-заглушки с кнопкой повтора для упавших микрофронтендов', true, 'mfe', NULL),
    ('mfe_auto_healthcheck', 'Автоматический Health-check', 'Фоновый мониторинг доступности и задержки remoteEntry.js', true, 'mfe', NULL),
    ('system_realtime_metrics', 'Real-time метрики системы', 'Трансляция загрузки CPU и памяти сервером через SSE', true, 'system', 'orchestrator'),
    ('content_live_preview', 'Live Preview контента', 'Предпросмотр контента в реальном времени через postMessage', true, 'content', 'content'),
    ('media_auto_webp', 'Автогенерация WebP/AVIF', 'Автоматическая конвертация загружаемых медиафайлов', true, 'media', 'media')
ON CONFLICT (id) DO NOTHING;
