
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, PieChart, Target } from 'lucide-react';

interface FundModel {
  name: string;
  gp_commit_usd: number;
  fund_size_usd: number;
  avg_entry_valuation_usd: number;
  avg_initial_check_usd: number;
  reserve_ratio_pct: number;
  recycling_rate_pct: number;
  hold_period_years: number;
  mgmt_fee_pct: number;
  carry_pct: number;
}

interface FundModelMetricsProps {
  model: FundModel;
}

const FundModelMetrics: React.FC<FundModelMetricsProps> = ({ model }) => {
  // Capital Calculations
  const management_fees = model.fund_size_usd * (model.mgmt_fee_pct / 100) * model.hold_period_years;
  const recycled_capital = model.fund_size_usd * (model.recycling_rate_pct / 100);
  const investable_capital = model.fund_size_usd - management_fees + recycled_capital;
  const initial_allocation = investable_capital * (1 - model.reserve_ratio_pct / 100);
  const reserve_allocation = investable_capital * (model.reserve_ratio_pct / 100);

  // Portfolio Construction
  const number_of_initial_investments = Math.floor(initial_allocation / model.avg_initial_check_usd);
  const ownership_per_investment = model.avg_initial_check_usd / model.avg_entry_valuation_usd;

  // Exit Outcome Buckets (hardcoded probabilities)
  const outcome_distribution = {
    "0x": 0.5,
    "2x": 0.3,
    "7x": 0.15,
    "20x": 0.05,
  };

  // Simulated Exit Value
  const expected_multiple = (0 * 0.5 + 2 * 0.3 + 7 * 0.15 + 20 * 0.05);
  const total_exit_value = number_of_initial_investments * ownership_per_investment * expected_multiple * model.avg_entry_valuation_usd;

  // Return Metrics
  const TVPI = total_exit_value / investable_capital;
  const DPI = (total_exit_value * 0.6) / investable_capital; // 60% assumed realized
  const MOIC = total_exit_value / model.fund_size_usd;

  // IRR Estimation (simplified)
  const IRR = Math.pow(total_exit_value / investable_capital, 1 / model.hold_period_years) - 1;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatMultiple = (value: number) => {
    return `${value.toFixed(2)}x`;
  };

  return (
    <div className="space-y-6">
      {/* Capital Calculations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Capital Calculations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(management_fees)}</div>
              <div className="text-sm text-gray-600">Management Fees</div>
              <div className="text-xs text-gray-500">{model.mgmt_fee_pct}% × {model.hold_period_years} years</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(recycled_capital)}</div>
              <div className="text-sm text-gray-600">Recycled Capital</div>
              <div className="text-xs text-gray-500">{model.recycling_rate_pct}% of fund size</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(investable_capital)}</div>
              <div className="text-sm text-gray-600">Investable Capital</div>
              <div className="text-xs text-gray-500">Fund - Fees + Recycling</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(initial_allocation)}</div>
              <div className="text-sm text-gray-600">Initial Allocation</div>
              <div className="text-xs text-gray-500">{100 - model.reserve_ratio_pct}% of investable</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{formatCurrency(reserve_allocation)}</div>
              <div className="text-sm text-gray-600">Reserve Allocation</div>
              <div className="text-xs text-gray-500">{model.reserve_ratio_pct}% of investable</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Construction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Portfolio Construction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{number_of_initial_investments}</div>
              <div className="text-sm text-gray-600">Initial Investments</div>
              <div className="text-xs text-gray-500">Based on avg check size</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-green-600">{formatPercentage(ownership_per_investment)}</div>
              <div className="text-sm text-gray-600">Ownership per Investment</div>
              <div className="text-xs text-gray-500">Check ÷ Entry Valuation</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{formatMultiple(expected_multiple)}</div>
              <div className="text-sm text-gray-600">Expected Multiple</div>
              <div className="text-xs text-gray-500">Weighted by probabilities</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Return Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Return Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(total_exit_value)}</div>
              <div className="text-sm text-gray-600">Total Exit Value</div>
              <div className="text-xs text-gray-500">Simulated portfolio value</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{formatMultiple(TVPI)}</div>
              <div className="text-sm text-gray-600">TVPI</div>
              <div className="text-xs text-gray-500">Total Value / Paid In</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{formatMultiple(DPI)}</div>
              <div className="text-sm text-gray-600">DPI</div>
              <div className="text-xs text-gray-500">60% realization assumed</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{formatMultiple(MOIC)}</div>
              <div className="text-sm text-gray-600">MOIC</div>
              <div className="text-xs text-gray-500">Multiple on Invested Capital</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{formatPercentage(IRR)}</div>
              <div className="text-sm text-gray-600">Est. IRR</div>
              <div className="text-xs text-gray-500">Simplified calculation</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exit Outcome Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Exit Outcome Buckets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(outcome_distribution).map(([multiple, probability]) => {
              const count = Math.round(number_of_initial_investments * probability);
              return (
                <div key={multiple} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-gray-600">{multiple} outcomes</div>
                  <Badge variant="secondary">{formatPercentage(probability)}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FundModelMetrics;
