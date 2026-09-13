# Founder Dynasty OS 10.0 — Project Status

Updated: 2026-09-13

**Parent:** SmartPickShop Holdings  
**Canonical repository:** `anastaysia94-sudo/founder-os`

## Current product direction

Founder Dynasty OS is a broad business operating intelligence system for any stage from raw idea through operating company, portfolio, and long-term enterprise value. The Same-Day Customer Growth Pack / Sales OS is a major module under Customers & Growth, not the identity of the product.

Canonical product statement: **Founder Dynasty OS is the operating intelligence of the business.**

## Broad standalone web shell

The primary web application is the standalone `web/` track, organized around one authenticated, account-owned Business Record rather than disconnected feature silos.

Current major areas include Business Stage, editable Business DNA, Founder Command Center, Value Map, Opportunities, Risks, Decisions, Business Memory, E1–E8 evidence labels, website Evidence capture/review, production acceptance diagnostics, plain-English explainable terms, and Customers & Growth → Sales OS.

## Authenticated shared Business Record

Production persistence uses Supabase Auth, Postgres, and Row Level Security across:

- `public.fdos_business_records`
- `public.fdos_value_items`
- `public.fdos_decisions`
- `public.fdos_risks`
- `public.fdos_opportunities`
- `public.fdos_memory`
- `public.fdos_evidence`
- `public.fdos_evidence_proposals`

All eight FDOS tables have RLS enabled.

### Atomic first-business bootstrap

`fdos_ensure_business()` is `SECURITY INVOKER`, derives ownership from `auth.uid()`, rejects unauthenticated use, serializes same-user first creation, and creates the default Business Record plus its initial E4 workspace-memory event atomically when no record exists.

Source mirror:

`db/migrations/20260913_add_atomic_fdos_business_bootstrap.sql`

## Auth/session privacy hardening

The deployed client version-tags hydration, ignores stale-user results, clears private state on sign-out and direct account switch, clears sensitive temporary UI state, verifies that Evidence capture still belongs to the initiating session, and prevents overlapping Business Stage writes.

These protections are source-complete and production-runtime verified. Genuine two-account browser verification remains a separate acceptance gate.

## Evidence-linked operating intelligence

`POST /api/evidence/website` captures a public webpage as E2 Current External Evidence and generates reviewable Proposals rather than silently changing the Business Record. Direct source observations remain E2; strategic interpretations remain E5 hypotheses; founder approval is required before a Proposal becomes canonical.

### Atomic Evidence persistence

`fdos_store_website_evidence(...)` writes the Evidence row, generated Proposals, and capture Business Memory event in one transaction. The route also rejects over-limit HTML rather than silently recording truncated source material as complete evidence.

Source mirror:

`db/migrations/20260913_add_atomic_fdos_website_evidence_capture.sql`

## Protected mutation verification

Business DNA saves and Evidence Proposal review operations require a positive returned row/result. A zero-row RLS-filtered mutation is treated as failure instead of being presented as success.

## RPC exposure hardening

Production ACL inspection found explicit `anon` EXECUTE grants that survived revocation from `PUBLIC`. Anonymous execution was explicitly removed from:

- `fdos_ensure_business()`
- `fdos_apply_evidence_proposal(uuid)`
- `fdos_store_website_evidence(...)`

All three application RPCs are `SECURITY INVOKER`; authenticated execution remains available.

Source mirror:

`db/migrations/20260913_restrict_fdos_rpc_execute_to_authenticated.sql`

## Relationship-aware tenant isolation

Business relationship hardening requires FDOS child rows to belong to the current user and reference a Business Record owned by that same user. Evidence Proposal policies also validate linked Evidence belongs to the same user and Business.

Source mirror:

`db/migrations/20260913_enforce_fdos_business_relationships_in_rls.sql`

A second pass protects optional Evidence links. Every non-null `evidence_id` on Value, Decision, Risk, Opportunity, and Memory rows must reference Evidence owned by the same authenticated user and attached to the same Business Record.

Source mirror:

`db/migrations/20260913_enforce_fdos_evidence_relationships_in_rls.sql`

Direct policy inspection confirmed these Business/Evidence relationship checks after migration.

## Production acceptance diagnostics

The standalone product includes `/acceptance`, a read-only browser proof helper. It reports:

- `/api/health` runtime health and deployed revision;
- whether a genuine Supabase browser session is active;
- the authenticated user's earliest persistent Business Record, if present;
- RLS-scoped counts for Value, Decision, Risk, Opportunity, Memory, Evidence, and Evidence Proposal rows;
- actual browser viewport and user agent;
- PASS / FAIL / WAITING checks;
- a copyable JSON diagnostic snapshot.

It performs no acceptance-test writes and deliberately refuses to auto-pass sign-out/restore, second-user isolation, or visual acceptance.

The route is owner-facing and has dedicated metadata:

- `index: false`
- `follow: false`
- `nocache: true`

It is not included in the sitemap. Apparently not every internal control panel needs to introduce itself to Google, a rare moment of restraint from the web stack.

## Sales OS integration

Sales OS remains inside Customers & Growth. `/sales-engine-app` bridges to the separate production Sales OS service rather than redefining Founder Dynasty OS around sales.

## Dependency and database hardening

The accepted runtime uses Next.js 16.3.4. CI's high/critical dependency vulnerability gate passes.

Fresh Supabase advisor scans after the current relationship migrations report no FDOS:

- missing-RLS-policy warning;
- authenticated `SECURITY DEFINER` warning;
- unindexed-FK finding;
- `auth_rls_initplan` warning.

FDOS still has unused-index INFO notices while production tables have no persistent workload. Findings belonging to FSA, EGM, Instant Decision, or other shared-project products are not silently modified as part of FDOS work.

## Current accepted production runtime

Railway service: `founder-dynasty-os-web`  
Public domain: `https://founder-dynasty-os-web-production.up.railway.app`

Accepted web/runtime revision:

`284c496117247013e0bf46b75dce337b24fdb7d1`

Railway deployment:

`0609d837-7f1e-4298-9a67-200683bdd9c1`

Verified:

- deployment status: `SUCCESS`;
- Railway identifies exact source commit `284c496117247013e0bf46b75dce337b24fdb7d1`;
- Next.js 16.3.4 production compilation passed;
- TypeScript passed;
- static generation passed;
- production container started successfully;
- Railway `/api/health` succeeded on the first observed attempt;
- production routes include `/acceptance` plus main, answers, Evidence, health, Sales bridge, manifest, robots, and sitemap routes;
- `FDOS_DEPLOY_REV` was aligned to this accepted revision before deployment.

CI for accepted revision:

- Founder OS Standalone Web run `34763437203`: **SUCCESS**;
- PHP Lint run `34763437224`: **SUCCESS**;
- dependency audit gate, TypeScript, production build, relational-RLS, acceptance-diagnostics, noindex, and production-testability contract checks all passed.

Database-only hardening revisions remain separately source-controlled and CI-verified. A docs-only repository commit does not require a ceremonial web redeploy when the deployed `web/` tree is unchanged.

## Production data state

Latest production counts remain zero persistent rows across all eight FDOS tables. No hardening migration or validation step seeded fake users, businesses, Evidence, opportunities, or successful outcomes.

## Verification boundary

### SOURCE COMPLETE / PRODUCTION RUNTIME VERIFIED

- broad standalone shell builds and type-checks;
- exact accepted web revision is deployed and healthy;
- `/acceptance` is built, deployed, and noindex/no-follow/nocache;
- all eight FDOS persistence tables exist with RLS;
- atomic first-Business bootstrap is in production;
- atomic Evidence + Proposals + Memory persistence is in production;
- protected write/review helpers verify an actual returned mutation;
- FDOS application RPCs are not executable by `anon`;
- child-row RLS validates referenced Business ownership;
- non-null Evidence links validate same-user/same-Business ownership;
- Evidence Proposal RLS validates Business + Evidence relationships;
- stale-session/account-switch privacy protections are deployed;
- FDOS-specific security/performance advisor checks remain clear of the remediated classes;
- website E2 capture and Sales OS bridge routes are present in production.

### NOT YET PROVEN THROUGH A GENUINE PRODUCTION USER SESSION

- first Business Record creation/load through deployed UI;
- Business DNA save → sign out → fresh sign in → restore;
- confirmation private Business content disappears after sign-out in a real browser;
- production UI create/read for Value, Decision, Risk, Opportunity, and Memory;
- authenticated website Evidence capture through deployed UI;
- approve/reject Evidence Proposals and verify resulting linked records;
- two genuine-user read/write isolation;
- direct account switching with immediate old-state clearing;
- actual `/acceptance` snapshots from those genuine sessions;
- Android/mobile and desktop visual/interaction acceptance.

## Next highest-value milestone

Run the genuine authenticated production acceptance loop with `/acceptance` acting as the read-only witness:

`sign in → create/load Business Record → edit Business DNA → change stage → add Value + Decision + Risk + Opportunity + Memory → /acceptance snapshot → sign out → confirm private state clears → sign back in → verify restore → /acceptance snapshot → capture website Evidence → approve one Proposal → reject one Proposal → verify Evidence links + Memory → switch to second user → verify old-state clearing + read/write isolation → /acceptance snapshot → mobile/desktop visual pass → KEEP / REVISE / REVERT`

Until that is complete, do not bury the product under another avalanche of modules. The core operating record has earned the right to be tested by an actual human browser before we give it more furniture.

## Product guardrail

Every major new module should connect back to the shared Business Record, measurable business outcomes, Evidence, a decision, a risk, or a learning loop. If it cannot, reconsider whether it belongs in Founder Dynasty OS.
