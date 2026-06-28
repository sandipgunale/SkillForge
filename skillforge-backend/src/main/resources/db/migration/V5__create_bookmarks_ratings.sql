CREATE TABLE bookmarks (
                           id          UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
                           user_id     UUID      NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
                           resource_id UUID      NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
                           created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    -- A user can bookmark the same resource only once
                           UNIQUE (user_id, resource_id)
);

CREATE INDEX idx_bookmarks_user_id     ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_resource_id ON bookmarks(resource_id);

-- -------------------------------------------------------

CREATE TABLE ratings (
                         id          UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
                         user_id     UUID      NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
                         resource_id UUID      NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
                         value       SMALLINT  NOT NULL CHECK (value BETWEEN 1 AND 5),
                         created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    -- One rating per user per resource
                         UNIQUE (user_id, resource_id)
);

CREATE INDEX idx_ratings_resource_id ON ratings(resource_id);
CREATE INDEX idx_ratings_user_id     ON ratings(user_id);

COMMENT ON COLUMN ratings.value IS '1–5 star rating';