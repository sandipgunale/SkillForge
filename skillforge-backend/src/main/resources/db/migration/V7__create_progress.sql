CREATE TABLE progress (
                          id                 UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
                          user_id            UUID      NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
                          topic_id           UUID      NOT NULL REFERENCES topics(id)  ON DELETE CASCADE,
                          completion_pct     SMALLINT  NOT NULL DEFAULT 0
                              CHECK (completion_pct BETWEEN 0 AND 100),
                          minutes_spent      INT       NOT NULL DEFAULT 0,
                          quizzes_taken      INT       NOT NULL DEFAULT 0,
                          avg_score          NUMERIC(5,2) NOT NULL DEFAULT 0.0,
                          last_activity_at   TIMESTAMP NOT NULL DEFAULT NOW(),
                          updated_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    -- One progress record per user per topic
                          UNIQUE (user_id, topic_id)
);

CREATE TRIGGER progress_updated_at
    BEFORE UPDATE ON progress
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_progress_user_id  ON progress(user_id);
CREATE INDEX idx_progress_topic_id ON progress(topic_id);
-- Analytics dashboard: sort by last activity
CREATE INDEX idx_progress_last_activity ON progress(last_activity_at DESC);

COMMENT ON TABLE progress IS
  'Aggregated per-user per-topic stats — updated after every quiz and resource view';