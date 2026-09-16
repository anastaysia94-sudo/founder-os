# Founder Dynasty OS 10.0 — Project Status

Updated: 2026-09-16

**Parent:** SmartPickShop Holdings  
**Canonical repository:** `anastaysia94-sudo/founder-os`

## Product direction

Founder Dynasty OS is a broad business operating intelligence system for any stage from raw idea through operating company, portfolio, long-term enterprise value, and succession.

The Same-Day Customer Growth Pack / Sales OS remains a major module under **Customers & Growth**, not the identity of the product.

Canonical product statement:

> **Founder Dynasty OS is the operating intelligence of the business.**

## Current standalone product surface

The primary standalone `web/` application is organized around one authenticated, account-owned Business Record.

### `/` — Founder Command Center
- Business Stage + Business DNA
- current goal and stage guidance
- Value Map
- Opportunity Engine
- Decision Engine
- Risk Center
- Business Memory
- E1–E8 evidence labels
- website Evidence capture + founder approval queue
- What Am I Missing? summary
- whole-OS neighborhood map
- Sales OS correctly nested under Customers & Growth

### `/intelligence` — Founder Intelligence Layer
- Idea Lab
- Business X-Ray
- detailed What Am I Missing? engine
- Value Sprints
- hypothesis → action → measure → result → KEEP / REVISE / REVERT
- top Opportunity → Sprint handoff
- Business Memory learning loop

### `/workbench` — Build & Run Workbench
- Finance Center
- E6 financial model assumptions
- Product & Offer Lab
- Draft / Testing / Active / Retired offer states
- Operations & Execution
- Planned / Active / Blocked / Done initiatives
- shared Business Memory updates

### `/strategy` — Strategy / Dynasty Workspace
- Business Model Lab
- Customer Intelligence
- Marketing & Distribution experiments
- Asset Map
- Founder Attention
- Scenario Lab
- Portfolio / Dynasty Mode
- strategy blind-spot questions
- structural Dynasty readiness signal, explicitly not a valuation or success forecast

### `/glossary`
- searchable plain-English glossary
- E1–E8 definitions
- business + technical term definitions
- global navigation access

### `/acceptance`
Read-only production diagnostics for runtime revision, genuine browser session, owned Business Record, RLS-scoped module counts, viewport and browser state. It writes no synthetic acceptance data and does not auto-pass human steps.

It remains `index: false`, `follow: false`, nocache, and absent from sitemap.

## Production data layer

The broad FDOS model has **19 RLS-enabled tables**:

### Core Business Record / Evidence
- `fdos_business_records`
- `fdos_value_items`
- `fdos_decisions`
- `fdos_risks`
- `fdos_opportunities`
- `fdos_memory`
- `fdos_evidence`
- `fdos_evidence_proposals`

### Learning / Build / Run
- `fdos_value_sprints`
- `fdos_financial_assumptions`
- `fdos_offer_hypotheses`
- `fdos_initiatives`

### Strategy / Assets / Dynasty
- `fdos_business_model_elements`
- `fdos_customer_insights`
- `fdos_distribution_experiments`
- `fdos_business_assets`
- `fdos_scenarios`
- `fdos_portfolio_theses`
- `fdos_attention_blocks`

The production migrations enforce RLS, account/business ownership, same-business Evidence relationships, E1–E8 constraints, and covering indexes for the expanded foreign keys.

## Evidence integrity

Permanent classes:
- E1 Verified Fact
- E2 Current External Evidence
- E3 Customer-Derived Evidence
- E4 Internal Observation
- E5 Strategic Hypothesis
- E6 Financial Model Assumption
- E7 Forecast
- E8 Illustrative Example

Rules preserved:
- manual Customer Intelligence notes are E4 unless genuine customer evidence exists;
- Business Model elements start E5;
- financial assumptions remain E6;
- scenarios remain E7;
- changing a UI status does not upgrade evidence class;
- external website observations remain E2 and require founder review before canonical changes;
- Sales OS offer values are not revenue and `paid` remains zero unless a real payment is recorded.

## Auth / privacy hardening

The accepted source now includes a global `AuthPrivacyGuard` mounted in the root layout.

It complements each workspace's own account-scoped hydration guards by clearing **all unsaved React-local drafts** across the entire app on:
- sign-out from an authenticated account; or
- direct account switching.

The guard records only the prior account identifier in browser `sessionStorage`, updates/clears it before reload, and reloads once at the auth boundary so drafts from `/intelligence`, `/workbench`, `/strategy`, and future modules cannot remain mounted across identities.

This is source/CI/runtime verified. The actual browser-observed sign-out/switch behavior still belongs to genuine production-user acceptance.

## Live production backend acceptance

A live authenticated production-policy acceptance pass was performed with ephemeral data and then fully cleaned up. Detailed evidence is in:

`FDOS-PRODUCTION-BACKEND-ACCEPTANCE-2026-09-16.md`

Observed:
- **19 / 19** FDOS tables accepted an owner-scoped ephemeral record graph;
- `fdos_apply_evidence_proposal` successfully approved one Proposal;
- switching the authenticated JWT identity to a foreign UUID exposed **0** owner Business rows and **0** owner child rows through RLS;
- website Evidence RPC captured **1 E2 Evidence** + **2 Proposals**;
- **1 Proposal approved**, **1 rejected**;
- the approved Decision retained the E2 Evidence/source link;
- capture created Business Memory;
- cleanup returned persistent synthetic FDOS row count to **0**.

This proves live backend behavior under production policies, not a second genuine person's browser session.

## CI state

Current accepted **web code revision**:

`8cf11db3c798f5a90d19e892c217ab88d79232e6`

Commit:

`fix(web): enforce auth privacy boundary across modules`

GitHub Actions:
- `Founder OS Standalone Web` run `35073170177`: **SUCCESS**
- `PHP Lint` run `35073170169`: **SUCCESS**

The standalone workflow verifies dependency/vulnerability gates, TypeScript, Next.js production build, broad Command Center contracts, Intelligence, Workbench, Strategy/Dynasty, Glossary, persistence contracts, RLS migrations, Evidence restrictions, diagnostics/noindex behavior, and health endpoint behavior.

Next.js 16 TypeScript defaults are committed in `web/tsconfig.json`, so production builds do not need to rewrite the config.

## Production runtime — privacy-hardened web revision is live

Railway service:
- service: `founder-dynasty-os-web`
- domain: `https://founder-dynasty-os-web-production.up.railway.app`
- environment: `production`
- root directory: `/web`
- healthcheck: `/api/health`

Current deployment:

`7c04e794-081c-4268-89da-7a8ccca94941`

Current deployed web source:

`8cf11db3c798f5a90d19e892c217ab88d79232e6`

Railway status: **SUCCESS**.

Observed build/runtime evidence:
- exact repository/branch fetched: `anastaysia94-sudo/founder-os` / `main`;
- exact commit identified by Railway: `8cf11db3...`;
- TypeScript completed successfully;
- all 13 generated/dynamic routes completed production build generation;
- production container started;
- Next.js 16.3.4 became Ready;
- healthcheck completed and deployment reached `SUCCESS`.

The health endpoint prefers Railway's injected `RAILWAY_GIT_COMMIT_SHA` over the legacy `FDOS_DEPLOY_REV`, so runtime provenance reports the code actually running.

## Completion state

### SOURCE COMPLETE / CI VERIFIED / PRODUCTION RUNTIME VERIFIED / LIVE BACKEND ACCEPTANCE VERIFIED
- broad Founder Command Center
- Business Stage + Business DNA
- Value Map
- Opportunity Engine
- Decision Engine
- Risk Center
- Business Memory
- Founder Intelligence Layer
- Idea Lab
- Business X-Ray
- What Am I Missing?
- Value Sprints + KEEP / REVISE / REVERT
- Finance Center
- Product & Offer Lab
- Operations & Execution
- Business Model Lab
- Customer Intelligence
- Marketing & Distribution
- Asset Map
- Founder Attention
- Scenario Lab
- Portfolio / Dynasty Mode
- Plain-English Glossary
- website Evidence capture/review architecture
- 19-table RLS-protected persistence
- relationship-aware Evidence links
- live backend owner-write + RLS smoke test
- live Evidence capture/approve/reject backend smoke test
- production source provenance
- deterministic Next.js 16 TypeScript config
- global auth/privacy draft boundary
- Sales OS correctly nested under Customers & Growth

### STILL REQUIRES GENUINE HUMAN / PRODUCTION-USER PROOF
These cannot truthfully be manufactured by CI or backend SQL:
- genuine browser sign-in on the current deployed revision;
- first Business Record bootstrap/load through the browser UI;
- save → sign out → fresh sign in → restore;
- browser-observed clearing of private records **and unsaved drafts** on sign-out/account switch;
- second genuine-account browser isolation;
- real UI create/update flows across major modules;
- browser website Evidence capture → approve → reject;
- mobile visual/interaction acceptance;
- desktop visual/interaction acceptance;
- one real Value Sprint completed through an observable result → KEEP / REVISE / REVERT.

There is currently only one authenticated production user, so genuine second-user acceptance cannot be honestly marked complete yet.

## Highest-value remaining milestone

**Do not build another department. Finish genuine production-user acceptance of the system that now exists.**

Sequence:

`open production → sign in → create/load Business Record → edit Business DNA → change stage → add Value + Decision + Risk + Opportunity + Memory → Idea Lab/X-Ray → run one Value Sprint → /acceptance → sign out → confirm all private state/drafts clear → sign back in → verify restore → browser Evidence capture → approve + reject → Workbench writes → Strategy/Dynasty writes → second genuine account → mobile + desktop visual pass → KEEP / REVISE / REVERT`

## Product guardrail

Every future module must connect to the shared Business Record, Evidence, measurable outcomes, a Decision, a Risk, an Asset, a Value Sprint, or Business Memory. If it cannot, reconsider whether it belongs in Founder Dynasty OS.
