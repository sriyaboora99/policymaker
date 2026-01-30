import { ModuleHeader } from '@/components/shared/ModuleHeader';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSimulator } from '@/context/SimulatorContext';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Bell, CheckCircle2, Info, Lightbulb, ArrowRight } from 'lucide-react';

export function RiskAlerts() {
  const navigate = useNavigate();
  const { alerts, currentPolicy, currentSimulation } = useSimulator();

  const highAlerts = alerts.filter(a => a.level === 'high');
  const mediumAlerts = alerts.filter(a => a.level === 'medium');
  const lowAlerts = alerts.filter(a => a.level === 'low');

  if (!currentSimulation) {
    return (
      <div className="animate-fade-in space-y-6">
        <ModuleHeader
          title="Early Failure Risk & Alert System"
          description="Detect risk patterns and receive early warnings"
        />
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/20">
              <Bell className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="font-medium text-foreground">No alerts available</p>
              <p className="text-sm text-muted-foreground">
                Please <Button variant="link" className="h-auto p-0" onClick={() => navigate('/simulation')}>run a simulation</Button> to generate risk alerts.
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
        title="Early Failure Risk & Alert System"
        description="Detect risk patterns and receive early warnings"
        actions={
          alerts.length > 0 && (
            <Button onClick={() => navigate('/comparison')} className="gap-2">
              Address with What-If
              <ArrowRight className="h-4 w-4" />
            </Button>
          )
        }
      />

      {/* Alert Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className={highAlerts.length > 0 ? 'border-destructive/50' : ''}>
          <CardContent className="flex items-center gap-4 py-6">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
              highAlerts.length > 0 ? 'bg-destructive/20' : 'bg-muted'
            }`}>
              <AlertTriangle className={`h-6 w-6 ${highAlerts.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className="text-3xl font-bold">{highAlerts.length}</p>
              <p className="text-sm text-muted-foreground">High Risk Alerts</p>
            </div>
          </CardContent>
        </Card>

        <Card className={mediumAlerts.length > 0 ? 'border-warning/50' : ''}>
          <CardContent className="flex items-center gap-4 py-6">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
              mediumAlerts.length > 0 ? 'bg-warning/20' : 'bg-muted'
            }`}>
              <Info className={`h-6 w-6 ${mediumAlerts.length > 0 ? 'text-warning' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className="text-3xl font-bold">{mediumAlerts.length}</p>
              <p className="text-sm text-muted-foreground">Medium Risk Alerts</p>
            </div>
          </CardContent>
        </Card>

        <Card className={alerts.length === 0 ? 'border-success/50' : ''}>
          <CardContent className="flex items-center gap-4 py-6">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
              alerts.length === 0 ? 'bg-success/20' : 'bg-muted'
            }`}>
              <CheckCircle2 className={`h-6 w-6 ${alerts.length === 0 ? 'text-success' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className="text-3xl font-bold">{lowAlerts.length}</p>
              <p className="text-sm text-muted-foreground">Low Risk / Info</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-success/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Risk Alerts</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              The current policy simulation did not trigger any significant risk alerts. 
              The policy appears to be performing within acceptable parameters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* High Risk */}
          {highAlerts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-destructive uppercase tracking-wide flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                High Risk Alerts
              </h3>
              {highAlerts.map((alert) => (
                <Card key={alert.id} className="border-destructive/30">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/20">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h4 className="font-semibold text-foreground">{alert.title}</h4>
                          <RiskBadge level={alert.level} size="sm" />
                          {alert.stage && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded capitalize">
                              {alert.stage} stage
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                          <Lightbulb className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                          <p className="text-sm text-foreground">{alert.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Medium Risk */}
          {mediumAlerts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-warning uppercase tracking-wide flex items-center gap-2">
                <Info className="h-4 w-4" />
                Medium Risk Alerts
              </h3>
              {mediumAlerts.map((alert) => (
                <Card key={alert.id} className="border-warning/30">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/20">
                        <Info className="h-5 w-5 text-warning" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h4 className="font-semibold text-foreground">{alert.title}</h4>
                          <RiskBadge level={alert.level} size="sm" />
                          {alert.stage && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded capitalize">
                              {alert.stage} stage
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                          <Lightbulb className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                          <p className="text-sm text-foreground">{alert.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Low Risk */}
          {lowAlerts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-success uppercase tracking-wide flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Low Risk / Informational
              </h3>
              {lowAlerts.map((alert) => (
                <Card key={alert.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/20">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-foreground">{alert.title}</h4>
                          <RiskBadge level={alert.level} size="sm" />
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Human-in-the-Loop Decision Support</p>
              <p className="text-sm text-muted-foreground mt-1">
                These alerts are generated based on simulation results and serve as decision-support indicators only. 
                All policy decisions should be made by authorized personnel with appropriate context and expertise. 
                The system does not make automatic recommendations or decisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
