
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, PieChart, Target } from 'lucide-react';
import { ValuationStage } from './ValuationProgressionEditor';

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
  valuationStages: ValuationStage[];
}

const FundModelMetrics: React.FC<FundModelMetricsProps> = ({ model, valuationStages }) => {
  // Capital Calculations
  const management_fees = model.fund_size_usd * (model.mgmt_fee_pct / 100) * model.hold_period_years;
  const recycled_capital = model.fund_size_usd * (model.recycling_rate_pct / 100);
  const investable_capital = model.fund_size_usd - management_fees + recycled_capital;
  const initial_allocation = investable_capital * (1 - model.reserve_ratio_pct / 100);
  const reserve_allocation = investable_capital * (model.reserve_ratio_pct / 100);
  const number_of_initial_investments = Math.floor(initial_allocation / model.avg_initial_check_usd);
  const ownership_per_investment = model.avg_initial_check_usd / model.avg_entry_valuation_usd;

  // Convert valuation stages to progression data using current entry valuation
  const companyStages = valuationStages.map(stage => ({
    stage: stage.stage,
    avgValuation: model.avg_entry_valuation_usd * stage.valuationMultiple,
    successRate: stage.successRate,
    timeToNext: stage.timeToNext,
    exitProbability: stage.exitProbability
  }));

  // Calculate dynamic portfolio outcomes based on valuation progression
  const calculatePortfolioOutcomes = () => {
    // Start with all companies at entry
    let remainingCompanies = number_of_initial_investments;
    const outcomes = [];
    
    // Calculate cumulative success through each stage
    let cumulativeSuccessRate = 1.0;
    
    for (let i = 0; i < valuationStages.length; i++) {
      const stage = valuationStages[i];
      const companiesAtThisStage = Math.round(remainingCompanies * stage.successRate);
      const companiesExitingAtThisStage = Math.round(companiesAtThisStage * stage.exitProbability);
      
      if (companiesExitingAtThisStage > 0) {
        outcomes.push({
          stage: stage.stage,
          count: companiesExitingAtThisStage,
          avgReturn: stage.valuationMultiple,
          avgValuation: model.avg_entry_valuation_usd * stage.valuationMultiple
        });
      }
      
      remainingCompanies = companiesAtThisStage - companiesExitingAtThisStage;
    }
    
    // Add companies that never made it past entry (total losses)
    const totalSuccessfulCompanies = outcomes.reduce((sum, outcome) => sum + outcome.count, 0);
    const totalLossCompanies = number_of_initial_investments - totalSuccessfulCompanies;
    
    if (totalLossCompanies > 0) {
      outcomes.unshift({
        stage: 'Total Loss',
        count: totalLossCompanies,
        avgReturn: 0,
        avgValuation: 0
      });
    }
    
    return outcomes;
  };

  const portfolioOutcomes = calculatePortfolioOutcomes();

  // Calculate weighted average exit valuation based on dynamic outcomes
  const totalCompanies = portfolioOutcomes.reduce((sum, outcome) => sum + outcome.count, 0);
  const weightedExitValue = portfolioOutcomes.reduce((sum, outcome) => {
    return sum + (outcome.count * outcome.avgReturn * model.avg_initial_check_usd);
  }, 0);

  // Portfolio concentration analysis - top 20% of outcomes
  const sortedOutcomes = [...portfolioOutcomes].sort((a, b) => b.avgReturn - a.avgReturn);
  const topOutcomes = sortedOutcomes.slice(0, Math.ceil(sortedOutcomes.length * 0.2));
  const topPerformerValue = topOutcomes.reduce((sum, outcome) => {
    return sum + (outcome.count * outcome.avgReturn * model.avg_initial_check_usd);
  }, 0);
  const concentrationRatio = weightedExitValue > 0 ? topPerformerValue / weightedExitValue : 0;

  // Return Metrics - Now fully reactive to valuation progression changes
  const TVPI = investable_capital > 0 ? weightedExitValue / investable_capital : 0;
  const DPI = investable_capital > 0 ? (weightedExitValue * 0.65) / investable_capital : 0; // 65% realization rate
  const MOIC = model.fund_size_usd > 0 ? weightedExitValue / model.fund_size_usd : 0;
  const IRR = investable_capital > 0 && model.hold_period_years > 0 ? 
    Math.pow(weightedExitValue / investable_capital, 1 / model.hold_period_years) - 1 : 0;

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
            Company Valuation Progression (Editable Benchmarks)
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

      {/* Dynamic Portfolio Outcome Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Portfolio Outcome Distribution (Based on Valuation Progression)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {portfolioOutcomes.map((outcome, index) => (
              <div key={`${outcome.stage}-${index}`} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{outcome.count}</div>
                <div className="text-sm text-gray-600">{outcome.stage}</div>
                <Badge variant="secondary">{formatMultiple(outcome.avgReturn)}</Badge>
                <div className="text-xs text-gray-500 mt-1">
                  {formatCurrency(outcome.count * outcome.avgReturn * model.avg_initial_check_usd)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Return Metrics & Portfolio Analysis - Now Fully Reactive */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Fund Performance Metrics (Fully Reactive to Valuation Progression)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(weightedExitValue)}</div>
              <div className="text-sm text-gray-600">Total Exit Value</div>
              <div className="text-xs text-gray-500">Based on progression</div>
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
              <div className="text-2xl font-bold text-red-600">{sortedOutcomes.slice(0, 2).reduce((sum, outcome) => sum + outcome.count, 0)}</div>
              <div className="text-sm text-gray-600">Top Performers</div>
              <div className="text-xs text-gray-500">Highest return stages</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{formatPercentage(concentrationRatio)}</div>
              <div className="text-sm text-gray-600">Concentration</div>
              <div className="text-xs text-gray-500">Top 20% outcomes</div>
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
