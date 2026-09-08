# Founder Dynasty OS 10.0 — SMARTPICKSHOP HOLDINGS

Founder Dynasty OS (FDOS) is a business operating system under **SMARTPICKSHOP HOLDINGS** for the full life of a business, from a raw idea through validation, launch, operation, growth, portfolio management, enterprise value, and succession.

It is **not** a sales app, a CRM with extra panels, or a generic startup dashboard. The Same-Day Customer Growth Pack / Sales OS is one major component inside the larger Founder Dynasty OS.

Read **`PRODUCT-VISION.md`** before making major product changes. It is the canonical statement of the restored broader vision.

## Core operating loop

Understand → identify the highest-value problem or opportunity → separate evidence from assumptions → recommend a next action → help execute it → measure what happened → learn → KEEP / REVISE / REVERT → update the business model → choose the next action.

The original FDOS language remains useful internally:

Evidence → Value Leak / Value Opportunity → ranked action → Value Sprint → measurement → KEEP / REVISE / REVERT.

## Who Founder Dynasty OS is for

FDOS must work for:

- someone with only a business idea,
- a solo founder or side hustle,
- a local service business,
- an online or ecommerce business,
- a software company,
- a creator or agency,
- a nonprofit or professional practice,
- a physical retailer or manufacturer,
- a marketplace or franchise,
- an enterprise,
- a holding company managing several businesses.

The system should change its guidance based on the business stage rather than forcing every user into a sales funnel.

## Signature Founder Dynasty OS systems

The long-term product architecture includes:

- **Business DNA** — a living model of what the business is.
- **Value Map** — where value is created, captured, leaked, at risk, or underused.
- **Value Leak Engine** — finds waste and lost value across the whole business, not just sales.
- **Opportunity Engine** — identifies and ranks potentially valuable moves.
- **Decision Engine** — preserves important decisions, assumptions, risks, choices, and outcomes.
- **Value Sprints** — short measurable attempts to improve one important thing.
- **Business Memory** — keeps research, decisions, experiments, results, feedback, and lessons.
- **Business X-Ray** — evaluates the business as a connected system.
- **What Am I Missing?** — looks for blind spots, missing evidence, risks, and ignored opportunities.
- **Argue Against Me** — stress-tests important plans with the strongest evidence-based counterargument.
- **Scenario Lab** — explores what-if decisions without confusing forecasts with facts.
- **Asset Map** — tracks valuable business assets and underused capabilities.
- **Founder Attention** — identifies the highest-value use of founder time and what should be stopped, delegated, or automated.
- **Dynasty Mode** — focuses on durable enterprise value, defensibility, systems, assets, portfolio value, and succession.

## Active implementation tracks

### Standalone Founder OS Web (`web/`)

Non-WordPress Next.js/React/TypeScript primary product track. It currently contains a Founder Command Center shell, evidence classifications, opportunity ranking, Value Sprint concepts, and the beginning of the plain-English interface. This track should grow into the broader product architecture defined in `PRODUCT-VISION.md`.

### Same-Day Customer Growth Pack Android/Web Sales OS (`sales-engine-app/` + `sales-engine/`)

Mobile-first installable PWA and sales operating system. It includes a verified prospect feed, scripts, pipeline tracking, authenticated persistence work, offline support, PWA assets, canonical XLSX CRM, and auditable history.

It belongs inside the broader hierarchy:

**SMARTPICKSHOP HOLDINGS → Founder Dynasty OS → Customers & Growth → Same-Day Customer Growth Pack / Sales OS**

Canonical sales data:

- `sales-engine-app/data/leads.json` — app prospect feed
- `sales-engine/Same-Day-Customer-Growth-Pack-Live-CRM.xlsx` — canonical CRM workbook
- `sales-engine/pipeline-history.json` — genuine pipeline/contact history
- `sales-engine/README.md` — integrity and refresh contract

Research refreshes may improve verified prospect information, but they must never overwrite genuine contact history. A Contact Ready prospect is not evidence that outreach, a reply, payment, customer, or revenue exists.

### WordPress FDOS Value Leak Scanner

The v1.0.1 launch-candidate plugin remains preserved as a compatibility/legacy track with evidence governance, website evidence, experiments, Shopify HMAC webhook handling, launch diagnostics, and production-verification tooling. WordPress is not a prerequisite for the primary standalone product.

## Research & Evidence Integrity Layer

FDOS preserves explicit evidence classes:

- E1 Verified Fact
- E2 Current External Evidence
- E3 Customer-Derived Evidence
- E4 Internal Observation
- E5 Strategic Hypothesis
- E6 Financial Model Assumption
- E7 Forecast
- E8 Illustrative Example

Externally derived claims require source attribution, uncertainty must be explicit where evidence is insufficient, and the project must not fabricate market size, pricing, results, testimonials, adoption statistics, regulations, partnerships, product capabilities, contacts, outreach, replies, payments, customers, revenue, ROI, or product-market fit.

## Plain-English product rule

Founder Dynasty OS should be sophisticated underneath and easy to understand on the surface.

Every major screen should answer:

1. What is this?
2. Why does it matter?
3. What should I do?
4. What happens next?

Specialized terms should be explainable in place and available in a searchable plain-English glossary. Advanced details should remain available without forcing beginners to learn jargon first.

## AI continuation / project handoff

- **`PRODUCT-VISION.md`** — canonical broad product vision. Read this before major product-direction changes.
- **`AGENTS.md`** — canonical project/component state, operating rules, evidence boundaries, and continuation priorities.
- **`.github/copilot-instructions.md`** — repository instructions for GitHub Copilot.
- **`AI-HANDOFF.md`** — continuation guidance for ChatGPT/Codex, Copilot, Grok, and Perplexity.

Any AI assistant continuing FDOS should inspect the repository, preserve genuine evidence/history, and avoid drifting the product into a generic CRM, sales dashboard, project manager, or startup template.

## Current direction

The immediate product-direction priority is to restore the broader Founder Dynasty OS architecture while preserving and hardening working components. That means building the shared Business DNA / Value Map / Decision / Opportunity / Business Memory foundation, continuing the plain-English experience, and integrating the Sales OS as one module rather than allowing it to define the product.

Production defects in existing components still matter and must be fixed and verified. New architecture is not an excuse to abandon working functionality or rewrite genuine history.

Build/test success and researched pipeline value are not commercial proof.
