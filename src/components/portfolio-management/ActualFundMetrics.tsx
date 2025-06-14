import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Calculator } from 'lucide-react';

interface ActualFundMetricsProps {
  fundId: string;
}

interface Investment {
  id: string;
  check_size: number;
  company_name: string;
  entry_valuation: number;
  marked_up_valuation: number | null;
  valuation_type: string | null;
  investment_date: string;
}

const ActualFundMetrics: React.FC<ActualFundMetricsProps> = ({ fundId }) => {
  // Fetch investments for this fund
  const { data: investments, isLoading } = useQuery({
    queryKey: ['fund-actual-metrics', fundId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investments')
        .select('id, check_size, company_name, entry_valuation, marked_up_valuation, valuation_type, investment_date')
        .eq('fund_id', fundId);
      
      if (error) throw error;
      return data as Investment[];
    }
  });

  // Calculate metrics
  const totalInvested = investments?.reduce((sum, inv) => sum + Number(inv.check_size), 0) || 0;
  
  // Current portfolio value (using marked up valuations where available)
  const currentPortfolioValue = investments?.reduce((sum, inv) => {
    const currentValue = inv.marked_up_valuation || inv.entry_valuation;
    return sum + Number(currentValue) * (Number(inv.check_size) / Number(inv.entry_valuation));
  }, 0) || 0;

  // TVPI (Total Value to Paid-In): Current Portfolio Value / Total Invested
  const tvpi = totalInvested > 0 ? currentPortfolioValue / totalInvested : 0;

  // MOIC (Priced Round): Only include priced investments that have actual markups
  const pricedInvestmentsWithMarkups = investments?.filter(inv => 
    inv.valuation_type === 'priced' && inv.marked_up_valuation
  ) || [];
  
  const pricedRoundValue = pricedInvestmentsWithMarkups.reduce((sum, inv) => {
    const investmentCurrentValue = Number(inv.marked_up_valuation!) * (Number(inv.check_size) / Number(inv.entry_valuation));
    return sum + investmentCurrentValue;
  }, 0);
  
  const pricedRoundInvestment = pricedInvestmentsWithMarkups.reduce((sum, inv) => {
    return sum + Number(inv.check_size);
  }, 0);

  const moicPricedRound = pricedRoundInvestment > 0 ? pricedRoundValue / pricedRoundInvestment : 0;

  // Total priced investments for context
  const totalPricedInvestments = investments?.filter(inv => inv.valuation_type === 'priced').length || 0;

  // MOIC (Priced + SAFE): Include both priced rounds and SAFE/entry valuations
  const totalCurrentValue = investments?.reduce((sum, inv) => {
    const currentValue = inv.marked_up_valuation || inv.entry_valuation;
    return sum + Number(currentValue) * (Number(inv.check_size) / Number(inv.entry_valuation));
  }, 0) || 0;

  const moicPricedPlusSafe = totalInvested > 0 ? totalCurrentValue / totalInvested : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatMultiple = (value: number) => {
    return `${value.toFixed(2)}x`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actual Fund Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div>Loading metrics...</div>
        </CardContent>
      </Card>
    );
  }

  if (!investments || investments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actual Fund Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-500">No investments to calculate metrics from.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Actual Fund Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TVPI */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600">TVPI</span>
            </div>
            <p className="text-2xl font-bold">{formatMultiple(tvpi)}</p>
            <div className="text-sm text-gray-500">
              <div>Portfolio Value: {formatCurrency(currentPortfolioValue)}</div>
              <div>Total Invested: {formatCurrency(totalInvested)}</div>
            </div>
          </div>

          {/* MOIC (Priced Round) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">MOIC (Priced Round)</span>
            </div>
            {pricedInvestmentsWithMarkups.length > 0 ? (
              <>
                <p className="text-2xl font-bold">{formatMultiple(moicPricedRound)}</p>
                <div className="text-sm text-gray-500">
                  <div>Marked-up Value: {formatCurrency(pricedRoundValue)}</div>
                  <div>Investment: {formatCurrency(pricedRoundInvestment)}</div>
                  <div>Marked-up: {pricedInvestmentsWithMarkups.length} of {totalPricedInvestments} priced</div>
                </div>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-400">N/A</p>
                <div className="text-sm text-gray-500">
                  <div>No priced investments</div>
                  <div>with markups yet</div>
                  <div>Total priced: {totalPricedInvestments}</div>
                </div>
              </>
            )}
          </div>

          {/* MOIC (Priced + SAFE) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-gray-600">MOIC (Priced + SAFE)</span>
            </div>
            <p className="text-2xl font-bold">{formatMultiple(moicPricedPlusSafe)}</p>
            <div className="text-sm text-gray-500">
              <div>Total Current Value: {formatCurrency(totalCurrentValue)}</div>
              <div>Total Invested: {formatCurrency(totalInvested)}</div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Companies:</span>
              <div className="font-medium">{investments?.length || 0}</div>
            </div>
            <div>
              <span className="text-gray-600">Priced Rounds:</span>
              <div className="font-medium">
                {investments?.filter(inv => inv.valuation_type === 'priced').length || 0}
              </div>
            </div>
            <div>
              <span className="text-gray-600">SAFE Rounds:</span>
              <div className="font-medium">
                {investments?.filter(inv => inv.valuation_type === 'safe' || !inv.valuation_type).length || 0}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Unrealized Gain:</span>
              <div className={`font-medium ${currentPortfolioValue - totalInvested >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(currentPortfolioValue - totalInvested)}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Avg Check:</span>
              <div className="font-medium">
                {investments?.length ? formatCurrency(totalInvested / investments.length) : '$0'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActualFundMetrics;
