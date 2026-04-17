// Core types for the Policy Impact Simulator

export type BenefitType = 'cash' | 'service' | 'subsidy';
export type TrustLevel = 'low' | 'medium' | 'high';
export type RiskLevel = 'low' | 'medium' | 'high';
export type GeographicScope = 'district' | 'state';
export type UserRole = 'policymaker' | 'implementing_agency' | 'researcher';

export interface PolicyAssumptions {
  awarenessLevel: number; // 0-100
  trustLevel: TrustLevel;
  digitalAccessibility: number; // 0-100
}

export type Caste = 'general' | 'obc' | 'sc' | 'st';

export interface EligibilityCriteria {
  minAge: number;
  maxAge: number;
  maxIncome: number;
  occupations: string[];
  castes: Caste[]; // Empty array = no caste restriction (all eligible)
}

export interface Policy {
  id: string;
  name: string;
  version: number;
  targetPopulation: number;
  geographicScope: GeographicScope;
  eligibility: EligibilityCriteria;
  documentsRequired: number;
  benefitType: BenefitType;
  benefitValue: number;
  expectedAdoptionPercentage: number;
  rolloutDurationDays: number;
  assumptions: PolicyAssumptions;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyntheticCitizen {
  id: string;
  // Demographics
  ageGroup: '18-25' | '26-35' | '36-45' | '46-55' | '56-65' | '65+';
  incomeTier: 'below_poverty' | 'low' | 'middle' | 'high';
  location: 'rural' | 'urban';
  caste: Caste;
  
  // Capability attributes
  digitalLiteracy: number; // 0-1
  documentReadiness: number; // 0-1
  physicalAccessibility: number; // 0-1 (inverse of distance)
  
  // Behavioral attributes
  awarenessProbability: number; // 0-1
  trustCoefficient: number; // 0-1
  frictionTolerance: number; // 0-1
  peerInfluenceSensitivity: number; // 0-1
}

export interface PopulationDistribution {
  ageGroups: Record<SyntheticCitizen['ageGroup'], number>;
  incomeTiers: Record<SyntheticCitizen['incomeTier'], number>;
  locations: Record<SyntheticCitizen['location'], number>;
  castes: Record<Caste, number>;
  digitalLiteracyMean: number;
  documentReadinessMean: number;
}

export type AdoptionStage = 
  | 'awareness'
  | 'interest'
  | 'application'
  | 'submission'
  | 'approval'
  | 'benefit';

export interface StageMetrics {
  stage: AdoptionStage;
  entered: number;
  completed: number;
  dropOff: number;
  dropOffRate: number;
}

export interface SimulationResult {
  id: string;
  policyId: string;
  timestamp: Date;
  totalPopulation: number;
  eligiblePopulation: number;
  finalBeneficiaries: number;
  adoptionRate: number;
  stages: StageMetrics[];
  timeSeriesData: TimeSeriesDataPoint[];
  costPerBeneficiary: number;
  budgetUtilization: number;
}

export interface TimeSeriesDataPoint {
  day: number;
  awareness: number;
  interest: number;
  application: number;
  submission: number;
  approval: number;
  benefit: number;
}

export interface GapAnalysis {
  adoptionGap: number;
  budgetUtilizationGap: number;
  costPerBeneficiaryDelta: number;
  failurePoints: FailurePoint[];
}

export interface FailurePoint {
  stage: AdoptionStage;
  cause: 'awareness' | 'access' | 'trust' | 'complexity';
  severity: RiskLevel;
  description: string;
  impactPercentage: number;
}

export interface RiskAlert {
  id: string;
  level: RiskLevel;
  title: string;
  description: string;
  stage?: AdoptionStage;
  recommendation: string;
}

export interface ComparisonResult {
  baselinePolicy: Policy;
  modifiedPolicy: Policy;
  baselineResult: SimulationResult;
  modifiedResult: SimulationResult;
  improvements: {
    adoptionDelta: number;
    costDelta: number;
    efficiencyDelta: number;
  };
}
