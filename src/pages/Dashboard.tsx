import { ModuleHeader } from '@/components/shared/ModuleHeader';
import { StatCard } from '@/components/shared/StatCard';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSimulator } from '@/context/SimulatorContext';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Play, 
  BarChart3, 
  AlertTriangle,
  ArrowRight,
  Plus,
  TrendingUp,
  Target,
  DollarSign,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function Dashboard() {
  const navigate = useNavigate();
  const { 
    userRole, 
    currentPolicy, 
    population, 
    currentSimulation, 
    simulations,
    alerts,
  } = useSimulator();

  const highAlerts = alerts.filter(a => a.level === 'high').length;
  const hasData = currentPolicy && population.length > 0 && currentSimulation;

  // Quick start cards for when there's no data
  const quickStartSteps = [
    {
      title: 'Define Policy',
      description: 'Create a government scheme with parameters',
      icon: FileText,
      action: () => navigate('/policy'),
      complete: !!currentPolicy,
    },
    {
      title: 'Generate Population',
      description: 'Create synthetic citizens for simulation',
      icon: Users,
      action: () => navigate('/population'),
      complete: population.length > 0,
    },
    {
      title: 'Run Simulation',
      description: 'Simulate citizen adoption behavior',
      icon: Play,
      action: () => navigate('/simulation'),
      complete: !!currentSimulation,
    },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <ModuleHeader
        title={`Welcome, ${userRole === 'policymaker' ? 'Policymaker' : userRole === 'implementing_agency' ? 'Agency User' : 'Researcher'}`}
        description="Adaptive Policy Impact Simulator - Decision support for government schemes"
        actions={
          <Button onClick={() => navigate('/policy')} className="gap-2">
            <Plus className="h-4 w-4" />
            New Policy
          </Button>
        }
      />

      {!hasData ? (
        /* Getting Started View */
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>Follow these steps to run your first policy simulation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {quickStartSteps.map((step, index) => (
                  <button
                    key={step.title}
                    onClick={step.action}
                    className={`relative flex flex-col items-center p-6 rounded-xl border-2 transition-all hover:border-secondary hover:shadow-lg ${
                      step.complete ? 'border-success/50 bg-success/5' : 'border-border'
                    }`}
                  >
                    <div className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                      step.complete ? 'bg-success/20' : 'bg-muted'
                    }`}>
                      <step.icon className={`h-7 w-7 ${step.complete ? 'text-success' : 'text-muted-foreground'}`} />
                    </div>
                    <h3 className="mt-4 font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground text-center">{step.description}</p>
                    {step.complete && (
                      <span className="mt-3 text-xs font-medium text-success">✓ Complete</span>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About This Simulator</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-muted-foreground">
              <p>
                The Adaptive Policy Impact Simulator is an interactive decision-support platform designed to help 
                policymakers, implementing agencies, and researchers understand and optimize government scheme adoption.
              </p>
              <p>
                Key capabilities:
              </p>
              <ul className="grid sm:grid-cols-2 gap-2 list-none pl-0">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  Define policies with structured parameters
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  Generate synthetic populations
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  Simulate behavioral adoption patterns
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  Analyze adoption gaps and root causes
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  Test what-if policy modifications
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  Receive early failure risk alerts
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Dashboard with Data */
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Final Beneficiaries"
              value={currentSimulation.finalBeneficiaries.toLocaleString()}
              subtitle={`of ${currentSimulation.eligiblePopulation.toLocaleString()} eligible`}
              icon={<Users className="h-6 w-6 text-secondary" />}
              variant="primary"
            />
            <StatCard
              title="Adoption Rate"
              value={`${currentSimulation.adoptionRate.toFixed(1)}%`}
              subtitle={`Target: ${currentPolicy.expectedAdoptionPercentage}%`}
              icon={<TrendingUp className="h-6 w-6 text-success" />}
              trend={{
                value: currentSimulation.adoptionRate - currentPolicy.expectedAdoptionPercentage,
                label: 'vs target',
                direction: currentSimulation.adoptionRate >= currentPolicy.expectedAdoptionPercentage ? 'up' : 'down',
              }}
            />
            <StatCard
              title="Cost per Beneficiary"
              value={`₹${currentSimulation.costPerBeneficiary.toFixed(0)}`}
              subtitle={`Budget: ₹${currentPolicy.benefitValue}`}
              icon={<DollarSign className="h-6 w-6 text-warning" />}
            />
            <StatCard
              title="Risk Alerts"
              value={alerts.length}
              subtitle={highAlerts > 0 ? `${highAlerts} high severity` : 'No critical issues'}
              icon={<AlertTriangle className={`h-6 w-6 ${highAlerts > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />}
              variant={highAlerts > 0 ? 'destructive' : 'default'}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Adoption Timeline */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Adoption Timeline</CardTitle>
                <CardDescription>Cumulative beneficiaries over rollout period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentSimulation.timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="day" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12}
                        tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="benefit" 
                        stroke="hsl(var(--secondary))" 
                        strokeWidth={2}
                        dot={false}
                        name="Beneficiaries"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions & Alerts */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Policy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-foreground">{currentPolicy.name}</p>
                      <p className="text-sm text-muted-foreground">Version {currentPolicy.version}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs">
                        {currentPolicy.geographicScope}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs">
                        ₹{currentPolicy.benefitValue.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs">
                        {currentPolicy.benefitType}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-2"
                      onClick={() => navigate('/comparison')}
                    >
                      Test Modifications →
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {alerts.length > 0 && (
                <Card className={highAlerts > 0 ? 'border-destructive/30' : 'border-warning/30'}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className={`h-5 w-5 ${highAlerts > 0 ? 'text-destructive' : 'text-warning'}`} />
                      Active Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {alerts.slice(0, 3).map((alert) => (
                        <div key={alert.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                          <RiskBadge level={alert.level} size="sm" showLabel={false} />
                          <span className="text-sm truncate">{alert.title}</span>
                        </div>
                      ))}
                      {alerts.length > 3 && (
                        <Button 
                          variant="ghost" 
                          className="w-full text-sm"
                          onClick={() => navigate('/alerts')}
                        >
                          View all {alerts.length} alerts →
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Stage-wise Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stage-wise Performance</CardTitle>
              <CardDescription>Drop-off analysis across adoption funnel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                {currentSimulation.stages.map((stage) => (
                  <div key={stage.stage} className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide capitalize mb-1">
                      {stage.stage}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stage.completed.toLocaleString()}
                    </p>
                    {stage.dropOffRate > 0 && (
                      <p className={`text-xs mt-1 ${stage.dropOffRate > 30 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        -{stage.dropOffRate.toFixed(1)}% drop-off
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
