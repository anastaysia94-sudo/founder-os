# Founder Dynasty OS — AI Continuation Instructions

This file is the canonical repository handoff for AI coding/research assistants working on **Founder Dynasty OS 10.0 (FDOS)** under **SMARTPICKSHOP HOLDINGS**.

Before major product-direction changes, read:

1. `PRODUCT-VISION.md`
2. `PROJECT-STATUS.md`
3. `PRODUCTION-USER-VALIDATION.md`
4. this file

`PRODUCT-VISION.md` defines the product. `PROJECT-STATUS.md` defines what currently exists. `PRODUCTION-USER-VALIDATION.md` defines what has actually been proven.

## Mission

Founder Dynasty OS is a **full-lifecycle Business Operating System / operating intelligence layer**, not a CRM, sales app, dashboard template, project manager, or generic startup tool.

It must work for someone who has only an idea as well as for an operating company, growing company, portfolio, or holding company.

Core loop:

**Understand → identify the highest-value problem or opportunity → separate evidence from assumptions → choose the next action → help execute it → measure what happened → learn → KEEP / REVISE / REVERT → update the business model / Business Memory → choose the next action.**

Canonical product statement:

> **Founder Dynasty OS is the operating intelligence of the business.**

## Product-direction guardrail — DO NOT NARROW FDOS TO SALES

The Same-Day Customer Growth Pack / Sales OS is a major component, not the product identity.

Hierarchy:

**SMARTPICKSHOP HOLDINGS → Founder Dynasty OS → Customers & Growth → Same-Day Customer Growth Pack / Sales OS.**

Do not restructure the broader product around a CRM or sales funnel because the Sales OS has useful production history. Sales is one neighborhood. It does not own the whole city.

## Primary product track

The **standalone Next.js / React / TypeScript application under `web/`, backed by Supabase, is the primary product track.**

The legacy WordPress/plugin implementation remains preserved compatibility/history unless a task explicitly targets it. Do not steer the primary product back toward WordPress because old launch docs still exist.

Current major standalone surfaces:

- `/` — Founder Command Center for the active Business Record: Business Stage, Business DNA, Value Map, Opportunities, Decisions, Risks, Business Memory, Missing Intelligence, Evidence Inbox, whole-OS map.
- `/intelligence` — Idea Lab, Business X-Ray, What Am I Missing?, Value Sprints, KEEP / REVISE / REVERT.
- `/workbench` — Finance Center, Product & Offer Lab, Operations & Execution.
- `/strategy` — Business Model Lab, Customer Intelligence, Marketing & Distribution, Asset Map, Founder Attention, Scenario Lab, Portfolio / Dynasty Mode.
- `/portfolio` — private Business Registry + Cross-Business Intelligence.
- `/glossary` — searchable plain-English glossary.
- `/answers` — public answer-oriented discovery surface.
- `/acceptance` and `/acceptance/restore` — noindex production-user proof helpers.
- `/sales-engine-app` — bridge to the separate Sales OS production service.

## Business-stage awareness

FDOS adapts to the actual stage:

1. Idea
2. Exploring
3. Validating
4. Building
5. Pre-Launch
6. Launched
7. Finding Traction
8. Growing
9. Systemizing
10. Scaling
11. Portfolio
12. Dynasty

Never assume customers, revenue, a website, employees, metrics, or even a formed company exist.

## Multi-business shared-record architecture

FDOS supports **multiple authenticated, account-owned Business Records**. One Business Record is active at a time. Major operating modules read/write the active record; they must not invent their own business identity.

The global Business Switcher and `/portfolio` registry are part of the canonical architecture. `fdos_create_business(...)` creates another independent record and its initial E4 Business Memory event. Anonymous RPC execution is denied.

Inside a Business Record, important child data stays scoped by both `user_id` and `business_id`. Across businesses, Cross-Business Intelligence may compare owner-scoped signals but must never merge canonical histories or silently move evidence, decisions, risks, opportunities, assets, Value Sprints, customer intelligence, finance, or memory between businesses.

The current production FDOS data model spans **19 RLS-enabled tables** covering:

- Business Records / Value / Decisions / Risks / Opportunities / Memory;
- Evidence + Evidence Proposals;
- Value Sprints;
- Finance assumptions / Offer hypotheses / Initiatives;
- Business Model / Customer Intelligence / Distribution;
- Assets / Scenarios / Portfolio theses / Founder Attention.

Before adding a table or module, inspect current domain/store layers and migrations. Do not create disconnected mini-apps or duplicate entities.

## Cross-Business Intelligence boundary

The private `/portfolio` layer currently compares descriptive operating signals including:

- high risks;
- open decisions;
- blocked initiatives;
- pending Evidence review;
- running Value Sprints;
- planned Founder Attention;
- opportunities;
- assets;
- measured Value Sprint loops.

Do **not** turn these into a synthetic “best business” ranking, valuation, revenue claim, product-market-fit score, founder-performance score, or election-style horse race between companies. Recommendations must remain explainable and grounded in the underlying saved records.

## Plain-English requirement

User-facing product language defaults to ordinary English.

Every major screen should answer:

1. What is this?
2. Why does it matter?
3. What should I do?
4. What happens next?

Specialized terms should be explainable in place and represented in the glossary. Preserve advanced detail through progressive disclosure rather than requiring jargon as an entrance exam.

## Research & Evidence Integrity Layer — NEVER REMOVE OR WEAKEN

Every material claim should remain classifiable as:

- **E1 — Verified Fact**
- **E2 — Current External Evidence**
- **E3 — Customer-Derived Evidence**
- **E4 — Internal Observation**
- **E5 — Strategic Hypothesis**
- **E6 — Financial Model Assumption**
- **E7 — Forecast**
- **E8 — Illustrative Example**

Rules:

1. Attribute externally derived claims.
2. State uncertainty when evidence is insufficient.
3. Never fabricate market size, pricing, customers, revenue, conversions, adoption, testimonials, regulations, partnerships, capabilities, ROI, profit, or product-market fit.
4. Before/after movement is not automatically causation.
5. Build success is not production-user verification.
6. Preserve evidence confidence/limitations where recorded.
7. Prospect discovery is E2 only when supported by current verifiable sources. `Contact Ready` is not evidence outreach happened.
8. A sent message is not a reply; a reply is not a sale; a quote is not payment; payment is not profit.
9. A UI status change does not upgrade evidence class.
10. A synthetic acceptance record is not commercial evidence.

## Sales OS source-of-truth rules

- App feed: `sales-engine-app/data/leads.json`
- Canonical CRM workbook: `sales-engine/Same-Day-Customer-Growth-Pack-Live-CRM.xlsx`
- Genuine pipeline/contact history: `sales-engine/pipeline-history.json`

Research refreshes may improve verified prospects but must never overwrite genuine contact timestamps, replies, opt-outs, quotes, payment, fulfillment, notes, or real status changes.

`offerValue` is not booked revenue. Do not mark a lead paid unless genuine payment evidence exists.

## Auth / privacy boundary

Preserve account-scoped RLS, per-business scoping, the root-level `AuthPrivacyGuard`, and the hard reload on Business Record switch.

When adding client state:
- treat business drafts as private;
- ensure auth identity and business identity changes clear or rehydrate them safely;
- do not store secrets/private business data in long-lived browser storage without deliberate scoping/design;
- never weaken RLS to solve a frontend problem;
- validate stored active-business identifiers against current owner access before trusting them.

## Verified technical state — 2026-09-16 checkpoint

Read `PROJECT-STATUS.md` for current identifiers before quoting exact commits/deployments.

### SOURCE / CI
The broad standalone product, multi-business registry, active-business switcher and first Cross-Business Intelligence layer are implemented. Standalone CI typechecks/builds the Next app and PHP lint protects the legacy compatibility track.

### PRODUCTION RUNTIME
The multi-business web source has been deployed successfully on Railway. Cross-Business Intelligence must also be verified against the exact deployed revision after each change before calling it runtime-verified.

### LIVE BACKEND ACCEPTANCE
A production-policy ephemeral test previously exercised all 19 FDOS tables, Evidence approve/reject, foreign-identity RLS visibility and cleanup. The multi-business RPC is live as `SECURITY INVOKER`, denies anonymous execute and permits authenticated execute.

See `FDOS-PRODUCTION-BACKEND-ACCEPTANCE-2026-09-16.md`.

### PRODUCTION USER VERIFIED — NOT YET COMPLETE
Do not falsely promote technical proof into human proof. Genuine browser/session evidence still includes sign-in, save/restore, creating and switching Business Records without bleed, browser module writes, website Evidence review, second real account isolation, mobile/desktop visual acceptance, and one genuinely measured Value Sprint.

### COMMERCIAL EVIDENCE
Keep external customer/user behavior separate from all technical states.

## Current highest-value priority

The broad architecture, Sales OS nesting, plain-English glossary, multi-business registry and first Cross-Business Intelligence layer are built for the current planned scope.

The highest-value unfinished milestone is:

> **Complete genuine production-user/browser acceptance of the broad multi-business system before adding another department.**

Preferred sequence:

`open exact production revision → sign in → create/load first Business Record → edit/save Business DNA → stage change → Value + Decision + Risk + Opportunity + Memory → create second intentional Business Record → switch between businesses and verify no bleed → Idea Lab/X-Ray → run one real Value Sprint → /acceptance → sign out → confirm private records/drafts clear → fresh sign in → verify restore + active-business behavior → browser Evidence capture → approve + reject → Workbench writes → Strategy/Dynasty writes → second genuine account isolation → mobile + desktop visual pass → KEEP / REVISE / REVERT`

If available tools cannot perform a genuine browser/user step, do **not** fake it. Improve only technically verifiable blockers and leave human proof explicitly pending.

## Development rules

- Inspect before implementing; avoid duplicate functionality.
- Preserve working behavior and genuine history.
- Run relevant tests and inspect CI after changes.
- For web changes, typecheck + production build must stay green.
- For database changes, preserve RLS, account/business relationships, Evidence integrity and migration safety; inspect live privileges after RPC changes.
- Never commit credentials, `.env`, private keys, tokens, passwords, or private customer/user data.
- Update status/validation docs when behavior or proof materially changes.
- Do not churn prospect/CRM files just to change dates.
- Do not build generic dashboard widgets that do not contribute to FDOS intelligence.

## Product uniqueness test

Before adding a major feature ask:

- Does it help FDOS understand one or more businesses better?
- Does it connect evidence to a decision/action?
- Does it preserve the boundary between businesses?
- Does it work for multiple business types/stages?
- Does it preserve what happened and what was learned?
- Does it create capability beyond a generic CRM/task manager/dashboard?
- Can a beginner understand it?
- Can an advanced user inspect the evidence/detail?
- Does it contribute to long-term business value, not only short-term sales?

If mostly no, reconsider it.

## Definition of truthful completion

Keep these states separate:

1. **SOURCE COMPLETE**
2. **CI VERIFIED**
3. **PRODUCTION RUNTIME VERIFIED**
4. **LIVE BACKEND ACCEPTANCE VERIFIED**
5. **PRODUCTION USER VERIFIED**
6. **COMMERCIAL EVIDENCE**

A component is only complete at the level actually supported by evidence. Profitability, recurring revenue, scalable acquisition, durable retention, PMF and enterprise-value improvement can never be checked off merely because code or research exists.

## When asked to “continue”

Choose the highest-value unfinished milestone from current repository/runtime evidence and execute as much as available tools permit.

Always report:
- what changed;
- what actually ran/passed;
- what remains human/browser dependent;
- what remains commercially unproven;
- what evidence would close the next gap.

Keep the receipts.
