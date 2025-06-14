
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Save, TrendingUp, DollarSign, PieChart, BarChart3 } from 'lucide-react';
import FundModelInputs from '../components/fund-modeling/FundModelInputs';
import FundModelMetrics from '../components/fund-modeling/FundModelMetrics';
import FundModelCharts from '../components/fund-modeling/FundModelCharts';

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

  const handleSaveModel = () => {
    saveModelMutation.mutate(model);
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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pre-Fund Modeling Simulator</h1>
          <p className="text-gray-600">Test different fund construction strategies before deployment</p>
        </div>
        <div className="flex gap-2">
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
                <Button
                  key={savedModel.id}
                  variant="outline"
                  size="sm"
                  onClick={() => loadModel(savedModel)}
                >
                  {savedModel.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input Panel */}
      <FundModelInputs model={model} setModel={setModel} />

      {/* Calculated Metrics */}
      <FundModelMetrics model={model} />

      {/* Charts & Visualizations */}
      <FundModelCharts model={model} />
    </div>
  );
};

export default AdminFundSimulator;
