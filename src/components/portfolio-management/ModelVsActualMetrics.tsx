
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ModelVsActualMetricsProps {
  fund: any;
}

const ModelVsActualMetrics: React.FC<ModelVsActualMetricsProps> = ({ fund }) => {
  // Fetch investments for variance analysis
  const { data: investments } = useQuery({
    queryKey: ['fund-investments-variance', fund.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('fund_id', fund.id);
      
      if (error) throw error;
      return data;
    }
  });

  const fundModel = fund.fund_models;

  if (!fundModel) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Model vs Actual Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No fund model linked to compare performance.</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate actual metrics
  const totalInvested = investments?.reduce((sum, inv) => sum + Number(inv.check_size), 0) || 0;
  const avgActualCheck = investments?.length ? totalInvested / investments.length : 0;
  const avgActualValuation = investments?.length 
    ? investments.reduce((sum, inv) => sum + Number(inv.entry_valuation), 0) / investments.length 
    : 0;

  // Calculate variances
  const checkSizeVariance = fundModel.avg_initial_check_usd > 0 
    ? ((avgActualCheck - fundModel.avg_initial_check_usd) / fundModel.avg_initial_check_usd) * 100 
    : 0;
  const valuationVariance = fundModel.avg_entry_valuation_usd > 0 
    ? ((avgActualValuation - fundModel.avg_entry_valuation_usd) / fundModel.avg_entry_valuation_usd) * 100 
    : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 5) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (variance < -5) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getVarianceBadge = (variance: number) => {
    if (variance > 5) return <Badge variant="default" className="bg-green-100 text-green-800">+{variance.toFixed(1)}%</Badge>;
    if (variance < -5) return <Badge variant="destructive">{variance.toFixed(1)}%</Badge>;
    return <Badge variant="secondary">{variance.toFixed(1)}%</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model vs Actual Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Check Size Comparison */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Average Check Size</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Modeled:</span>
                <span className="font-medium">{formatCurrency(fundModel.avg_initial_check_usd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Actual:</span>
                <span className="font-medium">{formatCurrency(avgActualCheck)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Variance:</span>
                <div className="flex items-center gap-2">
                  {getVarianceIcon(checkSizeVariance)}
                  {getVarianceBadge(checkSizeVariance)}
                </div>
              </div>
            </div>
          </div>

          {/* Valuation Comparison */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Average Entry Valuation</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Modeled:</span>
                <span className="font-medium">{formatCurrency(fundModel.avg_entry_valuation_usd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Actual:</span>
                <span className="font-medium">{formatCurrency(avgActualValuation)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Variance:</span>
                <div className="flex items-center gap-2">
                  {getVarianceIcon(valuationVariance)}
                  {getVarianceBadge(valuationVariance)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Investment Variances */}
        {investments && investments.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Individual Investment Analysis</h4>
            <div className="space-y-2">
              {investments.map((investment) => {
                const checkVariance = fundModel.avg_initial_check_usd > 0 
                  ? ((Number(investment.check_size) - fundModel.avg_initial_check_usd) / fundModel.avg_initial_check_usd) * 100 
                  : 0;
                const valVariance = fundModel.avg_entry_valuation_usd > 0 
                  ? ((Number(investment.entry_valuation) - fundModel.avg_entry_valuation_usd) / fundModel.avg_entry_valuation_usd) * 100 
                  : 0;

                return (
                  <div key={investment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{investment.company_name}</span>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(Number(investment.check_size))} @ {formatCurrency(Number(investment.entry_valuation))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Check</div>
                        {getVarianceBadge(checkVariance)}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Valuation</div>
                        {getVarianceBadge(valVariance)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModelVsActualMetrics;
