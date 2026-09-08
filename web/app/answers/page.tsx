import type {Metadata} from 'next';

export const metadata:Metadata={
  title:'Business Operating System Answers',
  description:'Plain-English answers about business operating systems, idea validation, evidence, experiments, prioritization, operations, finance, product, sales, hiring, and risk.',
};

const answers=[
  ['What is a business operating system?','A business operating system is a repeatable way to decide what matters, assign action, measure what happened, preserve evidence, and choose the next move. Founder Dynasty OS applies that loop to an idea, a one-person business, a growing company, or an established operation.'],
  ['Can Founder Dynasty OS be used before I have a business?','Yes. A raw idea is a valid starting point. The system can treat the idea as a hypothesis, identify what would need to be true for it to work, rank the cheapest useful tests, and keep imagined revenue separate from real evidence.'],
  ['Is Founder Dynasty OS only a sales tool?','No. Sales is one execution system. The broader product is designed for strategy, product, operations, customer experience, finance, hiring, risk, evidence collection, experiments, and prioritization.'],
  ['What does evidence-first business planning mean?','It means a forecast, assumption, example, customer statement, external source, and verified fact are not allowed to masquerade as the same thing. Each important claim gets a proof label and can be revised when better evidence arrives.'],
  ['What is a Value Leak?','A Value Leak is a place where a business may be losing money, customers, time, attention, quality, trust, or opportunity. It is a problem to investigate, not a claim that money has definitely been lost.'],
  ['What is a Value Sprint?','A Value Sprint is a short measured experiment. Pick one meaningful problem, establish a baseline, take one specific action, measure a relevant result, then KEEP, REVISE, or REVERT based on what the evidence supports.'],
  ['How should a founder choose what to work on first?','Rank candidate actions by expected impact, evidence strength, cost, reversibility, urgency, dependency, and effort. Then choose the highest-value action that can produce useful evidence without creating disproportionate downside.'],
  ['How does the system handle financial forecasts?','Forecasts and financial-model assumptions remain explicitly labeled as estimates. Actual cash, invoices, expenses, conversion events, and other verified records should be kept separate from modeled outcomes.'],
  ['How can this help with product decisions?','Turn feature requests or product ideas into testable hypotheses. Record the user problem, evidence, expected outcome, cost, success measure, guardrails, and post-test decision instead of shipping features because somebody sounded confident in a meeting.'],
  ['How can this help with operations?','Operational work can be organized around recurring processes, bottlenecks, owners, deadlines, failure modes, quality checks, and measured cycle times. The goal is to improve the system, not simply create more tasks.'],
  ['How can this help with hiring?','Treat a hire as a business decision with a defined outcome. Identify the capability gap, evidence of recurring demand, cost range, success measures, alternatives, and the risk of hiring too early or too late.'],
  ['How can this help with risk?','Record risks with likelihood, impact, evidence, owner, mitigation, trigger conditions, and review dates. Risks should become visible operating decisions rather than a vague list filed somewhere nobody opens again.'],
];

export default function Answers(){
  const siteUrl=process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/,'');
  const structured={
    '@context':'https://schema.org',
    '@type':'WebPage',
    name:'Founder Dynasty OS Business Operating System Answers',
    description:'Plain-English answers about evidence-first business operations from idea to growth.',
    about:{'@type':'SoftwareApplication',name:'Founder Dynasty OS'},
    publisher:{'@type':'Organization',name:'SmartPickShop Holdings'},
    ...(siteUrl?{url:`${siteUrl}/answers`}:{}),
  };
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structured)}}/>
    <header className="hero"><div><p className="eyebrow">FOUNDER DYNASTY OS · ANSWER CENTER</p><h1>Business questions. <span>Plain-English answers.</span></h1><p className="lede">Founder Dynasty OS is built for the messy part of business: figuring out what is true, what is only an assumption, what deserves attention, and what to do next.</p><p><a href="/">← Open Founder Dynasty OS</a></p></div><div className="status">EVIDENCE BEFORE CONFIDENCE</div></header>
    <section className="panel"><p className="eyebrow">THE SHORT VERSION</p><h2>One operating loop for any business stage</h2><p className="plainIntro">Start with an idea, problem, goal, customer signal, operational issue, or financial question. Collect the best available evidence. Rank the decisions. Run the smallest useful test. Measure the result. Keep what helped, revise what is uncertain, and undo what caused harm.</p></section>
    <section className="panel glossary"><p className="eyebrow">DIRECT ANSWERS</p><h2>What founders and business owners usually need explained</h2><div className="glossaryGrid">{answers.map(([q,a])=><article key={q}><h3>{q}</h3><p>{a}</p></article>)}</div></section>
    <section className="panel"><p className="eyebrow">WHERE IT APPLIES</p><h2>Not just customer acquisition</h2><div className="vault"><div><b>Idea</b><span>Problem, audience, assumptions, validation tests.</span></div><div><b>Strategy</b><span>Choices, tradeoffs, positioning, constraints.</span></div><div><b>Product</b><span>User problems, experiments, adoption evidence.</span></div><div><b>Operations</b><span>Processes, bottlenecks, quality, cycle time.</span></div><div><b>Sales</b><span>Prospects, outreach, pipeline, conversion evidence.</span></div><div><b>Finance</b><span>Cash facts, forecasts, assumptions, scenarios.</span></div><div><b>Team</b><span>Roles, hiring evidence, ownership, accountability.</span></div><div><b>Risk</b><span>Failure modes, controls, triggers, mitigation.</span></div></div></section>
    <footer>Founder Dynasty OS · SmartPickShop Holdings · Evidence-first business operating system.</footer>
  </main>;
}
