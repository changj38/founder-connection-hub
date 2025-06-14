
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, DollarSign, Target, Calendar } from 'lucide-react';

interface FundPerformanceOverviewProps {
  fund: any;
}

const FundPerformanceOverview: React.FC<FundPerformanceOverviewProps> = ({ fund }) => {
  // Fetch investments for this fund
  const { data: investments } = useQuery({
    queryKey: ['fund-investments', fund.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('fund_id', fund.id);
      
      if (error) throw error;
      return data;
    }
  });

  // Calculate key metrics
  const totalInvested = investments?.reduce((sum, inv) => sum + Number(inv.check_size), 0) || 0;
  const deploymentProgress = (totalInvested / fund.fund_size) * 100;
  const companiesInvested = investments?.length || 0;
  const avgCheckSize = investments?.length ? totalInvested / investments.length : 0;

  // Calculate current portfolio value (using marked up valuations where available)
  const currentPortfolioValue = investments?.reduce((sum, inv) => {
    const currentValue = inv.marked_up_valuation || inv.entry_valuation;
    return sum + Number(currentValue) * (Number(inv.check_size) / Number(inv.entry_valuation));
  }, 0) || 0;

  const unrealizedGain = currentPortfolioValue - totalInvested;
  const unrealizedMultiple = totalInvested > 0 ? currentPortfolioValue / totalInvested : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {fund.name} - Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">Fund Size</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(fund.fund_size)}</p>
              <p className="text-sm text-gray-500">
                Deployed: {formatCurrency(totalInvested)} ({deploymentProgress.toFixed(1)}%)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">Portfolio Companies</span>
              </div>
              <p className="text-2xl font-bold">{companiesInvested}</p>
              <p className="text-sm text-gray-500">
                Avg Check: {formatCurrency(avgCheckSize)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-gray-600">Current Value</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(currentPortfolioValue)}</p>
              <p className={`text-sm ${unrealizedGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {unrealizedGain >= 0 ? '+' : ''}{formatCurrency(unrealizedGain)} ({unrealizedMultiple.toFixed(2)}x)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-gray-600">Deployment Date</span>
              </div>
              <p className="text-lg font-bold">
                {fund.deployment_date ? formatDate(fund.deployment_date) : 'Not Set'}
              </p>
              <p className="text-sm text-gray-500">
                {fund.status ? fund.status.charAt(0).toUpperCase() + fund.status.slice(1) : 'Active'}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Capital Deployment Progress</span>
              <span>{deploymentProgress.toFixed(1)}%</span>
            </div>
            <Progress value={deploymentProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FundPerformanceOverview;
