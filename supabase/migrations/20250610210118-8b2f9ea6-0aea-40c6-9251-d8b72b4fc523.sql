
-- Add founder names and CEO LinkedIn URL fields to portfolio_companies table
ALTER TABLE portfolio_companies 
ADD COLUMN founder_names text,
ADD COLUMN ceo_linkedin_url text;
