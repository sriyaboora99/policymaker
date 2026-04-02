import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Policy, SyntheticCitizen, SimulationResult, PopulationDistribution, UserRole, RiskAlert } from '@/types/policy';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface SimulatorState {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  policies: Policy[];
  currentPolicy: Policy | null;
  addPolicy: (policy: Policy) => void;
  updatePolicy: (policy: Policy) => void;
  deletePolicy: (policyId: string) => void;
  setCurrentPolicy: (policy: Policy | null) => void;
  population: SyntheticCitizen[];
  populationDistribution: PopulationDistribution;
  setPopulation: (population: SyntheticCitizen[]) => void;
  setPopulationDistribution: (distribution: PopulationDistribution) => void;
  simulations: SimulationResult[];
  currentSimulation: SimulationResult | null;
  addSimulation: (result: SimulationResult) => void;
  setCurrentSimulation: (result: SimulationResult | null) => void;
  alerts: RiskAlert[];
  setAlerts: (alerts: RiskAlert[]) => void;
  comparisonPolicyId: string | null;
  setComparisonPolicyId: (id: string | null) => void;
}

const defaultDistribution: PopulationDistribution = {
  ageGroups: {
    '18-25': 20, '26-35': 25, '36-45': 20, '46-55': 15, '56-65': 12, '65+': 8,
  },
  incomeTiers: {
    'below_poverty': 25, 'low': 35, 'middle': 30, 'high': 10,
  },
  locations: {
    'rural': 65, 'urban': 35,
  },
  digitalLiteracyMean: 0.45,
  documentReadinessMean: 0.60,
};

function policyFromRow(row: any): Policy {
  return {
    id: row.id,
    name: row.name,
    version: row.version,
    targetPopulation: row.target_population,
    geographicScope: row.geographic_scope,
    eligibility: row.eligibility as any,
    documentsRequired: row.documents_required,
    benefitType: row.benefit_type,
    benefitValue: Number(row.benefit_value),
    expectedAdoptionPercentage: Number(row.expected_adoption_percentage),
    rolloutDurationDays: row.rollout_duration_days,
    assumptions: row.assumptions as any,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function simulationFromRow(row: any): SimulationResult {
  return {
    id: row.id,
    policyId: row.policy_id,
    timestamp: new Date(row.created_at),
    totalPopulation: row.total_population,
    eligiblePopulation: row.eligible_population,
    finalBeneficiaries: row.final_beneficiaries,
    adoptionRate: Number(row.adoption_rate),
    stages: row.stages as any,
    timeSeriesData: row.time_series_data as any,
    costPerBeneficiary: Number(row.cost_per_beneficiary),
    budgetUtilization: Number(row.budget_utilization),
  };
}

const SimulatorContext = createContext<SimulatorState | undefined>(undefined);

export function SimulatorProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>('policymaker');
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [currentPolicy, setCurrentPolicy] = useState<Policy | null>(null);
  const [population, setPopulation] = useState<SyntheticCitizen[]>([]);
  const [populationDistribution, setPopulationDistribution] = useState<PopulationDistribution>(defaultDistribution);
  const [simulations, setSimulations] = useState<SimulationResult[]>([]);
  const [currentSimulation, setCurrentSimulation] = useState<SimulationResult | null>(null);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [comparisonPolicyId, setComparisonPolicyId] = useState<string | null>(null);

  // Load policies and simulations from DB on mount
  useEffect(() => {
    async function load() {
      const { data: policyRows } = await supabase.from('policies').select('*').order('created_at', { ascending: false });
      if (policyRows) setPolicies(policyRows.map(policyFromRow));

      const { data: simRows } = await supabase.from('simulation_results').select('*').order('created_at', { ascending: false });
      if (simRows) setSimulations(simRows.map(simulationFromRow));
    }
    load();
  }, []);

  const addPolicy = async (policy: Policy) => {
    if (!user) return;
    setPolicies(prev => [policy, ...prev]);
    await supabase.from('policies').insert({
      id: policy.id,
      name: policy.name,
      version: policy.version,
      target_population: policy.targetPopulation,
      geographic_scope: policy.geographicScope,
      eligibility: policy.eligibility as any,
      documents_required: policy.documentsRequired,
      benefit_type: policy.benefitType,
      benefit_value: policy.benefitValue,
      expected_adoption_percentage: policy.expectedAdoptionPercentage,
      rollout_duration_days: policy.rolloutDurationDays,
      assumptions: policy.assumptions as any,
      user_id: user.id,
    });
  };

  const updatePolicy = async (policy: Policy) => {
    setPolicies(prev => prev.map(p => p.id === policy.id ? policy : p));
    await supabase.from('policies').update({
      name: policy.name,
      version: policy.version,
      target_population: policy.targetPopulation,
      geographic_scope: policy.geographicScope,
      eligibility: policy.eligibility as any,
      documents_required: policy.documentsRequired,
      benefit_type: policy.benefitType,
      benefit_value: policy.benefitValue,
      expected_adoption_percentage: policy.expectedAdoptionPercentage,
      rollout_duration_days: policy.rolloutDurationDays,
      assumptions: policy.assumptions as any,
      updated_at: new Date().toISOString(),
    }).eq('id', policy.id);
  };

  const deletePolicy = async (policyId: string) => {
    setPolicies(prev => prev.filter(p => p.id !== policyId));
    setSimulations(prev => prev.filter(s => s.policyId !== policyId));
    if (currentPolicy?.id === policyId) setCurrentPolicy(null);
    await supabase.from('simulation_results').delete().eq('policy_id', policyId);
    await supabase.from('policies').delete().eq('id', policyId);
  };

  const addSimulation = async (result: SimulationResult) => {
    if (!user) return;
    setSimulations(prev => [result, ...prev]);
    await supabase.from('simulation_results').insert({
      id: result.id,
      policy_id: result.policyId,
      total_population: result.totalPopulation,
      eligible_population: result.eligiblePopulation,
      final_beneficiaries: result.finalBeneficiaries,
      adoption_rate: result.adoptionRate,
      stages: result.stages as any,
      time_series_data: result.timeSeriesData as any,
      cost_per_beneficiary: result.costPerBeneficiary,
      budget_utilization: result.budgetUtilization,
      user_id: user.id,
    });
  };

  return (
    <SimulatorContext.Provider
      value={{
        userRole, setUserRole,
        policies, currentPolicy, addPolicy, updatePolicy, setCurrentPolicy,
        population, populationDistribution, setPopulation, setPopulationDistribution,
        simulations, currentSimulation, addSimulation, setCurrentSimulation,
        alerts, setAlerts,
        comparisonPolicyId, setComparisonPolicyId,
      }}
    >
      {children}
    </SimulatorContext.Provider>
  );
}

export function useSimulator() {
  const context = useContext(SimulatorContext);
  if (context === undefined) {
    throw new Error('useSimulator must be used within a SimulatorProvider');
  }
  return context;
}
