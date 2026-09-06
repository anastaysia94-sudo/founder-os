'use strict';
const assert = require('node:assert/strict');
const {
  EVIDENCE_CLASSES,
  scoreOpportunity,
  rankOpportunities,
  buildValueSprint,
  recommendNextAction
} = require('./decision-engine');

assert.equal(Object.keys(EVIDENCE_CLASSES).length, 8, 'E1-E8 taxonomy must remain complete');

const strong = {
  id: 'opp-1', title: 'Fix checkout abandonment', evidenceClass: 'E3',
  evidenceConfidence: 8, impact: 9, speedToEvidence: 9, reversibility: 9,
  cost: 2, complexity: 2, risk: 2, primaryKpi: 'checkout_completed'
};
const weak = {
  id: 'opp-2', title: 'Large speculative rebuild', evidenceClass: 'E5',
  evidenceConfidence: 2, impact: 8, speedToEvidence: 2, reversibility: 2,
  cost: 9, complexity: 9, risk: 8
};

const scored = scoreOpportunity(strong);
assert.ok(scored.priorityScore > 0);
assert.equal(scored.evidenceClass, 'E3');

const ranked = rankOpportunities([weak, strong]);
assert.equal(ranked[0].id, 'opp-1');

const sprint = buildValueSprint(strong, { action: 'Run a controlled checkout simplification test' });
assert.equal(sprint.hypothesisEvidenceClass, 'E5');
assert.equal(sprint.decision, 'pending');
assert.match(sprint.truthBoundary, /not proof/i);

const noEvidence = recommendNextAction({ opportunities: [] });
assert.equal(noEvidence.type, 'collect_evidence');

const next = recommendNextAction({ opportunities: [weak, strong] });
assert.equal(next.type, 'start_value_sprint');
assert.equal(next.opportunity.id, 'opp-1');

const running = recommendNextAction({
  opportunities: [strong],
  runningSprints: [{ sprintId: 'sprint-live', deadline: '2026-09-10' }]
});
assert.equal(running.type, 'measure_running_sprint');
assert.equal(running.sprintId, 'sprint-live');

console.log('FDOS decision engine tests passed');
