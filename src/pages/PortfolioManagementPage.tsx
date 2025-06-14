
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, TrendingUp, DollarSign, Target, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FundDeploymentDialog from '../components/portfolio-management/FundDeploymentDialog';
import FundPerformanceOverview from '../components/portfolio-management/FundPerformanceOverview';
import LiveInvestmentTracker from '../components/portfolio-management/LiveInvestmentTracker';
import ModelVsActualMetrics from '../components/portfolio-management/ModelVsActualMetrics';

const PortfolioManagementPage = () => {
  const [selectedFundId, setSelectedFundId] = useState<string | null>(null);
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch active funds with their linked models
  const { data: activeFunds, isLoading } = useQuery({
    queryKey: ['active-funds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('funds')
        .select(`
          *,
          fund_models (*)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Delete fund mutation
  const deleteFundMutation = useMutation({
    mutationFn: async (fundId: string) => {
      const { error } = await supabase
        .from('funds')
        .delete()
        .eq('id', fundId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-funds'] });
      setSelectedFundId(null);
      toast({
        title: "Fund deleted successfully",
        description: "The fund and all its data have been deleted."
      });
    }
  });

  const handleDeleteFund = (fundId: string) => {
    if (confirm('Are you sure you want to delete this fund? This will also delete all investments and performance data. This action cannot be undone.')) {
      deleteFundMutation.mutate(fundId);
    }
  };

  const selectedFund = activeFunds?.find(fund => fund.id === selectedFundId);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Management</h1>
          <p className="text-gray-600">Track real-time performance vs. your fund models</p>
        </div>
        <Button 
          onClick={() => setShowDeployDialog(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Deploy Fund Model
        </Button>
      </div>

      {/* Fund Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Active Funds
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading funds...</div>
          ) : activeFunds?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No active funds found. Deploy a fund model to get started.</p>
              <Button onClick={() => setShowDeployDialog(true)}>
                Deploy Your First Fund
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeFunds?.map((fund) => (
                <div
                  key={fund.id}
                  className={`p-4 border rounded-lg transition-all ${
                    selectedFundId === fund.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 
                      className="font-medium cursor-pointer"
                      onClick={() => setSelectedFundId(fund.id)}
                    >
                      {fund.name}
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteFund(fund.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div onClick={() => setSelectedFundId(fund.id)} className="cursor-pointer">
                    <p className="text-sm text-gray-600">
                      ${(fund.fund_size / 1000000).toFixed(0)}M Fund
                    </p>
                    <p className="text-sm text-gray-500">
                      Deployed: ${((fund.deployed_capital || 0) / 1000000).toFixed(1)}M
                    </p>
                    {fund.fund_models && (
                      <p className="text-xs text-blue-600 mt-1">
                        Based on: {fund.fund_models.name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Fund Dashboard */}
      {selectedFund && (
        <>
          <FundPerformanceOverview fund={selectedFund} />
          <ModelVsActualMetrics fund={selectedFund} />
          <LiveInvestmentTracker fundId={selectedFund.id} />
        </>
      )}

      <FundDeploymentDialog
        open={showDeployDialog}
        onOpenChange={setShowDeployDialog}
        onFundDeployed={(fundId) => {
          setSelectedFundId(fundId);
          setShowDeployDialog(false);
        }}
      />
    </div>
  );
};

export default PortfolioManagementPage;
