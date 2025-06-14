
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';
import { ValuationStage } from './ValuationProgressionEditor';

export interface FundScenario {
  name: string;
  description: string;
  type: 'bear' | 'base' | 'bull';
  valuationStages: ValuationStage[];
}

interface ScenarioSelectorProps {
  currentScenario: FundScenario;
  onScenarioChange: (scenario: FundScenario) => void;
  entryValuation: number;
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  currentScenario,
  onScenarioChange,
  entryValuation
}) => {
  const scenarios: FundScenario[] = [
    {
      name: 'Bear Case',
      description: 'Economic downturn, lower valuations, higher failure rates',
      type: 'bear',
      valuationStages: [
        { stage: 'Entry (Seed/A)', valuationMultiple: 1.0, successRate: 1.0, timeToNext: 2.0, exitProbability: 0.10 },
        { stage: 'Series B', valuationMultiple: 2.1, successRate: 0.45, timeToNext: 2.5, exitProbability: 0.25 },
        { stage: 'Series C+', valuationMultiple: 4.8, successRate: 0.30, timeToNext: 3.0, exitProbability: 0.35 },
        { stage: 'Growth/Pre-IPO', valuationMultiple: 9.5, successRate: 0.20, timeToNext: 3.5, exitProbability: 0.70 },
        { stage: 'Exit', valuationMultiple: 15.0, successRate: 0.14, timeToNext: 0, exitProbability: 1.0 }
      ]
    },
    {
      name: 'Base Case',
      description: 'Market consensus, moderate growth, typical success rates',
      type: 'base',
      valuationStages: [
        { stage: 'Entry (Seed/A)', valuationMultiple: 1.0, successRate: 1.0, timeToNext: 1.5, exitProbability: 0.05 },
        { stage: 'Series B', valuationMultiple: 3.2, successRate: 0.65, timeToNext: 2.0, exitProbability: 0.15 },
        { stage: 'Series C+', valuationMultiple: 8.5, successRate: 0.45, timeToNext: 2.5, exitProbability: 0.25 },
        { stage: 'Growth/Pre-IPO', valuationMultiple: 22.0, successRate: 0.30, timeToNext: 3.0, exitProbability: 0.60 },
        { stage: 'Exit', valuationMultiple: 45.0, successRate: 0.18, timeToNext: 0, exitProbability: 1.0 }
      ]
    },
    {
      name: 'Bull Case',
      description: 'Strong market conditions, high valuations, accelerated timelines',
      type: 'bull',
      valuationStages: [
        { stage: 'Entry (Seed/A)', valuationMultiple: 1.0, successRate: 1.0, timeToNext: 1.0, exitProbability: 0.02 },
        { stage: 'Series B', valuationMultiple: 4.8, successRate: 0.80, timeToNext: 1.5, exitProbability: 0.08 },
        { stage: 'Series C+', valuationMultiple: 14.5, successRate: 0.65, timeToNext: 2.0, exitProbability: 0.15 },
        { stage: 'Growth/Pre-IPO', valuationMultiple: 38.0, successRate: 0.45, timeToNext: 2.5, exitProbability: 0.50 },
        { stage: 'Exit', valuationMultiple: 85.0, successRate: 0.28, timeToNext: 0, exitProbability: 1.0 }
      ]
    }
  ];

  const getScenarioIcon = (type: string) => {
    switch (type) {
      case 'bear': return <TrendingDown className="h-4 w-4" />;
      case 'bull': return <TrendingUp className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const getScenarioColor = (type: string) => {
    switch (type) {
      case 'bear': return 'destructive';
      case 'bull': return 'default';
      default: return 'secondary';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Fund Scenarios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map((scenario) => (
            <div
              key={scenario.name}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                currentScenario.name === scenario.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onScenarioChange(scenario)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium flex items-center gap-2">
                  {getScenarioIcon(scenario.type)}
                  {scenario.name}
                </h4>
                <Badge variant={getScenarioColor(scenario.type) as any}>
                  {scenario.type}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
              
              <div className="space-y-2">
                <div className="text-xs text-gray-500">Key Metrics:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="font-medium">Max Exit Multiple</div>
                    <div className="text-gray-600">
                      {scenario.valuationStages[scenario.valuationStages.length - 1].valuationMultiple}x
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Series B Success</div>
                    <div className="text-gray-600">
                      {(scenario.valuationStages[1].successRate * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Current Scenario Details */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            {getScenarioIcon(currentScenario.type)}
            Current Scenario: {currentScenario.name}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            {currentScenario.valuationStages.map((stage, index) => (
              <div key={stage.stage} className="text-center">
                <div className="font-medium text-gray-700">{stage.stage}</div>
                <div className="text-blue-600">{formatCurrency(entryValuation * stage.valuationMultiple)}</div>
                <div className="text-gray-500">{(stage.successRate * 100).toFixed(0)}% advance</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScenarioSelector;
