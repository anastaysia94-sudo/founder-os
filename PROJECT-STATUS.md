# Founder Dynasty OS 10.0 — Project Status

Updated: 2026-09-16

**Parent:** SmartPickShop Holdings  
**Canonical repository:** `anastaysia94-sudo/founder-os`

## Product direction

Founder Dynasty OS is a broad business operating intelligence system for any stage from raw idea through operating company, portfolio, long-term enterprise value, and succession.

The Same-Day Customer Growth Pack / Sales OS remains a major module under **Customers & Growth**, not the identity of the product.

Canonical product statement:

> **Founder Dynasty OS is the operating intelligence of the business.**

## Current standalone source architecture

The primary standalone `web/` application is organized around one authenticated, account-owned Business Record.

### `/` — Founder Command Center

Implemented:
- Business Stage
- Business DNA
- Founder Command Center signals
- Value Map
- Opportunity Engine
- Risk Center
- Decision Engine
- Business Memory
- E1–E8 evidence labels
- website Evidence capture and founder approval queue
- whole-OS neighborhood map
- Customers & Growth → Sales OS placement

### `/intelligence` — Founder Intelligence Layer

Implemented:
- Idea Lab
- Business X-Ray
- What Am I Missing?
- Value Sprints
- hypothesis → action → measure → result → KEEP / REVISE / REVERT
- stage-aware and evidence-aware structural signals

### `/workbench` — Build & Run Workbench

Implemented:
- Finance Center
- E6 financial model assumptions with confidence
- Product & Offer Lab
- Draft / Testing / Active / Retired offer states
- Operations & Execution
- Planned / Active / Blocked / Done initiatives
- shared Business Memory updates

### `/strategy` — Strategy / Dynasty Workspace

Implemented:
- Business Model Lab
- Customer Intelligence
- Marketing & Distribution experiments
- Asset Map
- Founder Attention
- Scenario Lab
- Portfolio / Dynasty Mode
- strategy blind-spot questions
- structural Dynasty readiness signal, explicitly not a valuation or success forecast

### `/glossary` — Plain-English Glossary

Implemented:
- searchable business/technical glossary
- E1–E8 definitions
- plain-English definitions for product concepts and technical terms
- global navigation access

### `/acceptance` — Read-only production diagnostics

The diagnostic surface reads runtime health, the genuine browser session, the owned Business Record, and RLS-scoped counts across the broad FDOS data model. It does not write fake test data and does not auto-pass human acceptance steps.

It remains:
- `index: false`
- `follow: false`
- nocache
- absent from sitemap

## Current Supabase persistence

The expanded FDOS model has **19 RLS-enabled tables**:

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

The current migrations enforce RLS, account/business ownership, same-business Evidence relationships, E1–E8 evidence constraints, and covering indexes for the expanded FDOS foreign keys.

## Evidence integrity

Permanent evidence classes remain:
- E1 Verified Fact
- E2 Current External Evidence
- E3 Customer-Derived Evidence
- E4 Internal Observation
- E5 Strategic Hypothesis
- E6 Financial Model Assumption
- E7 Forecast
- E8 Illustrative Example

Important behavior:
- manual Customer Intelligence notes are E4 unless genuine customer evidence exists;
- Business Model elements start as E5;
- financial assumptions remain E6;
- scenarios remain E7;
- moving a UI status does not upgrade its evidence class;
- external website observations remain E2 and require founder review before proposed changes become canonical;
- Sales OS offer values are not revenue and payment remains zero unless a real payment is recorded.

## CI state

Current accepted web revision:

`9ae56202470e75040c76a08a25b6f074d5808577`

Commit:

`chore(web): align TypeScript config with Next 16`

GitHub Actions on 2026-09-16:
- `Founder OS Standalone Web` run `35072232659`: **SUCCESS**
- `PHP Lint` run `35072232717`: **SUCCESS**

The standalone workflow checks:
- dependency vulnerability gate
- TypeScript
- Next.js production build
- broad Command Center contract
- Intelligence Layer contract
- Build & Run Workbench contract
- Strategy / Dynasty workspace contract
- Plain-English Glossary contract
- Value Sprint persistence
- operating-workbench persistence
- strategy persistence
- relationship-aware RLS migrations
- expansion foreign-key index hardening
- Evidence persistence / RPC restrictions
- production diagnostics / noindex contract
- health endpoint revision/cache behavior

The Next.js 16 TypeScript defaults are now committed in `web/tsconfig.json` (`jsx: react-jsx` plus `.next/dev/types/**/*.ts`), so production builds no longer need to rewrite the TypeScript configuration inside the build container.

## Production runtime — accepted current web revision is live

Railway service:
- service: `founder-dynasty-os-web`
- domain: `https://founder-dynasty-os-web-production.up.railway.app`
- environment: `production`

Current deployment:

`d7fa868c-e074-46d9-abe2-77f3f3adcf38`

Current deployed web source:

`9ae56202470e75040c76a08a25b6f074d5808577`

Railway status: **SUCCESS**.

The stale-source problem from 2026-09-13 is resolved. Railway fetched the linked `main` branch and identified the current deployment as the exact accepted web commit above rather than reusing stale commit `284c496...`.

Build/runtime evidence for the current deployment:
- repository: `anastaysia94-sudo/founder-os`
- branch: `main`
- root directory: `/web`
- dependency install completed with 0 reported vulnerabilities
- Next.js 16.3.4 production compilation succeeded
- TypeScript succeeded
- all 13 generated/dynamic routes completed build generation
- committed TypeScript config required no Next.js rewrite during this build
- production container started successfully
- configured healthcheck remains `/api/health`
- deployment reached `SUCCESS`

Current production route set includes:
- `/`
- `/acceptance`
- `/answers`
- `/api/evidence/website`
- `/api/health`
- `/glossary`
- `/intelligence`
- `/manifest.webmanifest`
- `/robots.txt`
- `/sales-engine-app`
- `/sitemap.xml`
- `/strategy`
- `/workbench`

The health endpoint prefers Railway's automatically injected `RAILWAY_GIT_COMMIT_SHA` over the legacy manually managed `FDOS_DEPLOY_REV`, so production provenance reflects the code actually running.

## Completion state

### SOURCE COMPLETE / CI VERIFIED / CURRENT PRODUCTION RUNTIME VERIFIED
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
- Value Sprints and KEEP / REVISE / REVERT
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
- 19-table RLS-protected FDOS persistence
- relationship-aware Evidence links
- current-web Railway deployment
- health/provenance diagnostics
- deterministic Next.js 16 TypeScript config
- Sales OS correctly nested under Customers & Growth

### STILL REQUIRES GENUINE HUMAN / PRODUCTION-USER PROOF
These cannot be converted into facts by CI, database inspection, or an assistant pretending very confidently:
- genuine browser sign in against the current deployed revision
- create/load the first Business Record through current production UI
- save → sign out → fresh sign in → restore
- verify private state disappears immediately on sign-out/account switch
- second genuine-account read/write isolation
- create/read/update flows across the major new modules
- website Evidence capture → approve one proposal → reject one proposal
- mobile visual/interaction acceptance
- desktop visual/interaction acceptance
- one real Value Sprint completed through observable result → KEEP / REVISE / REVERT

## Highest-value next milestone

**Do not add another department yet. Complete genuine production-user acceptance of the system that now exists.**

Sequence:

`open current production → sign in → create/load Business Record → edit Business DNA → change stage → add Value + Decision + Risk + Opportunity + Memory → use Idea Lab/X-Ray → plan and run one Value Sprint → open /acceptance → sign out → verify private-state clearing → sign back in → verify restore → website Evidence capture → approve one Proposal → reject one Proposal → second-user isolation → mobile + desktop visual pass → KEEP / REVISE / REVERT`

## Product guardrail

Every new module must connect to the shared Business Record, Evidence, measurable outcomes, a decision, a risk, an asset, a Value Sprint, or Business Memory. If it cannot, reconsider whether it belongs in Founder Dynasty OS.
