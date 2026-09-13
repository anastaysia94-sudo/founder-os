# Founder Dynasty OS 10.0 — Project Status

Updated: 2026-09-13

**Parent:** SmartPickShop Holdings  
**Canonical repository:** `anastaysia94-sudo/founder-os`

## Current product direction

Founder Dynasty OS is a broad business operating intelligence system for any stage from raw idea through operating company, portfolio, and long-term enterprise value. The Same-Day Customer Growth Pack / Sales OS is a major module under Customers & Growth, not the identity of the product.

Canonical product statement: **Founder Dynasty OS is the operating intelligence of the business.**

## Broad standalone web shell

The primary web application is the standalone `web/` track, organized around one authenticated, account-owned Business Record rather than separate feature silos.

Current major areas include Business Stage, editable Business DNA, Founder Command Center, Value Map, Opportunities, Risks, Decisions, Business Memory, E1–E8 evidence labels, website evidence capture/review, plain-English explainable terms, and Customers & Growth → Sales OS.

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

All eight tables have RLS enabled.

### Atomic first-business bootstrap

`fdos_ensure_business()` is `SECURITY INVOKER`, derives ownership from `auth.uid()`, rejects unauthenticated calls, serializes same-user initial creation, returns an existing Business Record when present, and otherwise creates the default Business Record plus its E4 workspace-memory event in one transaction.

Migration mirror:

`db/migrations/20260913_add_atomic_fdos_business_bootstrap.sql`

### Relationship-aware tenant isolation

FDOS child-row RLS now validates both the row owner and the ownership of the referenced Business Record. Evidence Proposal policies additionally validate that the linked Evidence belongs to the same authenticated user and the same Business Record.

This closes a referential-isolation gap where matching `user_id` alone was insufficient to prove that a supplied `business_id` belonged to the caller.

Migration mirror:

`db/migrations/20260913_enforce_fdos_business_relationships_in_rls.sql`

## Auth/session privacy hardening

The current web source:

- version-tags hydration requests and ignores superseded results;
- rejects hydration for users who are no longer active;
- clears private Business Record state on sign-out;
- clears the previous account's private state before hydrating a newly active account;
- clears proposals, evidence receipt, composer/edit state, and website input with the private workspace;
- clears password state after successful authentication/sign-out;
- verifies that evidence capture still belongs to the initiating authenticated session;
- prevents overlapping Business Stage writes while a save is busy.

These protections are source-complete and deployed, but genuine two-account browser verification remains a separate gate.

## Evidence-linked operating intelligence

`POST /api/evidence/website` captures a public webpage as E2 Current External Evidence and produces reviewable proposals rather than silently changing the business.

Direct source observations remain E2. Interpretations remain E5 hypotheses. Founder approval is required before a proposal becomes canonical.

### Atomic evidence persistence

Evidence capture now persists its Evidence row, all generated Proposals, and its Business Memory event through `fdos_store_website_evidence(...)` in one database transaction. A persistence failure no longer leaves a half-written evidence loop.

The route also rejects an HTML body larger than its capture limit rather than silently recording a truncated document as complete evidence.

Migration mirror:

`db/migrations/20260913_add_atomic_fdos_website_evidence_capture.sql`

## Protected mutation verification

The client now requires a positive returned row/result for Business DNA saves and Evidence Proposal review mutations. A zero-row RLS-filtered mutation is therefore treated as failure instead of being presented as a successful save simply because the request itself did not throw.

## RPC exposure hardening

Production ACL inspection found explicit `anon` EXECUTE grants on FDOS RPCs even after execution had been revoked from `PUBLIC`.

Those explicit anonymous grants were removed from:

- `fdos_ensure_business()`
- `fdos_apply_evidence_proposal(uuid)`
- `fdos_store_website_evidence(...)`

All three application RPCs were verified as `SECURITY INVOKER`. Authenticated execution remains available; anonymous execution does not.

Migration mirror:

`db/migrations/20260913_restrict_fdos_rpc_execute_to_authenticated.sql`

## Sales OS integration

Sales OS remains in Customers & Growth. `/sales-engine-app` bridges to the separate production Sales OS service rather than redefining Founder Dynasty OS around sales.

Bridge source commit: `adccb5a148da64bafb081303352dd582f854062d`.

## Dependency and database hardening

The accepted runtime uses Next.js 16.3.4. The CI high/critical dependency vulnerability gate passes.

Earlier FDOS hardening added covering foreign-key indexes and optimized owner RLS expressions using `(select auth.uid())`.

Migration mirror:

`db/migrations/20260913_optimize_fdos_rls_and_foreign_key_indexes.sql`

Fresh post-hardening Supabase advisor scans report no FDOS missing-RLS-policy warning, no FDOS authenticated `SECURITY DEFINER` warning, no FDOS unindexed-FK finding, and no FDOS `auth_rls_initplan` warning. Remaining FDOS performance notices are unused-index INFO findings while the production tables still have no real workload data.

Shared-project warnings belonging to FSA, EGM, Instant Decision, or other products are not silently modified as part of FDOS work.

## Current accepted production runtime

Railway service: `founder-dynasty-os-web`  
Public domain: `https://founder-dynasty-os-web-production.up.railway.app`

Accepted web/runtime revision:

`77e14bd8ca8b04f42f50b7c19ef7673f7fec3f62`

Railway deployment:

`ed02e62d-de35-4fe4-b537-54e825cc1459`

Verified:

- deployment status: `SUCCESS`;
- Railway identifies the accepted web commit;
- Next.js 16.3.4 production compilation passed;
- TypeScript passed;
- static generation passed;
- production container started successfully;
- Railway `/api/health` succeeded on the first observed attempt;
- production routes include `/`, `/answers`, `/api/evidence/website`, `/api/health`, `/sales-engine-app`, manifest, robots, and sitemap;
- `FDOS_DEPLOY_REV` was aligned to the accepted web revision before deployment.

CI for accepted web revision:

- Founder OS Standalone Web run `34762781642`: **SUCCESS**;
- PHP Lint run `34762781636`: **SUCCESS**.

Latest database-policy source mirror revision:

`fd7d30061ed0c9605f519bf46681c3d7e5a382d5`

Because the standalone workflow now watches `db/migrations/**`, that database-only commit also completed the full web/contract CI gate successfully:

- Founder OS Standalone Web run `34762915913`: **SUCCESS**;
- PHP Lint run `34762915861`: **SUCCESS**.

The web runtime revision and database migration revision are tracked separately when a database-only commit does not change the deployed web bundle. This avoids ceremonial redeployments whose only achievement would be changing a SHA for the sake of changing a SHA.

## Production data state

The latest production count remains zero persistent rows across all eight FDOS tables. No hardening migration or validation step seeded fake users, businesses, evidence, opportunities, or successful outcomes.

## Verification boundary

### SOURCE COMPLETE / PRODUCTION RUNTIME VERIFIED

Verified at the current checkpoint:

- broad standalone shell builds and type-checks;
- accepted web revision is deployed and healthy;
- shared FDOS persistence tables exist with RLS;
- atomic first-Business bootstrap is in production;
- atomic Evidence + Proposals + Memory persistence is in production;
- protected write/review helpers confirm an actual returned mutation;
- FDOS application RPCs are no longer executable by `anon`;
- child-row RLS validates referenced Business ownership;
- Evidence Proposal RLS validates Business + Evidence relationships;
- stale-session/account-switch privacy protections are deployed;
- FDOS-specific security/performance advisor checks remain clear of the previously remediated classes;
- website E2 capture route and Sales OS bridge route are present in production.

### NOT YET PROVEN THROUGH A GENUINE PRODUCTION USER SESSION

- first Business Record creation/load through the deployed UI;
- Business DNA save → sign out → fresh sign in → restore;
- confirmation that private record content disappears after sign-out in a real browser;
- production UI create/read for Value, Decision, Risk, Opportunity, and Memory;
- real authenticated website evidence capture through the deployed UI;
- approve/reject Evidence Proposals through the deployed UI and verify linked records;
- two genuine-user read/write isolation test;
- direct account switch showing immediate old-state clearing in a real browser;
- Android/mobile and desktop visual/interaction acceptance.

Do not describe those user-flow items as complete until they are actually exercised. A database can be exceptionally well-behaved while a browser invents some new nonsense at the finish line.

## Next highest-value milestone

Run the genuine authenticated production acceptance loop:

`sign in → create/load Business Record → edit Business DNA → change stage → add Value + Decision + Risk + Opportunity + Memory → sign out → confirm private state clears → sign back in → verify restore → capture website evidence → approve/reject proposals → verify evidence links + memory → switch to second user → verify immediate old-state clearing + read/write isolation → mobile/desktop visual pass → KEEP / REVISE / REVERT`

Until that is complete, do not bury the project under another avalanche of modules. The core operating record must prove it survives actual human use first.

## Product guardrail

Every major new module should connect back to the shared Business Record, measurable business outcomes, evidence, a decision, a risk, or a learning loop. If it cannot, reconsider whether it belongs in Founder Dynasty OS.
