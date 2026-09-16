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

### `/answers`
- public answer-oriented content surface for search/AEO discovery

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

The accepted source includes a global `AuthPrivacyGuard` mounted in the root layout.

It complements each workspace's account-scoped hydration guards by clearing **all unsaved React-local drafts** across the app on:
- sign-out from an authenticated account; or
- direct account switching.

The guard stores only the prior account identifier in browser `sessionStorage`, updates/clears it before reload, and reloads once at the auth boundary so private drafts from `/intelligence`, `/workbench`, `/strategy`, and future modules cannot remain mounted across identities.

Source, CI and production deployment are verified. Actual browser-observed sign-out/switch behavior remains genuine production-user acceptance.

## Live production backend acceptance

Detailed evidence:

`FDOS-PRODUCTION-BACKEND-ACCEPTANCE-2026-09-16.md`

Observed against production policies with ephemeral data:
- **19 / 19** FDOS tables accepted an owner-scoped record graph;
- `fdos_apply_evidence_proposal` approved one Proposal;
- a foreign authenticated JWT identity saw **0** owner Business rows and **0** owner child rows through RLS;
- website Evidence RPC captured **1 E2 Evidence** + **2 Proposals**;
- **1 Proposal approved**, **1 rejected**;
- approved Decision retained its E2 Evidence/source link;
- capture created Business Memory;
- cleanup returned persistent synthetic FDOS row count to **0**.

This proves production backend behavior, not a second genuine person's browser session.

## CI state

Accepted **web code revision**:

`8cf11db3c798f5a90d19e892c217ab88d79232e6`

Commit:

`fix(web): enforce auth privacy boundary across modules`

GitHub Actions:
- `Founder OS Standalone Web` run `35073170177`: **SUCCESS**
- `PHP Lint` run `35073170169`: **SUCCESS**

The standalone workflow verifies dependency/vulnerability gates, TypeScript, Next.js production build, Command Center, Intelligence, Workbench, Strategy/Dynasty, Glossary, persistence contracts, RLS migrations, Evidence restrictions, diagnostics/noindex behavior, and health endpoint behavior.

Next.js 16 TypeScript defaults are committed in `web/tsconfig.json`; the production build no longer depends on build-time mutation of that file.

## Production runtime — accepted web code + current production configuration

Railway service:
- service: `founder-dynasty-os-web`
- domain: `https://founder-dynasty-os-web-production.up.railway.app`
- environment: `production`
- root directory: `/web`
- healthcheck: `/api/health`

Current deployment:

`6a976ff8-bc37-4c7c-864d-767bb3f5556b`

Deployed repository revision:

`31ee76a27e3a825ba9efd9628b07990320c8d310`

The deployed repository revision contains the same accepted `web/` code tree whose last web-changing commit is `8cf11db3...`, plus later documentation/handoff corrections.

Railway status: **SUCCESS**.

Observed build/runtime evidence:
- repository/branch: `anastaysia94-sudo/founder-os` / `main`;
- Railway identified exact deployed repository revision `31ee76a27...`;
- dependency install reported **0 vulnerabilities**;
- Next.js 16.3.4 compiled successfully;
- TypeScript completed successfully;
- all 13 generated/dynamic routes completed build generation;
- production container reached Ready;
- configured `/api/health` healthcheck passed and deployment reached `SUCCESS`.

### Production canonical/sitemap configuration

`NEXT_PUBLIC_SITE_URL` is now set to the production HTTPS domain. That enables the existing metadata/sitemap code to emit the production canonical URL and public sitemap entries for:
- `/`
- `/answers`
- `/glossary`

`/acceptance` remains intentionally excluded from the sitemap.

The health endpoint prefers Railway's injected `RAILWAY_GIT_COMMIT_SHA` over the legacy `FDOS_DEPLOY_REV`, so runtime provenance reflects the repository revision actually running.

## AI handoff drift corrected

The canonical continuation docs were audited after the web rebuild. Stale instructions that still described WordPress deployment as the primary milestone were corrected in:
- `AGENTS.md`
- `AI-HANDOFF.md`
- `.github/copilot-instructions.md`

Future assistants are now directed to the standalone broad OS, shared Business Record, current Evidence boundary, and genuine production-user acceptance instead of trying to drag the project backward into its historical WordPress launch path. Humanity has enough legacy instructions already.

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
- public Answers/AEO surface
- website Evidence capture/review architecture
- 19-table RLS-protected persistence
- relationship-aware Evidence links
- live backend owner-write + RLS smoke test
- live Evidence capture/approve/reject backend smoke test
- production source provenance
- deterministic Next.js 16 TypeScript config
- global auth/privacy draft boundary
- production canonical URL + sitemap configuration
- corrected multi-AI handoff instructions
- Sales OS correctly nested under Customers & Growth

### STILL REQUIRES GENUINE HUMAN / PRODUCTION-USER PROOF
These cannot truthfully be manufactured by CI, SQL, or a deploy tool:
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

There is currently only one authenticated production user, so genuine second-user acceptance cannot honestly be marked complete yet.

## Highest-value remaining milestone

**Do not build another department. Finish genuine production-user acceptance of the system that now exists.**

Sequence:

`open production → sign in → create/load Business Record → edit Business DNA → change stage → add Value + Decision + Risk + Opportunity + Memory → Idea Lab/X-Ray → run one Value Sprint → /acceptance → sign out → verify all private state/drafts clear → sign back in → verify restore → browser Evidence capture → approve + reject → Workbench writes → Strategy/Dynasty writes → second genuine account → mobile + desktop visual pass → KEEP / REVISE / REVERT`

## Product guardrail

Every future module must connect to the shared Business Record, Evidence, measurable outcomes, a Decision, a Risk, an Asset, a Value Sprint, or Business Memory. If it cannot, reconsider whether it belongs in Founder Dynasty OS.
