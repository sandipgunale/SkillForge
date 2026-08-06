-- Gamification: badges earned by users
CREATE TABLE user_badges (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code        VARCHAR(50)  NOT NULL,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    awarded_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, code)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);

-- In-app notifications (badge awards, weekly digest, ...)
CREATE TABLE notifications (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(30)  NOT NULL,
    title      VARCHAR(150) NOT NULL,
    message    TEXT,
    is_read    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, created_at DESC);
