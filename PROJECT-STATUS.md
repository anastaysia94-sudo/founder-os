# Founder Dynasty OS 10.0 — Project Status

Updated: 2026-09-13

**Parent:** SmartPickShop Holdings  
**Canonical repository:** `anastaysia94-sudo/founder-os`

## Current product direction

Founder Dynasty OS is a broad business operating intelligence system for any stage from raw idea through operating company, portfolio, and long-term enterprise value. The Same-Day Customer Growth Pack / Sales OS is a major module under Customers & Growth, not the identity of the product.

Canonical product statement: **Founder Dynasty OS is the operating intelligence of the business.**

## Broad standalone web shell

The primary web application is the standalone `web/` track, organized around one authenticated, account-owned Business Record rather than separate feature silos.

Current major areas include Business Stage, editable Business DNA, Founder Command Center, Value Map, Opportunities, Risks, Decisions, Business Memory, E1–E8 evidence labels, website evidence capture/review, production acceptance diagnostics, plain-English explainable terms, and Customers & Growth → Sales OS.

## Authenticated shared Business Record

Production persistence uses Supabase Auth, Postgres, and Row Level Security across eight FDOS tables:

- `public.fdos_business_records`
- `public.fdos_value_items`
- `public.fdos_decisions`
- `public.fdos_risks`
- `public.fdos_opportunities`
- `public.fdos_memory`
- `public.fdos_evidence`
- `public.fdos_evidence_proposals`

All eight have RLS enabled.

### Atomic first-business bootstrap

`fdos_ensure_business()` is `SECURITY INVOKER`, derives ownership from `auth.uid()`, rejects unauthenticated calls, serializes same-user initial creation, returns an existing Business Record when present, and otherwise creates the default Business Record plus its E4 workspace-memory event in one transaction.

Migration mirror:

`db/migrations/20260913_add_atomic_fdos_business_bootstrap.sql`

## Auth/session privacy hardening

The current web source version-tags hydration requests, rejects stale-user hydration, clears private state on sign-out and direct account switch, clears sensitive temporary UI state, verifies the Evidence-capture session still belongs to the initiating user, and prevents overlapping Business Stage writes.

These protections are source-complete and deployed, but genuine two-account browser verification remains a separate gate.

## Evidence-linked operating intelligence

`POST /api/evidence/website` captures a public webpage as E2 Current External Evidence and produces reviewable Proposals rather than silently changing the business. Direct source observations remain E2; interpretations remain E5 hypotheses; founder approval is required before canonical change.

### Atomic Evidence persistence

`fdos_store_website_evidence(...)` stores the Evidence row, generated Proposals, and capture Business Memory event in one database transaction. The route rejects over-limit HTML rather than silently treating truncated source material as complete evidence.

Migration mirror:

`db/migrations/20260913_add_atomic_fdos_website_evidence_capture.sql`

## Protected mutation verification

Business DNA saves and Evidence Proposal review mutations now require a positive returned row/result. A zero-row RLS-filtered mutation is treated as failure instead of being reported as success.

## RPC exposure hardening

Production ACL inspection found explicit `anon` EXECUTE grants that survived a revoke from `PUBLIC`. Anonymous execution was explicitly removed from:

- `fdos_ensure_business()`
- `fdos_apply_evidence_proposal(uuid)`
- `fdos_store_website_evidence(...)`

All three application RPCs are `SECURITY INVOKER`; authenticated execution remains available.

Migration mirror:

`db/migrations/20260913_restrict_fdos_rpc_execute_to_authenticated.sql`

## Relationship-aware tenant isolation

Business relationship hardening now requires FDOS child rows to belong to the current user and reference a Business Record owned by that same user. Evidence Proposal policies also validate the linked Evidence belongs to the same user and Business.

Migration mirror:

`db/migrations/20260913_enforce_fdos_business_relationships_in_rls.sql`

A second hardening pass covers optional Evidence links. Every non-null `evidence_id` on Value, Decision, Risk, Opportunity, and Memory rows must reference Evidence owned by the same authenticated user and attached to the same Business Record.

Migration mirror:

`db/migrations/20260913_enforce_fdos_evidence_relationships_in_rls.sql`

Direct policy inspection confirmed the Business and Evidence relationship checks are present after migration.

## Production acceptance diagnostics

The standalone product now includes `/acceptance`, a read-only browser proof helper.

It reports:

- `/api/health` runtime health and deployed revision;
- whether a genuine Supabase browser session is active;
- the authenticated user's first persistent Business Record, if one exists;
- RLS-scoped counts for Value, Decision, Risk, Opportunity, Memory, Evidence, and Evidence Proposal rows;
- actual browser viewport and user agent;
- explicit PASS / FAIL / WAITING checks;
- a copyable JSON diagnostic snapshot.

It intentionally performs no acceptance-test writes and refuses to auto-pass sign-out/restore, second-user isolation, or visual acceptance. Those still require actual browser behavior, because apparently software is most creative precisely when a human finally clicks it.

## Sales OS integration

Sales OS remains inside Customers & Growth. `/sales-engine-app` bridges to the separate production Sales OS service rather than redefining Founder Dynasty OS around sales.

## Dependency and database hardening

The accepted runtime uses Next.js 16.3.4. CI's high/critical dependency vulnerability gate passes, and the Railway production install for the accepted revision reported zero vulnerabilities.

Fresh Supabase advisor scans after the current FDOS relationship migrations report:

- no FDOS missing-RLS-policy warning;
- no FDOS authenticated `SECURITY DEFINER` warning;
- no FDOS unindexed-FK finding;
- no FDOS `auth_rls_initplan` warning.

FDOS still has unused-index INFO notices while its production tables have no persistent workload. Shared-project warnings belonging to FSA, EGM, Instant Decision, or other products are not silently modified as part of FDOS work.

## Current accepted production runtime

Railway service: `founder-dynasty-os-web`  
Public domain: `https://founder-dynasty-os-web-production.up.railway.app`

Accepted web/runtime revision:

`7b0cc70772e3fa71d6bee87b3e0e4127584d339c`

Railway deployment:

`f4b7ec54-ea2a-4e3c-8c9b-bf92f77327b7`

Verified:

- deployment status: `SUCCESS`;
- Railway identifies the exact accepted web commit;
- Next.js 16.3.4 production compilation passed;
- TypeScript passed;
- static generation passed;
- production container started successfully;
- Railway `/api/health` succeeded on the first observed attempt;
- production build emits `/acceptance` in addition to the existing main, answers, Evidence, health, Sales bridge, manifest, robots, and sitemap routes;
- `FDOS_DEPLOY_REV` was aligned to the accepted web revision before deployment.

CI for accepted revision:

- Founder OS Standalone Web run `34763277139`: **SUCCESS**;
- PHP Lint run `34763277146`: **SUCCESS**;
- high/critical dependency gate, TypeScript, production build, and relational-RLS / acceptance-diagnostics production-testability contract all passed.

Database-only hardening revisions are separately source-controlled and CI-verified, including `fd7d30061ed0c9605f519bf46681c3d7e5a382d5` and `8ba2072e0f7aee73cc8d6d4a9f067007e30691ea`.

## Production data state

The latest production count remains zero persistent rows across all eight FDOS tables. No hardening migration or validation step seeded fake users, businesses, Evidence, opportunities, or successful outcomes.

## Verification boundary

### SOURCE COMPLETE / PRODUCTION RUNTIME VERIFIED

Verified at the current checkpoint:

- broad standalone shell builds and type-checks;
- exact accepted web revision is deployed and healthy;
- `/acceptance` is built and deployed;
- shared FDOS persistence tables exist with RLS;
- atomic first-Business bootstrap is in production;
- atomic Evidence + Proposals + Memory persistence is in production;
- protected write/review helpers confirm actual returned mutations;
- FDOS application RPCs are not executable by `anon`;
- child-row RLS validates referenced Business ownership;
- non-null Evidence links validate same-user/same-Business ownership;
- Evidence Proposal RLS validates Business + Evidence relationships;
- stale-session/account-switch privacy protections are deployed;
- FDOS-specific security/performance advisor checks remain clear of the remediated classes;
- website E2 capture and Sales OS bridge routes are present in production.

### NOT YET PROVEN THROUGH A GENUINE PRODUCTION USER SESSION

- first Business Record creation/load through the deployed UI;
- Business DNA save → sign out → fresh sign in → restore;
- confirmation that private record content disappears after sign-out in a real browser;
- production UI create/read for Value, Decision, Risk, Opportunity, and Memory;
- real authenticated website Evidence capture through the deployed UI;
- approve/reject Evidence Proposals through the deployed UI and verify linked records;
- two genuine-user read/write isolation test;
- direct account switch showing immediate old-state clearing in a real browser;
- actual `/acceptance` diagnostic snapshots from those genuine sessions;
- Android/mobile and desktop visual/interaction acceptance.

## Next highest-value milestone

Run the genuine authenticated production acceptance loop using the deployed `/acceptance` helper as the read-only witness:

`sign in → create/load Business Record → edit Business DNA → change stage → add Value + Decision + Risk + Opportunity + Memory → /acceptance snapshot → sign out → confirm private state clears → sign back in → verify restore → /acceptance snapshot → capture website Evidence → approve/reject Proposals → verify Evidence links + Memory → switch to second user → verify immediate old-state clearing + read/write isolation → /acceptance snapshot → mobile/desktop visual pass → KEEP / REVISE / REVERT`

Until that is complete, do not bury the project under another avalanche of modules. The core operating record must prove it survives actual human use first.

## Product guardrail

Every major new module should connect back to the shared Business Record, measurable business outcomes, Evidence, a decision, a risk, or a learning loop. If it cannot, reconsider whether it belongs in Founder Dynasty OS.
