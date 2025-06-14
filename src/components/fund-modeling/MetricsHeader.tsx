
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar } from 'lucide-react';

interface Fund {
  id: string;
  name: string;
  fund_size: number;
  check_size: number;
  reserve_ratio: number;
  planned_investments: number;
}

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

interface MetricsHeaderProps {
  fund: Fund;
  investments: Investment[];
}

const MetricsHeader: React.FC<MetricsHeaderProps> = ({ fund, investments }) => {
  const metrics = useMemo(() => {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.check_size, 0);
    const totalRealized = investments.reduce((sum, inv) => sum + (inv.realized_return || 0), 0);
    
    // Calculate fair value (marked-up valuations or original investment if no markup)
    const totalFairValue = investments.reduce((sum, inv) => {
      if (inv.marked_up_valuation) {
        // Use ownership percentage to calculate our share of the marked-up valuation
        return sum + (inv.marked_up_valuation * inv.ownership_percentage);
      }
      // If no marked-up valuation, use original investment
      return sum + inv.check_size;
    }, 0);

    // TVPI = (Fair Value + Realized) / Invested
    const tvpi = totalInvested > 0 ? (totalFairValue + totalRealized) / totalInvested : 0;
    
    // DPI = Realized / Invested
    const dpi = totalInvested > 0 ? totalRealized / totalInvested : 0;

    // Simple IRR calculation (average across all investments)
    const irrs = investments.map(inv => {
      const investmentDate = new Date(inv.investment_date);
      const today = new Date();
      const daysHeld = Math.floor((today.getTime() - investmentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let currentValue = inv.check_size; // Default to original investment
      if (inv.realized_return) {
        currentValue = inv.realized_return;
      } else if (inv.marked_up_valuation) {
        currentValue = inv.marked_up_valuation * inv.ownership_percentage;
      }

      if (daysHeld <= 0) return 0;
      
      const yearsHeld = daysHeld / 365;
      if (yearsHeld <= 0 || inv.check_size <= 0) return 0;
      
      // IRR = ((Current Value / Investment)^(1/years)) - 1
      return Math.pow(currentValue / inv.check_size, 1 / yearsHeld) - 1;
    }).filter(irr => !isNaN(irr) && isFinite(irr));

    const avgIRR = irrs.length > 0 ? irrs.reduce((sum, irr) => sum + irr, 0) / irrs.length : 0;

    return {
      totalInvested,
      totalRealized,
      totalFairValue,
      tvpi,
      dpi,
      irr: avgIRR * 100, // Convert to percentage
      deploymentRatio: fund.fund_size > 0 ? (totalInvested / fund.fund_size) * 100 : 0,
      investmentCount: investments.length,
      remainingCapital: fund.fund_size - totalInvested
    };
  }, [fund, investments]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number, decimals = 1) => {
    return `${value.toFixed(decimals)}%`;
  };

  const formatMultiple = (value: number) => {
    return `${value.toFixed(2)}x`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">TVPI (Total Value)</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatMultiple(metrics.tvpi)}</div>
          <p className="text-xs text-muted-foreground">
            Fair Value + Realized / Invested
          </p>
          <Badge variant={metrics.tvpi >= 1 ? "default" : "destructive"} className="mt-2">
            {metrics.tvpi >= 1 ? "Positive" : "Negative"} Returns
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">DPI (Distributions)</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatMultiple(metrics.dpi)}</div>
          <p className="text-xs text-muted-foreground">
            Realized Returns / Invested
          </p>
          <div className="text-sm text-gray-600 mt-1">
            {formatCurrency(metrics.totalRealized)} realized
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">IRR (Annualized)</CardTitle>
          {metrics.irr >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPercentage(metrics.irr)}</div>
          <p className="text-xs text-muted-foreground">
            Average portfolio IRR
          </p>
          <Badge variant={metrics.irr >= 20 ? "default" : metrics.irr >= 0 ? "secondary" : "destructive"} className="mt-2">
            {metrics.irr >= 20 ? "Excellent" : metrics.irr >= 0 ? "Positive" : "Negative"}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fund Deployment</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPercentage(metrics.deploymentRatio)}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.investmentCount} of {fund.planned_investments} investments
          </p>
          <div className="text-sm text-gray-600 mt-1">
            {formatCurrency(metrics.remainingCapital)} remaining
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsHeader;
