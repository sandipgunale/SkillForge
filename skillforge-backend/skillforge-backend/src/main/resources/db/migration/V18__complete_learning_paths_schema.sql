-- V8 omitted status/completed_at/duration_weeks; entities always mapped
-- them, so the columns only existed on databases that once ran
-- ddl-auto=update. IF NOT EXISTS keeps this safe for drifted
-- environments that already have the columns.
ALTER TABLE learning_paths
    ADD COLUMN IF NOT EXISTS status VARCHAR(20)
        NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'COMPLETED', 'ARCHIVED'));

ALTER TABLE learning_paths
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

ALTER TABLE learning_paths
    ADD COLUMN IF NOT EXISTS duration_weeks INT
        NOT NULL DEFAULT 12
        CHECK (duration_weeks BETWEEN 1 AND 52);
