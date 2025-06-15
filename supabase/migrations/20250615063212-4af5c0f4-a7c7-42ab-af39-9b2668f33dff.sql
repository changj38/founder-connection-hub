
-- Add valuation_type column to investments table
ALTER TABLE investments ADD COLUMN valuation_type text;

-- Set default values for existing records
UPDATE investments SET valuation_type = 'safe' WHERE valuation_type IS NULL;
