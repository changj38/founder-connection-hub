
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Target } from 'lucide-react';

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

interface FundModelChartsProps {
  model: FundModel;
}

const FundModelCharts: React.FC<FundModelChartsProps> = ({ model }) => {
  // Calculate portfolio values
  const management_fees = model.fund_size_usd * (model.mgmt_fee_pct / 100) * model.hold_period_years;
  const recycled_capital = model.fund_size_usd * (model.recycling_rate_pct / 100);
  const investable_capital = model.fund_size_usd - management_fees + recycled_capital;
  const initial_allocation = investable_capital * (1 - model.reserve_ratio_pct / 100);
  const reserve_allocation = investable_capital * (model.reserve_ratio_pct / 100);
  const number_of_initial_investments = Math.floor(initial_allocation / model.avg_initial_check_usd);

  // Valuation progression data
  const valuationProgressionData = [
    { stage: 'Entry (Seed/A)', valuation: model.avg_entry_valuation_usd, companies: number_of_initial_investments, successRate: 100 },
    { stage: 'Series B', valuation: model.avg_entry_valuation_usd * 3.2, companies: Math.round(number_of_initial_investments * 0.65), successRate: 65 },
    { stage: 'Series C+', valuation: model.avg_entry_valuation_usd * 8.5, companies: Math.round(number_of_initial_investments * 0.45), successRate: 45 },
    { stage: 'Growth', valuation: model.avg_entry_valuation_usd * 22, companies: Math.round(number_of_initial_investments * 0.30), successRate: 30 },
    { stage: 'Exit', valuation: model.avg_entry_valuation_usd * 45, companies: Math.round(number_of_initial_investments * 0.18), successRate: 18 }
  ];

  // Portfolio outcome distribution
  const portfolioOutcomes = [
    { name: 'Total Loss', value: Math.round(number_of_initial_investments * 0.45), percentage: 45, avgReturn: 0, color: '#ef4444' },
    { name: 'Partial Loss', value: Math.round(number_of_initial_investments * 0.25), percentage: 25, avgReturn: 0.3, color: '#f97316' },
    { name: 'Breakeven', value: Math.round(number_of_initial_investments * 0.15), percentage: 15, avgReturn: 1.2, color: '#eab308' },
    { name: 'Modest Returns', value: Math.round(number_of_initial_investments * 0.10), percentage: 10, avgReturn: 3.5, color: '#84cc16' },
    { name: 'Good Returns', value: Math.round(number_of_initial_investments * 0.04), percentage: 4, avgReturn: 12, color: '#10b981' },
    { name: 'Great Returns', value: Math.round(number_of_initial_investments * 0.01), percentage: 1, avgReturn: 45, color: '#3b82f6' }
  ];

  // J-Curve modeling (cash flows over time)
  const jCurveData = Array.from({ length: Math.ceil(model.hold_period_years) + 2 }, (_, year) => {
    let cashFlow = 0;
    let cumulativeValue = 0;
    
    if (year <= 2) {
      // Initial deployment years - negative cash flows
      cashFlow = -(investable_capital * (0.4 + year * 0.3));
      cumulativeValue = cashFlow;
    } else if (year <= 5) {
      // Early markups and some exits
      const exitValue = investable_capital * (0.2 + (year - 2) * 0.3);
      cashFlow = exitValue * 0.3; // 30% of value realized
      cumulativeValue = -investable_capital + exitValue;
    } else {
      // Major exits in later years
      const exitValue = investable_capital * (1.5 + (year - 5) * 0.8);
      cashFlow = exitValue * 0.5;
      cumulativeValue = exitValue - investable_capital;
    }
    
    return {
      year: `Year ${year}`,
      cashFlow: cashFlow / 1000000, // Convert to millions
      cumulativeValue: cumulativeValue / 1000000,
      multiple: cumulativeValue / (investable_capital / 1000000)
    };
  });

  // Capital allocation breakdown
  const capitalAllocationData = [
    { name: 'Initial Checks', value: initial_allocation, color: '#3b82f6' },
    { name: 'Follow-on Reserves', value: reserve_allocation, color: '#10b981' },
    { name: 'Management Fees', value: management_fees, color: '#ef4444' },
    { name: 'Recycled Capital', value: recycled_capital, color: '#f59e0b' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatMillions = (value: number) => {
    return `$${(value).toFixed(1)}M`;
  };

  return (
    <div className="space-y-6">
      {/* Valuation Progression Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Company Valuation Progression Through Funding Rounds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valuationProgressionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => formatMillions(value / 1000000)} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}`} />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'valuation') return [formatCurrency(value), 'Avg Valuation'];
                    if (name === 'companies') return [`${value} companies`, 'Surviving Companies'];
                    return [value, name];
                  }}
                />
                <Bar yAxisId="left" dataKey="valuation" fill="#3b82f6" name="valuation" />
                <Bar yAxisId="right" dataKey="companies" fill="#10b981" name="companies" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>This chart shows how companies progress through funding rounds, with typical valuation step-ups and survival rates at each stage.</p>
          </div>
        </CardContent>
      </Card>

      {/* J-Curve Cash Flow Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Fund J-Curve: Cash Flows Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={jCurveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis yAxisId="left" orientation="left" tickFormatter={formatMillions} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value.toFixed(1)}x`} />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'cashFlow') return [formatMillions(value), 'Annual Cash Flow'];
                    if (name === 'cumulativeValue') return [formatMillions(value), 'Cumulative Value'];
                    if (name === 'multiple') return [`${value.toFixed(2)}x`, 'TVPI Multiple'];
                    return [value, name];
                  }}
                />
                <Line yAxisId="left" type="monotone" dataKey="cashFlow" stroke="#3b82f6" strokeWidth={3} name="cashFlow" />
                <Line yAxisId="left" type="monotone" dataKey="cumulativeValue" stroke="#10b981" strokeWidth={3} name="cumulativeValue" />
                <Line yAxisId="right" type="monotone" dataKey="multiple" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="multiple" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>The J-curve shows initial negative returns during deployment, followed by positive returns as companies mature and exit.</p>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Outcome Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Portfolio Outcome Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioOutcomes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {portfolioOutcomes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} companies`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {portfolioOutcomes.map((outcome) => (
                <div key={outcome.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: outcome.color }}
                    />
                    <span className="font-medium">{outcome.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{outcome.value} companies</div>
                    <div className="text-sm text-gray-500">{outcome.avgReturn.toFixed(1)}x avg return</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capital Allocation Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Capital Allocation Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={capitalAllocationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {capitalAllocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {capitalAllocationData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">{formatCurrency(item.value)}</span>
                    <div className="text-sm text-gray-500">
                      {((item.value / model.fund_size_usd) * 100).toFixed(1)}% of fund
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Summary Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Key Portfolio Construction Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6 border rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{number_of_initial_investments}</div>
              <div className="text-lg text-gray-600">Initial Investments</div>
              <div className="text-sm text-gray-500">{formatCurrency(model.avg_initial_check_usd)} avg check</div>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <div className="text-3xl font-bold text-green-600">{Math.round(number_of_initial_investments * 0.35)}</div>
              <div className="text-lg text-gray-600">Expected Exits</div>
              <div className="text-sm text-gray-500">Over {model.hold_period_years} years</div>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{((model.avg_initial_check_usd / model.avg_entry_valuation_usd) * 100).toFixed(1)}%</div>
              <div className="text-lg text-gray-600">Initial Ownership</div>
              <div className="text-sm text-gray-500">Pre-dilution average</div>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <div className="text-3xl font-bold text-orange-600">{Math.round(number_of_initial_investments * 0.05)}</div>
              <div className="text-lg text-gray-600">Potential Unicorns</div>
              <div className="text-sm text-gray-500">$1B+ valuations</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FundModelCharts;
