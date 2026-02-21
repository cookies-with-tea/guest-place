CREATE TABLE about (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE about_opportunities (
    id SERIAL PRIMARY KEY,
    about_id INTEGER REFERENCES about(id) ON DELETE CASCADE,
    icon_uuid UUID REFERENCES media(uuid),
    title TEXT NOT NULL,
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