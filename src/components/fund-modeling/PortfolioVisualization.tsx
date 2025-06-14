
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface Investment {
  id: string;
  fund_id: string;
  company_name: string;
  entry_valuation: number;
  check_size: number;
  ownership_percentage: number;
  investment_date: string;
  marked_up_valuation: number | null;
  realized_return: number | null;
}

interface PortfolioVisualizationProps {
  investments: Investment[];
}

const PortfolioVisualization: React.FC<PortfolioVisualizationProps> = ({ investments }) => {
  // Prepare data for allocation chart
  const allocationData = investments.map(inv => ({
    name: inv.company_name,
    value: inv.check_size,
    percentage: 0 // Will be calculated below
  }));

  const totalInvested = allocationData.reduce((sum, item) => sum + item.value, 0);
  allocationData.forEach(item => {
    item.percentage = (item.value / totalInvested) * 100;
  });

  // Prepare data for unrealized vs realized chart
  const valueData = investments.map(inv => {
    const unrealizedValue = inv.marked_up_valuation 
      ? inv.marked_up_valuation * inv.ownership_percentage 
      : inv.check_size;
    const realizedValue = inv.realized_return || 0;
    
    return {
      name: inv.company_name,
      unrealized: unrealizedValue,
      realized: realizedValue,
      total: unrealizedValue + realizedValue
    };
  }).sort((a, b) => b.total - a.total);

  // Color palette
  const COLORS = [
    '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
    '#6366F1', '#EC4899', '#14B8A6', '#F97316', '#84CC16'
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Allocation Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Portfolio Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => percentage > 5 ? `${name} (${percentage.toFixed(1)}%)` : ''}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Unrealized vs Realized Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Unrealized vs Realized Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={valueData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="unrealized" stackId="a" fill="#3B82F6" name="Unrealized" />
                <Bar dataKey="realized" stackId="a" fill="#10B981" name="Realized" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioVisualization;
