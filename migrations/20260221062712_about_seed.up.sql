-- Add about seed data
INSERT INTO about (title, description) VALUES ('About Our Platform', 'We are a platform dedicated to connecting guests with amazing places to stay.');

-- Insert opportunities
INSERT INTO about_opportunities (about_id, icon_uuid, title) VALUES (1, '1569166d-cf47-4ca2-b5b4-6342ad3cb15c', 'Amazing Opportunities');
INSERT INTO about_opportunity_items (opportunity_id, item_text) VALUES (1, 'Connect with hosts worldwide');
INSERT INTO about_opportunity_items (opportunity_id, item_text) VALUES (1, 'Find unique places to stay');
INSERT INTO about_opportunity_items (opportunity_id, item_text) VALUES (1, 'Experience local culture');

-- Insert leadership
INSERT INTO about_leadership (about_id, logo_uuid, title, description) VALUES (1, 'd57d431a-efee-453f-829f-c03f7c1f09b8', 'Our Leadership', 'Meet the team behind our platform');
INSERT INTO about_leadership_items (leadership_id, icon_uuid, text) VALUES (1, '1569166d-cf47-4ca2-b5b4-6342ad3cb15c', 'John Doe - CEO');
INSERT INTO about_leadership_items (leadership_id, icon_uuid, text) VALUES (1, '1569166d-cf47-4ca2-b5b4-6342ad3cb15c', 'Jane Smith - CTO');

-- Insert who we are
INSERT INTO about_who_we_are (about_id, title, description, image_uuid) VALUES (1, 'Our Mission', 'To create meaningful connections between travelers and hosts.', '1569166d-cf47-4ca2-b5b4-6342ad3cb15c');
INSERT INTO about_who_we_are (about_id, title, description, image_uuid) VALUES (1, 'Our Vision', 'To be the world''s most trusted platform for unique accommodations.', '1569166d-cf47-4ca2-b5b4-6342ad3cb15c');

-- Insert news
INSERT INTO about_news (about_id, title) VALUES (1, 'Latest News');
INSERT INTO about_news_items (news_id, icon_uuid, text) VALUES (1, '1569166d-cf47-4ca2-b5b4-6342ad3cb15c', 'We''ve reached 1 million bookings!');
INSERT INTO about_news_items (news_id, icon_uuid, text) VALUES (1, '1569166d-cf47-4ca2-b5b4-6342ad3cb15c', 'New features coming soon!');
