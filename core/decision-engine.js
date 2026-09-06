'use strict';

/**
 * Founder Dynasty OS platform-neutral Next Best Action engine.
 * No WordPress dependency. Designed for web, Android bridges, Node services,
 * dashboards, and future API clients.
 *
 * Evidence classes are deliberately preserved as data, not marketing labels.
 */

const EVIDENCE_CLASSES = Object.freeze({
  E1: 'Verified Fact',
  E2: 'Current External Evidence',
  E3: 'Customer-Derived Evidence',
  E4: 'Internal Observation',
  E5: 'Strategic Hypothesis',
  E6: 'Financial Model Assumption',
  E7: 'Forecast',
  E8: 'Illustrative Example'
});

const DEFAULT_WEIGHTS = Object.freeze({
  impact: 1,
  evidenceConfidence: 1,
  speedToEvidence: 1,
  reversibility: 1,
  cost: 1,
  complexity: 1,
  risk: 1
});

function clamp(value, min = 0, max = 10) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function validateEvidenceClass(value) {
  return Object.prototype.hasOwnProperty.call(EVIDENCE_CLASSES, value);
}

function normalizeOpportunity(input = {}) {
  const evidenceClass = validateEvidenceClass(input.evidenceClass) ? input.evidenceClass : 'E5';
  return {
    id: String(input.id || ''),
    title: String(input.title || 'Untitled opportunity'),
    description: String(input.description || ''),
    evidenceClass,
    evidenceConfidence: clamp(input.evidenceConfidence),
    impact: clamp(input.impact),
    speedToEvidence: clamp(input.speedToEvidence),
    reversibility: clamp(input.reversibility),
    cost: clamp(input.cost),
    complexity: clamp(input.complexity),
    risk: clamp(input.risk),
    primaryKpi: String(input.primaryKpi || ''),
    sourceRefs: Array.isArray(input.sourceRefs) ? input.sourceRefs.filter(Boolean).map(String) : [],
    limitations: Array.isArray(input.limitations) ? input.limitations.filter(Boolean).map(String) : [],
    recommendedExperiment: input.recommendedExperiment || null
  };
}

/**
 * Score = impact × evidence confidence × speed to evidence × reversibility
 *         --------------------------------------------------------------
 *                    cost + complexity + risk
 *
 * Inputs are 0..10. A +1 denominator prevents divide-by-zero and avoids
 * pretending a zero-cost action is infinitely valuable. The score is a
 * prioritization heuristic, not a forecast or proof of ROI.
 */
function scoreOpportunity(raw, weights = DEFAULT_WEIGHTS) {
  const o = normalizeOpportunity(raw);
  const w = { ...DEFAULT_WEIGHTS, ...weights };
  const numerator =
    (o.impact * w.impact) *
    (o.evidenceConfidence * w.evidenceConfidence) *
    (o.speedToEvidence * w.speedToEvidence) *
    (o.reversibility * w.reversibility);
  const denominator = 1 +
    (o.cost * w.cost) +
    (o.complexity * w.complexity) +
    (o.risk * w.risk);
  const rawScore = numerator / denominator;
  return { ...o, priorityScore: Math.round(rawScore * 100) / 100 };
}

function rankOpportunities(opportunities = [], weights) {
  return opportunities
    .map(item => scoreOpportunity(item, weights))
    .sort((a, b) => b.priorityScore - a.priorityScore || b.evidenceConfidence - a.evidenceConfidence);
}

function buildValueSprint(opportunity, options = {}) {
  const o = scoreOpportunity(opportunity, options.weights);
  return {
    sprintId: String(options.sprintId || ''),
    opportunityId: o.id,
    problem: o.title,
    evidence: {
      class: o.evidenceClass,
      label: EVIDENCE_CLASSES[o.evidenceClass],
      confidence: o.evidenceConfidence,
      sourceRefs: o.sourceRefs,
      limitations: o.limitations
    },
    hypothesis: String(options.hypothesis || (o.evidenceClass === 'E5' ? o.description : `Testing whether acting on: ${o.title} improves ${o.primaryKpi || 'the primary KPI'}.`)),
    hypothesisEvidenceClass: 'E5',
    baseline: options.baseline ?? null,
    action: options.action || o.recommendedExperiment || null,
    primaryKpi: options.primaryKpi || o.primaryKpi || null,
    guardrails: Array.isArray(options.guardrails) ? options.guardrails : [],
    deadline: options.deadline || null,
    decisionRule: options.decisionRule || 'KEEP if primary KPI improves without breaching guardrails; REVISE if evidence is inconclusive; REVERT if KPI worsens or guardrails fail.',
    priorityScore: o.priorityScore,
    status: 'draft',
    result: null,
    decision: 'pending',
    truthBoundary: 'Priority score is a decision heuristic. It is not proof of revenue, profit, ROI, causation, or product-market fit.'
  };
}

function recommendNextAction(state = {}) {
  const ranked = rankOpportunities(state.opportunities || [], state.weights);
  const running = Array.isArray(state.runningSprints) ? state.runningSprints : [];

  if (running.length > 0) {
    const due = [...running].sort((a, b) => String(a.deadline || '9999').localeCompare(String(b.deadline || '9999')))[0];
    return {
      type: 'measure_running_sprint',
      sprintId: due.sprintId || null,
      reason: 'A Value Sprint is already running. Measure/close existing evidence loops before creating unnecessary parallel work.',
      evidenceClass: 'E4'
    };
  }

  if (!ranked.length) {
    return {
      type: 'collect_evidence',
      reason: 'No ranked opportunities are available. Collect founder, customer, or current external evidence before recommending a strategic action.',
      evidenceClass: 'E4'
    };
  }

  const top = ranked[0];
  return {
    type: 'start_value_sprint',
    opportunity: top,
    sprint: buildValueSprint(top),
    reason: 'Highest current priority under the transparent impact/evidence/speed/reversibility versus cost/complexity/risk heuristic.',
    evidenceClass: 'E4'
  };
}

module.exports = {
  EVIDENCE_CLASSES,
  DEFAULT_WEIGHTS,
  normalizeOpportunity,
  scoreOpportunity,
  rankOpportunities,
  buildValueSprint,
  recommendNextAction
};
