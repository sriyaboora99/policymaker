import { ModuleHeader } from '@/components/shared/ModuleHeader';
import { StatCard } from '@/components/shared/StatCard';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSimulator } from '@/context/SimulatorContext';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Users, Play, BarChart3, AlertTriangle,
  Plus, TrendingUp, DollarSign, ArrowRight, CheckCircle2, Circle,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';

export function Dashboard() {
  const navigate = useNavigate();
  const { userRole, currentPolicy, population, currentSimulation, simulations, alerts } = useSimulator();

  const highAlerts = alerts.filter(a => a.level === 'high').length;
  const hasData = currentPolicy && population.length > 0 && currentSimulation;

  const quickStartSteps = [
    { title: 'Define Policy', description: 'Create a government scheme with eligibility criteria and benefit parameters', icon: FileText, action: () => navigate('/policy'), complete: !!currentPolicy },
    { title: 'Generate Population', description: 'Create synthetic citizens with demographic profiles for simulation', icon: Users, action: () => navigate('/population'), complete: population.length > 0 },
    { title: 'Run Simulation', description: 'Model citizen adoption behavior and analyze outcomes', icon: Play, action: () => navigate('/simulation'), complete: !!currentSimulation },
  ];

  const roleName = userRole === 'policymaker' ? 'Policymaker' : userRole === 'implementing_agency' ? 'Agency User' : 'Researcher';

  return (
    <div className="animate-fade-in space-y-8">
      <ModuleHeader
        title={`Welcome back, ${roleName}`}
        description="Adaptive Policy Impact Simulator — Decision support for government schemes"
        actions={
          <Button onClick={() => navigate('/policy')} className="gap-2 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <Plus className="h-4 w-4" />
            New Policy
          </Button>
        }
      />

      {!hasData ? (
        <div className="space-y-8">
          {/* Getting Started */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">Getting Started</h2>
            <p className="text-sm text-muted-foreground mb-5">Follow these steps to run your first policy simulation</p>
            <div className="grid gap-5 sm:grid-cols-3">
              {quickStartSteps.map((step, index) => (
                <button
                  key={step.title}
                  onClick={step.action}
                  className="group relative flex flex-col items-start p-6 rounded-2xl border-2 border-border bg-card transition-all duration-300 hover:border-accent hover:shadow-lg text-left"
                >
                  <div className="flex items-center gap-3 mb-4 w-full">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                      step.complete ? 'bg-success/15' : 'bg-muted'
                    }`}>
                      <step.icon className={`h-5 w-5 ${step.complete ? 'text-success' : 'text-muted-foreground group-hover:text-accent'} transition-colors`} />
                    </div>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                      {step.complete ? <CheckCircle2 className="h-5 w-5 text-success" /> : index + 1}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    Get started <ArrowRight className="h-3 w-3" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* About */}
          <Card className="rounded-2xl overflow-hidden border-border/60">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg">About This Simulator</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                The Adaptive Policy Impact Simulator is an interactive decision-support platform designed to help 
                policymakers, implementing agencies, and researchers understand and optimize government scheme adoption.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  'Define policies with structured parameters',
                  'Generate synthetic populations',
                  'Simulate behavioral adoption patterns',
                  'Analyze adoption gaps and root causes',
                  'Test what-if policy modifications',
                  'Receive early failure risk alerts',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Circle className="h-1.5 w-1.5 fill-accent text-accent shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
            <Card className="lg:col-span-2 rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">Adoption Timeline</CardTitle>
                <CardDescription>Cumulative beneficiaries over rollout period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentSimulation.timeSeriesData}>
                      <defs>
                        <linearGradient id="benefitGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                          boxShadow: '0 8px 20px hsl(var(--foreground) / 0.08)',
                        }}
                      />
                      <Area type="monotone" dataKey="benefit" stroke="hsl(var(--secondary))" strokeWidth={2.5} fill="url(#benefitGradient)" name="Beneficiaries" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar cards */}
            <div className="space-y-6">
              <Card className="rounded-2xl overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Current Policy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-bold text-foreground">{currentPolicy.name}</p>
                      <p className="text-xs text-muted-foreground">Version {currentPolicy.version}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[currentPolicy.geographicScope, `₹${currentPolicy.benefitValue.toLocaleString()}`, currentPolicy.benefitType].map((tag) => (
                        <span key={tag} className="inline-flex items-center rounded-lg bg-muted px-2.5 py-1 text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full mt-2 rounded-xl gap-2" onClick={() => navigate('/comparison')}>
                      Test Modifications <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {alerts.length > 0 && (
                <Card className={`rounded-2xl overflow-hidden ${highAlerts > 0 ? 'border-destructive/30' : 'border-warning/30'}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className={`h-5 w-5 ${highAlerts > 0 ? 'text-destructive' : 'text-warning'}`} />
                      Active Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {alerts.slice(0, 3).map((alert) => (
                        <div key={alert.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/50">
                          <RiskBadge level={alert.level} size="sm" showLabel={false} />
                          <span className="text-sm truncate">{alert.title}</span>
                        </div>
                      ))}
                      {alerts.length > 3 && (
                        <Button variant="ghost" className="w-full text-sm rounded-xl" onClick={() => navigate('/alerts')}>
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
          <Card className="rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Stage-wise Performance</CardTitle>
              <CardDescription>Drop-off analysis across adoption funnel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                {currentSimulation.stages.map((stage) => (
                  <div key={stage.stage} className="p-4 rounded-xl bg-muted/40 text-center border border-border/50 transition-all hover:bg-muted/60 hover:shadow-sm">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold capitalize mb-2">
                      {stage.stage}
                    </p>
                    <p className="text-2xl font-extrabold text-foreground">
                      {stage.completed.toLocaleString()}
                    </p>
                    {stage.dropOffRate > 0 && (
                      <p className={`text-xs mt-1.5 font-medium ${stage.dropOffRate > 30 ? 'text-destructive' : 'text-muted-foreground'}`}>
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
