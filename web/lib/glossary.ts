export type GlossaryEntry = {
  term: string;
  plain: string;
  category: 'Core' | 'Evidence' | 'Strategy' | 'Customers' | 'Money' | 'Execution' | 'Assets' | 'Dynasty' | 'Technical';
  example?: string;
  aliases?: string[];
};

export const glossaryEntries: GlossaryEntry[] = [
  { term: 'Business Stage', category: 'Core', plain: 'Where the business is in its life right now. The stage changes what deserves attention next.', example: 'Idea, Validating, Growing, Portfolio, or Dynasty.' },
  { term: 'Business DNA', category: 'Core', plain: 'The living description of what the business is: why it exists, who it serves, what problem it solves, what it offers, how it may make money, its advantage, constraints, and current goal.' },
  { term: 'Founder Command Center', category: 'Core', plain: 'The place that pulls the most important signals from the whole business into one view so the founder can decide what deserves attention.' },
  { term: 'Operating Intelligence', category: 'Core', plain: 'A connected view of what the business knows, assumes, is doing, is learning, and should probably do next.' },
  { term: 'What Am I Missing?', category: 'Core', plain: 'An FDOS check for unanswered questions, weak evidence, blind spots, risks, and missing next actions.' },
  { term: 'Business X-Ray', category: 'Core', plain: 'A structural check of the business. It shows where the record is strong or thin without pretending to grade the future success of the company.' },
  { term: 'Evidence', category: 'Evidence', plain: 'Information that supports a claim. FDOS labels important claims so facts, outside proof, customer proof, observations, assumptions, forecasts, and examples do not get mixed together.' },
  { term: 'E1 · Verified Fact', category: 'Evidence', plain: 'A fact that has been directly verified from a reliable source or the business record.' },
  { term: 'E2 · Current External Evidence', category: 'Evidence', plain: 'Current information from outside the business, such as a public webpage, market source, regulation, competitor page, or other attributable source.' },
  { term: 'E3 · Customer-Derived Evidence', category: 'Evidence', plain: 'Evidence that actually came from customers or customer behavior, such as replies, interviews, purchases, cancellations, or observed usage.' },
  { term: 'E4 · Internal Observation', category: 'Evidence', plain: 'Something the founder or team observed or recorded internally. Useful, but not the same as outside or customer proof.' },
  { term: 'E5 · Strategic Hypothesis', category: 'Evidence', plain: 'A reasoned idea about what might be true or what might work. It should be tested rather than presented as fact.' },
  { term: 'E6 · Financial Model Assumption', category: 'Evidence', plain: 'A number or financial relationship used for planning before it has been verified by actual financial results.' },
  { term: 'E7 · Forecast', category: 'Evidence', plain: 'A reasoned view of what may happen in the future. A forecast is not a promise or a fact from the future.' },
  { term: 'E8 · Illustrative Example', category: 'Evidence', plain: 'An example used to explain an idea. It is not evidence that the example happened in the real business.' },
  { term: 'Value Map', category: 'Strategy', plain: 'A map of where the business creates value, captures value, loses value, puts value at risk, finds opportunities, or builds assets.' },
  { term: 'Value Leak', category: 'Strategy', plain: 'A place where useful value is being lost, wasted, delayed, underpriced, ignored, or made unnecessarily difficult to capture.' },
  { term: 'Opportunity', category: 'Strategy', plain: 'A possible move that could improve the business, reduce uncertainty, protect value, or create new value.' },
  { term: 'Priority Score', category: 'Strategy', plain: 'A comparison score used to help rank opportunities using factors such as impact, confidence, speed, reversibility, cost, complexity, and risk. It is a decision aid, not a guarantee.' },
  { term: 'Business Model', category: 'Strategy', plain: 'The connected explanation of how the business serves a customer, delivers value, reaches people, operates, and captures enough value to keep going.' },
  { term: 'Value Proposition', category: 'Strategy', plain: 'The useful reason a specific customer should care about the offer. In normal language: what gets better for them and why this option is worth choosing.' },
  { term: 'Hypothesis', category: 'Strategy', plain: 'A testable idea that might be true. FDOS treats a hypothesis as something to investigate, not something to decorate until it looks factual.' },
  { term: 'Scenario', category: 'Strategy', plain: 'A plausible future situation used to prepare decisions before the future is known.' },
  { term: 'Scenario Lab', category: 'Strategy', plain: 'The FDOS workspace for asking what could happen, what early signal would reveal it, and what decision rule should apply.' },
  { term: 'Decision Rule', category: 'Strategy', plain: 'A rule chosen in advance for what to do when a specific signal or condition appears.' },
  { term: 'Customer Segment', category: 'Customers', plain: 'A specific group of people or organizations that share a relevant problem, need, situation, behavior, or buying context.' },
  { term: 'Customer Intelligence', category: 'Customers', plain: 'What the business learns about customer problems, needs, triggers, objections, behavior, language, and segments.' },
  { term: 'Customer Trigger', category: 'Customers', plain: 'An event or situation that makes a customer more likely to notice the problem and look for a solution.' },
  { term: 'Customer Objection', category: 'Customers', plain: 'A reason a customer hesitates, says no, delays, or chooses another option.' },
  { term: 'Distribution Channel', category: 'Customers', plain: 'A path used to reach customers or deliver a message, such as search, email, partners, events, social platforms, marketplaces, or referrals.' },
  { term: 'Distribution Experiment', category: 'Customers', plain: 'A measured test of a channel, audience, message, or action to learn whether it creates useful customer behavior.' },
  { term: 'CRM', category: 'Customers', plain: 'Customer Relationship Management. A system for keeping track of possible and existing customers, conversations, follow-ups, and status.', aliases: ['Customer Relationship Management'] },
  { term: 'Offer', category: 'Customers', plain: 'The specific value the business is proposing to deliver, to whom, under what terms, and in exchange for what.' },
  { term: 'Revenue Model', category: 'Money', plain: 'The way the business expects to receive money or another durable return for the value it creates.' },
  { term: 'Financial Assumption', category: 'Money', plain: 'A planning number that has not yet been proven by actual financial results. In FDOS it belongs under E6.' },
  { term: 'Revenue', category: 'Money', plain: 'Money earned from selling products, services, subscriptions, licenses, fees, or other business activity before subtracting expenses.' },
  { term: 'Cost', category: 'Money', plain: 'Money or resources the business must spend to create, sell, operate, or support its work.' },
  { term: 'Margin', category: 'Money', plain: 'The amount left after certain costs are subtracted from revenue. The exact type of margin depends on which costs are included.' },
  { term: 'Cash Flow', category: 'Money', plain: 'The movement of cash into and out of the business over time. A profitable-looking business can still have a cash problem if timing is ugly enough.' },
  { term: 'Forecast', category: 'Money', plain: 'A structured estimate of what may happen later, based on assumptions and available evidence. FDOS labels forecasts E7.' },
  { term: 'Decision', category: 'Execution', plain: 'An important choice worth recording so the reason, next step, and later outcome do not disappear into memory or chat history.' },
  { term: 'Risk', category: 'Execution', plain: 'Something that could damage an important goal, reduce value, increase cost, delay progress, or create a serious unwanted outcome.' },
  { term: 'Initiative', category: 'Execution', plain: 'A piece of work intended to produce a specific business outcome, with a status, priority, owner, or due date when useful.' },
  { term: 'Value Sprint', category: 'Execution', plain: 'A small measured attempt to improve one important thing: state the hypothesis, take the action, measure what happened, then KEEP, REVISE, or REVERT.' },
  { term: 'Baseline', category: 'Execution', plain: 'What is true before a test begins. It gives the result something real to compare against.' },
  { term: 'Target', category: 'Execution', plain: 'The result that would count as useful or meaningful for a test or goal. A target is not proof that the result will happen.' },
  { term: 'KPI', category: 'Execution', plain: 'Key Performance Indicator. In plain English: a number used to tell whether something important is improving, worsening, or staying the same.', aliases: ['Key Performance Indicator'] },
  { term: 'Business Memory', category: 'Execution', plain: 'The dated record of important changes, decisions, evidence, experiments, results, and lessons so the business does not repeatedly forget why it did something.' },
  { term: 'KEEP', category: 'Execution', plain: 'The test produced enough useful evidence to keep the change for now.' },
  { term: 'REVISE', category: 'Execution', plain: 'The idea may still be useful, but the evidence says the change should be modified and tested again.' },
  { term: 'REVERT', category: 'Execution', plain: 'The test did not justify keeping the change, so return to the prior state or undo the experiment where practical.' },
  { term: 'Asset', category: 'Assets', plain: 'Something the business owns, controls, or has built that can keep creating value, reducing cost, increasing leverage, or strengthening the company over time.' },
  { term: 'IP · Intellectual Property', category: 'Assets', plain: 'Intellectual property: creations, inventions, brands, designs, software, content, know-how, or other protected or protectable intangible value.', aliases: ['Intellectual Property', 'IP'] },
  { term: 'Transferability', category: 'Assets', plain: 'How easily an asset, process, relationship, or capability can keep working when ownership, staff, or leadership changes.' },
  { term: 'Founder Attention', category: 'Assets', plain: 'The limited time and mental energy the founder can deliberately allocate to the highest-value work instead of letting urgency choose everything.' },
  { term: 'Portfolio', category: 'Dynasty', plain: 'A group of businesses or major ventures managed together so capital, attention, assets, risk, and strategic roles can be compared.' },
  { term: 'Capital Allocation', category: 'Dynasty', plain: 'Deciding where money or other scarce resources should go, stay, shrink, or stop based on expected value and risk.' },
  { term: 'Enterprise Value', category: 'Dynasty', plain: 'The broader economic value of the business as an operating asset. In FDOS this is a long-term concept, not a made-up valuation badge.' },
  { term: 'Dynasty Mode', category: 'Dynasty', plain: 'The FDOS view focused on durable value beyond one product or one founder: assets, systems, defensibility, portfolio roles, governance, knowledge, and succession.' },
  { term: 'Succession', category: 'Dynasty', plain: 'Preparing the business so leadership, ownership, knowledge, and operations can continue when the current founder or leader steps away.' },
  { term: 'RLS · Row Level Security', category: 'Technical', plain: 'A database protection rule that controls which rows each signed-in user is allowed to read or change.', aliases: ['Row Level Security', 'RLS'] },
  { term: 'PWA · Progressive Web App', category: 'Technical', plain: 'A website built so it can behave more like an installed app, including installation and some app-like browser features when supported.', aliases: ['Progressive Web App', 'PWA'] },
];

export const glossaryByTerm = Object.fromEntries(glossaryEntries.map((entry) => [entry.term, entry])) as Record<string, GlossaryEntry>;

export function findGlossaryEntries(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return glossaryEntries;
  return glossaryEntries.filter((entry) => [entry.term, entry.plain, entry.category, ...(entry.aliases || [])].some((value) => value.toLowerCase().includes(q)));
}
