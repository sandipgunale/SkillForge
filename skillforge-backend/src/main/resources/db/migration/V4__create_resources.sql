CREATE TABLE resources (
                           id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
                           topic_id         UUID         NOT NULL
                               REFERENCES topics(id) ON DELETE RESTRICT,
                           title            VARCHAR(300) NOT NULL,
                           url              VARCHAR(500) NOT NULL,
                           type             VARCHAR(20)  NOT NULL
                               CHECK (type IN ('VIDEO', 'ARTICLE', 'COURSE', 'DOCS', 'BOOK')),
                           difficulty       VARCHAR(20)  NOT NULL
                               CHECK (difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
                           youtube_video_id VARCHAR(20),
                           description      TEXT,
                           avg_rating       NUMERIC(3,2) NOT NULL DEFAULT 0.0
                               CHECK (avg_rating >= 0 AND avg_rating <= 5),
                           rating_count     INT          NOT NULL DEFAULT 0,
                           is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
                           created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
                           updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TRIGGER resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- FK index — JPA always needs this for JOIN performance
CREATE INDEX idx_resources_topic_id  ON resources(topic_id);
-- Filter queries: GET /resources?difficulty=BEGINNER&type=VIDEO
CREATE INDEX idx_resources_difficulty ON resources(difficulty);
CREATE INDEX idx_resources_type       ON resources(type);
CREATE INDEX idx_resources_is_active  ON resources(is_active);
-- Full-text search on title
CREATE INDEX idx_resources_title_fts
    ON resources USING GIN (to_tsvector('english', title));

-- -------------------------------------------------------
-- Many-to-many: resource ↔ tag
CREATE TABLE resource_tags (
                               resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
                               tag_id      UUID NOT NULL REFERENCES tags(id)      ON DELETE CASCADE,
                               PRIMARY KEY (resource_id, tag_id)
);

CREATE INDEX idx_resource_tags_tag_id ON resource_tags(tag_id);

COMMENT ON COLUMN resources.youtube_video_id IS
  'Extracted from YouTube URL — used for embed player';
COMMENT ON INDEX idx_resources_title_fts IS
  'GIN index for full-text search across resource titles';