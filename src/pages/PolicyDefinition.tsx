import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ModuleHeader } from '@/components/shared/ModuleHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSimulator } from '@/context/SimulatorContext';
import { Policy, BenefitType, TrustLevel, GeographicScope, Caste } from '@/types/policy';
import { Save, Plus, FileText, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const ALL_CASTES: { value: Caste; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'obc', label: 'OBC' },
  { value: 'sc', label: 'SC' },
  { value: 'st', label: 'ST' },
];

const policySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  targetPopulation: z.number().min(100, 'Target population must be at least 100'),
  geographicScope: z.enum(['district', 'state']),
  minAge: z.number().min(0).max(100),
  maxAge: z.number().min(0).max(100),
  maxIncome: z.number().min(0),
  documentsRequired: z.number().min(0).max(20),
  benefitType: z.enum(['cash', 'service', 'subsidy']),
  benefitValue: z.number().min(0),
  expectedAdoptionPercentage: z.number().min(0).max(100),
  rolloutDurationDays: z.number().min(30).max(365),
  awarenessLevel: z.number().min(0).max(100),
  trustLevel: z.enum(['low', 'medium', 'high']),
  digitalAccessibility: z.number().min(0).max(100),
});

type PolicyFormData = z.infer<typeof policySchema>;

export function PolicyDefinition() {
  const navigate = useNavigate();
  const { policies, currentPolicy, addPolicy, setCurrentPolicy } = useSimulator();
  const [awarenessLevel, setAwarenessLevel] = useState(currentPolicy?.assumptions.awarenessLevel ?? 50);
  const [digitalAccessibility, setDigitalAccessibility] = useState(currentPolicy?.assumptions.digitalAccessibility ?? 60);
  const [selectedCastes, setSelectedCastes] = useState<Caste[]>(currentPolicy?.eligibility.castes ?? []);

  const toggleCaste = (caste: Caste) => {
    setSelectedCastes(prev =>
      prev.includes(caste) ? prev.filter(c => c !== caste) : [...prev, caste]
    );
  };

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PolicyFormData>({
    resolver: zodResolver(policySchema),
    defaultValues: currentPolicy ? {
      name: currentPolicy.name,
      targetPopulation: currentPolicy.targetPopulation,
      geographicScope: currentPolicy.geographicScope,
      minAge: currentPolicy.eligibility.minAge,
      maxAge: currentPolicy.eligibility.maxAge,
      maxIncome: currentPolicy.eligibility.maxIncome,
      documentsRequired: currentPolicy.documentsRequired,
      benefitType: currentPolicy.benefitType,
      benefitValue: currentPolicy.benefitValue,
      expectedAdoptionPercentage: currentPolicy.expectedAdoptionPercentage,
      rolloutDurationDays: currentPolicy.rolloutDurationDays,
      awarenessLevel: currentPolicy.assumptions.awarenessLevel,
      trustLevel: currentPolicy.assumptions.trustLevel,
      digitalAccessibility: currentPolicy.assumptions.digitalAccessibility,
    } : {
      name: '',
      targetPopulation: 100000,
      geographicScope: 'district',
      minAge: 18,
      maxAge: 65,
      maxIncome: 200000,
      documentsRequired: 5,
      benefitType: 'cash',
      benefitValue: 5000,
      expectedAdoptionPercentage: 60,
      rolloutDurationDays: 180,
      awarenessLevel: 50,
      trustLevel: 'medium',
      digitalAccessibility: 60,
    },
  });

  const onSubmit = (data: PolicyFormData) => {
    const policy: Policy = {
      id: `policy-${Date.now()}`,
      name: data.name,
      version: currentPolicy ? currentPolicy.version + 1 : 1,
      targetPopulation: data.targetPopulation,
      geographicScope: data.geographicScope as GeographicScope,
      eligibility: {
        minAge: data.minAge,
        maxAge: data.maxAge,
        maxIncome: data.maxIncome,
        occupations: [],
        castes: selectedCastes,
      },
      documentsRequired: data.documentsRequired,
      benefitType: data.benefitType as BenefitType,
      benefitValue: data.benefitValue,
      expectedAdoptionPercentage: data.expectedAdoptionPercentage,
      rolloutDurationDays: data.rolloutDurationDays,
      assumptions: {
        awarenessLevel: awarenessLevel,
        trustLevel: data.trustLevel as TrustLevel,
        digitalAccessibility: digitalAccessibility,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addPolicy(policy);
    setCurrentPolicy(policy);
    toast.success('Policy saved successfully', {
      description: `${policy.name} v${policy.version} is now ready for simulation`,
    });
  };

  const duplicatePolicy = (policy: Policy) => {
    const newPolicy: Policy = {
      ...policy,
      id: `policy-${Date.now()}`,
      name: `${policy.name} (Copy)`,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addPolicy(newPolicy);
    setCurrentPolicy(newPolicy);
    toast.success('Policy duplicated');
  };

  return (
    <div className="animate-fade-in space-y-6">
      <ModuleHeader
        title="Policy Definition Engine"
        description="Create and configure government schemes with structured parameters"
        actions={
          <Button onClick={handleSubmit(onSubmit)} className="gap-2">
            <Save className="h-4 w-4" />
            Save Policy
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>Define the scheme identity and scope</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 input-group">
                <Label htmlFor="name">Scheme Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., PM Kisan Samman Nidhi"
                  {...register('name')}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="input-group">
                <Label htmlFor="targetPopulation">Target Population</Label>
                <Input
                  id="targetPopulation"
                  type="number"
                  {...register('targetPopulation', { valueAsNumber: true })}
                />
              </div>

              <div className="input-group">
                <Label htmlFor="geographicScope">Geographic Scope</Label>
                <Select
                  defaultValue={watch('geographicScope')}
                  onValueChange={(v) => setValue('geographicScope', v as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="district">District Level</SelectItem>
                    <SelectItem value="state">State Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Eligibility Criteria */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Eligibility Criteria</CardTitle>
              <CardDescription>Define who qualifies for this scheme</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="input-group">
                <Label htmlFor="minAge">Minimum Age</Label>
                <Input
                  id="minAge"
                  type="number"
                  {...register('minAge', { valueAsNumber: true })}
                />
              </div>

              <div className="input-group">
                <Label htmlFor="maxAge">Maximum Age</Label>
                <Input
                  id="maxAge"
                  type="number"
                  {...register('maxAge', { valueAsNumber: true })}
                />
              </div>

              <div className="input-group">
                <Label htmlFor="maxIncome">Max Annual Income (₹)</Label>
                <Input
                  id="maxIncome"
                  type="number"
                  {...register('maxIncome', { valueAsNumber: true })}
                />
              </div>

              <div className="input-group">
                <Label htmlFor="documentsRequired">Documents Required</Label>
                <Input
                  id="documentsRequired"
                  type="number"
                  min={0}
                  max={20}
                  {...register('documentsRequired', { valueAsNumber: true })}
                />
              </div>

              <div className="input-group sm:col-span-3">
                <Label>Eligible Castes</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Select applicable categories. Leave all unchecked for no caste restriction.
                </p>
                <div className="flex flex-wrap gap-4">
                  {ALL_CASTES.map(({ value, label }) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 cursor-pointer rounded-md border px-3 py-2 hover:border-secondary transition-colors"
                    >
                      <Checkbox
                        checked={selectedCastes.includes(value)}
                        onCheckedChange={() => toggleCaste(value)}
                      />
                      <span className="text-sm font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefit Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Benefit Details</CardTitle>
              <CardDescription>Define what beneficiaries will receive</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="input-group">
                <Label htmlFor="benefitType">Benefit Type</Label>
                <Select
                  defaultValue={watch('benefitType')}
                  onValueChange={(v) => setValue('benefitType', v as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash Transfer</SelectItem>
                    <SelectItem value="service">Service Delivery</SelectItem>
                    <SelectItem value="subsidy">Subsidy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="input-group">
                <Label htmlFor="benefitValue">Benefit Value (₹)</Label>
                <Input
                  id="benefitValue"
                  type="number"
                  {...register('benefitValue', { valueAsNumber: true })}
                />
              </div>

              <div className="input-group">
                <Label htmlFor="expectedAdoptionPercentage">Expected Adoption (%)</Label>
                <Input
                  id="expectedAdoptionPercentage"
                  type="number"
                  min={0}
                  max={100}
                  {...register('expectedAdoptionPercentage', { valueAsNumber: true })}
                />
              </div>

              <div className="input-group">
                <Label htmlFor="rolloutDurationDays">Rollout Duration (days)</Label>
                <Input
                  id="rolloutDurationDays"
                  type="number"
                  min={30}
                  max={365}
                  {...register('rolloutDurationDays', { valueAsNumber: true })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Policy Assumptions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Policy Assumptions</CardTitle>
              <CardDescription>Define environmental and behavioral factors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Awareness Level</Label>
                  <span className="text-sm font-medium text-secondary">{awarenessLevel}%</span>
                </div>
                <Slider
                  value={[awarenessLevel]}
                  onValueChange={([v]) => {
                    setAwarenessLevel(v);
                    setValue('awarenessLevel', v);
                  }}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Estimated percentage of target population aware of the scheme
                </p>
              </div>

              <div className="input-group">
                <Label htmlFor="trustLevel">Trust Level</Label>
                <Select
                  defaultValue={watch('trustLevel')}
                  onValueChange={(v) => setValue('trustLevel', v as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Skeptical population</SelectItem>
                    <SelectItem value="medium">Medium - Neutral attitude</SelectItem>
                    <SelectItem value="high">High - Trusting population</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Digital Accessibility</Label>
                  <span className="text-sm font-medium text-secondary">{digitalAccessibility}%</span>
                </div>
                <Slider
                  value={[digitalAccessibility]}
                  onValueChange={([v]) => {
                    setDigitalAccessibility(v);
                    setValue('digitalAccessibility', v);
                  }}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Percentage of population with access to digital application channels
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Saved Policies */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Saved Policies</CardTitle>
              <CardDescription>
                {policies.length} policy version{policies.length !== 1 ? 's' : ''} available
              </CardDescription>
            </CardHeader>
            <CardContent>
              {policies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">No policies defined yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Create your first policy above</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {policies.map((policy) => (
                    <div
                      key={policy.id}
                      className={`rounded-lg border p-3 cursor-pointer transition-all hover:border-secondary ${
                        currentPolicy?.id === policy.id ? 'border-secondary bg-secondary/5' : ''
                      }`}
                      onClick={() => setCurrentPolicy(policy)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{policy.name}</p>
                          <p className="text-xs text-muted-foreground">Version {policy.version}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicatePolicy(policy);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs">
                          {policy.geographicScope}
                        </span>
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs">
                          ₹{policy.benefitValue.toLocaleString()}
                        </span>
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs">
                          {policy.targetPopulation.toLocaleString()} target
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {currentPolicy && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuration Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target Population</span>
                  <span className="font-medium">{currentPolicy.targetPopulation.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Beneficiaries</span>
                  <span className="font-medium">
                    {Math.floor(currentPolicy.targetPopulation * currentPolicy.expectedAdoptionPercentage / 100).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Budget</span>
                  <span className="font-medium">
                    ₹{(currentPolicy.benefitValue * currentPolicy.targetPopulation * currentPolicy.expectedAdoptionPercentage / 100).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Friction Score</span>
                  <span className="font-medium">
                    {((currentPolicy.documentsRequired / 10) * 0.4 + 
                      (1 - currentPolicy.assumptions.digitalAccessibility / 100) * 0.3 +
                      (currentPolicy.assumptions.trustLevel === 'high' ? 0 : 
                       currentPolicy.assumptions.trustLevel === 'medium' ? 0.09 : 0.18)).toFixed(2)}
                  </span>
                </div>
                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                  onClick={() => navigate('/population')}
                >
                  Continue to Population →
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
