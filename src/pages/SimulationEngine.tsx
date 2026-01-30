import { useState } from 'react';
import { ModuleHeader } from '@/components/shared/ModuleHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSimulator } from '@/context/SimulatorContext';
import { runSimulation, analyzeGaps, generateAlerts } from '@/lib/simulationEngine';
import { Play, Pause, RotateCcw, ArrowRight, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { AdoptionStage } from '@/types/policy';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

const stageLabels: Record<AdoptionStage, string> = {
  awareness: 'Awareness',
  interest: 'Interest',
  application: 'Application',
  submission: 'Submission',
  approval: 'Approval',
  benefit: 'Benefit Receipt',
};

const stageColors: Record<AdoptionStage, string> = {
  awareness: 'hsl(199, 89%, 48%)',
  interest: 'hsl(187, 85%, 45%)',
  application: 'hsl(172, 66%, 50%)',
  submission: 'hsl(142, 71%, 40%)',
  approval: 'hsl(88, 50%, 53%)',
  benefit: 'hsl(38, 92%, 50%)',
};

export function SimulationEngine() {
  const navigate = useNavigate();
  const { 
    currentPolicy, 
    population, 
    currentSimulation,
    addSimulation,
    setCurrentSimulation,
    setAlerts,
  } = useSimulator();

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleRunSimulation = () => {
    if (!currentPolicy || population.length === 0) {
      toast.error('Please define a policy and generate a population first');
      return;
    }

    setIsRunning(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    // Run actual simulation
    setTimeout(() => {
      const result = runSimulation(currentPolicy, population);
      const gaps = analyzeGaps(currentPolicy, result);
      const alerts = generateAlerts(currentPolicy, result, gaps);
      
      addSimulation(result);
      setCurrentSimulation(result);
      setAlerts(alerts);
      
      clearInterval(progressInterval);
      setProgress(100);
      setIsRunning(false);
      
      toast.success('Simulation completed', {
        description: `${result.finalBeneficiaries.toLocaleString()} beneficiaries reached`,
      });
    }, 1500);
  };

  const stages: AdoptionStage[] = ['awareness', 'interest', 'application', 'submission', 'approval', 'benefit'];

  return (
    <div className="animate-fade-in space-y-6">
      <ModuleHeader
        title="Behavioral Adoption Simulation Engine"
        description="Simulate citizen behavior through policy adoption stages"
        actions={
          <div className="flex gap-3">
            <Button
              onClick={handleRunSimulation}
              disabled={isRunning || !currentPolicy || population.length === 0}
              className={`gap-2 ${isRunning ? 'animate-pulse-glow' : ''}`}
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4" />
                  Running... {progress}%
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Simulation
                </>
              )}
            </Button>
            {currentSimulation && (
              <Button 
                variant="outline" 
                onClick={() => navigate('/impact')}
                className="gap-2"
              >
                View Impact Analysis
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        }
      />

      {(!currentPolicy || population.length === 0) && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/20">
              <Play className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="font-medium text-foreground">Prerequisites needed</p>
              <p className="text-sm text-muted-foreground">
                {!currentPolicy ? (
                  <>Please <Button variant="link" className="h-auto p-0" onClick={() => navigate('/policy')}>define a policy</Button> first.</>
                ) : (
                  <>Please <Button variant="link" className="h-auto p-0" onClick={() => navigate('/population')}>generate a population</Button> first.</>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Visualization Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Adoption Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Adoption Funnel</CardTitle>
              <CardDescription>
                Stage-wise progression through the adoption process
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentSimulation ? (
                <div className="space-y-3">
                  {currentSimulation.stages.map((stage, index) => {
                    const width = stage.completed > 0 
                      ? (stage.completed / currentSimulation.eligiblePopulation) * 100 
                      : 0;
                    const prevWidth = index > 0 
                      ? (currentSimulation.stages[index - 1].completed / currentSimulation.eligiblePopulation) * 100 
                      : 100;
                    
                    return (
                      <div key={stage.stage} className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{stageLabels[stage.stage]}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold">{stage.completed.toLocaleString()}</span>
                            {stage.dropOffRate > 0 && (
                              <span className="flex items-center gap-1 text-xs text-destructive">
                                <TrendingDown className="h-3 w-3" />
                                -{stage.dropOffRate.toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="h-8 rounded-lg bg-muted overflow-hidden relative">
                          <div
                            className="h-full rounded-lg transition-all duration-500"
                            style={{
                              width: `${width}%`,
                              backgroundColor: stageColors[stage.stage],
                            }}
                          />
                          {index > 0 && (
                            <div
                              className="absolute top-0 left-0 h-full opacity-20"
                              style={{
                                width: `${prevWidth}%`,
                                backgroundColor: stageColors[stages[index - 1]],
                              }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Play className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Run a simulation to see the adoption funnel</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Time Series Graph */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Adoption Over Time</CardTitle>
              <CardDescription>
                Cumulative beneficiary count throughout the rollout period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentSimulation ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentSimulation.timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="day" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12}
                        label={{ value: 'Days', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12}
                        tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [value.toLocaleString(), '']}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="awareness" stackId="1" stroke={stageColors.awareness} fill={stageColors.awareness} fillOpacity={0.3} name="Awareness" />
                      <Area type="monotone" dataKey="interest" stackId="2" stroke={stageColors.interest} fill={stageColors.interest} fillOpacity={0.4} name="Interest" />
                      <Area type="monotone" dataKey="application" stackId="3" stroke={stageColors.application} fill={stageColors.application} fillOpacity={0.5} name="Application" />
                      <Area type="monotone" dataKey="benefit" stackId="4" stroke={stageColors.benefit} fill={stageColors.benefit} fillOpacity={0.8} name="Benefit Received" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">No simulation data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Simulation Summary */}
        <div className="space-y-6">
          <Card className={currentSimulation ? 'border-secondary/30' : ''}>
            <CardHeader>
              <CardTitle className="text-lg">Simulation Results</CardTitle>
            </CardHeader>
            <CardContent>
              {currentSimulation ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-secondary/10 p-4 text-center">
                    <p className="text-3xl font-bold text-secondary">
                      {currentSimulation.finalBeneficiaries.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Final Beneficiaries</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Eligible Population</span>
                      <span className="font-medium">{currentSimulation.eligiblePopulation.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Adoption Rate</span>
                      <span className="font-medium">{currentSimulation.adoptionRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cost per Beneficiary</span>
                      <span className="font-medium">₹{currentSimulation.costPerBeneficiary.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Budget Utilization</span>
                      <span className="font-medium">{currentSimulation.budgetUtilization.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">Run a simulation to see results</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Drop-off Analysis */}
          {currentSimulation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Drop-off Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="data-table text-xs">
                  <thead>
                    <tr>
                      <th>Stage</th>
                      <th className="text-right">Drop-off</th>
                      <th className="text-right">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSimulation.stages.map((stage) => (
                      <tr key={stage.stage}>
                        <td className="capitalize">{stage.stage}</td>
                        <td className="text-right font-medium">
                          {stage.dropOff.toLocaleString()}
                        </td>
                        <td className={`text-right ${stage.dropOffRate > 30 ? 'text-destructive font-medium' : ''}`}>
                          {stage.dropOffRate.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {currentSimulation && (
            <Button 
              className="w-full" 
              onClick={() => navigate('/impact')}
            >
              Continue to Impact Analysis →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
