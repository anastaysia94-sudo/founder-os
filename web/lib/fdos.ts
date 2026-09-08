export type EvidenceClass='E1'|'E2'|'E3'|'E4'|'E5'|'E6'|'E7'|'E8';
export type BusinessStage='Idea'|'Exploring'|'Validating'|'Building'|'Pre-Launch'|'Launched'|'Finding Traction'|'Growing'|'Systemizing'|'Scaling'|'Portfolio'|'Dynasty';
export type Opportunity={id:string;title:string;observation:string;evidence:EvidenceClass;confidence:number;impact:number;speed:number;reversibility:number;cost:number;complexity:number;risk:number};
export type Decision={id:string;question:string;status:'Open'|'Decided'|'Learning';evidence:EvidenceClass;next:string};
export type Risk={id:string;title:string;level:'Low'|'Medium'|'High';evidence:EvidenceClass;response:string};
export type MemoryEvent={id:string;date:string;kind:string;summary:string;evidence:EvidenceClass};
export type ValueItem={id:string;kind:'Created'|'Captured'|'Leak'|'At Risk'|'Opportunity'|'Asset';title:string;detail:string;evidence:EvidenceClass};
export type BusinessDNA={name:string;stage:BusinessStage;purpose:string;problem:string;customer:string;offer:string;revenueModel:string;advantage:string;constraint:string;currentGoal:string};
export type BusinessRecord={dna:BusinessDNA;opportunities:Opportunity[];decisions:Decision[];risks:Risk[];memory:MemoryEvent[];valueMap:ValueItem[]};

export const evidenceLabels:Record<EvidenceClass,string>={E1:'Verified Fact',E2:'Current External Evidence',E3:'Customer-Derived Evidence',E4:'Internal Observation',E5:'Strategic Hypothesis',E6:'Financial Model Assumption',E7:'Forecast',E8:'Illustrative Example'};
export function score(o:Opportunity){const d=Math.max(1,(o.cost+o.complexity+o.risk)*10);return Math.min(100,Math.round((o.impact*(o.confidence/100)*o.speed*o.reversibility/d)*10)/10)}

export const demoBusiness:BusinessRecord={
  dna:{name:'New Business Workspace',stage:'Idea',purpose:'Turn a promising idea into a business worth building.',problem:'The exact customer problem is not yet proven.',customer:'Unknown until research or real conversations support a clearer answer.',offer:'Not decided yet.',revenueModel:'Not decided yet.',advantage:'Unknown. Must be earned or demonstrated.',constraint:'Avoid building too much before stronger evidence exists.',currentGoal:'Find the cheapest useful test that can reduce uncertainty.'},
  opportunities:[
    {id:'o1',title:'Define the first real problem to test',observation:'A broad idea becomes easier to evaluate when one customer problem is stated clearly.',evidence:'E5',confidence:78,impact:9,speed:9,reversibility:10,cost:1,complexity:2,risk:1},
    {id:'o2',title:'Compare three possible business models',observation:'The same idea may work better as a service, subscription, licensing model, marketplace, or another structure.',evidence:'E5',confidence:68,impact:8,speed:7,reversibility:10,cost:1,complexity:3,risk:1},
    {id:'o3',title:'Run one evidence-gathering conversation or test',observation:'One real external signal is more useful than adding another speculative feature.',evidence:'E5',confidence:84,impact:10,speed:8,reversibility:10,cost:2,complexity:3,risk:2}
  ],
  decisions:[
    {id:'d1',question:'What exact problem should this business solve first?',status:'Open',evidence:'E5',next:'Write the smallest useful problem statement and test it.'},
    {id:'d2',question:'Who is the first customer group worth learning from?',status:'Open',evidence:'E5',next:'Choose one group narrow enough to research properly.'}
  ],
  risks:[
    {id:'r1',title:'Building before demand is understood',level:'High',evidence:'E5',response:'Keep the first test cheap and reversible.'},
    {id:'r2',title:'Treating assumptions as facts',level:'Medium',evidence:'E4',response:'Require an evidence label on important claims.'}
  ],
  memory:[
    {id:'m1',date:'Today',kind:'Workspace created',summary:'Founder Dynasty OS started this business record in Idea stage.',evidence:'E4'},
    {id:'m2',date:'Today',kind:'Operating rule',summary:'Sales is one growth module inside the wider business operating system.',evidence:'E4'}
  ],
  valueMap:[
    {id:'v1',kind:'Opportunity',title:'Unproven idea can still be shaped cheaply',detail:'Early uncertainty is useful when the system turns it into specific tests instead of premature building.',evidence:'E5'},
    {id:'v2',kind:'Leak',title:'Founder attention can be wasted on low-value building',detail:'Time spent on features before the business problem is understood may create little useful evidence.',evidence:'E5'},
    {id:'v3',kind:'Asset',title:'Decision and evidence history',detail:'A durable record of what was tried and learned can become a strategic business asset over time.',evidence:'E5'}
  ]
};
