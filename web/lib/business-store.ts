import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { BusinessDNA, BusinessRecord, BusinessStage, Decision, EvidenceProposal, MemoryEvent, Opportunity, Risk, ValueItem, ValueSprint } from './fdos';

export type BusinessSummary = {
  id: string;
  name: string;
  stage: BusinessStage;
  currentGoal: string;
  createdAt: string;
  updatedAt: string;
};

const activeBusinessKey = (userId: string) => `fdos.activeBusiness:${userId}`;

export function getActiveBusinessId(userId: string) {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(activeBusinessKey(userId));
}

export function setActiveBusinessId(userId: string, businessId: string) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(activeBusinessKey(userId), businessId);
}

export function clearActiveBusinessId(userId: string) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(activeBusinessKey(userId));
}

export async function listBusinesses(user: User): Promise<BusinessSummary[]> {
  const q = await supabase
    .from('fdos_business_records')
    .select('id,name,stage,current_goal,created_at,updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });
  if (q.error) throw q.error;
  return (q.data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    stage: row.stage,
    currentGoal: row.current_goal,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function createBusiness(user: User, name: string, stage: BusinessStage = 'Idea') {
  const q = await supabase.rpc('fdos_create_business', { p_name: name, p_stage: stage });
  if (q.error) throw q.error;
  if (!q.data) throw new Error('Could not create the business record.');
  const businessId = q.data as string;
  setActiveBusinessId(user.id, businessId);
  return businessId;
}

export async function ensureBusiness(user: User): Promise<string> {
  const selected = getActiveBusinessId(user.id);
  if (selected) {
    const existing = await supabase
      .from('fdos_business_records')
      .select('id')
      .eq('id', selected)
      .eq('user_id', user.id)
      .maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data?.id) return existing.data.id;
    clearActiveBusinessId(user.id);
  }

  const q = await supabase.rpc('fdos_ensure_business');
  if (q.error) throw q.error;
  if (!q.data) throw new Error('Could not create or load the business record.');
  const businessId = q.data as string;
  setActiveBusinessId(user.id, businessId);
  return businessId;
}

export async function loadBusinessRecord(user: User, businessId: string): Promise<BusinessRecord> {
  const [b, v, d, r, o, m, s] = await Promise.all([
    supabase.from('fdos_business_records').select('*').eq('id', businessId).eq('user_id', user.id).single(),
    supabase.from('fdos_value_items').select('*').eq('business_id', businessId).eq('user_id', user.id).order('created_at'),
    supabase.from('fdos_decisions').select('*').eq('business_id', businessId).eq('user_id', user.id).order('created_at'),
    supabase.from('fdos_risks').select('*').eq('business_id', businessId).eq('user_id', user.id).order('created_at'),
    supabase.from('fdos_opportunities').select('*').eq('business_id', businessId).eq('user_id', user.id).order('created_at'),
    supabase.from('fdos_memory').select('*').eq('business_id', businessId).eq('user_id', user.id).order('occurred_at', { ascending: false }),
    supabase.from('fdos_value_sprints').select('*').eq('business_id', businessId).eq('user_id', user.id).order('created_at', { ascending: false }),
  ]);

  for (const q of [b, v, d, r, o, m, s]) if (q.error) throw q.error;
  const row: any = b.data;

  return {
    businessId,
    dna: {
      name: row.name,
      stage: row.stage,
      purpose: row.purpose,
      problem: row.problem,
      customer: row.customer,
      offer: row.offer,
      revenueModel: row.revenue_model,
      advantage: row.advantage,
      constraint: row.constraint_text,
      currentGoal: row.current_goal,
    },
    valueMap: (v.data || []).map((x: any): ValueItem => ({ id: x.id, kind: x.kind, title: x.title, detail: x.detail, evidence: x.evidence_class, evidenceId: x.evidence_id || undefined, sourceUrl: x.source_url || undefined })),
    decisions: (d.data || []).map((x: any): Decision => ({ id: x.id, question: x.question, status: x.status, evidence: x.evidence_class, next: x.next_step, evidenceId: x.evidence_id || undefined, sourceUrl: x.source_url || undefined })),
    risks: (r.data || []).map((x: any): Risk => ({ id: x.id, title: x.title, level: x.level, evidence: x.evidence_class, response: x.response, evidenceId: x.evidence_id || undefined, sourceUrl: x.source_url || undefined })),
    opportunities: (o.data || []).map((x: any): Opportunity => ({ id: x.id, title: x.title, observation: x.observation, evidence: x.evidence_class, confidence: x.confidence, impact: x.impact, speed: x.speed, reversibility: x.reversibility, cost: x.cost, complexity: x.complexity, risk: x.risk, evidenceId: x.evidence_id || undefined, sourceUrl: x.source_url || undefined })),
    memory: (m.data || []).map((x: any): MemoryEvent => ({ id: x.id, date: new Date(x.occurred_at).toLocaleString(), kind: x.kind, summary: x.summary, evidence: x.evidence_class, evidenceId: x.evidence_id || undefined, sourceUrl: x.source_url || undefined })),
    valueSprints: (s.data || []).map((x: any): ValueSprint => ({ id: x.id, title: x.title, hypothesis: x.hypothesis, action: x.action, measure: x.measure, baseline: x.baseline, target: x.target, result: x.result, status: x.status, decision: x.decision || undefined, evidence: x.evidence_class, evidenceId: x.evidence_id || undefined, sourceUrl: x.source_url || undefined, startedAt: x.started_at || undefined, measuredAt: x.measured_at || undefined })),
  };
}

export async function saveDNA(user: User, businessId: string, dna: BusinessDNA) {
  const q = await supabase
    .from('fdos_business_records')
    .update({
      name: dna.name,
      stage: dna.stage,
      purpose: dna.purpose,
      problem: dna.problem,
      customer: dna.customer,
      offer: dna.offer,
      revenue_model: dna.revenueModel,
      advantage: dna.advantage,
      constraint_text: dna.constraint,
      current_goal: dna.currentGoal,
    })
    .eq('id', businessId)
    .eq('user_id', user.id)
    .select('id')
    .single();
  if (q.error) throw q.error;
  if (!q.data?.id) throw new Error('Business DNA was not saved.');
  return q.data;
}

export async function addValue(user: User, businessId: string, item: Omit<ValueItem, 'id'>) {
  const q = await supabase.from('fdos_value_items').insert({ user_id: user.id, business_id: businessId, kind: item.kind, title: item.title, detail: item.detail, evidence_class: item.evidence, source_url: item.sourceUrl || null, evidence_id: item.evidenceId || null }).select('*').single();
  if (q.error) throw q.error;
  return q.data;
}

export async function addDecision(user: User, businessId: string, item: Omit<Decision, 'id'>) {
  const q = await supabase.from('fdos_decisions').insert({ user_id: user.id, business_id: businessId, question: item.question, status: item.status, next_step: item.next, evidence_class: item.evidence, source_url: item.sourceUrl || null, evidence_id: item.evidenceId || null }).select('*').single();
  if (q.error) throw q.error;
  return q.data;
}

export async function addRisk(user: User, businessId: string, item: Omit<Risk, 'id'>) {
  const q = await supabase.from('fdos_risks').insert({ user_id: user.id, business_id: businessId, title: item.title, level: item.level, response: item.response, evidence_class: item.evidence, source_url: item.sourceUrl || null, evidence_id: item.evidenceId || null }).select('*').single();
  if (q.error) throw q.error;
  return q.data;
}

export async function addOpportunity(user: User, businessId: string, item: Omit<Opportunity, 'id'>) {
  const q = await supabase.from('fdos_opportunities').insert({ user_id: user.id, business_id: businessId, title: item.title, observation: item.observation, evidence_class: item.evidence, confidence: item.confidence, impact: item.impact, speed: item.speed, reversibility: item.reversibility, cost: item.cost, complexity: item.complexity, risk: item.risk, source_url: item.sourceUrl || null, evidence_id: item.evidenceId || null }).select('*').single();
  if (q.error) throw q.error;
  return q.data;
}

export async function addMemory(user: User, businessId: string, item: Omit<MemoryEvent, 'id' | 'date'>) {
  const q = await supabase.from('fdos_memory').insert({ user_id: user.id, business_id: businessId, kind: item.kind, summary: item.summary, evidence_class: item.evidence, source_url: item.sourceUrl || null, evidence_id: item.evidenceId || null }).select('*').single();
  if (q.error) throw q.error;
  return q.data;
}

export async function addValueSprint(user: User, businessId: string, item: Omit<ValueSprint, 'id' | 'startedAt' | 'measuredAt'>) {
  const q = await supabase.from('fdos_value_sprints').insert({
    user_id: user.id,
    business_id: businessId,
    title: item.title,
    hypothesis: item.hypothesis,
    action: item.action,
    measure: item.measure,
    baseline: item.baseline,
    target: item.target,
    result: item.result,
    status: item.status,
    decision: item.decision || null,
    evidence_class: item.evidence,
    source_url: item.sourceUrl || null,
    evidence_id: item.evidenceId || null,
    started_at: item.status === 'Running' ? new Date().toISOString() : null,
  }).select('*').single();
  if (q.error) throw q.error;
  return q.data;
}

export async function updateValueSprint(user: User, businessId: string, sprintId: string, patch: Partial<Omit<ValueSprint, 'id' | 'evidenceId' | 'sourceUrl' | 'evidence'>>) {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.hypothesis !== undefined) row.hypothesis = patch.hypothesis;
  if (patch.action !== undefined) row.action = patch.action;
  if (patch.measure !== undefined) row.measure = patch.measure;
  if (patch.baseline !== undefined) row.baseline = patch.baseline;
  if (patch.target !== undefined) row.target = patch.target;
  if (patch.result !== undefined) row.result = patch.result;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.decision !== undefined) row.decision = patch.decision;
  if (patch.startedAt !== undefined) row.started_at = patch.startedAt;
  if (patch.measuredAt !== undefined) row.measured_at = patch.measuredAt;
  if (patch.status === 'Running' && patch.startedAt === undefined) row.started_at = new Date().toISOString();
  if (['Measured', 'Keep', 'Revise', 'Revert'].includes(patch.status || '') && patch.measuredAt === undefined) row.measured_at = new Date().toISOString();

  const q = await supabase.from('fdos_value_sprints')
    .update(row)
    .eq('id', sprintId)
    .eq('business_id', businessId)
    .eq('user_id', user.id)
    .select('*')
    .single();
  if (q.error) throw q.error;
  return q.data;
}

export async function loadEvidenceProposals(user: User, businessId: string): Promise<EvidenceProposal[]> {
  const q = await supabase
    .from('fdos_evidence_proposals')
    .select('id,evidence_id,target_type,title,rationale,payload,status,created_at,fdos_evidence(source_url,title)')
    .eq('user_id', user.id)
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });
  if (q.error) throw q.error;
  return (q.data || []).map((x: any) => ({ id: x.id, evidenceId: x.evidence_id, targetType: x.target_type, title: x.title, rationale: x.rationale, payload: x.payload || {}, status: x.status, createdAt: x.created_at, sourceUrl: x.fdos_evidence?.source_url || undefined, evidenceTitle: x.fdos_evidence?.title || undefined }));
}

export async function approveEvidenceProposal(id: string) {
  const q = await supabase.rpc('fdos_apply_evidence_proposal', { p_proposal_id: id });
  if (q.error) throw q.error;
  if (!q.data) throw new Error('Evidence proposal was not applied.');
  return q.data;
}

export async function rejectEvidenceProposal(user: User, id: string) {
  const q = await supabase
    .from('fdos_evidence_proposals')
    .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .select('id')
    .single();
  if (q.error) throw q.error;
  if (!q.data?.id) throw new Error('Evidence proposal was not rejected.');
  return q.data;
}
