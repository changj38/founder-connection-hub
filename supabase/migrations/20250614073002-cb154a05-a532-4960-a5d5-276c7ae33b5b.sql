
-- Create a link between fund models and actual funds for deployment tracking
ALTER TABLE funds ADD COLUMN fund_model_id uuid REFERENCES fund_models(id);

-- Add deployment tracking fields to funds
ALTER TABLE funds ADD COLUMN deployed_capital numeric DEFAULT 0;
ALTER TABLE funds ADD COLUMN deployment_date date;
ALTER TABLE funds ADD COLUMN status text DEFAULT 'active';

-- Add model comparison fields to investments table
ALTER TABLE investments ADD COLUMN model_expected_valuation numeric;
ALTER TABLE investments ADD COLUMN model_expected_check_size numeric;
ALTER TABLE investments ADD COLUMN variance_percentage numeric;

-- Create a table to track fund performance metrics over time
CREATE TABLE fund_performance_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id uuid REFERENCES funds(id) NOT NULL,
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  tvpi numeric NOT NULL DEFAULT 0,
  dpi numeric NOT NULL DEFAULT 0,
  irr_percentage numeric NOT NULL DEFAULT 0,
  deployed_capital numeric NOT NULL DEFAULT 0,
  unrealized_value numeric NOT NULL DEFAULT 0,
  realized_value numeric NOT NULL DEFAULT 0,
  remaining_capital numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new table
ALTER TABLE fund_performance_snapshots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for fund_performance_snapshots
CREATE POLICY "Users can view their fund performance snapshots" 
  ON fund_performance_snapshots 
  FOR SELECT 
  USING (fund_id IN (SELECT id FROM funds WHERE created_by = auth.uid()));

CREATE POLICY "Users can create their fund performance snapshots" 
  ON fund_performance_snapshots 
  FOR INSERT 
  WITH CHECK (fund_id IN (SELECT id FROM funds WHERE created_by = auth.uid()));

-- Add indexes for better performance
CREATE INDEX idx_fund_performance_snapshots_fund_id ON fund_performance_snapshots(fund_id);
CREATE INDEX idx_fund_performance_snapshots_date ON fund_performance_snapshots(snapshot_date);
CREATE INDEX idx_funds_model_id ON funds(fund_model_id);
