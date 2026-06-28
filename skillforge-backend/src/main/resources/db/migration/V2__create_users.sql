CREATE TABLE users (
                       id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
                       email         VARCHAR(255) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       full_name     VARCHAR(100) NOT NULL,
                       avatar_url    VARCHAR(500),
                       role          VARCHAR(20)  NOT NULL DEFAULT 'STUDENT'
                           CHECK (role IN ('STUDENT', 'INSTRUCTOR', 'ADMIN')),
                       skill_level   VARCHAR(20)
                           CHECK (skill_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
                       is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
                       created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
                       updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Trigger: auto-update updated_at on every UPDATE
CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Index: login lookup by email is the hottest query in the system
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Index: admin queries for active users only
CREATE INDEX idx_users_is_active ON users(is_active);

COMMENT ON TABLE users IS 'Platform users — students, instructors, and admins';
COMMENT ON COLUMN users.role IS 'STUDENT | INSTRUCTOR | ADMIN';
COMMENT ON COLUMN users.password_hash IS 'BCrypt hash, never store plaintext';