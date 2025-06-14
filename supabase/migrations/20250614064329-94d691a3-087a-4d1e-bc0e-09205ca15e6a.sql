
-- Create fund_models table to store pre-fund modeling scenarios
CREATE TABLE public.fund_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  
  -- Input parameters
  gp_commit_usd NUMERIC NOT NULL,
  fund_size_usd NUMERIC NOT NULL,
  avg_entry_valuation_usd NUMERIC NOT NULL,
  avg_initial_check_usd NUMERIC NOT NULL,
  reserve_ratio_pct NUMERIC NOT NULL,
  recycling_rate_pct NUMERIC NOT NULL,
  hold_period_years NUMERIC NOT NULL,
  mgmt_fee_pct NUMERIC NOT NULL,
  carry_pct NUMERIC NOT NULL
);

-- Add Row Level Security
ALTER TABLE public.fund_models ENABLE ROW LEVEL SECURITY;

-- Only admins can access fund models
CREATE POLICY "Only admins can access fund models" 
  ON public.fund_models 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
