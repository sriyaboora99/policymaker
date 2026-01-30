import { useState } from 'react';
import { ModuleHeader } from '@/components/shared/ModuleHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSimulator } from '@/context/SimulatorContext';
import { runSimulation, analyzeGaps, generateAlerts } from '@/lib/simulationEngine';
import { Policy, TrustLevel } from '@/types/policy';
import { GitCompare, Play, TrendingUp, TrendingDown, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export function WhatIfComparison() {
  const navigate = useNavigate();
  const { 
    currentPolicy, 
    population, 
    currentSimulation,
    addSimulation,
    setAlerts,
  } = useSimulator();

  const [modifiedPolicy, setModifiedPolicy] = useState<Policy | null>(null);
  const [modifiedResult, setModifiedResult] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);

  // Modified policy parameters
  const [documentsRequired, setDocumentsRequired] = useState(currentPolicy?.documentsRequired || 5);
  const [awarenessLevel, setAwarenessLevel] = useState(currentPolicy?.assumptions.awarenessLevel || 50);
  const [digitalAccessibility, setDigitalAccessibility] = useState(currentPolicy?.assumptions.digitalAccessibility || 60);
  const [trustLevel, setTrustLevel] = useState<TrustLevel>(currentPolicy?.assumptions.trustLevel || 'medium');
  const [benefitValue, setBenefitValue] = useState(currentPolicy?.benefitValue || 5000);

  const handleRunComparison = () => {
    if (!currentPolicy || population.length === 0 || !currentSimulation) {
      toast.error('Please run a baseline simulation first');
      return;
    }

    setIsComparing(true);

    const modified: Policy = {
      ...currentPolicy,
      id: `policy-modified-${Date.now()}`,
      name: `${currentPolicy.name} (Modified)`,
      version: currentPolicy.version + 1,
      documentsRequired,
      benefitValue,
      assumptions: {
        awarenessLevel,
        trustLevel,
        digitalAccessibility,
      },
      updatedAt: new Date(),
    };

    setTimeout(() => {
      const result = runSimulation(modified, population);
      const gaps = analyzeGaps(modified, result);
      const alerts = generateAlerts(modified, result, gaps);

      setModifiedPolicy(modified);
      setModifiedResult(result);
      addSimulation(result);
      setAlerts(alerts);
      setIsComparing(false);

      toast.success('Comparison complete', {
        description: `${result.finalBeneficiaries.toLocaleString()} beneficiaries with modified policy`,
      });
    }, 1000);
  };

  const getDelta = (baseline: number, modified: number) => {
    const delta = modified - baseline;
    const pct = baseline > 0 ? (delta / baseline) * 100 : 0;
    return { delta, pct };
  };

  const comparisonData = currentSimulation && modifiedResult ? [
    {
      metric: 'Beneficiaries',
      baseline: currentSimulation.finalBeneficiaries,
      modified: modifiedResult.finalBeneficiaries,
    },
    {
      metric: 'Adoption Rate',
      baseline: currentSimulation.adoptionRate,
      modified: modifiedResult.adoptionRate,
    },
    {
      metric: 'Budget Used',
      baseline: currentSimulation.budgetUtilization,
      modified: modifiedResult.budgetUtilization,
    },
  ] : [];

  if (!currentPolicy) {
    return (
      <div className="animate-fade-in space-y-6">
        <ModuleHeader
          title="What-If Policy Comparison"
          description="Modify policy parameters and compare outcomes"
        />
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/20">
              <GitCompare className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="font-medium text-foreground">No baseline policy</p>
              <p className="text-sm text-muted-foreground">
                Please <Button variant="link" className="h-auto p-0" onClick={() => navigate('/policy')}>define a policy</Button> and run a simulation first.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <ModuleHeader
        title="What-If Policy Comparison"
        description="Modify policy parameters and compare outcomes side-by-side"
        actions={
          <Button
            onClick={handleRunComparison}
            disabled={isComparing || !currentSimulation}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {isComparing ? 'Comparing...' : 'Run Comparison'}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Baseline Policy */}
        <Card>
          <CardHeader className="bg-muted/50">
            <div className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-lg">Baseline Policy</CardTitle>
                <CardDescription>{currentPolicy.name} v{currentPolicy.version}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Documents Required</p>
                <p className="text-lg font-bold">{currentPolicy.documentsRequired}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Benefit Value</p>
                <p className="text-lg font-bold">₹{currentPolicy.benefitValue.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Awareness Level</p>
                <p className="text-lg font-bold">{currentPolicy.assumptions.awarenessLevel}%</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Digital Accessibility</p>
                <p className="text-lg font-bold">{currentPolicy.assumptions.digitalAccessibility}%</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Trust Level</p>
                <p className="text-lg font-bold capitalize">{currentPolicy.assumptions.trustLevel}</p>
              </div>
            </div>

            {currentSimulation && (
              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-medium mb-3">Simulation Results</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Beneficiaries</span>
                    <span className="font-medium">{currentSimulation.finalBeneficiaries.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Adoption Rate</span>
                    <span className="font-medium">{currentSimulation.adoptionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cost/Beneficiary</span>
                    <span className="font-medium">₹{currentSimulation.costPerBeneficiary.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Budget Used</span>
                    <span className="font-medium">{currentSimulation.budgetUtilization.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modified Policy */}
        <Card className="border-secondary/30">
          <CardHeader className="bg-secondary/10">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-secondary" />
              <div>
                <CardTitle className="text-lg">Modified Policy</CardTitle>
                <CardDescription>Adjust parameters to test scenarios</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Documents Required</Label>
                  <span className="text-sm font-medium text-secondary">{documentsRequired}</span>
                </div>
                <Slider
                  value={[documentsRequired]}
                  onValueChange={([v]) => setDocumentsRequired(v)}
                  max={15}
                  min={1}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Benefit Value (₹)</Label>
                <Input
                  type="number"
                  value={benefitValue}
                  onChange={(e) => setBenefitValue(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Awareness Level</Label>
                  <span className="text-sm font-medium text-secondary">{awarenessLevel}%</span>
                </div>
                <Slider
                  value={[awarenessLevel]}
                  onValueChange={([v]) => setAwarenessLevel(v)}
                  max={100}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Digital Accessibility</Label>
                  <span className="text-sm font-medium text-secondary">{digitalAccessibility}%</span>
                </div>
                <Slider
                  value={[digitalAccessibility]}
                  onValueChange={([v]) => setDigitalAccessibility(v)}
                  max={100}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Trust Level</Label>
                <Select value={trustLevel} onValueChange={(v) => setTrustLevel(v as TrustLevel)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {modifiedResult && (
              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-medium mb-3">Simulation Results</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Beneficiaries</span>
                    <span className="font-medium">{modifiedResult.finalBeneficiaries.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Adoption Rate</span>
                    <span className="font-medium">{modifiedResult.adoptionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cost/Beneficiary</span>
                    <span className="font-medium">₹{modifiedResult.costPerBeneficiary.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Budget Used</span>
                    <span className="font-medium">{modifiedResult.budgetUtilization.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparison Results */}
      {currentSimulation && modifiedResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comparison Results</CardTitle>
            <CardDescription>Improvements and trade-offs between baseline and modified policy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Delta Cards */}
              <div className="space-y-4">
                {[
                  {
                    label: 'Beneficiaries',
                    baseline: currentSimulation.finalBeneficiaries,
                    modified: modifiedResult.finalBeneficiaries,
                    format: (v: number) => v.toLocaleString(),
                  },
                  {
                    label: 'Adoption Rate',
                    baseline: currentSimulation.adoptionRate,
                    modified: modifiedResult.adoptionRate,
                    format: (v: number) => `${v.toFixed(1)}%`,
                  },
                  {
                    label: 'Cost per Beneficiary',
                    baseline: currentSimulation.costPerBeneficiary,
                    modified: modifiedResult.costPerBeneficiary,
                    format: (v: number) => `₹${v.toFixed(0)}`,
                    inverse: true,
                  },
                ].map((item) => {
                  const { delta, pct } = getDelta(item.baseline, item.modified);
                  const isPositive = item.inverse ? delta < 0 : delta > 0;
                  const isNeutral = Math.abs(pct) < 1;

                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div>
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className="text-lg font-bold">
                          {item.format(item.baseline)} → {item.format(item.modified)}
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 ${
                        isNeutral ? 'text-muted-foreground' : isPositive ? 'text-success' : 'text-destructive'
                      }`}>
                        {isNeutral ? (
                          <Minus className="h-5 w-5" />
                        ) : isPositive ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : (
                          <TrendingDown className="h-5 w-5" />
                        )}
                        <span className="font-bold">
                          {pct > 0 ? '+' : ''}{pct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Comparison Chart */}
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="baseline" name="Baseline" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="modified" name="Modified" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
