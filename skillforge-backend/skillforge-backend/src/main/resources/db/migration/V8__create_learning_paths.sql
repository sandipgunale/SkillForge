CREATE TABLE learning_paths (
                                id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
                                user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                title       VARCHAR(200) NOT NULL,
                                goal        VARCHAR(300),
                                skill_level VARCHAR(20)
                                    CHECK (skill_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
                                weekly_hours INT         CHECK (weekly_hours BETWEEN 1 AND 40),
                                roadmap_json JSONB       NOT NULL,
                                created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
                                updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TRIGGER learning_paths_updated_at
    BEFORE UPDATE ON learning_paths
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_learning_paths_user_id    ON learning_paths(user_id);
CREATE INDEX idx_learning_paths_created_at ON learning_paths(created_at DESC);
-- JSONB index for querying roadmap content
CREATE INDEX idx_learning_paths_roadmap
    ON learning_paths USING GIN (roadmap_json);

COMMENT ON COLUMN learning_paths.roadmap_json IS
  'AI-generated structured roadmap. Schema: {weeks:[{week:1,topics:[],resources:[],goals:[]}]}';