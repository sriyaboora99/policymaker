import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Policy, SyntheticCitizen, SimulationResult, PopulationDistribution, UserRole, RiskAlert } from '@/types/policy';

interface SimulatorState {
  // Current user role
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  
  // Policies
  policies: Policy[];
  currentPolicy: Policy | null;
  addPolicy: (policy: Policy) => void;
  updatePolicy: (policy: Policy) => void;
  setCurrentPolicy: (policy: Policy | null) => void;
  
  // Population
  population: SyntheticCitizen[];
  populationDistribution: PopulationDistribution;
  setPopulation: (population: SyntheticCitizen[]) => void;
  setPopulationDistribution: (distribution: PopulationDistribution) => void;
  
  // Simulations
  simulations: SimulationResult[];
  currentSimulation: SimulationResult | null;
  addSimulation: (result: SimulationResult) => void;
  setCurrentSimulation: (result: SimulationResult | null) => void;
  
  // Alerts
  alerts: RiskAlert[];
  setAlerts: (alerts: RiskAlert[]) => void;
  
  // Comparison
  comparisonPolicyId: string | null;
  setComparisonPolicyId: (id: string | null) => void;
}

const defaultDistribution: PopulationDistribution = {
  ageGroups: {
    '18-25': 20,
    '26-35': 25,
    '36-45': 20,
    '46-55': 15,
    '56-65': 12,
    '65+': 8,
  },
  incomeTiers: {
    'below_poverty': 25,
    'low': 35,
    'middle': 30,
    'high': 10,
  },
  locations: {
    'rural': 65,
    'urban': 35,
  },
  digitalLiteracyMean: 0.45,
  documentReadinessMean: 0.60,
};

const SimulatorContext = createContext<SimulatorState | undefined>(undefined);

export function SimulatorProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>('policymaker');
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [currentPolicy, setCurrentPolicy] = useState<Policy | null>(null);
  const [population, setPopulation] = useState<SyntheticCitizen[]>([]);
  const [populationDistribution, setPopulationDistribution] = useState<PopulationDistribution>(defaultDistribution);
  const [simulations, setSimulations] = useState<SimulationResult[]>([]);
  const [currentSimulation, setCurrentSimulation] = useState<SimulationResult | null>(null);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [comparisonPolicyId, setComparisonPolicyId] = useState<string | null>(null);

  const addPolicy = (policy: Policy) => {
    setPolicies(prev => [...prev, policy]);
  };

  const updatePolicy = (policy: Policy) => {
    setPolicies(prev => prev.map(p => p.id === policy.id ? policy : p));
  };

  const addSimulation = (result: SimulationResult) => {
    setSimulations(prev => [...prev, result]);
  };

  return (
    <SimulatorContext.Provider
      value={{
        userRole,
        setUserRole,
        policies,
        currentPolicy,
        addPolicy,
        updatePolicy,
        setCurrentPolicy,
        population,
        populationDistribution,
        setPopulation,
        setPopulationDistribution,
        simulations,
        currentSimulation,
        addSimulation,
        setCurrentSimulation,
        alerts,
        setAlerts,
        comparisonPolicyId,
        setComparisonPolicyId,
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
