import { Policy, SyntheticCitizen, SimulationResult, StageMetrics, TimeSeriesDataPoint, AdoptionStage, PopulationDistribution, RiskAlert, FailurePoint, GapAnalysis } from '@/types/policy';

// Generate synthetic citizens based on distribution
export function generatePopulation(
  size: number,
  distribution: PopulationDistribution
): SyntheticCitizen[] {
  const citizens: SyntheticCitizen[] = [];
  const ageGroupKeys = Object.keys(distribution.ageGroups) as SyntheticCitizen['ageGroup'][];
  const incomeTierKeys = Object.keys(distribution.incomeTiers) as SyntheticCitizen['incomeTier'][];
  const locationKeys = Object.keys(distribution.locations) as SyntheticCitizen['location'][];

  for (let i = 0; i < size; i++) {
    const ageGroup = weightedRandom(ageGroupKeys, Object.values(distribution.ageGroups));
    const incomeTier = weightedRandom(incomeTierKeys, Object.values(distribution.incomeTiers));
    const location = weightedRandom(locationKeys, Object.values(distribution.locations));

    // Digital literacy correlates with age and income
    const ageFactor = getAgeFactor(ageGroup);
    const incomeFactor = getIncomeFactor(incomeTier);
    const locationFactor = location === 'urban' ? 1.2 : 0.8;

    const digitalLiteracy = clamp(
      gaussianRandom(distribution.digitalLiteracyMean, 0.2) * ageFactor * incomeFactor * locationFactor,
      0, 1
    );

    const documentReadiness = clamp(
      gaussianRandom(distribution.documentReadinessMean, 0.15) * incomeFactor,
      0, 1
    );

    const physicalAccessibility = location === 'urban' ? 
      gaussianRandom(0.8, 0.15) : 
      gaussianRandom(0.5, 0.2);

    citizens.push({
      id: `citizen-${i}`,
      ageGroup,
      incomeTier,
      location,
      digitalLiteracy,
      documentReadiness: clamp(documentReadiness, 0, 1),
      physicalAccessibility: clamp(physicalAccessibility, 0, 1),
      awarenessProbability: Math.random() * 0.3 + 0.1,
      trustCoefficient: gaussianRandom(0.5, 0.2),
      frictionTolerance: gaussianRandom(0.4, 0.2),
      peerInfluenceSensitivity: gaussianRandom(0.5, 0.15),
    });
  }

  return citizens;
}

// Run adoption simulation
export function runSimulation(
  policy: Policy,
  population: SyntheticCitizen[]
): SimulationResult {
  const stages: AdoptionStage[] = ['awareness', 'interest', 'application', 'submission', 'approval', 'benefit'];
  const stageMetrics: StageMetrics[] = [];
  const timeSeriesData: TimeSeriesDataPoint[] = [];

  // Filter eligible population
  const eligiblePopulation = population.filter(citizen => 
    isEligible(citizen, policy.eligibility)
  );

  // Track citizens through stages
  let currentCohort = [...eligiblePopulation];
  const stageCounts: Record<AdoptionStage, number[]> = {
    awareness: [],
    interest: [],
    application: [],
    submission: [],
    approval: [],
    benefit: [],
  };

  // Simulate over time
  const totalDays = policy.rolloutDurationDays;
  const dailyAwarenessGrowth = policy.assumptions.awarenessLevel / 100 / (totalDays * 0.3);
  
  let cumulativeAwareness = 0;
  let cumulativeInterest = 0;
  let cumulativeApplication = 0;
  let cumulativeSubmission = 0;
  let cumulativeApproval = 0;
  let cumulativeBenefit = 0;

  for (let day = 0; day <= totalDays; day += Math.max(1, Math.floor(totalDays / 50))) {
    const dayProgress = day / totalDays;
    
    // Awareness grows over time with peer effects
    const peerEffect = 1 + (cumulativeAwareness / eligiblePopulation.length) * 0.3;
    const awarenessToday = eligiblePopulation.filter(c => {
      const baseProb = policy.assumptions.awarenessLevel / 100 * dayProgress * peerEffect;
      return Math.random() < baseProb * (0.5 + c.awarenessProbability);
    }).length;
    cumulativeAwareness = Math.min(awarenessToday, eligiblePopulation.length);

    // Stage transitions with friction
    const trustMultiplier = getTrustMultiplier(policy.assumptions.trustLevel);
    const frictionScore = calculateFrictionScore(policy);

    cumulativeInterest = Math.floor(cumulativeAwareness * (0.6 + trustMultiplier * 0.2));
    cumulativeApplication = Math.floor(cumulativeInterest * (0.7 - frictionScore * 0.3) * (policy.assumptions.digitalAccessibility / 100));
    cumulativeSubmission = Math.floor(cumulativeApplication * (0.8 - policy.documentsRequired * 0.05));
    cumulativeApproval = Math.floor(cumulativeSubmission * 0.85);
    cumulativeBenefit = Math.floor(cumulativeApproval * 0.95 * Math.min(1, dayProgress * 1.5));

    timeSeriesData.push({
      day,
      awareness: cumulativeAwareness,
      interest: cumulativeInterest,
      application: cumulativeApplication,
      submission: cumulativeSubmission,
      approval: cumulativeApproval,
      benefit: cumulativeBenefit,
    });
  }

  // Calculate final stage metrics
  const finalPoint = timeSeriesData[timeSeriesData.length - 1];
  const stageData: [AdoptionStage, number][] = [
    ['awareness', finalPoint.awareness],
    ['interest', finalPoint.interest],
    ['application', finalPoint.application],
    ['submission', finalPoint.submission],
    ['approval', finalPoint.approval],
    ['benefit', finalPoint.benefit],
  ];

  for (let i = 0; i < stageData.length; i++) {
    const [stage, count] = stageData[i];
    const entered = i === 0 ? eligiblePopulation.length : stageData[i - 1][1];
    const dropOff = entered - count;
    
    stageMetrics.push({
      stage,
      entered,
      completed: count,
      dropOff,
      dropOffRate: entered > 0 ? (dropOff / entered) * 100 : 0,
    });
  }

  const totalBudget = policy.benefitValue * policy.targetPopulation * (policy.expectedAdoptionPercentage / 100);
  const actualCost = policy.benefitValue * finalPoint.benefit;
  const costPerBeneficiary = finalPoint.benefit > 0 ? actualCost / finalPoint.benefit : 0;

  return {
    id: `sim-${Date.now()}`,
    policyId: policy.id,
    timestamp: new Date(),
    totalPopulation: population.length,
    eligiblePopulation: eligiblePopulation.length,
    finalBeneficiaries: finalPoint.benefit,
    adoptionRate: eligiblePopulation.length > 0 ? (finalPoint.benefit / eligiblePopulation.length) * 100 : 0,
    stages: stageMetrics,
    timeSeriesData,
    costPerBeneficiary,
    budgetUtilization: totalBudget > 0 ? (actualCost / totalBudget) * 100 : 0,
  };
}

// Analyze gaps between expected and simulated outcomes
export function analyzeGaps(policy: Policy, result: SimulationResult): GapAnalysis {
  const expectedBeneficiaries = Math.floor(
    result.eligiblePopulation * (policy.expectedAdoptionPercentage / 100)
  );
  const adoptionGap = expectedBeneficiaries - result.finalBeneficiaries;
  const adoptionGapPercent = expectedBeneficiaries > 0 
    ? (adoptionGap / expectedBeneficiaries) * 100 
    : 0;

  const expectedBudget = policy.benefitValue * expectedBeneficiaries;
  const actualBudget = policy.benefitValue * result.finalBeneficiaries;
  const budgetUtilizationGap = expectedBudget > 0 
    ? ((expectedBudget - actualBudget) / expectedBudget) * 100 
    : 0;

  const expectedCostPerBeneficiary = policy.benefitValue;
  const costPerBeneficiaryDelta = result.costPerBeneficiary - expectedCostPerBeneficiary;

  // Identify failure points
  const failurePoints: FailurePoint[] = [];
  
  for (const stage of result.stages) {
    if (stage.dropOffRate > 20) {
      const cause = identifyCause(stage.stage, stage.dropOffRate, policy);
      failurePoints.push({
        stage: stage.stage,
        cause,
        severity: stage.dropOffRate > 40 ? 'high' : stage.dropOffRate > 25 ? 'medium' : 'low',
        description: getCauseDescription(stage.stage, cause),
        impactPercentage: stage.dropOffRate,
      });
    }
  }

  failurePoints.sort((a, b) => b.impactPercentage - a.impactPercentage);

  return {
    adoptionGap: adoptionGapPercent,
    budgetUtilizationGap,
    costPerBeneficiaryDelta,
    failurePoints,
  };
}

// Generate risk alerts based on simulation results
export function generateAlerts(policy: Policy, result: SimulationResult, gaps: GapAnalysis): RiskAlert[] {
  const alerts: RiskAlert[] = [];

  // Adoption below baseline
  if (result.adoptionRate < policy.expectedAdoptionPercentage * 0.7) {
    alerts.push({
      id: `alert-adoption-${Date.now()}`,
      level: 'high',
      title: 'Adoption Significantly Below Target',
      description: `Simulated adoption rate (${result.adoptionRate.toFixed(1)}%) is significantly below the expected ${policy.expectedAdoptionPercentage}%`,
      recommendation: 'Consider reducing documentation requirements or increasing awareness campaigns',
    });
  }

  // High drop-off at specific stages
  for (const stage of result.stages) {
    if (stage.dropOffRate > 35) {
      alerts.push({
        id: `alert-stage-${stage.stage}-${Date.now()}`,
        level: stage.dropOffRate > 50 ? 'high' : 'medium',
        title: `High Drop-off at ${stage.stage.charAt(0).toUpperCase() + stage.stage.slice(1)} Stage`,
        description: `${stage.dropOffRate.toFixed(1)}% of potential beneficiaries are lost at the ${stage.stage} stage`,
        stage: stage.stage,
        recommendation: getStageRecommendation(stage.stage),
      });
    }
  }

  // High cost with low impact
  if (result.costPerBeneficiary > policy.benefitValue * 1.5 && result.adoptionRate < 30) {
    alerts.push({
      id: `alert-cost-${Date.now()}`,
      level: 'high',
      title: 'High Cost, Low Impact',
      description: `Cost per beneficiary (₹${result.costPerBeneficiary.toFixed(0)}) is high while adoption remains low`,
      recommendation: 'Re-evaluate scheme design to improve cost-effectiveness',
    });
  }

  // Low digital accessibility impact
  if (policy.assumptions.digitalAccessibility < 50 && gaps.failurePoints.some(f => f.stage === 'application')) {
    alerts.push({
      id: `alert-digital-${Date.now()}`,
      level: 'medium',
      title: 'Digital Access Barrier',
      description: 'Low digital accessibility is contributing to application drop-offs',
      stage: 'application',
      recommendation: 'Consider adding offline application channels',
    });
  }

  return alerts;
}

// Helper functions
function weightedRandom<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * total;
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) return items[i];
  }
  
  return items[items.length - 1];
}

function gaussianRandom(mean: number, std: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * std;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getAgeFactor(ageGroup: SyntheticCitizen['ageGroup']): number {
  const factors: Record<SyntheticCitizen['ageGroup'], number> = {
    '18-25': 1.3,
    '26-35': 1.2,
    '36-45': 1.0,
    '46-55': 0.8,
    '56-65': 0.6,
    '65+': 0.4,
  };
  return factors[ageGroup];
}

function getIncomeFactor(tier: SyntheticCitizen['incomeTier']): number {
  const factors: Record<SyntheticCitizen['incomeTier'], number> = {
    'below_poverty': 0.5,
    'low': 0.7,
    'middle': 1.0,
    'high': 1.2,
  };
  return factors[tier];
}

function getTrustMultiplier(level: 'low' | 'medium' | 'high'): number {
  return level === 'high' ? 1.0 : level === 'medium' ? 0.7 : 0.4;
}

function calculateFrictionScore(policy: Policy): number {
  const docScore = Math.min(policy.documentsRequired / 10, 1) * 0.4;
  const accessScore = (1 - policy.assumptions.digitalAccessibility / 100) * 0.3;
  const trustScore = (1 - getTrustMultiplier(policy.assumptions.trustLevel)) * 0.3;
  return docScore + accessScore + trustScore;
}

function isEligible(citizen: SyntheticCitizen, criteria: Policy['eligibility']): boolean {
  const ageRanges: Record<SyntheticCitizen['ageGroup'], [number, number]> = {
    '18-25': [18, 25],
    '26-35': [26, 35],
    '36-45': [36, 45],
    '46-55': [46, 55],
    '56-65': [56, 65],
    '65+': [65, 100],
  };
  
  const [minAge, maxAge] = ageRanges[citizen.ageGroup];
  const avgAge = (minAge + maxAge) / 2;
  
  return avgAge >= criteria.minAge && avgAge <= criteria.maxAge;
}

function identifyCause(
  stage: AdoptionStage, 
  dropOffRate: number, 
  policy: Policy
): 'awareness' | 'access' | 'trust' | 'complexity' {
  if (stage === 'awareness') return 'awareness';
  if (stage === 'application' && policy.assumptions.digitalAccessibility < 60) return 'access';
  if (stage === 'submission' && policy.documentsRequired > 5) return 'complexity';
  if (stage === 'interest' || stage === 'approval') return 'trust';
  return 'complexity';
}

function getCauseDescription(stage: AdoptionStage, cause: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    awareness: {
      awareness: 'Potential beneficiaries are not learning about the scheme',
    },
    interest: {
      trust: 'Citizens aware of the scheme are not confident in its benefits',
      awareness: 'Information reaching citizens may not be compelling enough',
    },
    application: {
      access: 'Digital or physical access barriers prevent application initiation',
      complexity: 'Application process is perceived as too difficult',
    },
    submission: {
      complexity: 'Document requirements are causing abandonment',
      access: 'Citizens cannot complete the submission process',
    },
    approval: {
      trust: 'Application review process may have issues',
      complexity: 'Eligibility criteria may be filtering valid applicants',
    },
    benefit: {
      access: 'Benefit delivery mechanisms may have gaps',
      trust: 'Last-mile delivery issues',
    },
  };
  
  return descriptions[stage]?.[cause] || 'Process inefficiency at this stage';
}

function getStageRecommendation(stage: AdoptionStage): string {
  const recommendations: Record<AdoptionStage, string> = {
    awareness: 'Increase awareness through multiple channels including local media and community outreach',
    interest: 'Improve messaging about benefits and success stories from beneficiaries',
    application: 'Simplify application process or add assisted application centers',
    submission: 'Reduce document requirements or accept self-declaration where possible',
    approval: 'Streamline approval process and reduce processing time',
    benefit: 'Strengthen last-mile delivery infrastructure',
  };
  
  return recommendations[stage];
}
