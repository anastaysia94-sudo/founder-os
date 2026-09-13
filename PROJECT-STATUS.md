# Founder Dynasty OS 10.0 — Project Status

Updated: 2026-09-13

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

### `/acceptance` — Read-only production diagnostics

The diagnostic surface now reads runtime health, the genuine browser session, the owned Business Record, and RLS-scoped counts across the broad FDOS data model. It does not write fake test data and does not auto-pass human acceptance steps.

It remains:
- `index: false`
- `follow: false`
- nocache
- absent from sitemap

## Current Supabase persistence

The expanded FDOS model now has **19 RLS-enabled tables**:

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

Direct database inspection confirms RLS is enabled on all 19 FDOS tables.

## Relationship and performance hardening

Current source + production migrations enforce account/business ownership across the FDOS child tables. Optional Evidence links in the expanded model are constrained so a linked Evidence row must belong to the same authenticated user and Business Record.

After expanding Finance, Offer, Operations, Strategy, Assets and Dynasty, the Supabase performance advisor exposed missing covering indexes for the new `business_id` and `evidence_id` foreign keys. Those FDOS findings were remediated in:

`db/migrations/20260913_harden_fdos_expansion_relationships_and_indexes.sql`

A fresh advisor scan after the migration reports **no remaining FDOS entries under `unindexed_foreign_keys`**. Remaining findings belong to EGM4000/FSA/shared-project tables and are not silently altered as part of Founder OS work.

Fresh security-advisor output likewise contains no FDOS missing-policy or authenticated SECURITY DEFINER findings. Shared-project warnings remain scoped to other products. Leaked-password protection is still reported by Supabase as disabled at the Auth project level; that is an account/security setting rather than a Founder OS table migration.

Supabase remediation references:
- Security/RLS lint guidance: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
- Foreign-key index guidance: https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys
- Password protection guidance: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

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

Important current behavior:
- manual Customer Intelligence notes are E4 unless genuine customer evidence exists;
- Business Model elements start as E5;
- financial assumptions remain E6;
- scenarios remain E7;
- moving a UI status does not magically upgrade its evidence class;
- external website observations remain E2 and require founder review before proposed changes become canonical.

## CI state

The standalone workflow now checks:
- dependency vulnerability gate
- TypeScript
- Next.js production build
- broad Command Center contract
- Intelligence Layer contract
- Build & Run Workbench contract
- Strategy / Dynasty workspace contract
- Value Sprint persistence
- operating-workbench persistence
- strategy persistence
- relationship-aware RLS migrations
- expansion foreign-key index hardening
- Evidence persistence / RPC restrictions
- production diagnostics / noindex contract
- health endpoint revision/cache behavior

Verified source revision `b7354d5419edc1545c585aca1e2465f057d22502` passed the full standalone build workflow (`34784596187`). Later commits include database hardening, CI contract expansion, and documentation; they do not change the product’s evidence boundary.

## Production runtime boundary — important

Railway service:
- service: `founder-dynasty-os-web`
- domain: `https://founder-dynasty-os-web-production.up.railway.app`

The live Railway service is still consuming the older source snapshot:

`284c496117247013e0bf46b75dce337b24fdb7d1`

A manual Railway redeploy produced deployment:

`d55a6d83-7f67-4288-8efc-108ddf021e33`

with status `SUCCESS`, but Railway redeployed the same old source commit rather than pulling current `main`.

Therefore it is **not valid** to claim that `/intelligence`, `/workbench`, `/strategy`, the 19-table acceptance diagnostics, or the latest UI are live merely because GitHub CI and Supabase migrations are current.

Current accurate boundary:

### SOURCE COMPLETE / DATABASE APPLIED / CI VERIFIED
- broad Command Center
- Founder Intelligence Layer
- Value Sprints
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
- 19-table RLS-protected FDOS persistence
- expanded relationship-aware Evidence links
- current FDOS foreign-key coverage
- broad read-only acceptance diagnostics

### LIVE RAILWAY RUNTIME STILL STALE
- Railway is healthy but is serving old revision `284c496...`.
- normal redeploy reuses that stale source snapshot.
- production deployment must be repaired or replaced before claiming current source is live.

### STILL REQUIRES GENUINE HUMAN / PRODUCTION PROOF
- current-main deployment on a public URL
- sign in and first Business Record bootstrap through that deployed revision
- save → sign out → fresh sign in → restore
- old private state disappears immediately on sign-out/account switch
- second genuine-account read/write isolation
- create/read/update flows across the major new modules
- website Evidence capture → approve one proposal → reject one proposal
- mobile visual acceptance
- desktop visual acceptance
- KEEP / REVISE / REVERT after actual use

## Highest-value next milestone

**Stop adding broad modules temporarily. Prove the broad OS end to end.**

Next sequence:

`repair/replace stale Railway source → deploy current main → verify /api/health sourceRevision → open /, /intelligence, /workbench, /strategy, /acceptance → genuine sign-in → create/update real records → sign out → verify private-state clearing → sign back in → verify restore → second-user isolation → Evidence capture/review → mobile + desktop visual pass → KEEP / REVISE / REVERT`

That is now more valuable than giving the OS yet another shiny department before an actual production browser has walked through the building.

## Product guardrail

Every new module must connect to the shared Business Record, Evidence, measurable outcomes, a decision, a risk, an asset, a Value Sprint, or Business Memory. If it cannot, reconsider whether it belongs in Founder Dynasty OS.
