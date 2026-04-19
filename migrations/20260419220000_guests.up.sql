-- Up migration
CREATE TABLE guests (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE guests_opportunities (
    id SERIAL PRIMARY KEY,
    guests_id INTEGER REFERENCES guests(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    icon_uuid UUID REFERENCES media(uuid),
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

-- Seed initial data
INSERT INTO guests (title) VALUES ('Гостям');
INSERT INTO guests_search_promo (guests_id, title, description) VALUES (1, 'Для быстрого поиска Вы можете пользоваться всеми вариантами одновременно', 'GP Платформа позволяет общаться напрямую здесь и сейчас. Мы за «прозрачные отношения»');
