import { useState, useEffect } from 'react';
import { ModuleHeader } from '@/components/shared/ModuleHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useSimulator } from '@/context/SimulatorContext';
import { generatePopulation } from '@/lib/simulationEngine';
import { Users, RefreshCw, ArrowRight } from 'lucide-react';
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['hsl(187, 85%, 45%)', 'hsl(222, 47%, 40%)', 'hsl(38, 92%, 50%)', 'hsl(142, 71%, 40%)', 'hsl(280, 65%, 60%)', 'hsl(0, 72%, 51%)'];

export function PopulationGenerator() {
  const navigate = useNavigate();
  const { 
    currentPolicy, 
    populationDistribution, 
    setPopulationDistribution, 
    population, 
    setPopulation 
  } = useSimulator();

  const [isGenerating, setIsGenerating] = useState(false);

  // Local state for sliders
  const [ageDistribution, setAgeDistribution] = useState(populationDistribution.ageGroups);
  const [incomeDistribution, setIncomeDistribution] = useState(populationDistribution.incomeTiers);
  const [locationDistribution, setLocationDistribution] = useState(populationDistribution.locations);
  const [digitalLiteracy, setDigitalLiteracy] = useState(populationDistribution.digitalLiteracyMean * 100);
  const [documentReadiness, setDocumentReadiness] = useState(populationDistribution.documentReadinessMean * 100);

  const handleGenerate = () => {
    if (!currentPolicy) {
      toast.error('Please define a policy first');
      return;
    }

    setIsGenerating(true);
    
    const distribution = {
      ageGroups: ageDistribution,
      incomeTiers: incomeDistribution,
      locations: locationDistribution,
      castes: populationDistribution.castes,
      digitalLiteracyMean: digitalLiteracy / 100,
      documentReadinessMean: documentReadiness / 100,
    };

    setPopulationDistribution(distribution);

    // Generate with a slight delay to show loading state
    setTimeout(() => {
      const newPopulation = generatePopulation(currentPolicy.targetPopulation, distribution);
      setPopulation(newPopulation);
      setIsGenerating(false);
      toast.success(`Generated ${newPopulation.length.toLocaleString()} synthetic citizens`);
    }, 500);
  };

  // Auto-generate on policy change
  useEffect(() => {
    if (currentPolicy && population.length === 0) {
      handleGenerate();
    }
  }, [currentPolicy]);

  const ageChartData = Object.entries(ageDistribution).map(([key, value]) => ({
    name: key,
    value,
    fill: COLORS[Object.keys(ageDistribution).indexOf(key) % COLORS.length],
  }));

  const incomeChartData = Object.entries(incomeDistribution).map(([key, value]) => ({
    name: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value,
    fill: COLORS[Object.keys(incomeDistribution).indexOf(key) % COLORS.length],
  }));

  const locationChartData = Object.entries(locationDistribution).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    fill: COLORS[Object.keys(locationDistribution).indexOf(key) % COLORS.length],
  }));

  // Calculate population summary stats
  const populationStats = population.length > 0 ? {
    avgDigitalLiteracy: (population.reduce((sum, c) => sum + c.digitalLiteracy, 0) / population.length * 100).toFixed(1),
    avgDocReadiness: (population.reduce((sum, c) => sum + c.documentReadiness, 0) / population.length * 100).toFixed(1),
    avgTrust: (population.reduce((sum, c) => sum + c.trustCoefficient, 0) / population.length * 100).toFixed(1),
    ruralCount: population.filter(c => c.location === 'rural').length,
    urbanCount: population.filter(c => c.location === 'urban').length,
  } : null;

  return (
    <div className="animate-fade-in space-y-6">
      <ModuleHeader
        title="Synthetic Citizen Population Generator"
        description="Configure and generate a virtual population for simulation"
        actions={
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleGenerate}
              disabled={isGenerating || !currentPolicy}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
            <Button 
              onClick={() => navigate('/simulation')}
              disabled={population.length === 0}
              className="gap-2"
            >
              Run Simulation
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {!currentPolicy && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/20">
              <Users className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="font-medium text-foreground">No policy defined</p>
              <p className="text-sm text-muted-foreground">
                Please <Button variant="link" className="h-auto p-0" onClick={() => navigate('/policy')}>define a policy</Button> first to generate a population.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Distribution Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Age Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Age Group Distribution</CardTitle>
              <CardDescription>Adjust the percentage of each age group in the population</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  {Object.entries(ageDistribution).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">{key}</Label>
                        <span className="text-sm font-medium text-secondary">{value}%</span>
                      </div>
                      <Slider
                        value={[value]}
                        onValueChange={([v]) => setAgeDistribution(prev => ({ ...prev, [key]: v }))}
                        max={50}
                        step={1}
                      />
                    </div>
                  ))}
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ageChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" domain={[0, 50]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis dataKey="name" type="category" width={50} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Income & Location Distribution */}
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Income Tiers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incomeChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {incomeChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Legend 
                        formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-3">
                  {Object.entries(incomeDistribution).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="capitalize">{key.replace('_', ' ')}</span>
                        <span className="font-medium">{value}%</span>
                      </div>
                      <Slider
                        value={[value]}
                        onValueChange={([v]) => setIncomeDistribution(prev => ({ ...prev, [key]: v }))}
                        max={50}
                        step={1}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Location Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={locationChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {locationChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Legend 
                        formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-3">
                  {Object.entries(locationDistribution).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="capitalize">{key}</span>
                        <span className="font-medium">{value}%</span>
                      </div>
                      <Slider
                        value={[value]}
                        onValueChange={([v]) => setLocationDistribution(prev => ({ ...prev, [key]: v }))}
                        max={100}
                        step={1}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Capability Attributes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Capability Attributes</CardTitle>
              <CardDescription>Set mean values for population capabilities</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Mean Digital Literacy</Label>
                  <span className="text-sm font-medium text-secondary">{digitalLiteracy}%</span>
                </div>
                <Slider
                  value={[digitalLiteracy]}
                  onValueChange={([v]) => setDigitalLiteracy(v)}
                  max={100}
                  step={1}
                />
                <p className="text-xs text-muted-foreground">
                  Average ability to use digital services and applications
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Mean Document Readiness</Label>
                  <span className="text-sm font-medium text-secondary">{documentReadiness}%</span>
                </div>
                <Slider
                  value={[documentReadiness]}
                  onValueChange={([v]) => setDocumentReadiness(v)}
                  max={100}
                  step={1}
                />
                <p className="text-xs text-muted-foreground">
                  Average availability of required identity documents
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Population Summary */}
        <div className="space-y-6">
          <Card className={population.length > 0 ? 'border-secondary/30' : ''}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-secondary" />
                Population Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {population.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No population generated yet</p>
                  <Button 
                    className="mt-4" 
                    onClick={handleGenerate}
                    disabled={!currentPolicy}
                  >
                    Generate Population
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg bg-secondary/10 p-4 text-center">
                    <p className="text-3xl font-bold text-secondary">
                      {population.length.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Synthetic Citizens</p>
                  </div>

                  {populationStats && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Rural Population</span>
                        <span className="font-medium">{populationStats.ruralCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Urban Population</span>
                        <span className="font-medium">{populationStats.urbanCount.toLocaleString()}</span>
                      </div>
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Avg Digital Literacy</span>
                          <span className="font-medium">{populationStats.avgDigitalLiteracy}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Avg Document Readiness</span>
                        <span className="font-medium">{populationStats.avgDocReadiness}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Avg Trust Level</span>
                        <span className="font-medium">{populationStats.avgTrust}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {population.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Persona Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="data-table text-xs">
                  <thead>
                    <tr>
                      <th>Age</th>
                      <th className="text-right">Count</th>
                      <th className="text-right">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(ageDistribution).map(([age, _]) => {
                      const count = population.filter(c => c.ageGroup === age).length;
                      const pct = ((count / population.length) * 100).toFixed(1);
                      return (
                        <tr key={age}>
                          <td>{age}</td>
                          <td className="text-right font-medium">{count.toLocaleString()}</td>
                          <td className="text-right text-muted-foreground">{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
