
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';

interface FundModel {
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

interface FundModelInputsProps {
  model: FundModel;
  setModel: React.Dispatch<React.SetStateAction<FundModel>>;
}

const FundModelInputs: React.FC<FundModelInputsProps> = ({ model, setModel }) => {
  const updateModel = (field: keyof FundModel, value: string | number) => {
    setModel(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Fund Model Inputs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Model Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Model Name</Label>
          <Input
            id="name"
            value={model.name}
            onChange={(e) => updateModel('name', e.target.value)}
            placeholder="Enter model name"
          />
        </div>

        {/* Fund Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="gp_commit_usd">GP Commit (USD)</Label>
            <Input
              id="gp_commit_usd"
              type="number"
              value={model.gp_commit_usd}
              onChange={(e) => updateModel('gp_commit_usd', Number(e.target.value))}
              placeholder="2000000"
            />
            <p className="text-xs text-gray-500">{formatCurrency(model.gp_commit_usd)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fund_size_usd">Fund Size (USD)</Label>
            <Input
              id="fund_size_usd"
              type="number"
              value={model.fund_size_usd}
              onChange={(e) => updateModel('fund_size_usd', Number(e.target.value))}
              placeholder="100000000"
            />
            <p className="text-xs text-gray-500">{formatCurrency(model.fund_size_usd)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avg_entry_valuation_usd">Avg Entry Valuation (USD)</Label>
            <Input
              id="avg_entry_valuation_usd"
              type="number"
              value={model.avg_entry_valuation_usd}
              onChange={(e) => updateModel('avg_entry_valuation_usd', Number(e.target.value))}
              placeholder="10000000"
            />
            <p className="text-xs text-gray-500">{formatCurrency(model.avg_entry_valuation_usd)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avg_initial_check_usd">Avg Initial Check (USD)</Label>
            <Input
              id="avg_initial_check_usd"
              type="number"
              value={model.avg_initial_check_usd}
              onChange={(e) => updateModel('avg_initial_check_usd', Number(e.target.value))}
              placeholder="1000000"
            />
            <p className="text-xs text-gray-500">{formatCurrency(model.avg_initial_check_usd)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reserve_ratio_pct">Reserve Ratio (%)</Label>
            <Input
              id="reserve_ratio_pct"
              type="number"
              step="0.1"
              value={model.reserve_ratio_pct}
              onChange={(e) => updateModel('reserve_ratio_pct', Number(e.target.value))}
              placeholder="50"
            />
            <p className="text-xs text-gray-500">{model.reserve_ratio_pct}%</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recycling_rate_pct">Recycling Rate (%)</Label>
            <Input
              id="recycling_rate_pct"
              type="number"
              step="0.1"
              value={model.recycling_rate_pct}
              onChange={(e) => updateModel('recycling_rate_pct', Number(e.target.value))}
              placeholder="20"
            />
            <p className="text-xs text-gray-500">{model.recycling_rate_pct}%</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hold_period_years">Hold Period (Years)</Label>
            <Input
              id="hold_period_years"
              type="number"
              step="0.1"
              value={model.hold_period_years}
              onChange={(e) => updateModel('hold_period_years', Number(e.target.value))}
              placeholder="7"
            />
            <p className="text-xs text-gray-500">{model.hold_period_years} years</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mgmt_fee_pct">Management Fee (%)</Label>
            <Input
              id="mgmt_fee_pct"
              type="number"
              step="0.1"
              value={model.mgmt_fee_pct}
              onChange={(e) => updateModel('mgmt_fee_pct', Number(e.target.value))}
              placeholder="2.5"
            />
            <p className="text-xs text-gray-500">{model.mgmt_fee_pct}% annually</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="carry_pct">Carry (%)</Label>
            <Input
              id="carry_pct"
              type="number"
              step="0.1"
              value={model.carry_pct}
              onChange={(e) => updateModel('carry_pct', Number(e.target.value))}
              placeholder="20"
            />
            <p className="text-xs text-gray-500">{model.carry_pct}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FundModelInputs;
