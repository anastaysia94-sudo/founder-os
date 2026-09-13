import type { BusinessDNA, EvidenceClass } from './fdos';

export type ModelArea = 'Problem' | 'Customer' | 'Value Proposition' | 'Channel' | 'Relationship' | 'Revenue' | 'Cost' | 'Capability' | 'Partner';
export type ModelStatus = 'Hypothesis' | 'Testing' | 'Supported' | 'Rejected';
export type CustomerInsightKind = 'Segment' | 'Problem' | 'Need' | 'Trigger' | 'Objection' | 'Behavior' | 'Language';
export type DistributionStatus = 'Planned' | 'Running' | 'Measured' | 'Keep' | 'Revise' | 'Stop';
export type AssetKind = 'Brand' | 'IP' | 'Data' | 'Process' | 'Relationship' | 'Software' | 'Content' | 'License' | 'Physical' | 'Other';
export type ScenarioStatus = 'Open' | 'Watching' | 'Resolved';
export type PortfolioRole = 'Core' | 'Experiment' | 'Growth' | 'Cash Engine' | 'Option' | 'Exit Candidate';
export type PortfolioStatus = 'Explore' | 'Build' | 'Hold' | 'Harvest' | 'Exit';
export type AttentionStatus = 'Planned' | 'Active' | 'Stopped';

export type BusinessModelElement = { id: string; area: ModelArea; statement: string; confidence: number; status: ModelStatus; evidence: EvidenceClass };
export type CustomerInsight = { id: string; kind: CustomerInsightKind; statement: string; implication: string; evidence: EvidenceClass };
export type DistributionExperiment = { id: string; channel: string; audience: string; message: string; action: string; measure: string; result: string; status: DistributionStatus; evidence: EvidenceClass };
export type BusinessAsset = { id: string; kind: AssetKind; name: string; valueReason: string; control: string; transferability: 'Low' | 'Medium' | 'High'; evidence: EvidenceClass };
export type Scenario = { id: string; name: string; premise: string; upside: string; downside: string; earlySignal: string; decisionRule: string; probability: number; status: ScenarioStatus; evidence: EvidenceClass };
export type PortfolioThesis = { id: string; name: string; role: PortfolioRole; thesis: string; nextCapital: string; nextAttention: string; status: PortfolioStatus; evidence: EvidenceClass };
export type AttentionBlock = { id: string; area: string; outcome: string; weeklyMinutes: number; status: AttentionStatus; evidence: EvidenceClass };

export type StrategyDynastyRecord = {
  model: BusinessModelElement[];
  customerInsights: CustomerInsight[];
  distribution: DistributionExperiment[];
  assets: BusinessAsset[];
  scenarios: Scenario[];
  portfolio: PortfolioThesis[];
  attention: AttentionBlock[];
};

export const blankStrategyDynasty: StrategyDynastyRecord = { model: [], customerInsights: [], distribution: [], assets: [], scenarios: [], portfolio: [], attention: [] };

function pct(value: number) { return Math.max(0, Math.min(100, Math.round(value))); }

export function getStrategySignals(record: StrategyDynastyRecord, dna: BusinessDNA) {
  const modelAreas = new Set(record.model.filter((x) => x.status !== 'Rejected').map((x) => x.area));
  const supported = record.model.filter((x) => x.status === 'Supported').length;
  const modelCoverage = pct((modelAreas.size / 9) * 70 + Math.min(30, supported * 10));

  const customerEvidence = record.customerInsights.filter((x) => ['E1', 'E2', 'E3'].includes(x.evidence)).length;
  const customerClarity = pct(Math.min(100, record.customerInsights.length * 13 + customerEvidence * 14 + (dna.customer.trim() ? 16 : 0)));

  const measuredDistribution = record.distribution.filter((x) => ['Measured', 'Keep', 'Revise', 'Stop'].includes(x.status)).length;
  const distributionLearning = pct(Math.min(100, record.distribution.length * 14 + measuredDistribution * 22));

  const transferableAssets = record.assets.filter((x) => x.transferability === 'High').length;
  const assetStrength = pct(Math.min(100, record.assets.length * 14 + transferableAssets * 18));

  const actionableScenarios = record.scenarios.filter((x) => x.earlySignal.trim() && x.decisionRule.trim()).length;
  const scenarioReadiness = pct(Math.min(100, record.scenarios.length * 12 + actionableScenarios * 24));

  const weeklyMinutes = record.attention.filter((x) => x.status !== 'Stopped').reduce((sum, x) => sum + x.weeklyMinutes, 0);
  const activeAttention = record.attention.filter((x) => x.status === 'Active').length;
  const attentionDiscipline = pct(Math.min(100, activeAttention * 25 + (weeklyMinutes > 0 ? 25 : 0) + (record.attention.length >= 2 ? 20 : 0)));

  const portfolioMaturity = pct(Math.min(100, record.portfolio.length * 18 + record.portfolio.filter((x) => ['Build', 'Hold', 'Harvest', 'Exit'].includes(x.status)).length * 16));

  const dynastyReadiness = pct((modelCoverage + customerClarity + distributionLearning + assetStrength + scenarioReadiness + attentionDiscipline + portfolioMaturity) / 7);

  return { modelCoverage, customerClarity, distributionLearning, assetStrength, scenarioReadiness, attentionDiscipline, portfolioMaturity, dynastyReadiness, weeklyMinutes };
}

export function getStrategyQuestions(record: StrategyDynastyRecord, dna: BusinessDNA) {
  const questions: Array<{ area: string; question: string; next: string }> = [];
  const modelAreas = new Set(record.model.filter((x) => x.status !== 'Rejected').map((x) => x.area));
  if (!modelAreas.has('Customer')) questions.push({ area: 'Business Model Lab', question: 'Which specific customer belongs in the business model?', next: 'Add a Customer hypothesis and give it a confidence level.' });
  if (!modelAreas.has('Value Proposition')) questions.push({ area: 'Business Model Lab', question: 'What value proposition connects the customer problem to the offer?', next: 'State the promised value in one sentence and mark it E5 until tested.' });
  if (!record.customerInsights.length) questions.push({ area: 'Customer Intelligence', question: 'What have we actually learned about the customer?', next: 'Capture one segment, problem, trigger, objection, behavior, or phrase.' });
  if (!record.distribution.length) questions.push({ area: 'Marketing & Distribution', question: 'Which channel can cheaply test whether the message reaches the right people?', next: 'Plan one distribution experiment with a measure.' });
  if (!record.assets.length) questions.push({ area: 'Asset Map', question: 'What does this business own or control that can compound?', next: 'Record one asset and why it matters.' });
  if (!record.scenarios.length) questions.push({ area: 'Scenario Lab', question: 'What plausible future would materially change today’s decision?', next: 'Create one scenario with an early signal and decision rule.' });
  if (!record.attention.length) questions.push({ area: 'Founder Attention', question: 'Where should founder time go this week?', next: 'Allocate a block of weekly minutes to one outcome.' });
  if (['Portfolio', 'Dynasty'].includes(dna.stage) && !record.portfolio.length) questions.push({ area: 'Portfolio / Dynasty', question: 'What role does this business play in the wider portfolio?', next: 'Record a portfolio thesis: Core, Growth, Cash Engine, Option, Experiment, or Exit Candidate.' });
  return questions.slice(0, 8);
}
