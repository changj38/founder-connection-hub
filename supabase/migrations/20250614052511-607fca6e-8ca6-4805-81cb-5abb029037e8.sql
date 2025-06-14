
-- Create funds table
CREATE TABLE public.funds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  fund_size DECIMAL(15,2) NOT NULL,
  check_size DECIMAL(15,2) NOT NULL,
  reserve_ratio DECIMAL(5,4) NOT NULL, -- e.g., 0.25 for 25%
  planned_investments INTEGER NOT NULL
);

-- Create investments table
CREATE TABLE public.investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  fund_id UUID REFERENCES public.funds(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  entry_valuation DECIMAL(15,2) NOT NULL,
  check_size DECIMAL(15,2) NOT NULL,
  ownership_percentage DECIMAL(8,5) NOT NULL, -- e.g., 0.15000 for 15%
  investment_date DATE NOT NULL,
  marked_up_valuation DECIMAL(15,2),
  realized_return DECIMAL(15,2) DEFAULT 0
);

-- Add Row Level Security (RLS) for funds
ALTER TABLE public.funds ENABLE ROW LEVEL SECURITY;

-- Create policy that allows only admins to view funds
CREATE POLICY "Only admins can view funds" 
  ON public.funds 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policy that allows only admins to create funds
CREATE POLICY "Only admins can create funds" 
  ON public.funds 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policy that allows only admins to update funds
CREATE POLICY "Only admins can update funds" 
  ON public.funds 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policy that allows only admins to delete funds
CREATE POLICY "Only admins can delete funds" 
  ON public.funds 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add Row Level Security (RLS) for investments
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Create policy that allows only admins to view investments
CREATE POLICY "Only admins can view investments" 
  ON public.investments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policy that allows only admins to create investments
CREATE POLICY "Only admins can create investments" 
  ON public.investments 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policy that allows only admins to update investments
CREATE POLICY "Only admins can update investments" 
  ON public.investments 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policy that allows only admins to delete investments
CREATE POLICY "Only admins can delete investments" 
  ON public.investments 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create a function to calculate IRR (simplified version)
CREATE OR REPLACE FUNCTION public.calculate_simple_irr(
  investment_amount DECIMAL,
  current_value DECIMAL,
  days_held INTEGER
) RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
DECLARE
  years_held DECIMAL;
  irr_result DECIMAL;
BEGIN
  IF days_held <= 0 OR investment_amount <= 0 THEN
    RETURN 0;
  END IF;
  
  years_held := days_held / 365.0;
  
  -- Simple IRR calculation: ((Current Value / Investment)^(1/years)) - 1
  IF current_value > 0 THEN
    irr_result := POWER(current_value / investment_amount, 1.0 / years_held) - 1;
    RETURN ROUND(irr_result * 100, 2); -- Return as percentage
  ELSE
    RETURN -100; -- Total loss
  END IF;
END;
$$;
