
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface FundSetupFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const FundSetupForm: React.FC<FundSetupFormProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    fund_size: '',
    check_size: '',
    reserve_ratio: '',
    planned_investments: ''
  });
  const [error, setError] = useState('');

  const createFundMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: result, error } = await supabase
        .from('funds')
        .insert([{
          name: data.name,
          fund_size: parseFloat(data.fund_size),
          check_size: parseFloat(data.check_size),
          reserve_ratio: parseFloat(data.reserve_ratio) / 100, // Convert percentage to decimal
          planned_investments: parseInt(data.planned_investments),
          created_by: (await supabase.auth.getUser()).data.user?.id
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
      setError(error.message || 'Failed to create fund');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Fund name is required');
      return;
    }

    const fundSize = parseFloat(formData.fund_size);
    const checkSize = parseFloat(formData.check_size);
    const reserveRatio = parseFloat(formData.reserve_ratio);
    const plannedInvestments = parseInt(formData.planned_investments);

    if (isNaN(fundSize) || fundSize <= 0) {
      setError('Fund size must be a positive number');
      return;
    }

    if (isNaN(checkSize) || checkSize <= 0) {
      setError('Check size must be a positive number');
      return;
    }

    if (isNaN(reserveRatio) || reserveRatio < 0 || reserveRatio > 100) {
      setError('Reserve ratio must be between 0 and 100');
      return;
    }

    if (isNaN(plannedInvestments) || plannedInvestments <= 0) {
      setError('Planned investments must be a positive integer');
      return;
    }

    if (checkSize >= fundSize) {
      setError('Check size cannot be greater than or equal to fund size');
      return;
    }

    createFundMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user starts typing
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Fund</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Fund Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., DayDream Fund I"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fund_size">Fund Size ($)</Label>
            <Input
              id="fund_size"
              type="number"
              step="0.01"
              value={formData.fund_size}
              onChange={(e) => handleInputChange('fund_size', e.target.value)}
              placeholder="e.g., 10000000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="check_size">Typical Check Size ($)</Label>
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
            <Label htmlFor="reserve_ratio">Reserve Ratio (%)</Label>
            <Input
              id="reserve_ratio"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.reserve_ratio}
              onChange={(e) => handleInputChange('reserve_ratio', e.target.value)}
              placeholder="e.g., 25"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="planned_investments">Planned Investments</Label>
            <Input
              id="planned_investments"
              type="number"
              min="1"
              value={formData.planned_investments}
              onChange={(e) => handleInputChange('planned_investments', e.target.value)}
              placeholder="e.g., 40"
              required
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
              disabled={createFundMutation.isPending}
              className="flex-1"
            >
              {createFundMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Fund'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FundSetupForm;
