-- Create microfrontends table
CREATE TABLE IF NOT EXISTS microfrontends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    url TEXT NOT NULL,
    scope TEXT NOT NULL,
    module TEXT NOT NULL,
    icon TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial data from manifest.json
INSERT INTO microfrontends (name, display_name, url, scope, module, icon, order_index)
VALUES 
('orchestrator', 'Orchestrator', 'http://localhost:3005/assets/remoteEntry.js', 'orchestrator', './OrchestratorRoutes', 'Setting', 0),
('statistics', 'Statistics', 'http://localhost:3001/assets/remoteEntry.js', 'statistics', './StatisticsRoutes', 'Histogram', 1),
('translations', 'Translations', 'http://localhost:3002/assets/remoteEntry.js', 'translations', './TranslationsRoutes', 'ChatDotRound', 2),
('users', 'Users', 'http://localhost:3003/assets/remoteEntry.js', 'users', './UsersRoutes', 'User', 3),
('media', 'Media', 'http://localhost:3004/assets/remoteEntry.js', 'media', './MediaRoutes', 'Picture', 4)
ON CONFLICT (name) DO NOTHING;
