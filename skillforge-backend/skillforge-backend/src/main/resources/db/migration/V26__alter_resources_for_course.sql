ALTER TABLE resources
    ADD COLUMN course_level VARCHAR(30),
    ADD COLUMN course_outcomes JSONB,
    ADD COLUMN course_resources JSONB;
