export type EvidenceClass = 'E1' | 'E2' | 'E3' | 'E4' | 'E5' | 'E6' | 'E7' | 'E8';

export type BusinessStage =
  | 'Idea'
  | 'Exploring'
  | 'Validating'
  | 'Building'
  | 'Pre-Launch'
  | 'Launched'
  | 'Finding Traction'
  | 'Growing'
  | 'Systemizing'
  | 'Scaling'
  | 'Portfolio'
  | 'Dynasty';

export type EvidenceLink = { evidenceId?: string; sourceUrl?: string };

export type Opportunity = {
  id: string;
  title: string;
  observation: string;
  evidence: EvidenceClass;
  confidence: number;
  impact: number;
  speed: number;
  reversibility: number;
  cost: number;
  complexity: number;
  risk: number;
} & EvidenceLink;

export type Decision = {
  id: string;
  question: string;
  status: 'Open' | 'Decided' | 'Learning';
  evidence: EvidenceClass;
  next: string;
} & EvidenceLink;

export type Risk = {
  id: string;
  title: string;
  level: 'Low' | 'Medium' | 'High';
  evidence: EvidenceClass;
  response: string;
} & EvidenceLink;

export type MemoryEvent = {
  id: string;
  date: string;
  kind: string;
  summary: string;
  evidence: EvidenceClass;
} & EvidenceLink;

export type ValueItem = {
  id: string;
  kind: 'Created' | 'Captured' | 'Leak' | 'At Risk' | 'Opportunity' | 'Asset';
  title: string;
  detail: string;
  evidence: EvidenceClass;
} & EvidenceLink;

export type BusinessDNA = {
  name: string;
  stage: BusinessStage;
  purpose: string;
  problem: string;
  customer: string;
  offer: string;
  revenueModel: string;
  advantage: string;
  constraint: string;
  currentGoal: string;
};

export type BusinessRecord = {
  businessId?: string;
  dna: BusinessDNA;
  opportunities: Opportunity[];
  decisions: Decision[];
  risks: Risk[];
  memory: MemoryEvent[];
  valueMap: ValueItem[];
};

export type EvidenceProposal = {
  id: string;
  evidenceId: string;
  targetType: 'dna' | 'value' | 'decision' | 'risk' | 'opportunity';
  title: string;
  rationale: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  sourceUrl?: string;
  evidenceTitle?: string;
};

export type StageGuide = {
  job: string;
  prove: string;
  avoid: string;
};

export const evidenceLabels: Record<EvidenceClass, string> = {
  E1: 'Verified Fact',
  E2: 'Current External Evidence',
  E3: 'Customer-Derived Evidence',
  E4: 'Internal Observation',
  E5: 'Strategic Hypothesis',
  E6: 'Financial Model Assumption',
  E7: 'Forecast',
  E8: 'Illustrative Example',
};

export const stageGuidance: Record<BusinessStage, StageGuide> = {
  Idea: {
    job: 'Turn the idea into a clear problem, customer and reason to exist.',
    prove: 'That the problem is real enough to investigate before building much.',
    avoid: 'Falling in love with features before the problem is understood.',
  },
  Exploring: {
    job: 'Compare possible customers, problems, offers and business models.',
    prove: 'Which direction is worth testing first.',
    avoid: 'Treating interesting possibilities as proven demand.',
  },
  Validating: {
    job: 'Get outside evidence from real people, behavior, markets or transactions.',
    prove: 'That somebody cares enough to act, reply, sign up, try or pay.',
    avoid: 'Using compliments, guesses or internal enthusiasm as customer proof.',
  },
  Building: {
    job: 'Build the smallest reliable version that can deliver the promised value.',
    prove: 'That the offer can actually be delivered well and repeatedly.',
    avoid: 'Expanding scope faster than evidence justifies.',
  },
  'Pre-Launch': {
    job: 'Make the offer, operations, measurement and launch path ready for real users.',
    prove: 'That the business can launch without obvious operational holes.',
    avoid: 'Polishing low-impact details while critical launch risks stay open.',
  },
  Launched: {
    job: 'Observe what real users do and fix the largest friction first.',
    prove: 'That the business can create and capture value outside the build environment.',
    avoid: 'Calling launch itself success.',
  },
  'Finding Traction': {
    job: 'Find a repeatable pattern of customer value, acquisition and retention.',
    prove: 'That results are repeatable enough to deserve more investment.',
    avoid: 'Scaling one-off wins that cannot yet be reproduced.',
  },
  Growing: {
    job: 'Increase useful demand and delivery capacity without breaking quality or economics.',
    prove: 'That growth can continue without destroying margin, trust or operations.',
    avoid: 'Confusing revenue growth with healthy growth.',
  },
  Systemizing: {
    job: 'Turn recurring work into dependable systems, roles, controls and measures.',
    prove: 'That the business works without constant founder intervention.',
    avoid: 'Automating a bad process just because humans are tired of it.',
  },
  Scaling: {
    job: 'Multiply proven systems while protecting economics, quality and resilience.',
    prove: 'That additional capital, people or markets create more value than complexity.',
    avoid: 'Scaling faster than management information and controls can keep up.',
  },
  Portfolio: {
    job: 'Allocate attention, capital, talent and shared assets across multiple businesses.',
    prove: 'Which businesses deserve investment, harvest, repair, combination or exit.',
    avoid: 'Treating every company as equally strategic because it exists.',
  },
  Dynasty: {
    job: 'Protect compounding enterprise value beyond any one product, operator or generation.',
    prove: 'That assets, governance, knowledge and succession can survive leadership changes.',
    avoid: 'Building a founder-dependent empire that disappears with the founder.',
  },
};

export function score(o: Opportunity) {
  const denominator = Math.max(1, (o.cost + o.complexity + o.risk) * 10);
  return Math.min(
    100,
    Math.round((o.impact * (o.confidence / 100) * o.speed * o.reversibility / denominator) * 10) / 10,
  );
}

export function dnaCompleteness(dna: BusinessDNA) {
  const fields: Array<keyof Omit<BusinessDNA, 'stage'>> = [
    'name',
    'purpose',
    'problem',
    'customer',
    'offer',
    'revenueModel',
    'advantage',
    'constraint',
    'currentGoal',
  ];
  const filled = fields.filter((key) => dna[key].trim().length > 0 && dna[key] !== 'Untitled business').length;
  return Math.round((filled / fields.length) * 100);
}

export function getMissingQuestions(record: BusinessRecord) {
  const missing: string[] = [];
  const dna = record.dna;

  if (!dna.problem.trim()) missing.push('What painful or valuable problem are we actually solving?');
  if (!dna.customer.trim()) missing.push('Who specifically has this problem strongly enough to care?');
  if (!dna.offer.trim()) missing.push('What are we promising to deliver to that customer?');
  if (!dna.revenueModel.trim()) missing.push('How does value turn into money, funding or another durable return?');
  if (!dna.advantage.trim()) missing.push('Why might this business win instead of being interchangeable?');
  if (!dna.constraint.trim()) missing.push('What is the biggest limit on progress right now?');
  if (!dna.currentGoal.trim()) missing.push('What single result matters most next?');
  if (!record.opportunities.length) missing.push('What is the highest-value next action worth testing?');
  if (!record.decisions.length) missing.push('What important choice is still unresolved?');
  if (!record.risks.length) missing.push('What could seriously damage the current goal?');
  if (!record.valueMap.length) missing.push('Where is value created, captured, leaking, at risk or becoming an asset?');

  return missing.slice(0, 6);
}

export const blankBusiness: BusinessRecord = {
  businessId: undefined,
  dna: {
    name: 'Untitled business',
    stage: 'Idea',
    purpose: '',
    problem: '',
    customer: '',
    offer: '',
    revenueModel: '',
    advantage: '',
    constraint: '',
    currentGoal: 'Reduce the biggest uncertainty first.',
  },
  opportunities: [],
  decisions: [],
  risks: [],
  memory: [],
  valueMap: [],
};

export const demoBusiness: BusinessRecord = {
  businessId: undefined,
  dna: {
    name: 'New Business Workspace',
    stage: 'Idea',
    purpose: 'Turn a promising idea into a business worth building.',
    problem: 'The exact customer problem is not yet proven.',
    customer: 'Unknown until research or real conversations support a clearer answer.',
    offer: 'Not decided yet.',
    revenueModel: 'Not decided yet.',
    advantage: 'Unknown. Must be earned or demonstrated.',
    constraint: 'Avoid building too much before stronger evidence exists.',
    currentGoal: 'Find the cheapest useful test that can reduce uncertainty.',
  },
  opportunities: [
    {
      id: 'o1',
      title: 'Define the first real problem to test',
      observation: 'A broad idea becomes easier to evaluate when one customer problem is stated clearly.',
      evidence: 'E5',
      confidence: 78,
      impact: 9,
      speed: 9,
      reversibility: 10,
      cost: 1,
      complexity: 2,
      risk: 1,
    },
  ],
  decisions: [
    {
      id: 'd1',
      question: 'What exact problem should this business solve first?',
      status: 'Open',
      evidence: 'E5',
      next: 'Write the smallest useful problem statement and test it.',
    },
  ],
  risks: [
    {
      id: 'r1',
      title: 'Building before demand is understood',
      level: 'High',
      evidence: 'E5',
      response: 'Keep the first test cheap and reversible.',
    },
  ],
  memory: [
    {
      id: 'm1',
      date: 'Today',
      kind: 'Example only',
      summary: 'This demo record exists only when cloud sync is unavailable or before sign-in.',
      evidence: 'E8',
    },
  ],
  valueMap: [
    {
      id: 'v1',
      kind: 'Opportunity',
      title: 'Unproven idea can still be shaped cheaply',
      detail: 'Early uncertainty is useful when the system turns it into specific tests instead of premature building.',
      evidence: 'E5',
    },
  ],
};