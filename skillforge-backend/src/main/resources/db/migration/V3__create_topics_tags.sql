CREATE TABLE topics (
                        id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
                        name          VARCHAR(100) NOT NULL UNIQUE,
                        slug          VARCHAR(100) NOT NULL UNIQUE,
                        description   TEXT,
                        icon          VARCHAR(50),
                        display_order INT          NOT NULL DEFAULT 0,
                        created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_topics_slug ON topics(slug);
CREATE INDEX idx_topics_display_order ON topics(display_order);

-- -------------------------------------------------------

CREATE TABLE tags (
                      id    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
                      name  VARCHAR(50) NOT NULL UNIQUE,
                      slug  VARCHAR(50) NOT NULL UNIQUE
);

CREATE INDEX idx_tags_slug ON tags(slug);

COMMENT ON TABLE topics IS 'Top-level subject categories (Java, React, DSA, etc.)';
COMMENT ON TABLE tags   IS 'Fine-grained labels applied to resources (Spring, Hooks, BFS)';