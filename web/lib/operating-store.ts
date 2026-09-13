import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type {
  FinancialAssumption,
  Initiative,
  InitiativeStatus,
  OfferHypothesis,
  OfferStatus,
  OperatingWorkbenchRecord,
} from './operating-workbench';

export async function loadOperatingWorkbench(user: User, businessId: string): Promise<OperatingWorkbenchRecord> {
  const [financial, offers, initiatives] = await Promise.all([
    supabase.from('fdos_financial_assumptions').select('*').eq('business_id', businessId).eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('fdos_offer_hypotheses').select('*').eq('business_id', businessId).eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('fdos_initiatives').select('*').eq('business_id', businessId).eq('user_id', user.id).order('priority').order('created_at', { ascending: false }),
  ]);

  for (const query of [financial, offers, initiatives]) if (query.error) throw query.error;

  return {
    financialAssumptions: (financial.data || []).map((row: any): FinancialAssumption => ({
      id: row.id,
      title: row.title,
      kind: row.kind,
      value: row.value_text,
      confidence: row.confidence,
      evidence: row.evidence_class,
      evidenceId: row.evidence_id || undefined,
      sourceUrl: row.source_url || undefined,
      createdAt: row.created_at,
    })),
    offers: (offers.data || []).map((row: any): OfferHypothesis => ({
      id: row.id,
      name: row.name,
      customer: row.customer,
      problem: row.problem,
      promise: row.promise,
      delivery: row.delivery,
      price: row.price_text,
      status: row.status,
      evidence: row.evidence_class,
      evidenceId: row.evidence_id || undefined,
      sourceUrl: row.source_url || undefined,
      createdAt: row.created_at,
    })),
    initiatives: (initiatives.data || []).map((row: any): Initiative => ({
      id: row.id,
      title: row.title,
      outcome: row.outcome,
      status: row.status,
      priority: row.priority,
      owner: row.owner_text,
      dueDate: row.due_date || undefined,
      evidence: row.evidence_class,
      evidenceId: row.evidence_id || undefined,
      sourceUrl: row.source_url || undefined,
      createdAt: row.created_at,
    })),
  };
}

export async function addFinancialAssumption(user: User, businessId: string, item: Omit<FinancialAssumption, 'id' | 'createdAt'>) {
  const query = await supabase.from('fdos_financial_assumptions').insert({
    user_id: user.id,
    business_id: businessId,
    title: item.title,
    kind: item.kind,
    value_text: item.value,
    confidence: item.confidence,
    evidence_class: item.evidence,
    source_url: item.sourceUrl || null,
    evidence_id: item.evidenceId || null,
  }).select('*').single();
  if (query.error) throw query.error;
  return query.data;
}

export async function addOfferHypothesis(user: User, businessId: string, item: Omit<OfferHypothesis, 'id' | 'createdAt'>) {
  const query = await supabase.from('fdos_offer_hypotheses').insert({
    user_id: user.id,
    business_id: businessId,
    name: item.name,
    customer: item.customer,
    problem: item.problem,
    promise: item.promise,
    delivery: item.delivery,
    price_text: item.price,
    status: item.status,
    evidence_class: item.evidence,
    source_url: item.sourceUrl || null,
    evidence_id: item.evidenceId || null,
  }).select('*').single();
  if (query.error) throw query.error;
  return query.data;
}

export async function updateOfferStatus(user: User, businessId: string, offerId: string, status: OfferStatus) {
  const query = await supabase.from('fdos_offer_hypotheses')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', offerId)
    .eq('business_id', businessId)
    .eq('user_id', user.id)
    .select('id,status')
    .single();
  if (query.error) throw query.error;
  return query.data;
}

export async function addInitiative(user: User, businessId: string, item: Omit<Initiative, 'id' | 'createdAt'>) {
  const query = await supabase.from('fdos_initiatives').insert({
    user_id: user.id,
    business_id: businessId,
    title: item.title,
    outcome: item.outcome,
    status: item.status,
    priority: item.priority,
    owner_text: item.owner,
    due_date: item.dueDate || null,
    evidence_class: item.evidence,
    source_url: item.sourceUrl || null,
    evidence_id: item.evidenceId || null,
  }).select('*').single();
  if (query.error) throw query.error;
  return query.data;
}

export async function updateInitiativeStatus(user: User, businessId: string, initiativeId: string, status: InitiativeStatus) {
  const query = await supabase.from('fdos_initiatives')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', initiativeId)
    .eq('business_id', businessId)
    .eq('user_id', user.id)
    .select('id,status')
    .single();
  if (query.error) throw query.error;
  return query.data;
}
