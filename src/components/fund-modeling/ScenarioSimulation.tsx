
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, TrendingUp, RotateCcw } from 'lucide-react';

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

interface ScenarioSimulationProps {
  fund: Fund;
  investments: Investment[];
}

const ScenarioSimulation: React.FC<ScenarioSimulationProps> = ({ fund, investments }) => {
  const [scenarioData, setScenarioData] = useState<{[key: string]: any}>({});
  const [globalMultiplier, setGlobalMultiplier] = useState('1.0');
  const [exitPercentage, setExitPercentage] = useState('100');

  const resetScenario = () => {
    setScenarioData({});
    setGlobalMultiplier('1.0');
    setExitPercentage('100');
  };

  const scenarioMetrics = useMemo(() => {
    const multiplier = parseFloat(globalMultiplier) || 1;
    const exitPct = parseFloat(exitPercentage) / 100 || 1;

    const totalInvested = investments.reduce((sum, inv) => sum + inv.check_size, 0);
    
    let totalScenarioValue = 0;
    let totalRealized = 0;

    investments.forEach(inv => {
      const scenarioValue = scenarioData[inv.id] ? parseFloat(scenarioData[inv.id]) : null;
      
      let currentValue = inv.check_size; // Default to original investment
      if (scenarioValue !== null && !isNaN(scenarioValue)) {
        currentValue = scenarioValue * inv.ownership_percentage;
      } else if (inv.marked_up_valuation) {
        currentValue = inv.marked_up_valuation * inv.ownership_percentage * multiplier;
      } else {
        currentValue = inv.check_size * multiplier;
      }

      // Apply exit percentage
      const realizedValue = currentValue * exitPct;
      const unrealizedValue = currentValue * (1 - exitPct);

      totalRealized += realizedValue;
      totalScenarioValue += currentValue;
    });

    const tvpi = totalInvested > 0 ? totalScenarioValue / totalInvested : 0;
    const dpi = totalInvested > 0 ? totalRealized / totalInvested : 0;

    return {
      totalInvested,
      totalScenarioValue,
      totalRealized,
      tvpi,
      dpi,
      unrealizedValue: totalScenarioValue - totalRealized
    };
  }, [investments, scenarioData, globalMultiplier, exitPercentage]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatMultiple = (value: number) => {
    return `${value.toFixed(2)}x`;
  };

  const handleInvestmentScenarioChange = (investmentId: string, value: string) => {
    setScenarioData(prev => ({
      ...prev,
      [investmentId]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Scenario Analysis
          </CardTitle>
          <Button variant="outline" onClick={resetScenario} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="global" className="space-y-4">
          <TabsList>
            <TabsTrigger value="global">Global Scenarios</TabsTrigger>
            <TabsTrigger value="individual">Individual Companies</TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="globalMultiplier">Portfolio Value Multiplier</Label>
                <Input
                  id="globalMultiplier"
                  type="number"
                  step="0.1"
                  value={globalMultiplier}
                  onChange={(e) => setGlobalMultiplier(e.target.value)}
                  placeholder="1.0"
                />
                <p className="text-xs text-gray-500">Apply multiplier to all unrealized investments</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="exitPercentage">Exit Percentage</Label>
                <Input
                  id="exitPercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={exitPercentage}
                  onChange={(e) => setExitPercentage(e.target.value)}
                  placeholder="100"
                />
                <p className="text-xs text-gray-500">Percentage of portfolio to exit</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{formatMultiple(scenarioMetrics.tvpi)}</div>
                  <p className="text-xs text-muted-foreground">TVPI</p>
                  <Badge variant={scenarioMetrics.tvpi >= 1 ? "default" : "destructive"} className="mt-2">
                    {scenarioMetrics.tvpi >= 3 ? "Excellent" : scenarioMetrics.tvpi >= 1 ? "Positive" : "Negative"}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{formatMultiple(scenarioMetrics.dpi)}</div>
                  <p className="text-xs text-muted-foreground">DPI</p>
                  <div className="text-sm text-gray-600 mt-1">
                    {formatCurrency(scenarioMetrics.totalRealized)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{formatCurrency(scenarioMetrics.unrealizedValue)}</div>
                  <p className="text-xs text-muted-foreground">Unrealized Value</p>
                  <div className="text-sm text-gray-600 mt-1">
                    Remaining portfolio
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="individual" className="space-y-4">
            <div className="space-y-3">
              {investments.map((investment) => (
                <div key={investment.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{investment.company_name}</div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(investment.check_size)} invested • {(investment.ownership_percentage * 100).toFixed(2)}% ownership
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`scenario-${investment.id}`} className="text-sm">Exit Valuation:</Label>
                    <Input
                      id={`scenario-${investment.id}`}
                      type="number"
                      step="0.01"
                      value={scenarioData[investment.id] || ''}
                      onChange={(e) => handleInvestmentScenarioChange(investment.id, e.target.value)}
                      placeholder={investment.marked_up_valuation?.toString() || investment.entry_valuation.toString()}
                      className="w-32"
                    />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ScenarioSimulation;
