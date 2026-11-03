-- Structural rollback only — the content that lived in these tables was migrated into
-- content_entries (slugs: about/guests/platforms) and stays there; this does not copy it
-- back out, so the recreated tables come back empty.

CREATE TABLE about (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    hero_guide_uuid UUID REFERENCES media(uuid),
    opportunities_guide_uuid UUID REFERENCES media(uuid),
    leadership_guide_uuid UUID REFERENCES media(uuid),
    who_we_are_guide_uuid UUID REFERENCES media(uuid),
    news_guide_uuid UUID REFERENCES media(uuid)
);

CREATE TABLE about_opportunities (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    about_id INTEGER REFERENCES about(id) ON DELETE CASCADE,
    icon_uuid UUID REFERENCES media(uuid),
    link TEXT DEFAULT '',
    button_text TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE about_opportunity_items (
    id SERIAL PRIMARY KEY,
    opportunity_id INTEGER REFERENCES about_opportunities(id) ON DELETE CASCADE,
    item_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE about_leadership (
    id SERIAL PRIMARY KEY,
    about_id INTEGER REFERENCES about(id) ON DELETE CASCADE,
    logo_uuid UUID REFERENCES media(uuid),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE about_leadership_items (
    id SERIAL PRIMARY KEY,
    leadership_id INTEGER REFERENCES about_leadership(id) ON DELETE CASCADE,
    icon_uuid UUID REFERENCES media(uuid),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE about_who_we_are (
    id SERIAL PRIMARY KEY,
    about_id INTEGER REFERENCES about(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_uuid UUID REFERENCES media(uuid),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE about_news (
    id SERIAL PRIMARY KEY,
    about_id INTEGER REFERENCES about(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE about_news_items (
    id SERIAL PRIMARY KEY,
    news_id INTEGER REFERENCES about_news(id) ON DELETE CASCADE,
    icon_uuid UUID REFERENCES media(uuid),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE guests (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    hero_guide_uuid UUID REFERENCES media(uuid),
    opportunities_guide_uuid UUID REFERENCES media(uuid),
    interaction_cards_guide_uuid UUID REFERENCES media(uuid),
    search_promo_guide_uuid UUID REFERENCES media(uuid),
    additional_services_guide_uuid UUID REFERENCES media(uuid)
);

CREATE TABLE guests_opportunities (
    id SERIAL PRIMARY KEY,
    guests_id INTEGER REFERENCES guests(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    icon_uuid UUID REFERENCES media(uuid),
    button_text TEXT DEFAULT '' NOT NULL,
    link TEXT DEFAULT '' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE guests_opportunity_items (
    id SERIAL PRIMARY KEY,
    opportunity_id INTEGER REFERENCES guests_opportunities(id) ON DELETE CASCADE,
    item_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE guests_interaction_cards (
    id SERIAL PRIMARY KEY,
    guests_id INTEGER REFERENCES guests(id) ON DELETE CASCADE,
    icon_uuid UUID REFERENCES media(uuid),
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    button_text TEXT NOT NULL,
    link TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE guests_search_promo (
    id SERIAL PRIMARY KEY,
    guests_id INTEGER REFERENCES guests(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE guests_additional_services (
    id SERIAL PRIMARY KEY,
    guests_id INTEGER REFERENCES guests(id) ON DELETE CASCADE,
    icon_uuid UUID REFERENCES media(uuid),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE platforms (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    hero_guide_uuid UUID REFERENCES media(uuid) ON DELETE SET NULL,
    opportunities_guide_uuid UUID REFERENCES media(uuid) ON DELETE SET NULL,
    tools_guide_uuid UUID REFERENCES media(uuid) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE platforms_opportunities (
    id SERIAL PRIMARY KEY,
    platforms_id INTEGER REFERENCES platforms(id) ON DELETE CASCADE,
    icon_uuid UUID REFERENCES media(uuid) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    link VARCHAR(255) NOT NULL,
    button_text VARCHAR(255) NOT NULL
);

CREATE TABLE platforms_opportunity_items (
    id SERIAL PRIMARY KEY,
    opportunity_id INTEGER REFERENCES platforms_opportunities(id) ON DELETE CASCADE,
    item_text TEXT NOT NULL
);

CREATE TABLE platforms_tools (
    id SERIAL PRIMARY KEY,
    platforms_id INTEGER REFERENCES platforms(id) ON DELETE CASCADE,
    logo_uuid UUID REFERENCES media(uuid) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL
);

CREATE TABLE platforms_tools_items (
    id SERIAL PRIMARY KEY,
    tools_id INTEGER REFERENCES platforms_tools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL
);

INSERT INTO permissions (id, name, description) VALUES
    ('about:write', 'Write About', 'Allow editing about information')
ON CONFLICT (id) DO NOTHING;

INSERT INTO microfrontends (name, display_name, url, scope, module, icon, category, order_index)
VALUES
    ('about', 'About Page', 'http://localhost:3006/assets/remoteEntry.js', 'about', './AboutRoutes', 'EditPen', 'website', 10),
    ('guests', 'Гостям', 'http://localhost:3008/assets/remoteEntry.js', 'guests', './GuestsRoutes', 'UserFilled', 'website', 20),
    ('platforms', 'Площадкам', 'http://localhost:3009/assets/remoteEntry.js', 'platforms', './PlatformsRoutes', 'Place', 'website', 25)
ON CONFLICT (name) DO NOTHING;
