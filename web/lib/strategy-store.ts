import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type {
  AttentionBlock,
  BusinessAsset,
  BusinessModelElement,
  CustomerInsight,
  DistributionExperiment,
  PortfolioThesis,
  Scenario,
  StrategyDynastyRecord,
} from './strategy-dynasty';

export async function loadStrategyDynasty(user: User, businessId: string): Promise<StrategyDynastyRecord> {
  const [model, customers, distribution, assets, scenarios, portfolio, attention] = await Promise.all([
    supabase.from('fdos_business_model_elements').select('*').eq('business_id', businessId).eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('fdos_customer_insights').select('*').eq('business_id', businessId).eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('fdos_distribution_experiments').select('*').eq('business_id', businessId).eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('fdos_business_assets').select('*').eq('business_id', businessId).eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('fdos_scenarios').select('*').eq('business_id', businessId).eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('fdos_portfolio_theses').select('*').eq('business_id', businessId).eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('fdos_attention_blocks').select('*').eq('business_id', businessId).eq('user_id', user.id).order('created_at', { ascending: false }),
  ]);
  for (const q of [model, customers, distribution, assets, scenarios, portfolio, attention]) if (q.error) throw q.error;
  return {
    model: (model.data || []).map((x: any): BusinessModelElement => ({ id: x.id, area: x.area, statement: x.statement, confidence: x.confidence, status: x.status, evidence: x.evidence_class })),
    customerInsights: (customers.data || []).map((x: any): CustomerInsight => ({ id: x.id, kind: x.kind, statement: x.statement, implication: x.implication, evidence: x.evidence_class })),
    distribution: (distribution.data || []).map((x: any): DistributionExperiment => ({ id: x.id, channel: x.channel, audience: x.audience, message: x.message, action: x.action, measure: x.measure, result: x.result, status: x.status, evidence: x.evidence_class })),
    assets: (assets.data || []).map((x: any): BusinessAsset => ({ id: x.id, kind: x.kind, name: x.name, valueReason: x.value_reason, control: x.control, transferability: x.transferability, evidence: x.evidence_class })),
    scenarios: (scenarios.data || []).map((x: any): Scenario => ({ id: x.id, name: x.name, premise: x.premise, upside: x.upside, downside: x.downside, earlySignal: x.early_signal, decisionRule: x.decision_rule, probability: x.probability, status: x.status, evidence: x.evidence_class })),
    portfolio: (portfolio.data || []).map((x: any): PortfolioThesis => ({ id: x.id, name: x.name, role: x.role, thesis: x.thesis, nextCapital: x.next_capital, nextAttention: x.next_attention, status: x.status, evidence: x.evidence_class })),
    attention: (attention.data || []).map((x: any): AttentionBlock => ({ id: x.id, area: x.area, outcome: x.outcome, weeklyMinutes: x.weekly_minutes, status: x.status, evidence: x.evidence_class })),
  };
}

export async function addModelElement(user: User, businessId: string, item: Omit<BusinessModelElement, 'id'>) {
  const q = await supabase.from('fdos_business_model_elements').insert({ user_id: user.id, business_id: businessId, area: item.area, statement: item.statement, confidence: item.confidence, status: item.status, evidence_class: item.evidence }).select('*').single();
  if (q.error) throw q.error;
  return q.data;
}

export async function updateModelStatus(user: User, businessId: string, id: string, status: BusinessModelElement['status']) {
  const q = await supabase.from('fdos_business_model_elements').update({ status, updated_at: new Date().toISOString() }).eq('id', id).eq('business_id', businessId).eq('user_id', user.id).select('id').single();
  if (q.error) throw q.error;
  return q.data;
}

export async function addCustomerInsight(user: User, businessId: string, item: Omit<CustomerInsight, 'id'>) {
  const q = await supabase.from('fdos_customer_insights').insert({ user_id: user.id, business_id: businessId, kind: item.kind, statement: item.statement, implication: item.implication, evidence_class: item.evidence }).select('*').single();
  if (q.error) throw q.error;
  return q.data;
}

export async function addDistributionExperiment(user: User, businessId: string, item: Omit<DistributionExperiment, 'id'>) {
  const q = await supabase.from('fdos_distribution_experiments').insert({ user_id: user.id, business_id: businessId, channel: item.channel, audience: item.audience, message: item.message, action: item.action, measure: item.measure, result: item.result, status: item.status, evidence_class: item.evidence }).select('*').single();
  if (q.error) throw q.error;
  return q.data;
}

export async function updateDistribution(user: User, businessId: string, id: string, patch: Partial<Pick<DistributionExperiment, 'status' | 'result'>>) {
  const q = await supabase.from('fdos_distribution_experiments').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id).eq('business_id', businessId).eq('user_id', user.id).select('id').single();
  if (q.error) throw q.error;
  return q.data;
}

export async function addBusinessAsset(user: User, businessId: string, item: Omit<BusinessAsset, 'id'>) {
  const q = await supabase.from('fdos_business_assets').insert({ user_id: user.id, business_id: businessId, kind: item.kind, name: item.name, value_reason: item.valueReason, control: item.control, transferability: item.transferability, evidence_class: item.evidence }).select('*').single();
  if (q.error) throw q.error;
  return q.data;
}

export async function addScenario(user: User, businessId: string, item: Omit<Scenario, 'id'>) {
  const q = await supabase.from('fdos_scenarios').insert({ user_id: user.id, business_id: businessId, name: item.name, premise: item.premise, upside: item.upside, downside: item.downside, early_signal: item.earlySignal, decision_rule: item.decisionRule, probability: item.probability, status: item.status, evidence_class: item.evidence }).select('*').single();
  if (q.error) throw q.error;
  return q.data;
}

export async function updateScenarioStatus(user: User, businessId: string, id: string, status: Scenario['status']) {
  const q = await supabase.from('fdos_scenarios').update({ status, updated_at: new Date().toISOString() }).eq('id', id).eq('business_id', businessId).eq('user_id', user.id).select('id').single();
  if (q.error) throw q.error;
  return q.data;
}

export async function addPortfolioThesis(user: User, businessId: string, item: Omit<PortfolioThesis, 'id'>) {
  const q = await supabase.from('fdos_portfolio_theses').insert({ user_id: user.id, business_id: businessId, name: item.name, role: item.role, thesis: item.thesis, next_capital: item.nextCapital, next_attention: item.nextAttention, status: item.status, evidence_class: item.evidence }).select('*').single();
  if (q.error) throw q.error;
  return q.data;
}

export async function updatePortfolioStatus(user: User, businessId: string, id: string, status: PortfolioThesis['status']) {
  const q = await supabase.from('fdos_portfolio_theses').update({ status, updated_at: new Date().toISOString() }).eq('id', id).eq('business_id', businessId).eq('user_id', user.id).select('id').single();
  if (q.error) throw q.error;
  return q.data;
}

export async function addAttentionBlock(user: User, businessId: string, item: Omit<AttentionBlock, 'id'>) {
  const q = await supabase.from('fdos_attention_blocks').insert({ user_id: user.id, business_id: businessId, area: item.area, outcome: item.outcome, weekly_minutes: item.weeklyMinutes, status: item.status, evidence_class: item.evidence }).select('*').single();
  if (q.error) throw q.error;
  return q.data;
}

export async function updateAttentionStatus(user: User, businessId: string, id: string, status: AttentionBlock['status']) {
  const q = await supabase.from('fdos_attention_blocks').update({ status, updated_at: new Date().toISOString() }).eq('id', id).eq('business_id', businessId).eq('user_id', user.id).select('id').single();
  if (q.error) throw q.error;
  return q.data;
}
