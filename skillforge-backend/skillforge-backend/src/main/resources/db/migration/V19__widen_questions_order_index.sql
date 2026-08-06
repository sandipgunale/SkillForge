-- V6 declared order_index SMALLINT but the entity maps it as int
-- (INTEGER); Hibernate schema validation rejects the type mismatch on
-- fresh installs. ALTER TYPE is a no-op on databases where ddl-auto=update
-- already widened the column.
ALTER TABLE questions ALTER COLUMN order_index TYPE INTEGER;
