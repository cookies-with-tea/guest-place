-- Seed default About record
INSERT INTO about (id, title, description)
VALUES (1, 'About Guest Place', 'Platform main vision and mission')
ON CONFLICT (id) DO NOTHING;
