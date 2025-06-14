
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

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
  // Calculate values for charts
  const management_fees = model.fund_size_usd * (model.mgmt_fee_pct / 100) * model.hold_period_years;
  const recycled_capital = model.fund_size_usd * (model.recycling_rate_pct / 100);
  const investable_capital = model.fund_size_usd - management_fees + recycled_capital;
  const initial_allocation = investable_capital * (1 - model.reserve_ratio_pct / 100);
  const reserve_allocation = investable_capital * (model.reserve_ratio_pct / 100);
  const number_of_initial_investments = Math.floor(initial_allocation / model.avg_initial_check_usd);

  // Capital Allocation Data
  const capitalAllocationData = [
    { name: 'Management Fees', value: management_fees, color: '#ef4444' },
    { name: 'Initial Checks', value: initial_allocation, color: '#3b82f6' },
    { name: 'Reserves', value: reserve_allocation, color: '#10b981' },
    { name: 'Recycled Capital', value: recycled_capital, color: '#f59e0b' }
  ];

  // Return Distribution Data
  const outcome_distribution = {
    "0x": 0.5,
    "2x": 0.3,
    "7x": 0.15,
    "20x": 0.05,
  };

  const returnDistributionData = Object.entries(outcome_distribution).map(([multiple, probability]) => ({
    name: `${multiple} Returns`,
    count: Math.round(number_of_initial_investments * probability),
    probability: probability * 100
  }));

  // Ownership Summary Data
  const ownership_per_investment = model.avg_initial_check_usd / model.avg_entry_valuation_usd;
  const total_ownership_value = number_of_initial_investments * ownership_per_investment * model.avg_entry_valuation_usd;

  const ownershipData = [
    { name: 'Ownership %', value: ownership_per_investment * 100 },
    { name: 'Total Ownership Value', value: total_ownership_value / 1000000 } // In millions
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Capital Allocation Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Capital Allocation Breakdown
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
              {capitalAllocationData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Return Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Return Distribution Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={returnDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'count' ? `${value} investments` : `${value}%`,
                    name === 'count' ? 'Number of Companies' : 'Probability'
                  ]}
                />
                <Bar dataKey="count" fill="#3b82f6" name="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-4">
            {returnDistributionData.map((item, index) => (
              <div key={item.name} className="text-center p-3 border rounded-lg">
                <div className="text-lg font-bold">{item.count}</div>
                <div className="text-sm text-gray-600">{item.name}</div>
                <div className="text-xs text-gray-500">{item.probability}% probability</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{number_of_initial_investments}</div>
              <div className="text-lg text-gray-600">Total Investments</div>
              <div className="text-sm text-gray-500">Initial deployment</div>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <div className="text-3xl font-bold text-green-600">{(ownership_per_investment * 100).toFixed(2)}%</div>
              <div className="text-lg text-gray-600">Avg Ownership</div>
              <div className="text-sm text-gray-500">Per investment</div>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{formatCurrency(total_ownership_value)}</div>
              <div className="text-lg text-gray-600">Total Ownership Value</div>
              <div className="text-sm text-gray-500">At entry valuations</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FundModelCharts;
