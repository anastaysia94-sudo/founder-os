import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { BusinessDNA, BusinessRecord, Decision, MemoryEvent, Opportunity, Risk, ValueItem } from './fdos';

function blankDNA(): BusinessDNA {
  return {
    name: 'Untitled business', stage: 'Idea', purpose: '', problem: '', customer: '', offer: '',
    revenueModel: '', advantage: '', constraint: '', currentGoal: 'Reduce the biggest uncertainty first.'
  };
}

export async function ensureBusiness(user: User): Promise<string> {
  const existing = await supabase.from('fdos_business_records').select('id').eq('user_id', user.id).order('created_at').limit(1).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data?.id) return existing.data.id;
  const dna = blankDNA();
  const created = await supabase.from('fdos_business_records').insert({
    user_id:user.id,name:dna.name,stage:dna.stage,purpose:dna.purpose,problem:dna.problem,customer:dna.customer,
    offer:dna.offer,revenue_model:dna.revenueModel,advantage:dna.advantage,constraint_text:dna.constraint,current_goal:dna.currentGoal
  }).select('id').single();
  if (created.error) throw created.error;
  await supabase.from('fdos_memory').insert({user_id:user.id,business_id:created.data.id,kind:'Workspace created',summary:'Founder Dynasty OS created this business record.',evidence_class:'E4'});
  return created.data.id;
}

export async function loadBusinessRecord(user: User, businessId: string): Promise<BusinessRecord> {
  const [b,v,d,r,o,m] = await Promise.all([
    supabase.from('fdos_business_records').select('*').eq('id',businessId).eq('user_id',user.id).single(),
    supabase.from('fdos_value_items').select('*').eq('business_id',businessId).eq('user_id',user.id).order('created_at'),
    supabase.from('fdos_decisions').select('*').eq('business_id',businessId).eq('user_id',user.id).order('created_at'),
    supabase.from('fdos_risks').select('*').eq('business_id',businessId).eq('user_id',user.id).order('created_at'),
    supabase.from('fdos_opportunities').select('*').eq('business_id',businessId).eq('user_id',user.id).order('created_at'),
    supabase.from('fdos_memory').select('*').eq('business_id',businessId).eq('user_id',user.id).order('occurred_at',{ascending:false})
  ]);
  for (const q of [b,v,d,r,o,m]) if (q.error) throw q.error;
  const row:any=b.data;
  return {
    businessId,
    dna:{name:row.name,stage:row.stage,purpose:row.purpose,problem:row.problem,customer:row.customer,offer:row.offer,revenueModel:row.revenue_model,advantage:row.advantage,constraint:row.constraint_text,currentGoal:row.current_goal},
    valueMap:(v.data||[]).map((x:any):ValueItem=>({id:x.id,kind:x.kind,title:x.title,detail:x.detail,evidence:x.evidence_class,sourceUrl:x.source_url||undefined})),
    decisions:(d.data||[]).map((x:any):Decision=>({id:x.id,question:x.question,status:x.status,evidence:x.evidence_class,next:x.next_step})),
    risks:(r.data||[]).map((x:any):Risk=>({id:x.id,title:x.title,level:x.level,evidence:x.evidence_class,response:x.response})),
    opportunities:(o.data||[]).map((x:any):Opportunity=>({id:x.id,title:x.title,observation:x.observation,evidence:x.evidence_class,confidence:x.confidence,impact:x.impact,speed:x.speed,reversibility:x.reversibility,cost:x.cost,complexity:x.complexity,risk:x.risk})),
    memory:(m.data||[]).map((x:any):MemoryEvent=>({id:x.id,date:new Date(x.occurred_at).toLocaleString(),kind:x.kind,summary:x.summary,evidence:x.evidence_class}))
  };
}

export async function saveDNA(user: User,businessId:string,dna:BusinessDNA){
  const q=await supabase.from('fdos_business_records').update({name:dna.name,stage:dna.stage,purpose:dna.purpose,problem:dna.problem,customer:dna.customer,offer:dna.offer,revenue_model:dna.revenueModel,advantage:dna.advantage,constraint_text:dna.constraint,current_goal:dna.currentGoal}).eq('id',businessId).eq('user_id',user.id);
  if(q.error) throw q.error;
}

export async function addValue(user:User,businessId:string,item:Omit<ValueItem,'id'>){const q=await supabase.from('fdos_value_items').insert({user_id:user.id,business_id:businessId,kind:item.kind,title:item.title,detail:item.detail,evidence_class:item.evidence,source_url:item.sourceUrl||null}).select('*').single();if(q.error)throw q.error;return q.data;}
export async function addDecision(user:User,businessId:string,item:Omit<Decision,'id'>){const q=await supabase.from('fdos_decisions').insert({user_id:user.id,business_id:businessId,question:item.question,status:item.status,next_step:item.next,evidence_class:item.evidence}).select('*').single();if(q.error)throw q.error;return q.data;}
export async function addRisk(user:User,businessId:string,item:Omit<Risk,'id'>){const q=await supabase.from('fdos_risks').insert({user_id:user.id,business_id:businessId,title:item.title,level:item.level,response:item.response,evidence_class:item.evidence}).select('*').single();if(q.error)throw q.error;return q.data;}
export async function addOpportunity(user:User,businessId:string,item:Omit<Opportunity,'id'>){const q=await supabase.from('fdos_opportunities').insert({user_id:user.id,business_id:businessId,title:item.title,observation:item.observation,evidence_class:item.evidence,confidence:item.confidence,impact:item.impact,speed:item.speed,reversibility:item.reversibility,cost:item.cost,complexity:item.complexity,risk:item.risk}).select('*').single();if(q.error)throw q.error;return q.data;}
export async function addMemory(user:User,businessId:string,item:Omit<MemoryEvent,'id'|'date'>){const q=await supabase.from('fdos_memory').insert({user_id:user.id,business_id:businessId,kind:item.kind,summary:item.summary,evidence_class:item.evidence}).select('*').single();if(q.error)throw q.error;return q.data;}
