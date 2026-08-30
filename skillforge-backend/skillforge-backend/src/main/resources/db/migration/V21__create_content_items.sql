CREATE TABLE content_items (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id      UUID         NOT NULL REFERENCES resources (id) ON DELETE CASCADE,
    title            VARCHAR(300) NOT NULL,
    description      TEXT,
    type             VARCHAR(20)  NOT NULL
        CHECK (type IN ('VIDEO', 'ARTICLE', 'BOOK', 'PDF', 'DOCUMENT', 'LINK', 'GITHUB', 'EXERCISE')),
    url              VARCHAR(500),
    order_index      INT          NOT NULL DEFAULT 0,
    duration_minutes INT,
    is_required      BOOLEAN      NOT NULL DEFAULT TRUE,
    youtube_video_id VARCHAR(20),
    author           VARCHAR(200),
    isbn             VARCHAR(20),
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TRIGGER content_items_updated_at
    BEFORE UPDATE ON content_items
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_content_items_resource ON content_items (resource_id, order_index);
