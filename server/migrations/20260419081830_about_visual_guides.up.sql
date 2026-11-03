ALTER TABLE about
ADD COLUMN hero_guide_uuid UUID REFERENCES media(uuid),
ADD COLUMN opportunities_guide_uuid UUID REFERENCES media(uuid),
ADD COLUMN leadership_guide_uuid UUID REFERENCES media(uuid),
ADD COLUMN who_we_are_guide_uuid UUID REFERENCES media(uuid),
ADD COLUMN news_guide_uuid UUID REFERENCES media(uuid);
