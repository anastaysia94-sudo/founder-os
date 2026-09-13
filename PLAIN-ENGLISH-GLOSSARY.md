# Founder Dynasty OS — Plain-English Glossary

Founder Dynasty OS should be sophisticated underneath and understandable on first use.

The canonical interactive glossary is implemented in:

- `web/lib/glossary.ts` — term definitions and categories
- `web/app/glossary/page.tsx` — searchable user-facing glossary

## Product language rule

Every major screen should answer, in ordinary language:

1. What is this?
2. Why does it matter?
3. What should I do?
4. What happens next?

A technical or business term may remain where it is useful, but the user should not have to understand jargon before understanding the decision.

## Evidence language

The E1–E8 labels are permanent and must retain their meanings:

- **E1 — Verified Fact:** directly verified information.
- **E2 — Current External Evidence:** attributable current information from outside the business.
- **E3 — Customer-Derived Evidence:** evidence that actually came from customers or customer behavior.
- **E4 — Internal Observation:** founder/team observation or internally recorded information.
- **E5 — Strategic Hypothesis:** a testable idea about what may be true or useful.
- **E6 — Financial Model Assumption:** a planning number or relationship, not an observed financial result.
- **E7 — Forecast:** a reasoned view of what may happen later.
- **E8 — Illustrative Example:** an example used to explain, not evidence that the example happened.

Do not upgrade a claim merely because its UI status changed. A hypothesis moved from Draft to Active is not automatically a Verified Fact. A Scenario with a probability is still a Forecast. A manually entered customer note is not E3 unless it truly came from customer evidence.

## Preferred plain-English translations

- **KPI** → “How we’ll know if it worked”
- **Opportunity ranking** → “What should I do first?”
- **Pipeline** → “Where each possible customer stands”
- **Evidence vault** → “What do we actually know?”
- **Value Sprint** → “Test one improvement”
- **Value proposition** → “Why this is useful to the customer”
- **Capital allocation** → “Where our money/resources should go”
- **Scenario planning** → “What would we do if this future starts happening?”
- **Founder attention** → “Where your limited time should go”
- **Enterprise value** → “The business’s durable economic value as an operating asset”

## Interaction rule

Where specialized terms appear in the main product:

- visually identify explainable terms;
- open a small definition bubble/card on click or tap where practical;
- provide the full searchable `/glossary` as a fallback and learning surface;
- do not hide essential actions behind unexplained technical wording;
- keep advanced detail available through progressive disclosure rather than deleting useful sophistication.

## Writing rule for future modules

Prefer specific questions and actions over category labels.

Instead of:

> Optimize CAC/LTV efficiency before scaling GTM.

Prefer:

> Before spending more to find customers, compare what it costs to get one customer with the value that customer creates over time.

The first sentence may still exist in an advanced view. The second should be understandable without a business-degree initiation ceremony.
