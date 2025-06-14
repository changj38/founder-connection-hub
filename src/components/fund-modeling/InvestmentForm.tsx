
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface Fund {
  id: string;
  name: string;
  fund_size: number;
  check_size: number;
  reserve_ratio: number;
  planned_investments: number;
}

interface InvestmentFormProps {
  fund: Fund;
  onClose: () => void;
  onSuccess: () => void;
}

const InvestmentForm: React.FC<InvestmentFormProps> = ({ fund, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    company_name: '',
    entry_valuation: '',
    check_size: fund.check_size.toString(),
    ownership_percentage: '',
    investment_date: new Date().toISOString().split('T')[0],
    marked_up_valuation: '',
    realized_return: ''
  });
  const [error, setError] = useState('');

  const createInvestmentMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: result, error } = await supabase
        .from('investments')
        .insert([{
          fund_id: fund.id,
          company_name: data.company_name,
          entry_valuation: parseFloat(data.entry_valuation),
          check_size: parseFloat(data.check_size),
          ownership_percentage: parseFloat(data.ownership_percentage) / 100, // Convert percentage to decimal
          investment_date: data.investment_date,
          marked_up_valuation: data.marked_up_valuation ? parseFloat(data.marked_up_valuation) : null,
          realized_return: data.realized_return ? parseFloat(data.realized_return) : null
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to create investment');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.company_name.trim()) {
      setError('Company name is required');
      return;
    }

    const entryValuation = parseFloat(formData.entry_valuation);
    const checkSize = parseFloat(formData.check_size);
    const ownershipPercentage = parseFloat(formData.ownership_percentage);

    if (isNaN(entryValuation) || entryValuation <= 0) {
      setError('Entry valuation must be a positive number');
      return;
    }

    if (isNaN(checkSize) || checkSize <= 0) {
      setError('Check size must be a positive number');
      return;
    }

    if (isNaN(ownershipPercentage) || ownershipPercentage <= 0 || ownershipPercentage > 100) {
      setError('Ownership percentage must be between 0 and 100');
      return;
    }

    if (!formData.investment_date) {
      setError('Investment date is required');
      return;
    }

    // Auto-calculate ownership if not provided
    if (!formData.ownership_percentage) {
      const calculatedOwnership = (checkSize / entryValuation) * 100;
      setFormData(prev => ({ ...prev, ownership_percentage: calculatedOwnership.toFixed(2) }));
    }

    createInvestmentMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');

    // Auto-calculate ownership percentage when check size or valuation changes
    if (field === 'check_size' || field === 'entry_valuation') {
      const updatedData = { ...formData, [field]: value };
      const checkSize = parseFloat(updatedData.check_size);
      const entryValuation = parseFloat(updatedData.entry_valuation);
      
      if (!isNaN(checkSize) && !isNaN(entryValuation) && entryValuation > 0) {
        const calculatedOwnership = (checkSize / entryValuation) * 100;
        setFormData(prev => ({ 
          ...prev, 
          [field]: value,
          ownership_percentage: calculatedOwnership.toFixed(4)
        }));
      }
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Investment to {fund.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              placeholder="e.g., TechStartup Inc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entry_valuation">Entry Valuation ($)</Label>
            <Input
              id="entry_valuation"
              type="number"
              step="0.01"
              value={formData.entry_valuation}
              onChange={(e) => handleInputChange('entry_valuation', e.target.value)}
              placeholder="e.g., 5000000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="check_size">Check Size ($)</Label>
            <Input
              id="check_size"
              type="number"
              step="0.01"
              value={formData.check_size}
              onChange={(e) => handleInputChange('check_size', e.target.value)}
              placeholder="e.g., 250000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownership_percentage">Ownership Percentage (%)</Label>
            <Input
              id="ownership_percentage"
              type="number"
              step="0.0001"
              min="0"
              max="100"
              value={formData.ownership_percentage}
              onChange={(e) => handleInputChange('ownership_percentage', e.target.value)}
              placeholder="Auto-calculated"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="investment_date">Investment Date</Label>
            <Input
              id="investment_date"
              type="date"
              value={formData.investment_date}
              onChange={(e) => handleInputChange('investment_date', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="marked_up_valuation">Current Marked-up Valuation ($) <span className="text-gray-500">(Optional)</span></Label>
            <Input
              id="marked_up_valuation"
              type="number"
              step="0.01"
              value={formData.marked_up_valuation}
              onChange={(e) => handleInputChange('marked_up_valuation', e.target.value)}
              placeholder="e.g., 7500000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="realized_return">Realized Return ($) <span className="text-gray-500">(Optional)</span></Label>
            <Input
              id="realized_return"
              type="number"
              step="0.01"
              value={formData.realized_return}
              onChange={(e) => handleInputChange('realized_return', e.target.value)}
              placeholder="e.g., 500000"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createInvestmentMutation.isPending}
              className="flex-1"
            >
              {createInvestmentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Investment'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentForm;
