
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Edit2, Save, X } from 'lucide-react';

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

interface InvestmentsListProps {
  investments: Investment[];
  onInvestmentUpdated: () => void;
}

const InvestmentsList: React.FC<InvestmentsListProps> = ({ investments, onInvestmentUpdated }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Investment>>({});
  const queryClient = useQueryClient();

  const updateInvestmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Investment> }) => {
      const { error } = await supabase
        .from('investments')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      setEditingId(null);
      setEditData({});
      onInvestmentUpdated();
    }
  });

  const handleEdit = (investment: Investment) => {
    setEditingId(investment.id);
    setEditData({
      marked_up_valuation: investment.marked_up_valuation,
      realized_return: investment.realized_return
    });
  };

  const handleSave = (id: string) => {
    updateInvestmentMutation.mutate({ id, data: editData });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateMultiple = (investment: Investment) => {
    const currentValue = investment.realized_return || 
      (investment.marked_up_valuation ? investment.marked_up_valuation * investment.ownership_percentage : investment.check_size);
    return currentValue / investment.check_size;
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Investment</TableHead>
            <TableHead>Ownership</TableHead>
            <TableHead>Current Value</TableHead>
            <TableHead>Realized</TableHead>
            <TableHead>Multiple</TableHead>
            <TableHead>Date</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investments.map((investment) => (
            <TableRow key={investment.id}>
              <TableCell className="font-medium">{investment.company_name}</TableCell>
              <TableCell>{formatCurrency(investment.check_size)}</TableCell>
              <TableCell>{formatPercentage(investment.ownership_percentage)}</TableCell>
              <TableCell>
                {editingId === investment.id ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={editData.marked_up_valuation || ''}
                    onChange={(e) => setEditData(prev => ({ 
                      ...prev, 
                      marked_up_valuation: e.target.value ? parseFloat(e.target.value) : null 
                    }))}
                    placeholder="Marked-up valuation"
                    className="w-32"
                  />
                ) : (
                  formatCurrency(investment.marked_up_valuation)
                )}
              </TableCell>
              <TableCell>
                {editingId === investment.id ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={editData.realized_return || ''}
                    onChange={(e) => setEditData(prev => ({ 
                      ...prev, 
                      realized_return: e.target.value ? parseFloat(e.target.value) : null 
                    }))}
                    placeholder="Realized return"
                    className="w-32"
                  />
                ) : (
                  formatCurrency(investment.realized_return)
                )}
              </TableCell>
              <TableCell>
                <Badge variant={calculateMultiple(investment) >= 1 ? "default" : "destructive"}>
                  {calculateMultiple(investment).toFixed(2)}x
                </Badge>
              </TableCell>
              <TableCell>{formatDate(investment.investment_date)}</TableCell>
              <TableCell>
                {editingId === investment.id ? (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => handleSave(investment.id)}
                      disabled={updateInvestmentMutation.isPending}
                    >
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(investment)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvestmentsList;
