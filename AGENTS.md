# Founder Dynasty OS — AI Continuation Instructions

This file is the canonical handoff for AI coding/research assistants working on **Founder Dynasty OS 10.0 (FDOS)** under **SMARTPICKSHOP HOLDINGS**.

Before major product-direction changes, read **`PRODUCT-VISION.md`**. That file defines the restored broad product vision.

## Mission

Founder Dynasty OS is a **full-lifecycle Business Operating System**, not a CRM, sales app, dashboard template, or generic startup tool.

It must work for a user who has only an idea as well as for an operating company, growing company, portfolio, or holding company.

Its high-level loop is:

**Understand → identify the highest-value problem or opportunity → separate evidence from assumptions → choose the next action → help execute it → measure what happened → learn → KEEP / REVISE / REVERT → update the business model → choose the next action.**

The original internal FDOS language remains valid:

**Evidence → Value Leak / Value Opportunity → ranked action → Value Sprint → measurement → KEEP / REVISE / REVERT.**

## Product-direction guardrail — DO NOT NARROW FDOS TO SALES

The Same-Day Customer Growth Pack / Sales OS is a major component, but it is not the product identity.

The product hierarchy is:

**SMARTPICKSHOP HOLDINGS → Founder Dynasty OS → business operating-system domains → Customers & Growth → Same-Day Customer Growth Pack / Sales OS.**

Do not restructure the broader product around a CRM or sales funnel simply because the Sales OS currently has more production validation than other modules.

Founder Dynasty OS should evolve around shared business intelligence, including:

- Business DNA
- Value Map
- Value Leak Engine
- Opportunity Engine
- Decision Engine
- Value Sprints
- Business Memory
- Business X-Ray
- What Am I Missing?
- Argue Against Me
- Scenario Lab
- Asset Map
- Founder Attention
- Dynasty / enterprise-value mode
- Portfolio / SMARTPICKSHOP HOLDINGS view

Functional domains should eventually include Idea Lab, Strategy, Research, Business Model Lab, Product / Offer Lab, Customer Intelligence, Sales, Marketing & Distribution, Finance, Operations, Projects, Risk, Assets, Decisions, Evidence, Growth, Portfolio, and Dynasty.

## Business-stage awareness

FDOS must adapt to the user's actual stage:

1. Idea
2. Exploring
3. Validating
4. Building
5. Pre-launch
6. Launched
7. Finding traction
8. Growing
9. Systemizing
10. Scaling
11. Portfolio / holding company
12. Dynasty

Never assume the user already has customers, revenue, a website, employees, metrics, or even a formed company.

## Plain-English requirement

The user-facing product must use ordinary language first.

Every major screen should answer:

1. What is this?
2. Why does it matter?
3. What should I do?
4. What happens next?

Specialized business/technical words should be explainable in place and included in the product glossary. Preserve advanced detail through progressive disclosure rather than forcing beginners to understand jargon.

## Tracked implementation components

1. **Standalone Founder OS Web (`web/`)** — Next.js/React/TypeScript primary product direction. It should become the broad operating-system experience described in `PRODUCT-VISION.md`.
2. **Same-Day Customer Growth Pack Android/Web Sales OS (`sales-engine-app/` + `sales-engine/`)** — installable mobile-first Sales OS with verified prospect research, scripts, pipeline state, persistence, offline behavior, and CRM artifacts.
3. **Legacy/compatibility WordPress FDOS Value Leak Scanner** — preserved source and launch/proof tooling; not the main future architecture.

### Same-Day Customer Growth Pack source-of-truth rules

- App feed: `sales-engine-app/data/leads.json`
- Canonical CRM workbook: `sales-engine/Same-Day-Customer-Growth-Pack-Live-CRM.xlsx`
- Genuine pipeline/contact history: `sales-engine/pipeline-history.json`
- Human-readable audit artifacts: `sales-engine/README.md`, dated snapshots, and scripts.
- Refresh JSON feed and CRM together only when genuinely new verified prospect research exists.
- Never overwrite genuine contact timestamps, replies, opt-outs, quotes, payment, fulfillment, notes, or real status changes during research refreshes.
- Never invent contacts, outreach, replies, payments, customers, revenue, or results.

## Research & Evidence Integrity Layer — NEVER REMOVE OR WEAKEN

Every major strategic claim must be classifiable as:

- **E1 — Verified Fact**
- **E2 — Current External Evidence**
- **E3 — Customer-Derived Evidence**
- **E4 — Internal Observation**
- **E5 — Strategic Hypothesis**
- **E6 — Financial Model Assumption**
- **E7 — Forecast**
- **E8 — Illustrative Example**

Rules:

1. Attribute externally derived claims to sources.
2. State uncertainty when evidence is insufficient.
3. Never fabricate market size, pricing, customers, revenue, conversions, adoption, testimonials, regulations, partnerships, product capabilities, ROI, profit, or product-market fit.
4. Before/after movement is not automatically causation.
5. Build/test success is not production verification.
6. Preserve evidence confidence and limitations wherever the product records them.
7. Prospect discovery is E2 only when supported by current verifiable sources. `Contact Ready` is not evidence that outreach occurred.
8. A sent message is not a reply; a reply is not a sale; a quote is not payment; payment is not profit.

## Preserve completed work

Before implementing anything substantial, inspect the repository. Preserve working behavior and genuine evidence, including:

- standalone web shell in `web/`
- Sales OS PWA in `sales-engine-app/`
- live JSON prospect feed and canonical CRM workbook
- genuine pipeline/contact history
- Supabase authentication/persistence work where present
- offline service worker and PWA manifest
- Value Leak and Value Sprint concepts
- evidence event ledger and E1–E8 taxonomy
- WordPress evidence adapters and experiments
- Shopify HMAC verification/deduplication
- P1/P2/P3 legacy production-verification tooling
- security and safe-uninstall behavior
- CI/build workflows

Do not delete functioning systems merely to make the architecture prettier.

## Current product priorities

Prioritize these in order unless current repository/runtime evidence justifies a change:

1. **Restore the broad FDOS product architecture** around shared Business DNA, Value Map, decisions, opportunities, evidence, and Business Memory.
2. **Continue the plain-English rebuild**, including reusable explainable terms and a searchable glossary.
3. **Turn the standalone web track into the actual broad Founder Dynasty OS**, rather than a thin Value Leak/Sales shell.
4. **Integrate existing modules into that architecture**, including the Sales OS, without making any one module the identity of FDOS.
5. **Harden existing production behavior**: authentication, sign-out, session restoration, persistence, account isolation, offline/reconnect behavior, and audit integrity.
6. **Capture genuine external usage evidence** for complete workflows before making commercial claims.

## Architecture principle

New modules must share core records rather than becoming disconnected mini-apps.

Prefer reusable entities such as:

- Business
- Business Stage
- Business DNA
- Evidence Item
- Opportunity
- Value Leak
- Risk
- Decision
- Experiment / Value Sprint
- Result
- Project / Initiative
- Asset
- Customer Insight
- Financial Assumption
- Forecast
- Lesson / Business Memory event

A project should trace back to a business outcome, opportunity, risk, decision, or Value Sprint.

A recommendation should be able to explain **why the user is seeing it** and what evidence or assumptions produced it.

## Development rules

- Read `PRODUCT-VISION.md`, `README.md`, `AGENTS.md`, component READMEs, security notes, and task-relevant source files before major changes.
- Inspect existing code before implementing; do not duplicate working functionality.
- Preserve backward compatibility unless a migration is justified.
- Run relevant tests and never claim runtime success unless it actually ran.
- Never commit credentials, `.env`, private keys, access tokens, passwords, or production customer secrets.
- Update documentation when behavior or architecture changes.
- Do not mark production work complete without evidence from the real runtime.
- Do not silently rewrite historical evidence or sales-pipeline history.
- Avoid building generic SaaS dashboard widgets with no clear connection to FDOS intelligence.

## Product uniqueness test

Before adding a major feature ask:

- Does this help FDOS understand the business better?
- Does it connect evidence to a decision or action?
- Does it work for more than one business type?
- Does it work at the relevant business stage?
- Does it preserve what happened and what was learned?
- Does it create a capability beyond a generic CRM/task manager/dashboard?
- Can a beginner understand it?
- Can an advanced user inspect the underlying detail?
- Does it contribute to long-term business value, not just short-term sales?

If the answer is mostly no, reconsider the feature.

## Definition of truthful completion

A component is complete only when its relevant behavior has been tested successfully. Product-market fit, profitability, recurring revenue, scalable acquisition, durable retention, and enterprise-value improvement can never be checked off because code or research exists.

## When asked to “continue”

Choose the **highest-value unfinished milestone**, execute as much as available tools allow, preserve completed work, and clearly distinguish:

- what was actually changed,
- what was actually tested,
- what remains incomplete,
- what is current but commercially unproven,
- what evidence would close the next gap.

For Sales OS research refreshes, compare the JSON feed and CRM before writing. If no genuinely new verified research exists, do not churn files simply to change dates.

Keep the receipts.
