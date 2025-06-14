
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Save, TrendingUp, DollarSign, PieChart, BarChart3, ArrowRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FundModelInputs from '../components/fund-modeling/FundModelInputs';
import FundModelMetrics from '../components/fund-modeling/FundModelMetrics';
import FundModelCharts from '../components/fund-modeling/FundModelCharts';
import ValuationProgressionEditor, { ValuationStage } from '../components/fund-modeling/ValuationProgressionEditor';
import ScenarioSelector, { FundScenario } from '../components/fund-modeling/ScenarioSelector';

interface FundModel {
  id?: string;
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

const AdminFundSimulator = () => {
  const navigate = useNavigate();
  
  const [model, setModel] = useState<FundModel>({
    name: 'Fund Model 1',
    gp_commit_usd: 2000000,
    fund_size_usd: 100000000,
    avg_entry_valuation_usd: 10000000,
    avg_initial_check_usd: 1000000,
    reserve_ratio_pct: 50,
    recycling_rate_pct: 20,
    hold_period_years: 7,
    mgmt_fee_pct: 2.5,
    carry_pct: 20
  });

  // Default valuation progression stages (Base Case)
  const [valuationStages, setValuationStages] = useState<ValuationStage[]>([
    { stage: 'Entry (Seed/A)', valuationMultiple: 1.0, successRate: 1.0, timeToNext: 1.5, exitProbability: 0.05 },
    { stage: 'Series B', valuationMultiple: 3.2, successRate: 0.65, timeToNext: 2.0, exitProbability: 0.15 },
    { stage: 'Series C+', valuationMultiple: 8.5, successRate: 0.45, timeToNext: 2.5, exitProbability: 0.25 },
    { stage: 'Growth/Pre-IPO', valuationMultiple: 22, successRate: 0.30, timeToNext: 3.0, exitProbability: 0.60 },
    { stage: 'Exit', valuationMultiple: 45, successRate: 0.18, timeToNext: 0, exitProbability: 1.0 }
  ]);

  // Current scenario state
  const [currentScenario, setCurrentScenario] = useState<FundScenario>({
    name: 'Base Case',
    description: 'Market consensus, moderate growth, typical success rates',
    type: 'base',
    valuationStages: valuationStages
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch saved models
  const { data: savedModels, isLoading } = useQuery({
    queryKey: ['fund-models'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fund_models')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Save model mutation
  const saveModelMutation = useMutation({
    mutationFn: async (modelData: FundModel) => {
      const { data, error } = await supabase
        .from('fund_models')
        .insert([{
          ...modelData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fund-models'] });
      toast({
        title: "Model saved successfully",
        description: "Your fund model has been saved."
      });
    }
  });

  // Delete model mutation
  const deleteModelMutation = useMutation({
    mutationFn: async (modelId: string) => {
      const { error } = await supabase
        .from('fund_models')
        .delete()
        .eq('id', modelId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fund-models'] });
      toast({
        title: "Model deleted successfully",
        description: "The fund model has been deleted."
      });
    }
  });

  const handleSaveModel = () => {
    saveModelMutation.mutate(model);
  };

  const handleDeleteModel = (modelId: string) => {
    if (confirm('Are you sure you want to delete this fund model? This action cannot be undone.')) {
      deleteModelMutation.mutate(modelId);
    }
  };

  const loadModel = (savedModel: any) => {
    setModel({
      name: savedModel.name,
      gp_commit_usd: Number(savedModel.gp_commit_usd),
      fund_size_usd: Number(savedModel.fund_size_usd),
      avg_entry_valuation_usd: Number(savedModel.avg_entry_valuation_usd),
      avg_initial_check_usd: Number(savedModel.avg_initial_check_usd),
      reserve_ratio_pct: Number(savedModel.reserve_ratio_pct),
      recycling_rate_pct: Number(savedModel.recycling_rate_pct),
      hold_period_years: Number(savedModel.hold_period_years),
      mgmt_fee_pct: Number(savedModel.mgmt_fee_pct),
      carry_pct: Number(savedModel.carry_pct)
    });
  };

  const handleScenarioChange = (scenario: FundScenario) => {
    setCurrentScenario(scenario);
    setValuationStages(scenario.valuationStages);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pre-Fund Modeling Simulator</h1>
          <p className="text-gray-600">Test different fund construction strategies before deployment</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate('/portfolio-management')}
            className="flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            Go to Portfolio Management
          </Button>
          <Button onClick={handleSaveModel} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Model
          </Button>
        </div>
      </div>

      {/* Saved Models */}
      {savedModels && savedModels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {savedModels.map((savedModel) => (
                <div key={savedModel.id} className="flex items-center gap-2 p-2 border rounded-lg">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadModel(savedModel)}
                  >
                    {savedModel.name}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteModel(savedModel.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input Panel */}
      <FundModelInputs model={model} setModel={setModel} />

      {/* Scenario Selector */}
      <ScenarioSelector 
        currentScenario={currentScenario}
        onScenarioChange={handleScenarioChange}
        entryValuation={model.avg_entry_valuation_usd}
      />

      {/* Valuation Progression Editor */}
      <ValuationProgressionEditor 
        stages={valuationStages}
        onStagesChange={setValuationStages}
        entryValuation={model.avg_entry_valuation_usd}
      />

      {/* Calculated Metrics */}
      <FundModelMetrics model={model} valuationStages={valuationStages} />

      {/* Charts & Visualizations */}
      <FundModelCharts model={model} />
    </div>
  );
};

export default AdminFundSimulator;
