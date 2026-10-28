-- ROADMAP.md section 9.3.2: About/Guests/Platforms are now Schema Builder singleton
-- content_schemas/content_entries (slugs: about, guests, platforms), migrated from these
-- tables by `cargo run --bin migrate_legacy_pages`. Drop the now-dead dedicated tables,
-- MFE registrations and the orphaned permission row that went with them.

DROP TABLE IF EXISTS about_news_items;
DROP TABLE IF EXISTS about_news;
DROP TABLE IF EXISTS about_who_we_are;
DROP TABLE IF EXISTS about_leadership_items;
DROP TABLE IF EXISTS about_leadership;
DROP TABLE IF EXISTS about_opportunity_items;
DROP TABLE IF EXISTS about_opportunities;
DROP TABLE IF EXISTS about;

DROP TABLE IF EXISTS guests_additional_services;
DROP TABLE IF EXISTS guests_search_promo;
DROP TABLE IF EXISTS guests_interaction_cards;
DROP TABLE IF EXISTS guests_opportunity_items;
DROP TABLE IF EXISTS guests_opportunities;
DROP TABLE IF EXISTS guests;

DROP TABLE IF EXISTS platforms_tools_items;
DROP TABLE IF EXISTS platforms_tools;
DROP TABLE IF EXISTS platforms_opportunity_items;
DROP TABLE IF EXISTS platforms_opportunities;
DROP TABLE IF EXISTS platforms;

DELETE FROM microfrontends WHERE name IN ('about', 'guests', 'platforms');

DELETE FROM roles_permissions WHERE permission_id = 'about:write';
DELETE FROM permissions WHERE id = 'about:write';
