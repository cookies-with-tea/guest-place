CREATE TABLE IF NOT EXISTS home_page (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL DEFAULT 'СОЦИАЛЬНАЯ ИНТЕРАКТИВНАЯ ПЛАТФОРМА',
    subtitle TEXT NOT NULL DEFAULT 'Соединяем гостей и места
Общение, бронирование здесь и сейчас',
    hero_map_button_text VARCHAR(100) NOT NULL DEFAULT 'Показать на карте',
    hero_list_button_text VARCHAR(100) NOT NULL DEFAULT 'Показать списком',
    hero_guide_uuid UUID REFERENCES media(uuid) ON DELETE SET NULL,
    
    categories_title VARCHAR(255) NOT NULL DEFAULT 'Места по категориям',
    
    latest_section_title VARCHAR(255) NOT NULL DEFAULT 'Последние добавленные',
    latest_section_button_text VARCHAR(100) NOT NULL DEFAULT 'Показать еще',
    latest_section_button_link VARCHAR(255) NOT NULL DEFAULT '/venues',
    
    popular_section_title VARCHAR(255) NOT NULL DEFAULT 'Самые популярные',
    popular_section_button_text VARCHAR(100) NOT NULL DEFAULT 'В каталог',
    popular_section_button_link VARCHAR(255) NOT NULL DEFAULT '/venues',
    
    interactions_title VARCHAR(255) NOT NULL DEFAULT 'Варианты взаимодействия с GP Platform',
    
    banner_title TEXT NOT NULL DEFAULT 'Для быстрого поиска Вы можете пользоваться всеми вариантами одновременно.',
    banner_text TEXT NOT NULL DEFAULT 'GP Платформа позволяет общаться напрямую здесь и сейчас. Мы за «прозрачные отношения»',
    banner_guide_uuid UUID REFERENCES media(uuid) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS home_categories (
    id SERIAL PRIMARY KEY,
    home_id INT NOT NULL REFERENCES home_page(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    link VARCHAR(255) NOT NULL,
    icon_uuid UUID REFERENCES media(uuid) ON DELETE SET NULL,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS home_interactions (
    id SERIAL PRIMARY KEY,
    home_id INT NOT NULL REFERENCES home_page(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    button_text VARCHAR(100) NOT NULL,
    link VARCHAR(255) NOT NULL,
    is_accent BOOLEAN NOT NULL DEFAULT false,
    sort_order INT NOT NULL DEFAULT 0
);

-- Seed default home page if not exists
INSERT INTO home_page (
    id, title, subtitle, hero_map_button_text, hero_list_button_text,
    categories_title, latest_section_title, latest_section_button_text, latest_section_button_link,
    popular_section_title, popular_section_button_text, popular_section_button_link,
    interactions_title, banner_title, banner_text
) VALUES (
    1,
    'СОЦИАЛЬНАЯ ИНТЕРАКТИВНАЯ ПЛАТФОРМА',
    'Соединяем гостей и места
Общение, бронирование здесь и сейчас',
    'Показать на карте',
    'Показать списком',
    'Места по категориям',
    'Последние добавленные',
    'Показать еще',
    '/venues',
    'Самые популярные',
    'В каталог',
    '/venues',
    'Варианты взаимодействия с GP Platform',
    'Для быстрого поиска Вы можете пользоваться всеми вариантами одновременно.',
    'GP Платформа позволяет общаться напрямую здесь и сейчас. Мы за «прозрачные отношения»'
) ON CONFLICT (id) DO NOTHING;

-- Seed default categories
INSERT INTO home_categories (home_id, title, slug, link, sort_order) VALUES
(1, 'Отдых', 'rest', '/venues?venue_types=Загородный клуб', 1),
(1, 'Бизнес', 'business', '/venues?venue_types=Бизнес-площадка', 2),
(1, 'Банкеты', 'banquets', '/venues?venue_types=Банкетный зал', 3),
(1, 'Здоровье', 'health', '/venues?features=Парковая зона', 4)
ON CONFLICT DO NOTHING;

-- Seed default interaction cards
INSERT INTO home_interactions (home_id, step_number, title, text, button_text, link, is_accent, sort_order) VALUES
(1, 1, 'Самостоятельный поиск и бронирование', 'С помощью удобного фильтра и карты подбираете места и сами связываетесь с ними через чат, запрос или звоните. Данную опцию можно использовать без на платформе (за исключением чата).', 'Каталог поиска', '/venues', false, 1),
(1, 2, 'Возможность разместить запрос', 'Запрос увидят площадки подходящие по параметрам, указанным вами при заполнении формы. Они сами свяжутся с вами в удобное время, отправят предложение в чат личного кабинета... подробнее', 'Разместить запрос', '/venues', true, 2),
(1, 3, 'Помощь эксперта GP', 'Эксперты платформы подскажут по всем вопросам, помогут быстрее и “без нервов” найти то, что нужно. Проконсультируют по ценам и условиям, в целом по городу, району и т.д... подробнее', 'Получить помощь', '/venues', false, 3),
(1, 4, 'Дополнительный сервис от GP', 'Быстрый и качественный подбор места, профессиональная консультация эксперта платформы, онлайн сопровождение до момента бронирования. Это современно и.... подробнее', 'Заказать услугу', '/venues', false, 4)
ON CONFLICT DO NOTHING;
