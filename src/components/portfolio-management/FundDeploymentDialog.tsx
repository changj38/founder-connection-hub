
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface FundDeploymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFundDeployed: (fundId: string) => void;
}

const FundDeploymentDialog: React.FC<FundDeploymentDialogProps> = ({
  open,
  onOpenChange,
  onFundDeployed
}) => {
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [fundName, setFundName] = useState('');
  const [deploymentDate, setDeploymentDate] = useState(new Date().toISOString().split('T')[0]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available fund models
  const { data: fundModels } = useQuery({
    queryKey: ['fund-models-for-deployment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fund_models')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const selectedModel = fundModels?.find(model => model.id === selectedModelId);

  const deployFundMutation = useMutation({
    mutationFn: async (deploymentData: any) => {
      const { data, error } = await supabase
        .from('funds')
        .insert([{
          ...deploymentData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['active-funds'] });
      toast({
        title: "Fund deployed successfully",
        description: "Your fund model has been deployed and is ready for investment tracking."
      });
      onFundDeployed(data.id);
      resetForm();
    }
  });

  const resetForm = () => {
    setSelectedModelId('');
    setFundName('');
    setDeploymentDate(new Date().toISOString().split('T')[0]);
  };

  const handleDeploy = () => {
    if (!selectedModel || !fundName) return;

    deployFundMutation.mutate({
      name: fundName,
      fund_model_id: selectedModelId,
      fund_size: selectedModel.fund_size_usd,
      check_size: selectedModel.avg_initial_check_usd,
      reserve_ratio: selectedModel.reserve_ratio_pct / 100,
      planned_investments: Math.floor(selectedModel.fund_size_usd / selectedModel.avg_initial_check_usd),
      deployment_date: deploymentDate,
      deployed_capital: 0,
      status: 'active'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Deploy Fund Model</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="model-select">Select Fund Model</Label>
            <Select value={selectedModelId} onValueChange={setSelectedModelId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a fund model to deploy" />
              </SelectTrigger>
              <SelectContent>
                {fundModels?.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name} - ${(model.fund_size_usd / 1000000).toFixed(0)}M
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedModel && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Model Overview</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Fund Size:</span>
                  <span className="ml-2 font-medium">${(selectedModel.fund_size_usd / 1000000).toFixed(0)}M</span>
                </div>
                <div>
                  <span className="text-gray-600">Avg Check:</span>
                  <span className="ml-2 font-medium">${(selectedModel.avg_initial_check_usd / 1000).toFixed(0)}K</span>
                </div>
                <div>
                  <span className="text-gray-600">Reserve Ratio:</span>
                  <span className="ml-2 font-medium">{selectedModel.reserve_ratio_pct}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Target Companies:</span>
                  <span className="ml-2 font-medium">
                    {Math.floor(selectedModel.fund_size_usd / selectedModel.avg_initial_check_usd)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fund-name">Fund Name</Label>
            <Input
              id="fund-name"
              value={fundName}
              onChange={(e) => setFundName(e.target.value)}
              placeholder="e.g., Acme Ventures Fund I"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deployment-date">Deployment Date</Label>
            <Input
              id="deployment-date"
              type="date"
              value={deploymentDate}
              onChange={(e) => setDeploymentDate(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeploy}
              disabled={!selectedModelId || !fundName || deployFundMutation.isPending}
            >
              {deployFundMutation.isPending ? 'Deploying...' : 'Deploy Fund'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FundDeploymentDialog;
