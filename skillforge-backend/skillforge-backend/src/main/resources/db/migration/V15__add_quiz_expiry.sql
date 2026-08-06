-- Server-side quiz session deadline: IN_PROGRESS quizzes past this
-- deadline are abandoned by the engine instead of accepted on submit.
ALTER TABLE quizzes ADD COLUMN expires_at TIMESTAMP;
CREATE INDEX idx_quizzes_expires_at ON quizzes(expires_at);
