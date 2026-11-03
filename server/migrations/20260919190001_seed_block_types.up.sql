-- Up migration: Seed initial block types for Stage 1
INSERT INTO block_types (name, slug, description, icon, category, schema)
VALUES
(
    'Hero Секция',
    'hero',
    'Главный баннер страницы с заголовком, описанием и фоновым изображением',
    '🚀',
    'hero',
    '[
        {"name": "title", "label": "Заголовок", "fieldType": "Text", "required": true},
        {"name": "subtitle", "label": "Подзаголовок", "fieldType": "Text"},
        {"name": "image", "label": "Изображение", "fieldType": "Media"},
        {"name": "cta_text", "label": "Текст кнопки", "fieldType": "Text"},
        {"name": "cta_link", "label": "Ссылка кнопки", "fieldType": "Text"}
    ]'::jsonb
),
(
    'Две колонки возможностей',
    'two_column_features',
    'Сравнение двух направлений с буллетами и кнопками действия',
    '⚖️',
    'content',
    '[
        {"name": "left_title", "label": "Заголовок левой колонки", "fieldType": "Text"},
        {"name": "left_items", "label": "Пункты левой колонки (через перенос строки)", "fieldType": "RichText"},
        {"name": "left_cta_text", "label": "Текст левой кнопки", "fieldType": "Text"},
        {"name": "left_cta_link", "label": "Ссылка левой кнопки", "fieldType": "Text"},
        {"name": "right_title", "label": "Заголовок правой колонки", "fieldType": "Text"},
        {"name": "right_items", "label": "Пункты правой колонки (через перенос строки)", "fieldType": "RichText"},
        {"name": "right_cta_text", "label": "Текст правой кнопки", "fieldType": "Text"},
        {"name": "right_cta_link", "label": "Ссылка правой кнопки", "fieldType": "Text"}
    ]'::jsonb
),
(
    'Цитата-баннер',
    'quote_banner',
    'Акцентный блок с цитатой, миссией и ключевыми ценностями',
    '💬',
    'content',
    '[
        {"name": "quote", "label": "Текст цитаты / Заголовок", "fieldType": "Text", "required": true},
        {"name": "description", "label": "Описание", "fieldType": "RichText"},
        {"name": "val1_title", "label": "Ценность 1 (заголовок)", "fieldType": "Text"},
        {"name": "val1_desc", "label": "Ценность 1 (описание)", "fieldType": "Text"},
        {"name": "val2_title", "label": "Ценность 2 (заголовок)", "fieldType": "Text"},
        {"name": "val2_desc", "label": "Ценность 2 (описание)", "fieldType": "Text"}
    ]'::jsonb
),
(
    'Текст с изображением',
    'text_with_image',
    'Контентный блок с текстом и иллюстрацией (слева или справа)',
    '🖼️',
    'content',
    '[
        {"name": "title_prefix", "label": "Префикс заголовка (обычный)", "fieldType": "Text"},
        {"name": "title_accent", "label": "Акцентная часть заголовка (цветная)", "fieldType": "Text"},
        {"name": "text", "label": "Основной текст", "fieldType": "RichText"},
        {"name": "image", "label": "Изображение", "fieldType": "Media"},
        {"name": "image_position", "label": "Позиция изображения (left или right)", "fieldType": "Text"}
    ]'::jsonb
),
(
    'Сетка карточек',
    'card_grid',
    'Сетка новостей или преимуществ из нескольких карточек',
    '▦',
    'content',
    '[
        {"name": "title", "label": "Заголовок блока", "fieldType": "Text"},
        {"name": "subtitle", "label": "Подзаголовок", "fieldType": "Text"},
        {"name": "card1_title", "label": "Карточка 1: Заголовок", "fieldType": "Text"},
        {"name": "card1_desc", "label": "Карточка 1: Описание", "fieldType": "Text"},
        {"name": "card1_icon", "label": "Карточка 1: Иконка / Эмодзи", "fieldType": "Text"},
        {"name": "card2_title", "label": "Карточка 2: Заголовок", "fieldType": "Text"},
        {"name": "card2_desc", "label": "Карточка 2: Описание", "fieldType": "Text"},
        {"name": "card2_icon", "label": "Карточка 2: Иконка / Эмодзи", "fieldType": "Text"},
        {"name": "card3_title", "label": "Карточка 3: Заголовок", "fieldType": "Text"},
        {"name": "card3_desc", "label": "Карточка 3: Описание", "fieldType": "Text"},
        {"name": "card3_icon", "label": "Карточка 3: Иконка / Эмодзи", "fieldType": "Text"}
    ]'::jsonb
),
(
    'Инфо-баннер (CTA)',
    'info_banner',
    'Центрированный баннер с призывом к действию или информацией',
    '📢',
    'cta',
    '[
        {"name": "title", "label": "Заголовок баннера", "fieldType": "Text", "required": true},
        {"name": "description", "label": "Описание", "fieldType": "Text"},
        {"name": "button_text", "label": "Текст кнопки", "fieldType": "Text"},
        {"name": "button_link", "label": "Ссылка кнопки", "fieldType": "Text"}
    ]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;
