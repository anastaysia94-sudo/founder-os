import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type PortfolioSignal = {
  businessId: string;
  highRisks: number;
  openDecisions: number;
  opportunities: number;
  runningSprints: number;
  completedSprintLoops: number;
  assets: number;
  pendingEvidence: number;
  blockedInitiatives: number;
  plannedAttentionMinutes: number;
};

export type PortfolioTotals = Omit<PortfolioSignal, 'businessId'>;

const emptySignal = (businessId: string): PortfolioSignal => ({
  businessId,
  highRisks: 0,
  openDecisions: 0,
  opportunities: 0,
  runningSprints: 0,
  completedSprintLoops: 0,
  assets: 0,
  pendingEvidence: 0,
  blockedInitiatives: 0,
  plannedAttentionMinutes: 0,
});

export async function loadPortfolioSignals(user: User, businessIds: string[]): Promise<Record<string, PortfolioSignal>> {
  if (!businessIds.length) return {};

  const [risks, decisions, opportunities, sprints, assets, evidence, initiatives, attention] = await Promise.all([
    supabase.from('fdos_risks').select('business_id,level').eq('user_id', user.id).in('business_id', businessIds),
    supabase.from('fdos_decisions').select('business_id,status').eq('user_id', user.id).in('business_id', businessIds),
    supabase.from('fdos_opportunities').select('business_id,id').eq('user_id', user.id).in('business_id', businessIds),
    supabase.from('fdos_value_sprints').select('business_id,status').eq('user_id', user.id).in('business_id', businessIds),
    supabase.from('fdos_business_assets').select('business_id,id').eq('user_id', user.id).in('business_id', businessIds),
    supabase.from('fdos_evidence_proposals').select('business_id,status').eq('user_id', user.id).in('business_id', businessIds),
    supabase.from('fdos_initiatives').select('business_id,status').eq('user_id', user.id).in('business_id', businessIds),
    supabase.from('fdos_attention_blocks').select('business_id,weekly_minutes,status').eq('user_id', user.id).in('business_id', businessIds),
  ]);

  for (const query of [risks, decisions, opportunities, sprints, assets, evidence, initiatives, attention]) {
    if (query.error) throw query.error;
  }

  const result: Record<string, PortfolioSignal> = Object.fromEntries(
    businessIds.map((businessId) => [businessId, emptySignal(businessId)]),
  );

  for (const row of risks.data || []) if (row.level === 'High') result[row.business_id].highRisks += 1;
  for (const row of decisions.data || []) if (row.status === 'Open') result[row.business_id].openDecisions += 1;
  for (const row of opportunities.data || []) result[row.business_id].opportunities += 1;
  for (const row of sprints.data || []) {
    if (row.status === 'Running') result[row.business_id].runningSprints += 1;
    if (['Measured', 'Keep', 'Revise', 'Revert'].includes(row.status)) result[row.business_id].completedSprintLoops += 1;
  }
  for (const row of assets.data || []) result[row.business_id].assets += 1;
  for (const row of evidence.data || []) if (row.status === 'pending') result[row.business_id].pendingEvidence += 1;
  for (const row of initiatives.data || []) if (row.status === 'Blocked') result[row.business_id].blockedInitiatives += 1;
  for (const row of attention.data || []) {
    if (row.status !== 'Stopped') result[row.business_id].plannedAttentionMinutes += Number(row.weekly_minutes || 0);
  }

  return result;
}

export function getPortfolioTotals(signals: Record<string, PortfolioSignal>): PortfolioTotals {
  return Object.values(signals).reduce<PortfolioTotals>((totals, signal) => ({
    highRisks: totals.highRisks + signal.highRisks,
    openDecisions: totals.openDecisions + signal.openDecisions,
    opportunities: totals.opportunities + signal.opportunities,
    runningSprints: totals.runningSprints + signal.runningSprints,
    completedSprintLoops: totals.completedSprintLoops + signal.completedSprintLoops,
    assets: totals.assets + signal.assets,
    pendingEvidence: totals.pendingEvidence + signal.pendingEvidence,
    blockedInitiatives: totals.blockedInitiatives + signal.blockedInitiatives,
    plannedAttentionMinutes: totals.plannedAttentionMinutes + signal.plannedAttentionMinutes,
  }), {
    highRisks: 0,
    openDecisions: 0,
    opportunities: 0,
    runningSprints: 0,
    completedSprintLoops: 0,
    assets: 0,
    pendingEvidence: 0,
    blockedInitiatives: 0,
    plannedAttentionMinutes: 0,
  });
}

export function getAttentionReasons(signal?: PortfolioSignal) {
  if (!signal) return [];
  const reasons: string[] = [];
  if (signal.highRisks) reasons.push(`${signal.highRisks} high risk${signal.highRisks === 1 ? '' : 's'}`);
  if (signal.blockedInitiatives) reasons.push(`${signal.blockedInitiatives} blocked initiative${signal.blockedInitiatives === 1 ? '' : 's'}`);
  if (signal.pendingEvidence) reasons.push(`${signal.pendingEvidence} evidence proposal${signal.pendingEvidence === 1 ? '' : 's'} waiting`);
  if (signal.openDecisions) reasons.push(`${signal.openDecisions} open decision${signal.openDecisions === 1 ? '' : 's'}`);
  return reasons;
}
