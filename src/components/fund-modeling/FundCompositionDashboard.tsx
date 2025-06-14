
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TrendingUp, Target, Calendar, MapPin, PieChart, Settings } from 'lucide-react';

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

interface FundCompositionDashboardProps {
  fund: Fund;
  investments: Investment[];
}

// Mock data for enhanced features
const investmentStages = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+'];
const sectors = ['SaaS', 'FinTech', 'HealthTech', 'EdTech', 'E-commerce', 'AI/ML', 'Climate', 'Other'];
const geographies = ['North America', 'Europe', 'Asia-Pacific', 'Latin America', 'Other'];
const lifecycleStages = ['Fundraising', 'Deployment', 'Harvesting'];

const FundCompositionDashboard: React.FC<FundCompositionDashboardProps> = ({ fund, investments }) => {
  const [activeLifecycleStage, setActiveLifecycleStage] = useState<string>('Deployment');

  const compositionMetrics = useMemo(() => {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.check_size, 0);
    const deploymentRatio = fund.fund_size > 0 ? (totalInvested / fund.fund_size) * 100 : 0;
    const remainingCapital = fund.fund_size - totalInvested;
    
    // Mock stage distribution (in real app, this would be based on investment data)
    const stageDistribution = {
      'Pre-Seed': 15,
      'Seed': 35,
      'Series A': 30,
      'Series B': 15,
      'Series C+': 5
    };

    // Mock sector allocation (in real app, this would be based on investment data)
    const sectorAllocation = {
      'SaaS': 25,
      'FinTech': 20,
      'HealthTech': 15,
      'AI/ML': 20,
      'EdTech': 10,
      'Climate': 10
    };

    // Mock geographic distribution
    const geoDistribution = {
      'North America': 60,
      'Europe': 25,
      'Asia-Pacific': 10,
      'Other': 5
    };

    return {
      totalInvested,
      deploymentRatio,
      remainingCapital,
      investmentCount: investments.length,
      targetInvestments: fund.planned_investments,
      stageDistribution,
      sectorAllocation,
      geoDistribution
    };
  }, [fund, investments]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getLifecycleStageColor = (stage: string) => {
    switch (stage) {
      case 'Fundraising': return 'bg-blue-500';
      case 'Deployment': return 'bg-green-500';
      case 'Harvesting': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Fund Lifecycle Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Fund Lifecycle & Composition Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {lifecycleStages.map((stage) => (
              <Button
                key={stage}
                variant={activeLifecycleStage === stage ? "default" : "outline"}
                onClick={() => setActiveLifecycleStage(stage)}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <div className={`w-3 h-3 rounded-full ${getLifecycleStageColor(stage)}`} />
                <span className="font-medium">{stage}</span>
                <span className="text-xs text-muted-foreground">
                  {stage === 'Deployment' ? 'Active' : stage === 'Fundraising' ? 'Complete' : 'Future'}
                </span>
              </Button>
            ))}
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(compositionMetrics.deploymentRatio)}%</div>
              <div className="text-sm text-muted-foreground">Capital Deployed</div>
              <Progress value={compositionMetrics.deploymentRatio} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{compositionMetrics.investmentCount}</div>
              <div className="text-sm text-muted-foreground">Total Investments</div>
              <div className="text-xs text-gray-500 mt-1">
                of {compositionMetrics.targetInvestments} planned
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatCurrency(compositionMetrics.remainingCapital)}</div>
              <div className="text-sm text-muted-foreground">Remaining Capital</div>
              <Badge variant="secondary" className="mt-1">
                {Math.round((compositionMetrics.remainingCapital / fund.fund_size) * 100)}% Available
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">24M</div>
              <div className="text-sm text-muted-foreground">Avg Time to Deploy</div>
              <div className="text-xs text-gray-500 mt-1">Target: 18-30M</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Composition Analysis Tabs */}
      <Tabs defaultValue="stages" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stages" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Investment Stages
          </TabsTrigger>
          <TabsTrigger value="sectors" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Sector Allocation
          </TabsTrigger>
          <TabsTrigger value="geography" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Geographic Mix
          </TabsTrigger>
          <TabsTrigger value="deployment" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Deployment Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Investment Stage Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(compositionMetrics.stageDistribution).map(([stage, percentage]) => (
                <div key={stage} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{percentage}%</span>
                      <Badge variant="outline" className="text-xs">
                        Target: {stage === 'Seed' ? '40%' : stage === 'Series A' ? '35%' : '20%'}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sectors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sector Allocation vs Targets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(compositionMetrics.sectorAllocation).map(([sector, percentage]) => (
                <div key={sector} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{sector}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{percentage}%</span>
                      <Badge 
                        variant={percentage > 15 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {percentage > 15 ? 'Above Target' : 'On Track'}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(compositionMetrics.geoDistribution).map(([region, percentage]) => (
                <div key={region} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{region}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{percentage}%</span>
                      <Badge variant="outline" className="text-xs">
                        Limit: {region === 'North America' ? '70%' : '30%'}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Capital Deployment Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">Year 1-2</div>
                  <div className="text-sm text-muted-foreground">Initial Deployment</div>
                  <div className="text-lg font-semibold mt-2">60%</div>
                  <Progress value={60} className="mt-2" />
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">Year 3-4</div>
                  <div className="text-sm text-muted-foreground">Active Investment</div>
                  <div className="text-lg font-semibold mt-2">30%</div>
                  <Progress value={30} className="mt-2" />
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">Year 5+</div>
                  <div className="text-sm text-muted-foreground">Follow-ons & Reserve</div>
                  <div className="text-lg font-semibold mt-2">10%</div>
                  <Progress value={10} className="mt-2" />
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Deployment Insights</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Currently on track with deployment timeline</li>
                  <li>• {Math.round(fund.reserve_ratio * 100)}% reserved for follow-on investments</li>
                  <li>• Average check size: {formatCurrency(fund.check_size)}</li>
                  <li>• Estimated fund life: 8-10 years</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FundCompositionDashboard;
