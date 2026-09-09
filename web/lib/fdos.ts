export type EvidenceClass='E1'|'E2'|'E3'|'E4'|'E5'|'E6'|'E7'|'E8';
export type BusinessStage='Idea'|'Exploring'|'Validating'|'Building'|'Pre-Launch'|'Launched'|'Finding Traction'|'Growing'|'Systemizing'|'Scaling'|'Portfolio'|'Dynasty';
export type Opportunity={id:string;title:string;observation:string;evidence:EvidenceClass;confidence:number;impact:number;speed:number;reversibility:number;cost:number;complexity:number;risk:number};
export type Decision={id:string;question:string;status:'Open'|'Decided'|'Learning';evidence:EvidenceClass;next:string};
export type Risk={id:string;title:string;level:'Low'|'Medium'|'High';evidence:EvidenceClass;response:string};
export type MemoryEvent={id:string;date:string;kind:string;summary:string;evidence:EvidenceClass};
export type ValueItem={id:string;kind:'Created'|'Captured'|'Leak'|'At Risk'|'Opportunity'|'Asset';title:string;detail:string;evidence:EvidenceClass;sourceUrl?:string};
export type BusinessDNA={name:string;stage:BusinessStage;purpose:string;problem:string;customer:string;offer:string;revenueModel:string;advantage:string;constraint:string;currentGoal:string};
export type BusinessRecord={businessId?:string;dna:BusinessDNA;opportunities:Opportunity[];decisions:Decision[];risks:Risk[];memory:MemoryEvent[];valueMap:ValueItem[]};

export const evidenceLabels:Record<EvidenceClass,string>={E1:'Verified Fact',E2:'Current External Evidence',E3:'Customer-Derived Evidence',E4:'Internal Observation',E5:'Strategic Hypothesis',E6:'Financial Model Assumption',E7:'Forecast',E8:'Illustrative Example'};
export function score(o:Opportunity){const d=Math.max(1,(o.cost+o.complexity+o.risk)*10);return Math.min(100,Math.round((o.impact*(o.confidence/100)*o.speed*o.reversibility/d)*10)/10)}

export const blankBusiness:BusinessRecord={businessId:undefined,dna:{name:'Untitled business',stage:'Idea',purpose:'',problem:'',customer:'',offer:'',revenueModel:'',advantage:'',constraint:'',currentGoal:'Reduce the biggest uncertainty first.'},opportunities:[],decisions:[],risks:[],memory:[],valueMap:[]};

export const demoBusiness:BusinessRecord={
  businessId:undefined,
  dna:{name:'New Business Workspace',stage:'Idea',purpose:'Turn a promising idea into a business worth building.',problem:'The exact customer problem is not yet proven.',customer:'Unknown until research or real conversations support a clearer answer.',offer:'Not decided yet.',revenueModel:'Not decided yet.',advantage:'Unknown. Must be earned or demonstrated.',constraint:'Avoid building too much before stronger evidence exists.',currentGoal:'Find the cheapest useful test that can reduce uncertainty.'},
  opportunities:[{id:'o1',title:'Define the first real problem to test',observation:'A broad idea becomes easier to evaluate when one customer problem is stated clearly.',evidence:'E5',confidence:78,impact:9,speed:9,reversibility:10,cost:1,complexity:2,risk:1}],
  decisions:[{id:'d1',question:'What exact problem should this business solve first?',status:'Open',evidence:'E5',next:'Write the smallest useful problem statement and test it.'}],
  risks:[{id:'r1',title:'Building before demand is understood',level:'High',evidence:'E5',response:'Keep the first test cheap and reversible.'}],
  memory:[{id:'m1',date:'Today',kind:'Example only',summary:'This demo record exists only when cloud sync is unavailable or before sign-in.',evidence:'E8'}],
  valueMap:[{id:'v1',kind:'Opportunity',title:'Unproven idea can still be shaped cheaply',detail:'Early uncertainty is useful when the system turns it into specific tests instead of premature building.',evidence:'E5'}]
};
