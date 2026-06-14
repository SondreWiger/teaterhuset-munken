-- Add year column to shows
ALTER TABLE shows ADD COLUMN year INTEGER;

-- Backfill from created_at
UPDATE shows SET year = EXTRACT(YEAR FROM created_at)::INTEGER;

-- Make it NOT NULL after backfill
ALTER TABLE shows ALTER COLUMN year SET NOT NULL;
ALTER TABLE shows ALTER COLUMN year SET DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER;

CREATE INDEX idx_shows_year ON shows(year);
