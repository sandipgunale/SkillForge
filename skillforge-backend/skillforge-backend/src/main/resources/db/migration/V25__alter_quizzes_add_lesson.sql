ALTER TABLE quizzes ADD COLUMN lesson_id UUID REFERENCES content_items (id) ON DELETE SET NULL;

CREATE INDEX idx_quizzes_lesson ON quizzes (lesson_id);
