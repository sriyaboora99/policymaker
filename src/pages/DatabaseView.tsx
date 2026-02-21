import { useState, useMemo } from 'react';
import { ModuleHeader } from '@/components/shared/ModuleHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { useSimulator } from '@/context/SimulatorContext';
import { Policy, SimulationResult, SyntheticCitizen, RiskLevel } from '@/types/policy';
import { Search, ArrowUpDown, Database, FileText, Play, Users, Eye } from 'lucide-react';

type SortDir = 'asc' | 'desc';

function useSortableData<T>(data: T[], defaultKey: keyof T) {
  const [sortKey, setSortKey] = useState<keyof T>(defaultKey);
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const toggleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return { sorted, sortKey, sortDir, toggleSort };
}

function SortHeader({ label, active, dir, onClick }: { label: string; active: boolean; dir: SortDir; onClick: () => void }) {
  return (
    <TableHead>
      <button onClick={onClick} className="flex items-center gap-1 hover:text-foreground transition-colors">
        {label}
        <ArrowUpDown className={`h-3 w-3 ${active ? 'text-secondary' : 'text-muted-foreground/50'}`} />
      </button>
    </TableHead>
  );
}

// --- Policy Detail Modal ---
function PolicyDetailModal({ policy, open, onClose }: { policy: Policy | null; open: boolean; onClose: () => void }) {
  if (!policy) return null;
  const fields = [
    ['Policy ID', policy.id],
    ['Name', policy.name],
    ['Version', policy.version],
    ['Geographic Scope', policy.geographicScope],
    ['Target Population', policy.targetPopulation.toLocaleString()],
    ['Age Range', `${policy.eligibility.minAge}–${policy.eligibility.maxAge}`],
    ['Max Income', `₹${policy.eligibility.maxIncome.toLocaleString()}`],
    ['Benefit Type', policy.benefitType],
    ['Benefit Value', `₹${policy.benefitValue.toLocaleString()}`],
    ['Documents Required', policy.documentsRequired],
    ['Expected Adoption', `${policy.expectedAdoptionPercentage}%`],
    ['Rollout Duration', `${policy.rolloutDurationDays} days`],
    ['Awareness Level', `${policy.assumptions.awarenessLevel}%`],
    ['Trust Level', policy.assumptions.trustLevel],
    ['Digital Accessibility', `${policy.assumptions.digitalAccessibility}%`],
    ['Created', policy.createdAt instanceof Date ? policy.createdAt.toLocaleString() : String(policy.createdAt)],
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-secondary" />
            {policy.name} — v{policy.version}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {fields.map(([label, value]) => (
            <div key={label as string} className="flex justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground">{label as string}</span>
              <span className="text-sm font-medium capitalize">{String(value)}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Simulation Detail Modal ---
function SimulationDetailModal({ sim, open, onClose }: { sim: SimulationResult | null; open: boolean; onClose: () => void }) {
  if (!sim) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-secondary" />
            Simulation {sim.id}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {[
            ['Run ID', sim.id],
            ['Policy ID', sim.policyId],
            ['Total Population', sim.totalPopulation.toLocaleString()],
            ['Eligible Population', sim.eligiblePopulation.toLocaleString()],
            ['Final Beneficiaries', sim.finalBeneficiaries.toLocaleString()],
            ['Adoption Rate', `${sim.adoptionRate.toFixed(1)}%`],
            ['Cost per Beneficiary', `₹${sim.costPerBeneficiary.toFixed(0)}`],
            ['Budget Utilization', `${sim.budgetUtilization.toFixed(1)}%`],
            ['Timestamp', sim.timestamp instanceof Date ? sim.timestamp.toLocaleString() : String(sim.timestamp)],
          ].map(([label, value]) => (
            <div key={label as string} className="flex justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground">{label as string}</span>
              <span className="text-sm font-medium">{String(value)}</span>
            </div>
          ))}
          <div className="pt-4">
            <p className="text-sm font-medium mb-2">Stage Breakdown</p>
            {sim.stages.map(s => (
              <div key={s.stage} className="flex justify-between py-1 text-sm">
                <span className="capitalize text-muted-foreground">{s.stage}</span>
                <span>{s.completed.toLocaleString()} <span className="text-muted-foreground text-xs">({s.dropOffRate.toFixed(1)}% drop)</span></span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Persona types for the table ---
interface PersonaRow {
  type: string;
  trustLevel: string;
  awarenessLevel: string;
  digitalLiteracy: string;
  populationShare: string;
  count: number;
}

export function DatabaseView() {
  const { policies, simulations, population, alerts } = useSimulator();

  const [filter, setFilter] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [selectedSim, setSelectedSim] = useState<SimulationResult | null>(null);

  // Derive persona rows from population
  const personaRows: PersonaRow[] = useMemo(() => {
    if (population.length === 0) return [];
    const groups: Record<string, { count: number; trust: number; awareness: number; digital: number }> = {};

    for (const c of population) {
      const key = `${c.ageGroup}-${c.incomeTier}-${c.location}`;
      if (!groups[key]) groups[key] = { count: 0, trust: 0, awareness: 0, digital: 0 };
      groups[key].count++;
      groups[key].trust += c.trustCoefficient;
      groups[key].awareness += c.awarenessProbability;
      groups[key].digital += c.digitalLiteracy;
    }

    return Object.entries(groups).map(([key, g]) => ({
      type: key,
      trustLevel: (g.trust / g.count).toFixed(2),
      awarenessLevel: (g.awareness / g.count * 100).toFixed(1),
      digitalLiteracy: (g.digital / g.count * 100).toFixed(1),
      populationShare: ((g.count / population.length) * 100).toFixed(1),
      count: g.count,
    }));
  }, [population]);

  // Get risk level for simulation
  const getSimRisk = (sim: SimulationResult): RiskLevel => {
    if (sim.adoptionRate < 20) return 'high';
    if (sim.adoptionRate < 40) return 'medium';
    return 'low';
  };

  // Filtered data
  const filteredPolicies = policies.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase()) ||
    p.id.toLowerCase().includes(filter.toLowerCase())
  );

  const filteredSims = simulations.filter(s =>
    s.id.toLowerCase().includes(filter.toLowerCase()) ||
    s.policyId.toLowerCase().includes(filter.toLowerCase())
  );

  const filteredPersonas = personaRows.filter(p =>
    p.type.toLowerCase().includes(filter.toLowerCase())
  );

  // Sort hooks
  const policiesSort = useSortableData(filteredPolicies, 'createdAt' as keyof Policy);
  const simsSort = useSortableData(filteredSims, 'timestamp' as keyof SimulationResult);

  return (
    <div className="animate-fade-in space-y-6">
      <ModuleHeader
        title="Database"
        description="System transparency layer — read-only view of all stored records"
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{policies.length}</p>
              <p className="text-sm text-muted-foreground">Policies</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Play className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{simulations.length}</p>
              <p className="text-sm text-muted-foreground">Simulation Runs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Users className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{population.length.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Personas Generated</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Filter records..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="policies">
        <TabsList>
          <TabsTrigger value="policies" className="gap-2">
            <FileText className="h-4 w-4" /> Policies
          </TabsTrigger>
          <TabsTrigger value="simulations" className="gap-2">
            <Play className="h-4 w-4" /> Simulation Runs
          </TabsTrigger>
          <TabsTrigger value="personas" className="gap-2">
            <Users className="h-4 w-4" /> Personas
          </TabsTrigger>
        </TabsList>

        {/* Policies Table */}
        <TabsContent value="policies">
          <Card>
            <CardContent className="p-0">
              {filteredPolicies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Database className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">No policies recorded yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Create a policy to see it here</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortHeader label="Policy ID" active={policiesSort.sortKey === 'id'} dir={policiesSort.sortDir} onClick={() => policiesSort.toggleSort('id')} />
                      <SortHeader label="Policy Name" active={policiesSort.sortKey === 'name'} dir={policiesSort.sortDir} onClick={() => policiesSort.toggleSort('name')} />
                      <TableHead>Eligibility Rules</TableHead>
                      <TableHead>Benefit Type</TableHead>
                      <SortHeader label="Benefit Value" active={policiesSort.sortKey === 'benefitValue'} dir={policiesSort.sortDir} onClick={() => policiesSort.toggleSort('benefitValue')} />
                      <TableHead>Docs Req.</TableHead>
                      <SortHeader label="Version" active={policiesSort.sortKey === 'version'} dir={policiesSort.sortDir} onClick={() => policiesSort.toggleSort('version')} />
                      <SortHeader label="Created" active={policiesSort.sortKey === 'createdAt'} dir={policiesSort.sortDir} onClick={() => policiesSort.toggleSort('createdAt')} />
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policiesSort.sorted.map(p => (
                      <TableRow key={p.id} className="cursor-pointer" onClick={() => setSelectedPolicy(p)}>
                        <TableCell className="font-mono text-xs">{p.id.slice(0, 12)}…</TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          Age {p.eligibility.minAge}–{p.eligibility.maxAge}, ≤₹{p.eligibility.maxIncome.toLocaleString()}
                        </TableCell>
                        <TableCell className="capitalize">{p.benefitType}</TableCell>
                        <TableCell>₹{p.benefitValue.toLocaleString()}</TableCell>
                        <TableCell>{p.documentsRequired}</TableCell>
                        <TableCell>v{p.version}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {p.createdAt instanceof Date ? p.createdAt.toLocaleDateString() : '—'}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Simulations Table */}
        <TabsContent value="simulations">
          <Card>
            <CardContent className="p-0">
              {filteredSims.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Database className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">No simulation runs recorded</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortHeader label="Run ID" active={simsSort.sortKey === 'id'} dir={simsSort.sortDir} onClick={() => simsSort.toggleSort('id')} />
                      <TableHead>Policy ID</TableHead>
                      <SortHeader label="Population" active={simsSort.sortKey === 'totalPopulation'} dir={simsSort.sortDir} onClick={() => simsSort.toggleSort('totalPopulation')} />
                      <SortHeader label="Adoption %" active={simsSort.sortKey === 'adoptionRate'} dir={simsSort.sortDir} onClick={() => simsSort.toggleSort('adoptionRate')} />
                      <TableHead>Risk Level</TableHead>
                      <SortHeader label="Timestamp" active={simsSort.sortKey === 'timestamp'} dir={simsSort.sortDir} onClick={() => simsSort.toggleSort('timestamp')} />
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {simsSort.sorted.map(s => (
                      <TableRow key={s.id} className="cursor-pointer" onClick={() => setSelectedSim(s)}>
                        <TableCell className="font-mono text-xs">{s.id.slice(0, 12)}…</TableCell>
                        <TableCell className="font-mono text-xs">{s.policyId.slice(0, 12)}…</TableCell>
                        <TableCell>{s.totalPopulation.toLocaleString()}</TableCell>
                        <TableCell className="font-medium">{s.adoptionRate.toFixed(1)}%</TableCell>
                        <TableCell><RiskBadge level={getSimRisk(s)} size="sm" /></TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {s.timestamp instanceof Date ? s.timestamp.toLocaleString() : '—'}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personas Table */}
        <TabsContent value="personas">
          <Card>
            <CardContent className="p-0">
              {filteredPersonas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Database className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">No personas generated yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Persona Type</TableHead>
                      <TableHead>Trust Level</TableHead>
                      <TableHead>Awareness Level</TableHead>
                      <TableHead>Digital Literacy</TableHead>
                      <TableHead>Population Share</TableHead>
                      <TableHead>Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPersonas.sort((a, b) => b.count - a.count).map(p => (
                      <TableRow key={p.type}>
                        <TableCell className="font-mono text-xs">{p.type}</TableCell>
                        <TableCell>{p.trustLevel}</TableCell>
                        <TableCell>{p.awarenessLevel}%</TableCell>
                        <TableCell>{p.digitalLiteracy}%</TableCell>
                        <TableCell>{p.populationShare}%</TableCell>
                        <TableCell className="font-medium">{p.count.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Modals */}
      <PolicyDetailModal policy={selectedPolicy} open={!!selectedPolicy} onClose={() => setSelectedPolicy(null)} />
      <SimulationDetailModal sim={selectedSim} open={!!selectedSim} onClose={() => setSelectedSim(null)} />

      {/* Disclaimer */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Transparency Layer</p>
              <p className="text-sm text-muted-foreground mt-1">
                This section provides read-only visibility into all system records. 
                Data can only be modified through the application's dedicated forms. 
                All records update in real-time as policies are created or simulations are run.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
