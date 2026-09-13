# Founder Dynasty OS 10.0 — Project Status

Updated: 2026-09-13

**Parent:** SmartPickShop Holdings  
**Canonical repository:** `anastaysia94-sudo/founder-os`

## Current product direction

Founder Dynasty OS is a broad business operating intelligence system for any stage from raw idea through operating company, portfolio, and long-term enterprise value. The Same-Day Customer Growth Pack / Sales OS is a major module under Customers & Growth, not the identity of the product.

Canonical product statement: **Founder Dynasty OS is the operating intelligence of the business.**

## Broad standalone web shell

The primary web application is the standalone `web/` track, organized around one authenticated, account-owned Business Record rather than separate feature silos.

Current major areas include Business Stage, editable Business DNA, Founder Command Center, Value Map, Opportunities, Risks, Decisions, Business Memory, E1–E8 evidence labels, website evidence capture/review, plain-English explainable terms, and the Customers & Growth → Sales OS neighborhood.

## Authenticated shared Business Record

Production persistence uses Supabase Auth, Postgres, and Row Level Security. Implemented FDOS tables include:

- `public.fdos_business_records`
- `public.fdos_value_items`
- `public.fdos_decisions`
- `public.fdos_risks`
- `public.fdos_opportunities`
- `public.fdos_memory`
- `public.fdos_evidence`
- `public.fdos_evidence_proposals`

All listed FDOS tables have RLS enabled with account-owner policies.

### Atomic first-business bootstrap

The old browser-side `select → if missing → insert` bootstrap was replaced to eliminate a concurrent first-record race.

Production `fdos_ensure_business()` is `SECURITY INVOKER`, derives ownership from `auth.uid()`, rejects unauthenticated calls, serializes same-user initial creation with a transaction-scoped advisory lock, returns the existing earliest Business Record when one exists, and otherwise creates the default Business Record plus one E4 `Workspace created` memory entry.

Web integration commit: `9e34e6e07818ac49eaf0a60c864f97697509e087`  
Migration mirror: `db/migrations/20260913_add_atomic_fdos_business_bootstrap.sql`

## Auth/session stale-state hardening

A second acceptance blocker was found in the client: an old asynchronous hydration request could theoretically finish after sign-out or after another account became active and repaint stale private state into the UI.

The accepted web source now:

- version-tags hydration requests and ignores superseded results;
- tracks the active authenticated user independently of old async closures;
- clears private Business Record UI state on sign-out;
- rejects hydration requests belonging to a previously active user;
- clears password state after successful auth/sign-out;
- verifies the evidence-capture session still belongs to the initiating user;
- prevents rapid overlapping Business Stage persistence while the stage action is busy.

Accepted auth/session hardening revision:

`f82f488f231baf71e576024f9dfecde466e958f2`

CI:

- Founder OS Standalone Web run `34761083989`: **SUCCESS**
- PHP Lint run `34761084005`: **SUCCESS**
- TypeScript: passed
- production build: passed
- implemented-surface/production-testability contract: passed

## Evidence-linked operating intelligence

`POST /api/evidence/website` captures a public webpage as E2 Current External Evidence, preserves its source, and creates reviewable proposals rather than silently rewriting the business.

Direct source observations stay E2. Interpretations are labeled E5 hypotheses. The founder must explicitly approve or reject proposed changes. Approved changes preserve evidence/source linkage and write Business Memory.

## Sales OS integration

The broad shell keeps Sales OS in Customers & Growth. `/sales-engine-app` bridges to the separate production Sales OS service, validates the destination, and requires HTTPS before redirecting.

Bridge source commit: `adccb5a148da64bafb081303352dd582f854062d`.

The route is present in the accepted production build. Independent public-browser observation of the redirect hop remains separate external evidence.

## Dependency and database hardening

The accepted runtime uses Next.js 16.3.4. The CI dependency vulnerability gate passes for the current auth-safe revision.

FDOS database hardening added covering foreign-key indexes and optimized owner RLS expressions using `(select auth.uid())`. The earlier FDOS unindexed-FK and `auth_rls_initplan` findings cleared on advisor re-scan.

Migration mirror:

`db/migrations/20260913_optimize_fdos_rls_and_foreign_key_indexes.sql`

## Current accepted production runtime

Railway service: `founder-dynasty-os-web`  
Public domain: `https://founder-dynasty-os-web-production.up.railway.app`

Accepted web/runtime revision: `f82f488f231baf71e576024f9dfecde466e958f2`  
Railway deployment: `72a3c73a-c285-4473-a75b-97d7edf22764`

Verified:

- deployment status: `SUCCESS`
- Next.js 16.3.4 production build: passed
- TypeScript: passed
- production container: started successfully and became ready in the observed runtime log
- Railway `/api/health`: succeeded on first observed healthcheck attempt
- current route set includes `/`, `/answers`, `/api/evidence/website`, `/api/health`, `/sales-engine-app`, manifest, robots, and sitemap
- `FDOS_DEPLOY_REV` was aligned to the accepted web revision before this deployment

## Verification boundary

### SOURCE COMPLETE / PRODUCTION RUNTIME VERIFIED

Verified at the current checkpoint:

- broad standalone shell builds and type-checks
- accepted auth-safe web revision is deployed
- production health gate succeeds
- shared FDOS persistence tables and owner-scoped RLS exist
- FDOS-specific database index/RLS performance findings were remediated
- atomic first-Business bootstrap exists in production and the deployed client calls it
- stale-session hydration protection is in the deployed client
- evidence proposal apply RPC exists with account/pending-state gating
- website E2 capture route is in production
- Sales OS bridge route is in production

### NOT YET PROVEN THROUGH A GENUINE PRODUCTION USER SESSION

- first Business Record creation/load through the deployed UI
- Business DNA save → sign out → fresh sign in → restore
- confirmation that private record content disappears after sign-out in a real browser
- production UI create/read for Value, Decision, Risk, Opportunity, and Memory
- real authenticated website evidence capture through the deployed UI
- approve/reject evidence proposals through the deployed UI and verify resulting linked records
- two genuine-user isolation and account-switch stale-state test
- Android/mobile and desktop visual/interaction acceptance

Do not describe those user-flow items as complete until they are actually exercised. Source safeguards are not a substitute for watching a real session survive the indignities of actual human use.

## Next highest-value milestone

Run the genuine authenticated production acceptance loop:

`sign in → create/load Business Record → edit Business DNA → change stage → add Value + Decision + Risk + Opportunity + Memory → sign out → confirm private state clears → sign back in → verify restore → capture website evidence → approve/reject proposals → verify evidence links + memory → switch to second user → verify isolation/no stale first-user state → mobile/desktop visual pass → KEEP / REVISE / REVERT`

Until that is complete, do not bury the project under another avalanche of modules. The core operating record must prove it survives actual human use first.

## Product guardrail

Every major new module should connect back to the shared Business Record, measurable business outcomes, evidence, a decision, a risk, or a learning loop. If it cannot, reconsider whether it belongs in Founder Dynasty OS.
