-- Enable UUID generation natively in PostgreSQL
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Reusable timestamp trigger function — applied to every table
CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;