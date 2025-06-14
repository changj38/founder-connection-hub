
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

// Valuation-based company progression model
interface CompanyStage {
  stage: string;
  avgValuation: number;
  successRate: number;
  timeToNext: number;
  exitProbability: number;
}

const FundModelMetrics: React.FC<FundModelMetricsProps> = ({ model }) => {
  // Capital Calculations
  const management_fees = model.fund_size_usd * (model.mgmt_fee_pct / 100) * model.hold_period_years;
  const recycled_capital = model.fund_size_usd * (model.recycling_rate_pct / 100);
  const investable_capital = model.fund_size_usd - management_fees + recycled_capital;
  const initial_allocation = investable_capital * (1 - model.reserve_ratio_pct / 100);
  const reserve_allocation = investable_capital * (model.reserve_ratio_pct / 100);
  const number_of_initial_investments = Math.floor(initial_allocation / model.avg_initial_check_usd);
  const ownership_per_investment = model.avg_initial_check_usd / model.avg_entry_valuation_usd;

  // Valuation-based progression stages
  const companyStages: CompanyStage[] = [
    { stage: 'Entry (Seed/A)', avgValuation: model.avg_entry_valuation_usd, successRate: 1.0, timeToNext: 1.5, exitProbability: 0.05 },
    { stage: 'Series B', avgValuation: model.avg_entry_valuation_usd * 3.2, successRate: 0.65, timeToNext: 2.0, exitProbability: 0.15 },
    { stage: 'Series C+', avgValuation: model.avg_entry_valuation_usd * 8.5, successRate: 0.45, timeToNext: 2.5, exitProbability: 0.25 },
    { stage: 'Growth/Pre-IPO', avgValuation: model.avg_entry_valuation_usd * 22, successRate: 0.30, timeToNext: 3.0, exitProbability: 0.60 },
    { stage: 'Exit', avgValuation: model.avg_entry_valuation_usd * 45, successRate: 0.18, timeToNext: 0, exitProbability: 1.0 }
  ];

  // Portfolio outcome modeling
  const portfolioOutcomes = {
    totalLoss: { count: Math.round(number_of_initial_investments * 0.45), avgReturn: 0 },
    partialLoss: { count: Math.round(number_of_initial_investments * 0.25), avgReturn: 0.3 },
    breakeven: { count: Math.round(number_of_initial_investments * 0.15), avgReturn: 1.2 },
    modest: { count: Math.round(number_of_initial_investments * 0.10), avgReturn: 3.5 },
    good: { count: Math.round(number_of_initial_investments * 0.04), avgReturn: 12 },
    great: { count: Math.round(number_of_initial_investments * 0.01), avgReturn: 45 }
  };

  // Calculate weighted average exit valuation
  const totalCompanies = Object.values(portfolioOutcomes).reduce((sum, outcome) => sum + outcome.count, 0);
  const weightedExitValue = Object.values(portfolioOutcomes).reduce((sum, outcome) => {
    return sum + (outcome.count * outcome.avgReturn * model.avg_initial_check_usd);
  }, 0);

  // Portfolio concentration analysis
  const topPerformers = portfolioOutcomes.great.count + portfolioOutcomes.good.count;
  const topPerformerValue = (portfolioOutcomes.great.count * portfolioOutcomes.great.avgReturn + 
                            portfolioOutcomes.good.count * portfolioOutcomes.good.avgReturn) * model.avg_initial_check_usd;
  const concentrationRatio = topPerformerValue / weightedExitValue;

  // Return Metrics
  const TVPI = weightedExitValue / investable_capital;
  const DPI = (weightedExitValue * 0.65) / investable_capital; // 65% realization rate
  const MOIC = weightedExitValue / model.fund_size_usd;
  const IRR = Math.pow(weightedExitValue / investable_capital, 1 / model.hold_period_years) - 1;

  // Follow-on modeling
  const followOnDeployment = reserve_allocation * 0.8; // 80% of reserves used
  const avgFollowOnPerCompany = followOnDeployment / (number_of_initial_investments * 0.6); // 60% get follow-ons

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
            Capital Deployment Analysis
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
              <div className="text-2xl font-bold text-green-600">{formatCurrency(initial_allocation)}</div>
              <div className="text-sm text-gray-600">Initial Checks</div>
              <div className="text-xs text-gray-500">{number_of_initial_investments} companies</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(avgFollowOnPerCompany)}</div>
              <div className="text-sm text-gray-600">Avg Follow-on</div>
              <div className="text-xs text-gray-500">Per qualifying company</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(reserve_allocation)}</div>
              <div className="text-sm text-gray-600">Reserve Pool</div>
              <div className="text-xs text-gray-500">{model.reserve_ratio_pct}% of investable</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{formatCurrency(recycled_capital)}</div>
              <div className="text-sm text-gray-600">Recycled Capital</div>
              <div className="text-xs text-gray-500">{model.recycling_rate_pct}% recycling rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Valuation Progression Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Company Valuation Progression
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {companyStages.map((stage, index) => (
              <div key={stage.stage} className="text-center p-4 border rounded-lg">
                <div className="text-lg font-bold text-blue-600">{formatCurrency(stage.avgValuation)}</div>
                <div className="text-sm text-gray-600">{stage.stage}</div>
                <div className="text-xs text-gray-500">{formatPercentage(stage.successRate)} advance</div>
                <div className="text-xs text-gray-500">{stage.timeToNext}y to next</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Outcome Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Portfolio Outcome Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(portfolioOutcomes).map(([outcome, data]) => (
              <div key={outcome} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{data.count}</div>
                <div className="text-sm text-gray-600 capitalize">{outcome.replace(/([A-Z])/g, ' $1')}</div>
                <Badge variant="secondary">{formatMultiple(data.avgReturn)}</Badge>
                <div className="text-xs text-gray-500 mt-1">
                  {formatCurrency(data.count * data.avgReturn * model.avg_initial_check_usd)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Return Metrics & Portfolio Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Fund Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(weightedExitValue)}</div>
              <div className="text-sm text-gray-600">Total Exit Value</div>
              <div className="text-xs text-gray-500">Portfolio aggregate</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{formatMultiple(TVPI)}</div>
              <div className="text-sm text-gray-600">TVPI</div>
              <div className="text-xs text-gray-500">Total Value / Paid In</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{formatMultiple(DPI)}</div>
              <div className="text-sm text-gray-600">DPI</div>
              <div className="text-xs text-gray-500">65% realization rate</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{formatPercentage(IRR)}</div>
              <div className="text-sm text-gray-600">Net IRR</div>
              <div className="text-xs text-gray-500">After fees & carry</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{topPerformers}</div>
              <div className="text-sm text-gray-600">Top Performers</div>
              <div className="text-xs text-gray-500">10x+ returns</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{formatPercentage(concentrationRatio)}</div>
              <div className="text-sm text-gray-600">Concentration</div>
              <div className="text-xs text-gray-500">Top 5% of portfolio</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Portfolio Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Construction Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{formatPercentage(ownership_per_investment)}</div>
              <div className="text-lg text-gray-600">Initial Ownership</div>
              <div className="text-sm text-gray-500">Pre-dilution per company</div>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <div className="text-3xl font-bold text-green-600">{Math.round(number_of_initial_investments * 0.6)}</div>
              <div className="text-lg text-gray-600">Follow-on Eligible</div>
              <div className="text-sm text-gray-500">Companies reaching Series B+</div>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{Math.round(model.hold_period_years * 1.2)}</div>
              <div className="text-lg text-gray-600">Avg Hold Period</div>
              <div className="text-sm text-gray-500">Years to exit</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FundModelMetrics;
