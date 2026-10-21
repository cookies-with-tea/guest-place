-- Down migration: Remove seeded block types
DELETE FROM block_types WHERE slug IN (
    'hero',
    'two_column_features',
    'quote_banner',
    'text_with_image',
    'card_grid',
    'info_banner'
);
