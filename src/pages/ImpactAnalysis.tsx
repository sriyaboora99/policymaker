import { ModuleHeader } from '@/components/shared/ModuleHeader';
import { StatCard } from '@/components/shared/StatCard';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSimulator } from '@/context/SimulatorContext';
import { analyzeGaps } from '@/lib/simulationEngine';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingDown, 
  Target, 
  DollarSign, 
  AlertTriangle,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export function ImpactAnalysis() {
  const navigate = useNavigate();
  const { currentPolicy, currentSimulation } = useSimulator();

  const gaps = currentPolicy && currentSimulation 
    ? analyzeGaps(currentPolicy, currentSimulation) 
    : null;

  const failureChartData = gaps?.failurePoints.map(fp => ({
    stage: fp.stage.charAt(0).toUpperCase() + fp.stage.slice(1),
    impact: fp.impactPercentage,
    severity: fp.severity,
  })) || [];

  const getBarColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'hsl(0, 72%, 51%)';
      case 'medium': return 'hsl(38, 92%, 50%)';
      default: return 'hsl(142, 71%, 40%)';
    }
  };

  if (!currentSimulation || !currentPolicy) {
    return (
      <div className="animate-fade-in space-y-6">
        <ModuleHeader
          title="Impact Gap Analyzer"
          description="Compare intended outcomes vs simulated outcomes"
        />
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/20">
              <BarChart3 className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="font-medium text-foreground">No simulation data available</p>
              <p className="text-sm text-muted-foreground">
                Please <Button variant="link" className="h-auto p-0" onClick={() => navigate('/simulation')}>run a simulation</Button> first to see impact analysis.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const expectedBeneficiaries = Math.floor(
    currentSimulation.eligiblePopulation * (currentPolicy.expectedAdoptionPercentage / 100)
  );

  return (
    <div className="animate-fade-in space-y-6">
      <ModuleHeader
        title="Impact Gap Analyzer"
        description="Compare intended outcomes vs simulated outcomes"
        actions={
          <Button onClick={() => navigate('/comparison')} className="gap-2">
            Try What-If Scenarios
            <ArrowRight className="h-4 w-4" />
          </Button>
        }
      />

      {/* Gap Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Adoption Gap"
          value={`${gaps?.adoptionGap.toFixed(1) || 0}%`}
          subtitle={`${(expectedBeneficiaries - currentSimulation.finalBeneficiaries).toLocaleString()} fewer than expected`}
          icon={<TrendingDown className="h-6 w-6 text-destructive" />}
          variant={(gaps?.adoptionGap || 0) > 30 ? 'destructive' : 'warning'}
        />
        
        <StatCard
          title="Budget Utilization Gap"
          value={`${gaps?.budgetUtilizationGap.toFixed(1) || 0}%`}
          subtitle="Unused budget allocation"
          icon={<DollarSign className="h-6 w-6 text-warning" />}
          variant={(gaps?.budgetUtilizationGap || 0) > 40 ? 'warning' : 'default'}
        />
        
        <StatCard
          title="Cost Delta"
          value={`₹${Math.abs(gaps?.costPerBeneficiaryDelta || 0).toFixed(0)}`}
          subtitle={(gaps?.costPerBeneficiaryDelta || 0) > 0 ? 'Above expected cost' : 'Below expected cost'}
          icon={<Target className="h-6 w-6 text-muted-foreground" />}
        />
        
        <StatCard
          title="Failure Points"
          value={gaps?.failurePoints.length || 0}
          subtitle={`${gaps?.failurePoints.filter(f => f.severity === 'high').length || 0} high severity`}
          icon={<AlertTriangle className="h-6 w-6 text-warning" />}
          variant={(gaps?.failurePoints.filter(f => f.severity === 'high').length || 0) > 0 ? 'destructive' : 'default'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Expected vs Actual Comparison */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Expected vs Simulated Outcomes</CardTitle>
            <CardDescription>Comparison of policy targets against simulation results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Expected</h4>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Beneficiaries</span>
                    <span className="font-bold">{expectedBeneficiaries.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Adoption Rate</span>
                    <span className="font-bold">{currentPolicy.expectedAdoptionPercentage}%</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Total Budget</span>
                    <span className="font-bold">₹{(currentPolicy.benefitValue * expectedBeneficiaries).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Cost/Beneficiary</span>
                    <span className="font-bold">₹{currentPolicy.benefitValue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-sm text-secondary uppercase tracking-wide">Simulated</h4>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                    <span className="text-sm">Beneficiaries</span>
                    <span className="font-bold">{currentSimulation.finalBeneficiaries.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                    <span className="text-sm">Adoption Rate</span>
                    <span className="font-bold">{currentSimulation.adoptionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                    <span className="text-sm">Actual Cost</span>
                    <span className="font-bold">₹{(currentPolicy.benefitValue * currentSimulation.finalBeneficiaries).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                    <span className="text-sm">Cost/Beneficiary</span>
                    <span className="font-bold">₹{currentSimulation.costPerBeneficiary.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Failure Point Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Drop-off by Stage</CardTitle>
            <CardDescription>Impact percentage at each failure point</CardDescription>
          </CardHeader>
          <CardContent>
            {failureChartData.length > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={failureChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis dataKey="stage" type="category" width={80} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Drop-off']}
                    />
                    <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                      {failureChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.severity)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">
                No significant failure points detected
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Root Cause Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Root Cause Analysis</CardTitle>
          <CardDescription>Identified causes ranked by impact on adoption</CardDescription>
        </CardHeader>
        <CardContent>
          {gaps && gaps.failurePoints.length > 0 ? (
            <div className="space-y-4">
              {gaps.failurePoints.map((fp, index) => (
                <div
                  key={`${fp.stage}-${index}`}
                  className="flex items-start gap-4 p-4 rounded-lg border"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium capitalize">{fp.stage} Stage</span>
                      <RiskBadge level={fp.severity} size="sm" />
                      <span className="text-sm text-muted-foreground">
                        Cause: <span className="capitalize font-medium">{fp.cause}</span>
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{fp.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs font-medium text-destructive">
                        {fp.impactPercentage.toFixed(1)}% drop-off
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">
              No significant root causes identified. The policy appears to be performing well.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
