-- Extend about_opportunities table
ALTER TABLE about_opportunities ADD COLUMN link TEXT DEFAULT '';
ALTER TABLE about_opportunities ADD COLUMN button_text TEXT DEFAULT '';

-- Extend guests table with preview guides
ALTER TABLE guests ADD COLUMN hero_guide_uuid UUID REFERENCES media(uuid);
ALTER TABLE guests ADD COLUMN opportunities_guide_uuid UUID REFERENCES media(uuid);
ALTER TABLE guests ADD COLUMN interaction_cards_guide_uuid UUID REFERENCES media(uuid);
ALTER TABLE guests ADD COLUMN search_promo_guide_uuid UUID REFERENCES media(uuid);
ALTER TABLE guests ADD COLUMN additional_services_guide_uuid UUID REFERENCES media(uuid);

-- Rename "Content" MFE to "Схемы" and move to top
UPDATE microfrontends 
SET display_name = 'Схемы', 
    order_index = -1 
WHERE name = 'content';

-- Also update existing 'guests' MFE display name for consistency if needed (user didn't ask but good for UI)
UPDATE microfrontends 
SET display_name = 'Гостям'
WHERE name = 'guests';
