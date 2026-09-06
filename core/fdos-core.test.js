'use strict';
const assert = require('assert');
const FDOS = require('./fdos-core.js');

assert.strictEqual(Object.keys(FDOS.EVIDENCE_CLASSES).length, 8);
assert(FDOS.opportunityScore({impact:10,evidence_strength:10,speed:10,reversibility:10,cost:1,complexity:1,risk:1}) <= 100);
const findings = FDOS.analyze({business_idea:'A measurable founder intelligence product'});
assert.strictEqual(findings[0].evidence, 'E4');
assert.strictEqual(findings[0].value_sprint.baseline_required, true);

const ledger = new FDOS.EvidenceLedger();
const engine = new FDOS.ExperimentEngine(ledger);
const exp = engine.create({name:'CTA experiment', primary_kpi:'qualified_lead', baseline_start:'2026-08-01', baseline_end:'2026-08-07', observation_start:'2026-08-08', observation_end:'2026-08-14'});
engine.start(exp.experiment_id);
ledger.add({experiment_id:exp.experiment_id,event_type:'qualified_lead',numeric_value:2,evidence_class:'E1',confidence:100,occurred_at:'2026-08-03T12:00:00Z'});
ledger.add({experiment_id:exp.experiment_id,event_type:'qualified_lead',numeric_value:4,evidence_class:'E1',confidence:100,occurred_at:'2026-08-10T12:00:00Z'});
const report = engine.report(exp.experiment_id, new Date('2026-08-20T00:00:00Z'));
assert.strictEqual(report.decision, 'keep');
assert.strictEqual(report.evidence_class, 'E4');
assert(report.limitation.includes('does not prove causation'));
assert.strictEqual(ledger.evidenceMix().E1, 2);

console.log('FDOS portable core tests passed');
