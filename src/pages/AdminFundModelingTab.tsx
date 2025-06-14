import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, DollarSign, PieChart, Target, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FundSetupForm from '../components/fund-modeling/FundSetupForm';
import InvestmentForm from '../components/fund-modeling/InvestmentForm';
import MetricsHeader from '../components/fund-modeling/MetricsHeader';
import ScenarioSimulation from '../components/fund-modeling/ScenarioSimulation';
import PortfolioVisualization from '../components/fund-modeling/PortfolioVisualization';
import FundsList from '../components/fund-modeling/FundsList';
import InvestmentsList from '../components/fund-modeling/InvestmentsList';
import FundCompositionDashboard from '../components/fund-modeling/FundCompositionDashboard';
import AllocationTargetsManager from '../components/fund-modeling/AllocationTargetsManager';

interface Fund {
  id: string;
  name: string;
  fund_size: number;
  check_size: number;
  reserve_ratio: number;
  planned_investments: number;
  created_at: string;
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

const AdminFundModelingTab = () => {
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [showFundForm, setShowFundForm] = useState(false);
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const [showScenarios, setShowScenarios] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'composition' | 'targets'>('overview');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch funds
  const { data: funds, isLoading: fundsLoading } = useQuery({
    queryKey: ['funds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('funds')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Fund[];
    }
  });

  // Fetch investments for selected fund
  const { data: investments, isLoading: investmentsLoading } = useQuery({
    queryKey: ['investments', selectedFund?.id],
    queryFn: async () => {
      if (!selectedFund) return [];
      
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('fund_id', selectedFund.id)
        .order('investment_date', { ascending: false });
      
      if (error) throw error;
      return data as Investment[];
    },
    enabled: !!selectedFund
  });

  // Auto-select first fund if none selected
  useEffect(() => {
    if (funds && funds.length > 0 && !selectedFund) {
      setSelectedFund(funds[0]);
    }
  }, [funds, selectedFund]);

  const handleFundCreated = () => {
    setShowFundForm(false);
    queryClient.invalidateQueries({ queryKey: ['funds'] });
    toast({
      title: "Fund created successfully",
      description: "New fund has been added to your portfolio."
    });
  };

  const handleInvestmentCreated = () => {
    setShowInvestmentForm(false);
    queryClient.invalidateQueries({ queryKey: ['investments'] });
    toast({
      title: "Investment added successfully",
      description: "New portfolio company has been added."
    });
  };

  if (fundsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fund Modeling Dashboard</h2>
          <p className="text-gray-600">Comprehensive fund composition and performance analysis</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowFundForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Fund
          </Button>
          {selectedFund && (
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowInvestmentForm(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Investment
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowScenarios(!showScenarios)}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Scenarios
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Fund Selector */}
      {funds && funds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Active Funds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FundsList 
              funds={funds} 
              selectedFund={selectedFund} 
              onSelectFund={setSelectedFund} 
            />
          </CardContent>
        </Card>
      )}

      {/* View Toggle */}
      {selectedFund && (
        <div className="flex gap-2">
          <Button
            variant={activeView === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveView('overview')}
            className="flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            Portfolio Overview
          </Button>
          <Button
            variant={activeView === 'composition' ? 'default' : 'outline'}
            onClick={() => setActiveView('composition')}
            className="flex items-center gap-2"
          >
            <PieChart className="h-4 w-4" />
            Fund Composition
          </Button>
          <Button
            variant={activeView === 'targets' ? 'default' : 'outline'}
            onClick={() => setActiveView('targets')}
            className="flex items-center gap-2"
          >
            <Target className="h-4 w-4" />
            Allocation Targets
          </Button>
        </div>
      )}

      {/* Metrics Header */}
      {selectedFund && investments && (
        <MetricsHeader fund={selectedFund} investments={investments} />
      )}

      {/* Dynamic Content Based on Active View */}
      {selectedFund && investments && (
        <>
          {activeView === 'overview' && (
            <>
              {/* Scenario Simulation */}
              {showScenarios && (
                <ScenarioSimulation fund={selectedFund} investments={investments} />
              )}

              {/* Portfolio Overview */}
              {investments.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PortfolioVisualization investments={investments} />
                  <Card>
                    <CardHeader>
                      <CardTitle>Portfolio Companies</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <InvestmentsList 
                        investments={investments} 
                        onInvestmentUpdated={() => queryClient.invalidateQueries({ queryKey: ['investments'] })}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}

          {activeView === 'composition' && (
            <FundCompositionDashboard fund={selectedFund} investments={investments} />
          )}

          {activeView === 'targets' && (
            <AllocationTargetsManager />
          )}
        </>
      )}

      {/* Empty State */}
      {(!funds || funds.length === 0) && (
        <Card className="text-center py-12">
          <CardContent>
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No funds created yet</h3>
            <p className="text-gray-500 mb-6">Create your first fund to start tracking investments and analyzing composition.</p>
            <Button onClick={() => setShowFundForm(true)} className="flex items-center gap-2 mx-auto">
              <Plus className="h-4 w-4" />
              Create First Fund
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {showFundForm && (
        <FundSetupForm 
          onClose={() => setShowFundForm(false)}
          onSuccess={handleFundCreated}
        />
      )}

      {showInvestmentForm && selectedFund && (
        <InvestmentForm 
          fund={selectedFund}
          onClose={() => setShowInvestmentForm(false)}
          onSuccess={handleInvestmentCreated}
        />
      )}
    </div>
  );
};

export default AdminFundModelingTab;
