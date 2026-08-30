CREATE TABLE course_sections (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id  UUID         NOT NULL REFERENCES resources (id) ON DELETE CASCADE,
    title        VARCHAR(300) NOT NULL,
    description  TEXT,
    order_index  INT          NOT NULL DEFAULT 0,
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TRIGGER course_sections_updated_at
    BEFORE UPDATE ON course_sections
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_course_sections_resource ON course_sections (resource_id, order_index);
