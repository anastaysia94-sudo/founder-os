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

export type ValueSprintStatus = 'Planned' | 'Running' | 'Measured' | 'Keep' | 'Revise' | 'Revert';
export type ValueSprintDecision = 'Keep' | 'Revise' | 'Revert';

export type ValueSprint = {
  id: string;
  title: string;
  hypothesis: string;
  action: string;
  measure: string;
  baseline: string;
  target: string;
  result: string;
  status: ValueSprintStatus;
  decision?: ValueSprintDecision;
  evidence: EvidenceClass;
  startedAt?: string;
  measuredAt?: string;
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
  valueSprints: ValueSprint[];
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

export type MissingIntelligenceItem = {
  id: string;
  level: 'Now' | 'Soon' | 'Watch';
  area: string;
  question: string;
  why: string;
  next: string;
};

export type XRaySignal = {
  id: string;
  label: string;
  score: number;
  state: 'Strong' | 'Developing' | 'Weak';
  why: string;
  next: string;
};

export type IdeaLabPrompt = {
  id: string;
  title: string;
  question: string;
  writesTo: keyof BusinessDNA;
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

const evidenceWeight: Record<EvidenceClass, number> = {
  E1: 1,
  E2: 0.9,
  E3: 0.95,
  E4: 0.55,
  E5: 0.35,
  E6: 0.3,
  E7: 0.25,
  E8: 0.1,
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

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
  return getMissingIntelligence(record).map((item) => item.question).slice(0, 6);
}

export function getMissingIntelligence(record: BusinessRecord): MissingIntelligenceItem[] {
  const items: MissingIntelligenceItem[] = [];
  const dna = record.dna;

  const add = (item: MissingIntelligenceItem) => items.push(item);
  if (!dna.problem.trim()) add({ id: 'problem', level: 'Now', area: 'Idea & Strategy', question: 'What painful or valuable problem are we actually solving?', why: 'Without a specific problem, product and marketing decisions drift into feature collecting.', next: 'Write one problem statement in the customer’s language.' });
  if (!dna.customer.trim()) add({ id: 'customer', level: 'Now', area: 'Customer Intelligence', question: 'Who specifically has this problem strongly enough to care?', why: 'A business cannot validate demand against “everyone.”', next: 'Name the narrowest plausible first customer group.' });
  if (!dna.offer.trim()) add({ id: 'offer', level: 'Now', area: 'Product & Offer', question: 'What are we promising to deliver to that customer?', why: 'The customer needs a concrete outcome, not an internal list of features.', next: 'Describe the result, delivery form and boundary of the first offer.' });
  if (!dna.revenueModel.trim()) add({ id: 'money', level: 'Soon', area: 'Money', question: 'How does value turn into money, funding or another durable return?', why: 'A useful product still needs a sustainable value-capture mechanism.', next: 'Choose the first pricing or funding assumption to test.' });
  if (!dna.advantage.trim()) add({ id: 'advantage', level: 'Soon', area: 'Strategy', question: 'Why might this business win instead of being interchangeable?', why: 'Without an advantage hypothesis, competition usually becomes a price race.', next: 'Name one capability, asset, insight, relationship or experience that could compound.' });
  if (!dna.constraint.trim()) add({ id: 'constraint', level: 'Now', area: 'Founder Attention', question: 'What is the biggest limit on progress right now?', why: 'The highest-value work usually attacks the current bottleneck, not the longest task list.', next: 'Name the one constraint that makes everything else harder.' });
  if (!dna.currentGoal.trim()) add({ id: 'goal', level: 'Now', area: 'Command Center', question: 'What single result matters most next?', why: 'Prioritization is impossible if every result is simultaneously “top priority.”', next: 'Choose one observable result for the current stage.' });
  if (!record.opportunities.length) add({ id: 'opportunity', level: 'Now', area: 'Opportunity Engine', question: 'What is the highest-value next action worth testing?', why: 'A business record should convert uncertainty into action.', next: 'Add at least one reversible, evidence-seeking opportunity.' });
  if (!record.decisions.length) add({ id: 'decision', level: 'Soon', area: 'Decision Engine', question: 'What important choice is still unresolved?', why: 'Unrecorded decisions get re-litigated and lose their original reasoning.', next: 'Capture one decision, the next step and what evidence would change your mind.' });
  if (!record.risks.length) add({ id: 'risk', level: 'Soon', area: 'Risk Center', question: 'What could seriously damage the current goal?', why: 'Risk ignored is not risk removed. Humans have tried this strategy for centuries with mixed reviews.', next: 'Record the most consequential plausible failure and a response.' });
  if (!record.valueMap.length) add({ id: 'value', level: 'Soon', area: 'Value Map', question: 'Where is value created, captured, leaking, at risk or becoming an asset?', why: 'The OS needs to know where enterprise value is actually moving.', next: 'Add one value creator and one leak or at-risk item.' });
  if (!record.valueSprints.length) add({ id: 'sprint', level: 'Now', area: 'Value Sprint', question: 'What single improvement can we test and measure instead of debating?', why: 'A measured test turns a strategic argument into evidence.', next: 'Start one Value Sprint with a hypothesis, action and success measure.' });

  const externalEvidenceCount = [...record.opportunities, ...record.decisions, ...record.risks, ...record.valueMap, ...record.valueSprints]
    .filter((item) => item.evidence === 'E1' || item.evidence === 'E2' || item.evidence === 'E3').length;
  if (externalEvidenceCount === 0) add({ id: 'evidence', level: 'Now', area: 'Research & Evidence', question: 'What do we know from outside the founder’s own head?', why: 'A beautifully organized assumption is still an assumption.', next: 'Capture current external evidence or customer-derived evidence for the riskiest claim.' });

  return items.slice(0, 10);
}

export function getIdeaLabPrompts(record: BusinessRecord): IdeaLabPrompt[] {
  const dna = record.dna;
  const candidates: IdeaLabPrompt[] = [
    { id: 'purpose', title: 'Reason to exist', question: 'If this business works, what becomes meaningfully better for someone?', writesTo: 'purpose' },
    { id: 'problem', title: 'Problem worth solving', question: 'What frustrating, expensive, risky or valuable problem are you trying to change?', writesTo: 'problem' },
    { id: 'customer', title: 'First customer', question: 'Who feels that problem most strongly and is easiest to reach first?', writesTo: 'customer' },
    { id: 'offer', title: 'First offer', question: 'What useful result could you deliver before building the giant version?', writesTo: 'offer' },
    { id: 'revenueModel', title: 'Value capture', question: 'If the customer gets value, how could the business capture enough value to survive?', writesTo: 'revenueModel' },
    { id: 'advantage', title: 'Reason to choose you', question: 'What might make this meaningfully better, easier, faster, safer or harder to copy?', writesTo: 'advantage' },
    { id: 'constraint', title: 'Current bottleneck', question: 'What one limit is most likely to slow learning or progress?', writesTo: 'constraint' },
    { id: 'currentGoal', title: 'Next proof point', question: 'What one result would make the next decision easier?', writesTo: 'currentGoal' },
  ];
  return candidates.sort((a, b) => Number(Boolean(dna[a.writesTo].trim())) - Number(Boolean(dna[b.writesTo].trim())));
}

export function getBusinessXRay(record: BusinessRecord): XRaySignal[] {
  const allEvidence = [...record.opportunities, ...record.decisions, ...record.risks, ...record.valueMap, ...record.valueSprints];
  const evidenceScore = allEvidence.length
    ? allEvidence.reduce((sum, item) => sum + evidenceWeight[item.evidence], 0) / allEvidence.length * 100
    : 0;
  const clarity = dnaCompleteness(record.dna);
  const valueCoverage = clampScore(Math.min(100, record.valueMap.length * 22 + (record.valueMap.some((item) => item.kind === 'Leak') ? 18 : 0) + (record.valueMap.some((item) => item.kind === 'Asset') ? 18 : 0)));
  const decisionDiscipline = clampScore(Math.min(100, record.decisions.length * 22 + record.memory.length * 7));
  const execution = clampScore(Math.min(100, record.opportunities.length * 14 + record.valueSprints.length * 30 + record.valueSprints.filter((s) => ['Measured', 'Keep', 'Revise', 'Revert'].includes(s.status)).length * 18));
  const resilience = clampScore(record.risks.length ? Math.min(100, 35 + record.risks.filter((r) => r.response.trim()).length * 18 - record.risks.filter((r) => r.level === 'High').length * 8) : 0);

  const make = (id: string, label: string, value: number, why: string, next: string): XRaySignal => ({
    id,
    label,
    score: clampScore(value),
    state: value >= 72 ? 'Strong' : value >= 42 ? 'Developing' : 'Weak',
    why,
    next,
  });

  return [
    make('clarity', 'Business clarity', clarity, 'Measures how much of the core Business DNA is actually defined.', clarity < 72 ? 'Fill the most consequential missing Business DNA fields.' : 'Keep the DNA current as evidence changes.'),
    make('evidence', 'Evidence strength', evidenceScore, 'Measures whether saved claims lean toward facts, current external evidence and customer evidence instead of assumptions.', evidenceScore < 60 ? 'Attach stronger outside or customer evidence to the riskiest claims.' : 'Protect the distinction between evidence and interpretation.'),
    make('value', 'Value visibility', valueCoverage, 'Measures whether the system can see value creation, capture, leakage, risk and assets.', valueCoverage < 60 ? 'Map at least one value creator, one leak or risk, and one compounding asset.' : 'Use the Value Map to choose what deserves a sprint.'),
    make('decisions', 'Decision discipline', decisionDiscipline, 'Measures whether important choices and lessons are being recorded instead of disappearing into memory and chat threads.', decisionDiscipline < 60 ? 'Record the next important decision and the reasoning behind it.' : 'Close the loop by recording outcomes and changed assumptions.'),
    make('execution', 'Learning velocity', execution, 'Measures whether opportunities are turning into explicit, measured Value Sprints.', execution < 60 ? 'Turn the highest-ranked reversible opportunity into one Value Sprint.' : 'Finish active sprints and make KEEP / REVISE / REVERT explicit.'),
    make('resilience', 'Risk readiness', resilience, 'Measures whether meaningful risks are visible and have responses.', resilience < 60 ? 'Name the largest plausible failure and define a response before it becomes a surprise.' : 'Keep high risks visible until their probability or impact changes.'),
  ];
}

export function getXRayScore(record: BusinessRecord) {
  const signals = getBusinessXRay(record);
  return clampScore(signals.reduce((sum, signal) => sum + signal.score, 0) / signals.length);
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
  valueSprints: [],
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
  valueSprints: [],
};