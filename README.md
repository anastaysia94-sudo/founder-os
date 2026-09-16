# Founder Dynasty OS 10.0 — SMARTPICKSHOP HOLDINGS

Founder Dynasty OS (FDOS) is a business operating intelligence system under **SMARTPICKSHOP HOLDINGS** for the full life of a business, from a raw idea through validation, launch, operation, growth, portfolio management, enterprise value, and succession.

It is **not** a sales app, a CRM with extra panels, or a generic startup dashboard. The Same-Day Customer Growth Pack / Sales OS is one major component inside the larger Founder Dynasty OS.

Read **`PRODUCT-VISION.md`** before making major product changes. Canonical product statement:

> **Founder Dynasty OS is the operating intelligence of the business.**

## Core operating loop

Understand → find the highest-value problem or opportunity → separate evidence from assumptions → choose a next action → execute → measure → learn → **KEEP / REVISE / REVERT** → update the business model → choose the next action.

The original FDOS language remains useful internally:

Evidence → Value Leak / Value Opportunity → ranked action → Value Sprint → measurement → KEEP / REVISE / REVERT.

## Who Founder Dynasty OS is for

FDOS must work for someone with only an idea as well as a solo founder, local service business, ecommerce company, software company, creator, agency, nonprofit, professional practice, retailer, manufacturer, marketplace, franchise, enterprise, portfolio, or holding company.

The system changes guidance by business stage rather than forcing every business into a sales funnel.

## Standalone web architecture

The primary product track is the Next.js / React / TypeScript application under `web/`. Major operating surfaces now include:

- `/` — **Founder Command Center**: Business Stage, Business DNA, Value Map, Opportunities, Risks, Decisions, Business Memory, Evidence Inbox, and whole-OS map for the active Business Record.
- `/intelligence` — **Founder Intelligence Layer**: Idea Lab, Business X-Ray, What Am I Missing?, and persistent Value Sprints.
- `/workbench` — **Build & Run Workbench**: Finance Center, Product & Offer Lab, and Operations & Execution.
- `/strategy` — **Strategy / Dynasty Workspace**: Business Model Lab, Customer Intelligence, Marketing & Distribution, Asset Map, Founder Attention, Scenario Lab, and Portfolio / Dynasty Mode.
- `/portfolio` — **Business Registry + Cross-Business Intelligence**: create/switch account-owned Business Records and compare descriptive operating signals without merging their histories.
- `/glossary` — searchable plain-English business/evidence/technical glossary.
- `/answers` — public answer-oriented discovery surface.
- `/acceptance` and `/acceptance/restore` — owner-facing production acceptance helpers. They do not manufacture green checks.
- `/sales-engine-app` — bridge to the separate Customers & Growth → Sales OS production service.

These are neighborhoods of one operating system, not separate products pretending the same business has several incompatible realities.

## Shared Business Records and persistence

The standalone OS supports **multiple authenticated, account-owned Business Records**. One Business Record is active at a time. Command Center, Intelligence, Workbench and Strategy/Dynasty all operate on that selected business.

The active selection is account-scoped in the browser session and validated against owner-scoped database access. Switching businesses performs a hard UI boundary so unsaved component-local state from one business is not left mounted inside another.

Current Supabase-backed FDOS persistence includes 19 RLS-protected tables:

### Core record and evidence
- `fdos_business_records`
- `fdos_value_items`
- `fdos_decisions`
- `fdos_risks`
- `fdos_opportunities`
- `fdos_memory`
- `fdos_evidence`
- `fdos_evidence_proposals`

### Learning and execution
- `fdos_value_sprints`
- `fdos_financial_assumptions`
- `fdos_offer_hypotheses`
- `fdos_initiatives`

### Strategy, assets, and Dynasty
- `fdos_business_model_elements`
- `fdos_customer_insights`
- `fdos_distribution_experiments`
- `fdos_business_assets`
- `fdos_scenarios`
- `fdos_portfolio_theses`
- `fdos_attention_blocks`

Child records are scoped by both authenticated user and Business Record. Optional Evidence links are constrained to the same user/business where implemented.

`fdos_create_business(...)` creates another independent Business Record plus its first E4 `Workspace created` Business Memory event. It is `SECURITY INVOKER`; anonymous execution is denied and authenticated execution is allowed.

## Cross-Business Intelligence

The private portfolio layer can compare **descriptive owner-scoped signals** across businesses while preserving every business's canonical history.

Current signals include high risks, open decisions, blocked initiatives, pending Evidence review, running Value Sprints, planned Founder Attention, opportunities, assets and measured sprint loops.

These are not rankings, valuations, revenue claims, success grades, product-market-fit judgments or forecasts. The system may compare Business Records; it must not blur them together.

## Signature Founder Dynasty OS systems

- **Business DNA** — living model of what the business is.
- **Business X-Ray** — structural diagnosis across clarity, evidence, value, decisions, execution, and risk.
- **What Am I Missing?** — exposes unanswered questions and missing proof.
- **Value Map** — where value is created, captured, leaked, at risk, or becoming an asset.
- **Opportunity Engine** — ranks potentially valuable moves inside the active business using transparent inputs.
- **Decision Engine** — preserves choices and next steps.
- **Value Sprints** — hypothesis → action → measure → result → KEEP / REVISE / REVERT.
- **Business Memory** — dated learning, evidence, decisions, and changes.
- **Business Model Lab** — tests how customer, value proposition, channels, economics, capabilities, and partners fit together.
- **Customer Intelligence** — captures customer problems, needs, triggers, objections, behavior, segments, and language without falsely upgrading founder notes to customer proof.
- **Marketing & Distribution** — measured channel/message experiments rather than vanity-metric theater.
- **Finance Center** — financial model assumptions remain E6 instead of masquerading as historical truth.
- **Product / Offer Lab** — offer hypotheses move through operating states without confusing a dropdown with validation.
- **Operations & Execution** — initiatives, outcomes, owners, due dates, priorities, and status.
- **Asset Map** — tracks assets that may compound enterprise value.
- **Founder Attention** — makes time allocation and intended outcomes explicit.
- **Scenario Lab** — E7 forecasts with early signals and decision rules.
- **Portfolio / Dynasty Mode** — records portfolio roles and theses while the Business Registry provides the real multi-business operating boundary.
- **Cross-Business Intelligence** — compares account-owned risks, decisions, work, evidence, learning, assets and attention without rewriting per-business truth.

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

Externally derived claims require source attribution. Uncertainty must remain explicit. Never fabricate market size, pricing, results, testimonials, adoption statistics, regulations, partnerships, capabilities, contacts, outreach, replies, payments, customers, revenue, ROI, or product-market fit.

## Plain-English product rule

Founder Dynasty OS should be sophisticated underneath and easy to understand on the surface. Every major screen should answer:

1. What is this?
2. Why does it matter?
3. What should I do?
4. What happens next?

Specialized terms should be explainable in place and available through the plain-English glossary. Advanced details belong behind progressive disclosure, not as an entrance exam.

## Sales OS integration

The Same-Day Customer Growth Pack / Sales OS belongs in this hierarchy:

**SMARTPICKSHOP HOLDINGS → Founder Dynasty OS → Customers & Growth → Same-Day Customer Growth Pack / Sales OS**

Canonical sales data remains:

- `sales-engine-app/data/leads.json`
- `sales-engine/Same-Day-Customer-Growth-Pack-Live-CRM.xlsx`
- `sales-engine/pipeline-history.json`

Research refreshes may improve verified prospect information but must never overwrite genuine contact history. A Contact Ready lead is not proof of outreach, reply, payment, customer, or revenue.

## Production verification boundary

Build success is not production proof, production backend proof is not human-browser proof, and any of those is not commercial proof.

Current source includes read-only `/acceptance` diagnostics and `/acceptance/restore` workflow support. Genuine save/restore, business switching, second-user isolation, mobile/desktop visual acceptance, and real-world customer outcomes still require actual observation rather than a flattering interpretation of source code.

## AI continuation / project handoff

- `PRODUCT-VISION.md` — canonical product direction.
- `PROJECT-STATUS.md` — current implementation and verification boundary.
- `AGENTS.md` — operating rules and continuation priorities.
- `.github/copilot-instructions.md` — GitHub Copilot instructions.
- `AI-HANDOFF.md` — continuation guidance for ChatGPT/Codex, Copilot, Grok, and Perplexity.

Any AI continuing FDOS should inspect the repository, preserve genuine evidence/history, keep Sales OS in its proper neighborhood, preserve per-business boundaries, and reject drift toward a generic CRM, dashboard, project manager, or startup-template clone.
