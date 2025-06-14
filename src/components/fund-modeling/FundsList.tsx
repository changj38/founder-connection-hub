
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Fund {
  id: string;
  name: string;
  fund_size: number;
  check_size: number;
  reserve_ratio: number;
  planned_investments: number;
  created_at: string;
}

interface FundsListProps {
  funds: Fund[];
  selectedFund: Fund | null;
  onSelectFund: (fund: Fund) => void;
}

const FundsList: React.FC<FundsListProps> = ({ funds, selectedFund, onSelectFund }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {funds.map((fund) => (
        <Button
          key={fund.id}
          variant={selectedFund?.id === fund.id ? "default" : "outline"}
          onClick={() => onSelectFund(fund)}
          className="flex flex-col items-start p-4 h-auto"
        >
          <div className="font-medium">{fund.name}</div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(fund.fund_size)} fund
          </div>
          <div className="text-xs text-muted-foreground">
            {formatCurrency(fund.check_size)} avg check
          </div>
        </Button>
      ))}
    </div>
  );
};

export default FundsList;
