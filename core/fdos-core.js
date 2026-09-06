'use strict';

/** Founder Dynasty OS portable core.
 * No WordPress dependency. Runs in modern browsers and Node/CommonJS.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.FDOSCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const EVIDENCE_CLASSES = Object.freeze({
    E1: 'Verified Fact', E2: 'Current External Evidence', E3: 'Customer-Derived Evidence',
    E4: 'Internal Observation', E5: 'Strategic Hypothesis', E6: 'Financial Model Assumption',
    E7: 'Forecast', E8: 'Illustrative Example'
  });

  const clamp = (n, min, max) => Math.max(min, Math.min(max, Number(n)));
  const clean = v => String(v == null ? '' : v).trim();
  const uid = prefix => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

  function opportunityScore(input = {}) {
    const impact = clamp(input.impact ?? 5, 1, 10);
    const evidence = clamp(input.evidence_strength ?? 5, 1, 10);
    const speed = clamp(input.speed ?? 5, 1, 10);
    const reversibility = clamp(input.reversibility ?? 5, 1, 10);
    const cost = clamp(input.cost ?? 5, 1, 10);
    const complexity = clamp(input.complexity ?? 5, 1, 10);
    const risk = clamp(input.risk ?? 5, 1, 10);
    return Math.round(Math.min(100, (impact * evidence * speed * reversibility) / ((cost + complexity + risk) * 10)) * 10) / 10;
  }

  function valueSprint(finding = {}) {
    return {
      problem: clean(finding.observation),
      evidence_class: EVIDENCE_CLASSES[finding.evidence] ? finding.evidence : 'E4',
      hypothesis: 'E5: Addressing this finding may improve the selected business outcome; this must be tested rather than assumed.',
      recommended_action: clean(finding.action),
      baseline_required: true,
      primary_kpi: 'Choose one measurable KPI before intervention',
      guardrails: ['Do not call correlation causation', 'Do not call revenue profit', 'Record uncertainty and limitations'],
      decision_rule: 'After the observation window, compare the selected KPI with baseline and choose KEEP, REVISE, or REVERT.'
    };
  }

  function analyze(input = {}) {
    const website = clean(input.website_url);
    const facebook = clean(input.facebook_url);
    const idea = clean(input.business_idea);
    const findings = [];

    if (website) findings.push({
      key: 'website_evidence_required',
      observation: 'A website URL was supplied. The portable core does not claim page-specific facts until an external evidence adapter records them.',
      evidence: 'E4', confidence: 100,
      priority_score: opportunityScore({ impact: 7, evidence_strength: 10, speed: 9, reversibility: 10, cost: 2, complexity: 3, risk: 2 }),
      action: 'Run a permissioned/current website evidence adapter and store its observations as E2 with source references.'
    });
    if (facebook) findings.push({
      key: 'facebook_permission_boundary',
      observation: 'A Facebook business URL was supplied, but FDOS did not fetch or infer page content without a permissioned adapter.',
      evidence: 'E4', confidence: 100,
      priority_score: opportunityScore({ impact: 5, evidence_strength: 10, speed: 8, reversibility: 10, cost: 2, complexity: 3, risk: 2 }),
      action: 'Connect a permissioned Meta evidence adapter before making page-specific claims.'
    });
    if (idea) findings.push({
      key: 'idea_validation',
      observation: 'A business idea was provided without verified customer or market evidence in this intake.',
      evidence: 'E4', confidence: 100,
      priority_score: opportunityScore({ impact: 8, evidence_strength: 9, speed: 8, reversibility: 9, cost: 2, complexity: 3, risk: 2 }),
      action: 'Run a narrow customer-evidence experiment before treating demand, pricing, or market size as fact.'
    });
    if (!findings.length) findings.push({ key: 'missing_input', observation: 'No analyzable business input was supplied.', evidence: 'E1', confidence: 100, priority_score: 0, action: 'Submit at least one business input.' });
    findings.sort((a, b) => b.priority_score - a.priority_score);
    return findings.map(f => ({ ...f, value_sprint: valueSprint(f) }));
  }

  class EvidenceLedger {
    constructor(events = []) { this.events = []; events.forEach(e => this.add(e)); }
    add(event = {}) {
      const evidenceClass = clean(event.evidence_class).toUpperCase() || 'E4';
      if (!EVIDENCE_CLASSES[evidenceClass]) throw new Error('Invalid evidence class');
      const row = {
        event_id: clean(event.event_id) || uid('evt'),
        experiment_id: clean(event.experiment_id) || null,
        event_type: clean(event.event_type) || 'event', project: clean(event.project) || 'Founder Dynasty OS',
        channel: clean(event.channel), campaign: clean(event.campaign),
        numeric_value: event.numeric_value == null || event.numeric_value === '' ? null : Number(event.numeric_value),
        currency: clean(event.currency), evidence_class: evidenceClass,
        confidence: clamp(event.confidence ?? 0, 0, 100), source_type: clean(event.source_type) || 'manual',
        source_ref: clean(event.source_ref), metadata: event.metadata && typeof event.metadata === 'object' ? event.metadata : {},
        occurred_at: clean(event.occurred_at) || new Date().toISOString()
      };
      this.events.push(row); return row;
    }
    list() { return this.events.slice(); }
    evidenceMix() { return Object.keys(EVIDENCE_CLASSES).reduce((o, k) => ({ ...o, [k]: this.events.filter(e => e.evidence_class === k).length }), {}); }
    metricWindow(eventType, start, end, experimentId = null) {
      const s = new Date(`${start}T00:00:00Z`).getTime(), e = new Date(`${end}T23:59:59.999Z`).getTime();
      const rows = this.events.filter(x => x.event_type === eventType && (!experimentId || x.experiment_id === experimentId) && new Date(x.occurred_at).getTime() >= s && new Date(x.occurred_at).getTime() <= e);
      return { count: rows.length, value: rows.reduce((n, x) => n + (Number.isFinite(x.numeric_value) ? x.numeric_value : 1), 0) };
    }
  }

  class ExperimentEngine {
    constructor(ledger) { this.ledger = ledger || new EvidenceLedger(); this.experiments = []; }
    create(data = {}) {
      if (!clean(data.name) || !clean(data.primary_kpi)) throw new Error('name and primary_kpi are required');
      const e = { experiment_id: uid('exp'), name: clean(data.name), hypothesis: clean(data.hypothesis), primary_kpi: clean(data.primary_kpi), guardrails: Array.isArray(data.guardrails) ? data.guardrails.map(clean).filter(Boolean) : [], baseline_start: clean(data.baseline_start), baseline_end: clean(data.baseline_end), observation_start: clean(data.observation_start), observation_end: clean(data.observation_end), status: 'draft', decision: 'pending', created_at: new Date().toISOString() };
      this.experiments.push(e); return e;
    }
    start(id) { const e = this.get(id); if (!e) throw new Error('Experiment not found'); ['baseline_start','baseline_end','observation_start','observation_end'].forEach(k => { if (!e[k]) throw new Error('All baseline and observation dates are required before start'); }); e.status = 'running'; return e; }
    get(id) { return this.experiments.find(e => e.experiment_id === id); }
    report(id, now = new Date()) {
      const e = this.get(id); if (!e) throw new Error('Experiment not found');
      const b = this.ledger.metricWindow(e.primary_kpi, e.baseline_start, e.baseline_end, id);
      const o = this.ledger.metricWindow(e.primary_kpi, e.observation_start, e.observation_end, id);
      const delta = o.value - b.value, pct = b.value !== 0 ? Math.round((delta / b.value) * 10000) / 100 : null;
      const complete = e.observation_end && now.getTime() > new Date(`${e.observation_end}T23:59:59Z`).getTime();
      let decision = 'insufficient_evidence';
      if (complete && b.count > 0 && o.count > 0) decision = delta > 0 ? 'keep' : delta < 0 ? 'revert' : 'revise';
      if (complete) { e.status = 'completed'; e.decision = decision; }
      return { experiment_id: id, primary_kpi: e.primary_kpi, event_scope: 'experiment_correlated', baseline: b, observation: o, absolute_delta: delta, percent_change: pct, complete: Boolean(complete), decision, evidence_class: 'E4', limitation: 'Directional before/after comparison only. Confounding may exist; this does not prove causation.' };
    }
  }

  return { version: '1.1.0-core', EVIDENCE_CLASSES, opportunityScore, valueSprint, analyze, EvidenceLedger, ExperimentEngine };
});
