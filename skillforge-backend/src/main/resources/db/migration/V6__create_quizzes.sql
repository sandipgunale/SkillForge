CREATE TABLE quizzes (
                         id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
                         user_id         UUID         NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
                         topic_id        UUID         NOT NULL REFERENCES topics(id)  ON DELETE RESTRICT,
                         difficulty      VARCHAR(20)  NOT NULL
                             CHECK (difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
                         status          VARCHAR(20)  NOT NULL DEFAULT 'IN_PROGRESS'
                             CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'ABANDONED')),
                         total_questions INT          NOT NULL CHECK (total_questions BETWEEN 1 AND 20),
                         score           INT          NOT NULL DEFAULT 0,
                         max_score       INT          NOT NULL DEFAULT 0,
                         started_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
                         completed_at    TIMESTAMP
);

CREATE INDEX idx_quizzes_user_id   ON quizzes(user_id);
CREATE INDEX idx_quizzes_topic_id  ON quizzes(topic_id);
CREATE INDEX idx_quizzes_status    ON quizzes(status);
-- Analytics: quiz history ordered by date
CREATE INDEX idx_quizzes_started_at ON quizzes(started_at DESC);

-- -------------------------------------------------------

CREATE TABLE questions (
                           id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
                           quiz_id        UUID         NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
                           type           VARCHAR(30)  NOT NULL
                               CHECK (type IN ('MCQ', 'CODING', 'SCENARIO', 'INTERVIEW')),
                           content        TEXT         NOT NULL,
                           options_json   JSONB,
                           correct_answer TEXT         NOT NULL,
                           user_answer    TEXT,
                           ai_feedback    TEXT,
                           is_correct     BOOLEAN,
                           order_index    SMALLINT     NOT NULL DEFAULT 0
);

CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
-- JSONB index for querying inside options
CREATE INDEX idx_questions_options ON questions USING GIN (options_json);

COMMENT ON COLUMN questions.options_json IS
  'MCQ options stored as JSON array: ["Option A","Option B","Option C","Option D"]';
COMMENT ON COLUMN questions.ai_feedback IS
  'Per-question AI explanation returned after quiz submission';