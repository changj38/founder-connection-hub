
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Settings, AlertTriangle, CheckCircle } from 'lucide-react';

interface AllocationTarget {
  category: string;
  target: number;
  current: number;
  limit?: number;
}

const AllocationTargetsManager: React.FC = () => {
  const [stageTargets, setStageTargets] = useState<AllocationTarget[]>([
    { category: 'Pre-Seed', target: 15, current: 15 },
    { category: 'Seed', target: 40, current: 35 },
    { category: 'Series A', target: 35, current: 30 },
    { category: 'Series B+', target: 10, current: 20 }
  ]);

  const [sectorTargets, setSectorTargets] = useState<AllocationTarget[]>([
    { category: 'SaaS', target: 25, current: 25, limit: 30 },
    { category: 'FinTech', target: 20, current: 20, limit: 25 },
    { category: 'HealthTech', target: 15, current: 15, limit: 20 },
    { category: 'AI/ML', target: 20, current: 20, limit: 25 },
    { category: 'Other', target: 20, current: 20, limit: 25 }
  ]);

  const [geoTargets, setGeoTargets] = useState<AllocationTarget[]>([
    { category: 'North America', target: 60, current: 60, limit: 70 },
    { category: 'Europe', target: 25, current: 25, limit: 30 },
    { category: 'Asia-Pacific', target: 10, current: 10, limit: 15 },
    { category: 'Other', target: 5, current: 5, limit: 10 }
  ]);

  const getStatusColor = (current: number, target: number, limit?: number) => {
    if (limit && current > limit) return 'text-red-600';
    if (Math.abs(current - target) <= 5) return 'text-green-600';
    return 'text-yellow-600';
  };

  const getStatusIcon = (current: number, target: number, limit?: number) => {
    if (limit && current > limit) return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (Math.abs(current - target) <= 5) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
  };

  const renderAllocationTable = (
    targets: AllocationTarget[], 
    setTargets: React.Dispatch<React.SetStateAction<AllocationTarget[]>>,
    title: string
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {targets.map((item, index) => (
          <div key={item.category} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.category}</span>
                {getStatusIcon(item.current, item.target, item.limit)}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm">
                    Current: <span className={getStatusColor(item.current, item.target, item.limit)}>
                      {item.current}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Target: {item.target}%
                    {item.limit && ` (Max: ${item.limit}%)`}
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-24">
                    <Label htmlFor={`target-${index}`} className="text-xs">Target %</Label>
                    <Input
                      id={`target-${index}`}
                      type="number"
                      value={item.target}
                      onChange={(e) => {
                        const newTargets = [...targets];
                        newTargets[index].target = parseFloat(e.target.value) || 0;
                        setTargets(newTargets);
                      }}
                      className="h-8 text-xs"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <Progress 
                value={item.current} 
                className="h-2" 
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>{item.limit ? `${item.limit}% max` : '100%'}</span>
              </div>
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span>Total Allocation:</span>
            <span className={targets.reduce((sum, t) => sum + t.current, 0) === 100 ? 'text-green-600' : 'text-red-600'}>
              {targets.reduce((sum, t) => sum + t.current, 0)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Allocation Targets & Compliance</h3>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Save Targets
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderAllocationTable(stageTargets, setStageTargets, "Investment Stage Targets")}
        {renderAllocationTable(sectorTargets, setSectorTargets, "Sector Allocation Targets")}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {renderAllocationTable(geoTargets, setGeoTargets, "Geographic Distribution Targets")}
      </div>

      {/* Compliance Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-medium">Stage Allocation</div>
              <div className="text-sm text-green-600">Within Targets</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="font-medium">Sector Allocation</div>
              <div className="text-sm text-yellow-600">Minor Deviation</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-medium">Geographic Mix</div>
              <div className="text-sm text-green-600">Compliant</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AllocationTargetsManager;
