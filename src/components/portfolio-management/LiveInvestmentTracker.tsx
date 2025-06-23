import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, TrendingUp } from 'lucide-react';
import { fetchPortfolioCompanies } from '../../utils/adminApi';

interface LiveInvestmentTrackerProps {
  fundId: string;
}

interface InvestmentForm {
  company_name: string;
  check_size: string;
  entry_valuation: string;
  investment_date: string;
  marked_up_valuation: string;
  valuation_type: string;
  share_price: string;
  share_count: string;
}

interface Investment {
  id: string;
  company_name: string;
  check_size: number;
  entry_valuation: number;
  investment_date: string;
  marked_up_valuation: number | null;
  valuation_type: string | null;
}

const LiveInvestmentTracker: React.FC<LiveInvestmentTrackerProps> = ({ fundId }) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [formData, setFormData] = useState<InvestmentForm>({
    company_name: '',
    check_size: '',
    entry_valuation: '',
    investment_date: new Date().toISOString().split('T')[0],
    marked_up_valuation: '',
    valuation_type: 'safe',
    share_price: '',
    share_count: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch portfolio companies for the dropdown
  const { data: portfolioCompanies = [] } = useQuery({
    queryKey: ['portfolioCompanies'],
    queryFn: fetchPortfolioCompanies
  });

  // Fetch investments for this fund
  const { data: investments, isLoading } = useQuery({
    queryKey: ['fund-investments-tracker', fundId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investments')
        .select('id, company_name, check_size, entry_valuation, investment_date, marked_up_valuation, valuation_type')
        .eq('fund_id', fundId)
        .order('investment_date', { ascending: false });
      
      if (error) throw error;
      return data as Investment[];
    }
  });

  // Add investment mutation
  const addInvestmentMutation = useMutation({
    mutationFn: async (investmentData: any) => {
      const { data, error } = await supabase
        .from('investments')
        .insert([investmentData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fund-investments-tracker', fundId] });
      queryClient.invalidateQueries({ queryKey: ['fund-investments', fundId] });
      queryClient.invalidateQueries({ queryKey: ['fund-investments-variance', fundId] });
      queryClient.invalidateQueries({ queryKey: ['fund-actual-metrics', fundId] });
      toast({
        title: "Investment added successfully",
        description: "The investment has been tracked in your portfolio."
      });
      resetForm();
      setShowAddDialog(false);
    }
  });

  // Update investment mutation
  const updateInvestmentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const { data, error } = await supabase
        .from('investments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fund-investments-tracker', fundId] });
      queryClient.invalidateQueries({ queryKey: ['fund-investments', fundId] });
      queryClient.invalidateQueries({ queryKey: ['fund-investments-variance', fundId] });
      queryClient.invalidateQueries({ queryKey: ['fund-actual-metrics', fundId] });
      toast({
        title: "Investment updated successfully",
        description: "The investment details have been updated."
      });
      setEditingInvestment(null);
      resetForm();
    }
  });

  const resetForm = () => {
    setFormData({
      company_name: '',
      check_size: '',
      entry_valuation: '',
      investment_date: new Date().toISOString().split('T')[0],
      marked_up_valuation: '',
      valuation_type: 'safe',
      share_price: '',
      share_count: ''
    });
  };

  const handleSubmit = () => {
    // Calculate ownership percentage automatically
    const checkSize = Number(formData.check_size);
    const entryValuation = Number(formData.entry_valuation);
    const ownershipPercentage = entryValuation > 0 ? (checkSize / entryValuation) * 100 : 0;

    // For priced rounds, use share price × share count as marked up valuation
    let markedUpValuation = null;
    if (formData.valuation_type === 'priced' && formData.share_price && formData.share_count) {
      markedUpValuation = Number(formData.share_price) * Number(formData.share_count);
    } else if (formData.marked_up_valuation) {
      markedUpValuation = Number(formData.marked_up_valuation);
    }

    const investmentData = {
      fund_id: fundId,
      company_name: formData.company_name,
      check_size: checkSize,
      entry_valuation: entryValuation,
      ownership_percentage: ownershipPercentage,
      investment_date: formData.investment_date,
      marked_up_valuation: markedUpValuation,
      valuation_type: formData.valuation_type
    };

    if (editingInvestment) {
      updateInvestmentMutation.mutate({ id: editingInvestment.id, updates: investmentData });
    } else {
      addInvestmentMutation.mutate(investmentData);
    }
  };

  const startEdit = (investment: Investment) => {
    setEditingInvestment(investment);
    setFormData({
      company_name: investment.company_name,
      check_size: investment.check_size.toString(),
      entry_valuation: investment.entry_valuation.toString(),
      investment_date: investment.investment_date,
      marked_up_valuation: investment.marked_up_valuation?.toString() || '',
      valuation_type: investment.valuation_type || 'safe',
      share_price: '',
      share_count: ''
    });
    setShowAddDialog(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Portfolio Investments
          </span>
          <Dialog open={showAddDialog} onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) {
              setEditingInvestment(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Investment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingInvestment ? 'Edit Investment' : 'Add New Investment'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="company-select">Company Name</Label>
                  <Select
                    value={formData.company_name}
                    onValueChange={(value) => setFormData({ ...formData, company_name: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a portfolio company" />
                    </SelectTrigger>
                    <SelectContent>
                      {portfolioCompanies.map((company) => (
                        <SelectItem key={company.id} value={company.name}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="investment-date">Investment Date</Label>
                  <Input
                    id="investment-date"
                    type="date"
                    value={formData.investment_date}
                    onChange={(e) => setFormData({ ...formData, investment_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="check-size">Check Size ($)</Label>
                  <Input
                    id="check-size"
                    type="number"
                    value={formData.check_size}
                    onChange={(e) => setFormData({ ...formData, check_size: e.target.value })}
                    placeholder="1000000"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="entry-valuation">Entry Valuation ($)</Label>
                  <Input
                    id="entry-valuation"
                    type="number"
                    value={formData.entry_valuation}
                    onChange={(e) => setFormData({ ...formData, entry_valuation: e.target.value })}
                    placeholder="10000000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valuation-type">Valuation Type</Label>
                  <Select
                    value={formData.valuation_type}
                    onValueChange={(value) => setFormData({ ...formData, valuation_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select valuation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="safe">SAFE</SelectItem>
                      <SelectItem value="priced">Priced Round</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.valuation_type === 'safe' && (
                  <div className="space-y-2">
                    <Label htmlFor="marked-up-valuation">Current Valuation ($)</Label>
                    <Input
                      id="marked-up-valuation"
                      type="number"
                      value={formData.marked_up_valuation}
                      onChange={(e) => setFormData({ ...formData, marked_up_valuation: e.target.value })}
                      placeholder="15000000"
                    />
                  </div>
                )}

                {formData.valuation_type === 'priced' && (
                  <>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Priced Round Details - Share Value Calculation
                      </Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="share-price">Share Price ($)</Label>
                      <Input
                        id="share-price"
                        type="number"
                        step="0.01"
                        value={formData.share_price}
                        onChange={(e) => setFormData({ ...formData, share_price: e.target.value })}
                        placeholder="10.50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="share-count">Number of Shares</Label>
                      <Input
                        id="share-count"
                        type="number"
                        value={formData.share_count}
                        onChange={(e) => setFormData({ ...formData, share_count: e.target.value })}
                        placeholder="95238"
                      />
                    </div>

                    {formData.share_price && formData.share_count && (
                      <div className="md:col-span-2 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          Current Share Value: ${(Number(formData.share_price) * Number(formData.share_count)).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={addInvestmentMutation.isPending || updateInvestmentMutation.isPending}
                >
                  {addInvestmentMutation.isPending || updateInvestmentMutation.isPending 
                    ? 'Saving...' 
                    : editingInvestment ? 'Update' : 'Add Investment'
                  }
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Loading investments...</div>
        ) : investments?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No investments tracked yet.</p>
            <Button onClick={() => setShowAddDialog(true)}>
              Add Your First Investment
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {investments?.map((investment) => {
              const currentValue = investment.marked_up_valuation || investment.entry_valuation;
              
              // For priced rounds, marked_up_valuation IS the current share value
              // For SAFE rounds, we need to calculate based on ownership percentage
              let investmentValue;
              if (investment.valuation_type === 'priced' && investment.marked_up_valuation) {
                // For priced rounds: marked_up_valuation is the direct share value
                investmentValue = Number(investment.marked_up_valuation);
              } else {
                // For SAFE rounds: calculate based on ownership percentage
                investmentValue = Number(currentValue) * (Number(investment.check_size) / Number(investment.entry_valuation));
              }
              
              const unrealizedGain = investmentValue - Number(investment.check_size);
              const multiple = investmentValue / Number(investment.check_size);
              
              return (
                <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <h4 className="font-medium">{investment.company_name}</h4>
                      <span className="text-sm text-gray-500">
                        {formatDate(investment.investment_date)}
                      </span>
                      {investment.valuation_type && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          investment.valuation_type === 'priced' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {investment.valuation_type === 'priced' ? 'Priced' : 'SAFE'}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                      <div>
                        <span className="text-gray-600">Check Size:</span>
                        <div className="font-medium">{formatCurrency(Number(investment.check_size))}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Entry Valuation:</span>
                        <div className="font-medium">{formatCurrency(Number(investment.entry_valuation))}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Current Value:</span>
                        <div className="font-medium">{formatCurrency(investmentValue)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Multiple:</span>
                        <div className={`font-medium ${multiple >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                          {multiple.toFixed(2)}x
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(investment)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveInvestmentTracker;
