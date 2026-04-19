CREATE TABLE IF NOT EXISTS platforms (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    hero_guide_uuid UUID REFERENCES media(uuid) ON DELETE SET NULL,
    opportunities_guide_uuid UUID REFERENCES media(uuid) ON DELETE SET NULL,
    tools_guide_uuid UUID REFERENCES media(uuid) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS platforms_opportunities (
    id SERIAL PRIMARY KEY,
    platforms_id INTEGER REFERENCES platforms(id) ON DELETE CASCADE,
    icon_uuid UUID REFERENCES media(uuid) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    link VARCHAR(255) NOT NULL,
    button_text VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS platforms_opportunity_items (
    id SERIAL PRIMARY KEY,
    opportunity_id INTEGER REFERENCES platforms_opportunities(id) ON DELETE CASCADE,
    item_text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS platforms_tools (
    id SERIAL PRIMARY KEY,
    platforms_id INTEGER REFERENCES platforms(id) ON DELETE CASCADE,
    logo_uuid UUID REFERENCES media(uuid) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS platforms_tools_items (
    id SERIAL PRIMARY KEY,
    tools_id INTEGER REFERENCES platforms_tools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL
);

-- Seed initial platforms page data
INSERT INTO platforms (id, title, description) 
VALUES (1, 'Площадкам Guest & Place', 'Initial overview for platforms')
ON CONFLICT (id) DO NOTHING;

-- Seed MFE entry
INSERT INTO microfrontends (name, display_name, url, scope, module, icon, category, order_index, enabled)
VALUES (
    'admin-platforms',
    'Площадкам',
    'http://localhost:3009/assets/remoteEntry.js',
    'admin-platforms',
    './PlatformsRoutes',
    'Place',
    'website',
    25,
    true
)
ON CONFLICT (name) DO NOTHING;
