-- Up migration: Stage 3 SEO, Navigation & Redirects

-- 1. Extend pages table with parent_id for page hierarchy
ALTER TABLE pages 
    ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES pages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_pages_parent_id ON pages(parent_id);

-- 2. Menus table for site navigation (Header, Footer, Sidebar, etc.)
CREATE TABLE IF NOT EXISTS menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL UNIQUE,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menus_location ON menus(location);

CREATE OR REPLACE FUNCTION update_menus_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_menus_updated_at
BEFORE UPDATE ON menus
FOR EACH ROW
EXECUTE FUNCTION update_menus_updated_at();

-- Seed default menus: header, footer, sidebar
INSERT INTO menus (name, location, items)
VALUES
(
    'Главное меню (Шапка)',
    'header',
    '[
        {"id": "h-1", "title": "О платформе", "type": "url", "url": "/about", "target": "_self", "children": []},
        {"id": "h-2", "title": "Площадкам", "type": "url", "url": "/platforms", "target": "_self", "children": []},
        {"id": "h-3", "title": "Гостям", "type": "url", "url": "/guests", "target": "_self", "children": []},
        {
            "id": "h-4", 
            "title": "Услуги", 
            "type": "url", 
            "url": "#services", 
            "target": "_self",
            "children": [
                {"id": "h-4-1", "title": "Корпоративы", "type": "url", "url": "/p/corporate", "target": "_self", "children": []},
                {"id": "h-4-2", "title": "Свадьбы & Банкеты", "type": "url", "url": "/p/weddings", "target": "_self", "children": []}
            ]
        }
    ]'::jsonb
),
(
    'Нижнее меню (Подвал)',
    'footer',
    '[
        {"id": "f-1", "title": "О проекте", "type": "url", "url": "/about", "target": "_self", "children": []},
        {"id": "f-2", "title": "Площадкам", "type": "url", "url": "/platforms", "target": "_self", "children": []},
        {"id": "f-3", "title": "Гостям", "type": "url", "url": "/guests", "target": "_self", "children": []},
        {"id": "f-4", "title": "Политика конфиденциальности", "type": "url", "url": "/p/privacy", "target": "_self", "children": []}
    ]'::jsonb
),
(
    'Боковое меню (Сайдбар)',
    'sidebar',
    '[
        {"id": "s-1", "title": "Главная", "type": "url", "url": "/", "target": "_self", "children": []},
        {"id": "s-2", "title": "Каталог залов", "type": "url", "url": "/platforms", "target": "_self", "children": []},
        {"id": "s-3", "title": "Спецпредложения", "type": "url", "url": "/p/offers", "target": "_self", "children": []}
    ]'::jsonb
)
ON CONFLICT (location) DO NOTHING;

-- 3. Redirects table (301/302)
CREATE TABLE IF NOT EXISTS redirects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_path TEXT NOT NULL UNIQUE,
    target_path TEXT NOT NULL,
    status_code INT NOT NULL DEFAULT 301,
    is_active BOOLEAN NOT NULL DEFAULT true,
    hits INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_redirects_source_path ON redirects(source_path);
CREATE INDEX IF NOT EXISTS idx_redirects_is_active ON redirects(is_active);

CREATE OR REPLACE FUNCTION update_redirects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_redirects_updated_at
BEFORE UPDATE ON redirects
FOR EACH ROW
EXECUTE FUNCTION update_redirects_updated_at();

-- Seed initial test redirects
INSERT INTO redirects (source_path, target_path, status_code, is_active, hits)
VALUES
    ('/about-us', '/about', 301, true, 42),
    ('/venues', '/platforms', 301, true, 18),
    ('/old-promo', '/p/promo', 302, true, 7)
ON CONFLICT (source_path) DO NOTHING;
