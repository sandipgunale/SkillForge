-- Add estimated_minutes column (Resource entity maps it; schema validation requires it)
-- IF NOT EXISTS: guards against dev databases where the column was added manually
ALTER TABLE resources
    ADD COLUMN IF NOT EXISTS estimated_minutes INT NOT NULL DEFAULT 0;

COMMENT ON COLUMN resources.estimated_minutes IS
    'Estimated time to consume the resource in minutes';
