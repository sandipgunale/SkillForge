-- Bookmark folders
CREATE TABLE bookmark_folders (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       VARCHAR(100) NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, name)
);

CREATE INDEX idx_bookmark_folders_user_id ON bookmark_folders(user_id);

-- Bookmark folder association (nullable = "uncategorized")
ALTER TABLE bookmarks ADD COLUMN folder_id UUID REFERENCES bookmark_folders(id) ON DELETE SET NULL;
CREATE INDEX idx_bookmarks_folder_id ON bookmarks(folder_id);
