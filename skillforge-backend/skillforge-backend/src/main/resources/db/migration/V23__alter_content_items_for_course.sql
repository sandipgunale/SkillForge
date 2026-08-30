ALTER TABLE content_items
    ADD COLUMN section_id UUID REFERENCES course_sections (id) ON DELETE SET NULL,
    ADD COLUMN free_preview BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN materials JSONB;

CREATE INDEX idx_content_items_section ON content_items (section_id);
