CREATE TABLE lesson_completion (
    id                      UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    lesson_id               UUID      NOT NULL REFERENCES content_items (id) ON DELETE CASCADE,
    completed               BOOLEAN   NOT NULL DEFAULT FALSE,
    completed_at            TIMESTAMP,
    last_position_seconds   INT,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_lesson_completion_user_lesson UNIQUE (user_id, lesson_id)
);

CREATE TRIGGER lesson_completion_updated_at
    BEFORE UPDATE ON lesson_completion
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_lesson_completion_user ON lesson_completion (user_id);
CREATE INDEX idx_lesson_completion_lesson ON lesson_completion (lesson_id);
