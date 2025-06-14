
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Target } from 'lucide-react';

export interface ValuationStage {
  stage: string;
  valuationMultiple: number;
  successRate: number;
  timeToNext: number;
  exitProbability: number;
}

interface ValuationProgressionEditorProps {
  stages: ValuationStage[];
  onStagesChange: (stages: ValuationStage[]) => void;
  entryValuation: number;
}

const ValuationProgressionEditor: React.FC<ValuationProgressionEditorProps> = ({
  stages,
  onStagesChange,
  entryValuation
}) => {
  const updateStage = (index: number, field: keyof ValuationStage, value: string | number) => {
    const updatedStages = [...stages];
    updatedStages[index] = { ...updatedStages[index], [field]: value };
    onStagesChange(updatedStages);
  };

  const addStage = () => {
    const newStage: ValuationStage = {
      stage: `Stage ${stages.length + 1}`,
      valuationMultiple: stages.length > 0 ? stages[stages.length - 1].valuationMultiple * 1.5 : 1,
      successRate: 0.5,
      timeToNext: 2,
      exitProbability: 0.1
    };
    onStagesChange([...stages, newStage]);
  };

  const removeStage = (index: number) => {
    if (stages.length > 1) {
      const updatedStages = stages.filter((_, i) => i !== index);
      onStagesChange(updatedStages);
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
          Company Valuation Progression Benchmarks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Configure the valuation progression stages and success rates for your portfolio companies
          </p>
          <Button onClick={addStage} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Stage
          </Button>
        </div>

        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Stage {index + 1}</h4>
                {stages.length > 1 && (
                  <Button
                    onClick={() => removeStage(index)}
                    size="sm"
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`stage-name-${index}`}>Stage Name</Label>
                  <Input
                    id={`stage-name-${index}`}
                    value={stage.stage}
                    onChange={(e) => updateStage(index, 'stage', e.target.value)}
                    placeholder="e.g., Series A"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`valuation-multiple-${index}`}>Valuation Multiple</Label>
                  <Input
                    id={`valuation-multiple-${index}`}
                    type="number"
                    step="0.1"
                    value={stage.valuationMultiple}
                    onChange={(e) => updateStage(index, 'valuationMultiple', Number(e.target.value))}
                    placeholder="3.2"
                  />
                  <p className="text-xs text-gray-500">
                    {formatCurrency(entryValuation * stage.valuationMultiple)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`success-rate-${index}`}>Success Rate</Label>
                  <Input
                    id={`success-rate-${index}`}
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={stage.successRate}
                    onChange={(e) => updateStage(index, 'successRate', Number(e.target.value))}
                    placeholder="0.65"
                  />
                  <p className="text-xs text-gray-500">{(stage.successRate * 100).toFixed(1)}%</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`time-to-next-${index}`}>Time to Next (Years)</Label>
                  <Input
                    id={`time-to-next-${index}`}
                    type="number"
                    step="0.1"
                    value={stage.timeToNext}
                    onChange={(e) => updateStage(index, 'timeToNext', Number(e.target.value))}
                    placeholder="2.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`exit-probability-${index}`}>Exit Probability</Label>
                  <Input
                    id={`exit-probability-${index}`}
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={stage.exitProbability}
                    onChange={(e) => updateStage(index, 'exitProbability', Number(e.target.value))}
                    placeholder="0.15"
                  />
                  <p className="text-xs text-gray-500">{(stage.exitProbability * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ValuationProgressionEditor;
