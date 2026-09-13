# Founder Dynasty OS 10.0 — Project Status

Updated: 2026-09-13

**Parent:** SmartPickShop Holdings  
**Canonical repository:** `anastaysia94-sudo/founder-os`

## Current product direction

Founder Dynasty OS is a broad business operating intelligence system for any stage from raw idea through operating company, portfolio, and long-term enterprise value. The Same-Day Customer Growth Pack / Sales OS is a major module under Customers & Growth, not the identity of the product.

Canonical product statement: **Founder Dynasty OS is the operating intelligence of the business.**

## Broad standalone web shell

The primary web application is the standalone `web/` track, organized around one authenticated, account-owned Business Record rather than separate feature silos.

Current major areas include:

- Business Stage from Idea through Dynasty
- editable Business DNA
- Founder Command Center
- Value Map
- Opportunities
- Risks
- Decisions
- Business Memory
- E1–E8 evidence labels
- website evidence capture and founder proposal review
- plain-English explainable terms
- Customers & Growth → Sales OS neighborhood

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

All listed FDOS tables have RLS enabled with account-owner policies. The implemented shared record covers Business DNA and Stage, Value Map items, Decisions, Risks, Opportunities, Business Memory, captured evidence, and evidence-derived proposal review state.

### Atomic first-business bootstrap

The old browser-side `select → if missing → insert` bootstrap was replaced because concurrent auth hydration could theoretically create duplicate first records.

Production now exposes authenticated RPC `fdos_ensure_business()`:

- `SECURITY INVOKER`
- rejects unauthenticated calls
- derives ownership from `auth.uid()`
- takes a same-user transaction-scoped advisory lock before checking/creating
- returns the earliest existing Business Record when one already exists
- otherwise creates the default Business Record and one E4 `Workspace created` Business Memory event
- execution is granted to `authenticated`, not the public role

The web client now calls that RPC directly. The production migration is mirrored at:

`db/migrations/20260913_add_atomic_fdos_business_bootstrap.sql`

Web integration commit: `9e34e6e07818ac49eaf0a60c864f97697509e087`  
Migration mirror commit: `be8fd931a22d83cf0e9c7c9af9a1aeb8686d4827`

## Evidence-linked operating intelligence

`POST /api/evidence/website` captures a public webpage as E2 Current External Evidence, preserves its source, and creates reviewable proposals rather than silently rewriting the business.

Possible proposals include Value Map, Risk, Decision, Opportunity, and, when appropriate, Business DNA changes. Direct source observations stay E2. Interpretations are labeled E5 hypotheses. The founder must explicitly approve or reject proposed changes.

Approval is handled by `fdos_apply_evidence_proposal(uuid)` with account ownership and pending-state checks. Approved changes preserve evidence/source linkage and write Business Memory.

## Sales OS integration

The broad shell keeps Sales OS in Customers & Growth. The standalone route `/sales-engine-app` now bridges to the separate production Sales OS service instead of pointing at a nonexistent local asset path.

Bridge source commit: `adccb5a148da64bafb081303352dd582f854062d`.

The bridge validates its destination and requires HTTPS before issuing a redirect. The route is present in the current production build. This is production-runtime evidence; an independent browser observation of the redirect hop is still a separate external-verification event.

## Dependency and database hardening

Current runtime dependencies are exact-pinned around Next.js 16.3.4, React 19.2.8, and Supabase JS 2.116.0. The current observed Railway production build audited 37 packages and reported **0 vulnerabilities**.

FDOS production database hardening also added covering foreign-key indexes and optimized owner RLS expressions using `(select auth.uid())`. The earlier FDOS-specific unindexed-FK and `auth_rls_initplan` findings cleared on advisor re-scan.

Migration mirror:

`db/migrations/20260913_optimize_fdos_rls_and_foreign_key_indexes.sql`

## Current exact production runtime

Railway service: `founder-dynasty-os-web`  
Public domain: `https://founder-dynasty-os-web-production.up.railway.app`

Current accepted production checkpoint:

- deployment: `4fd5eadb-35c6-4bf2-b66d-e21f3e3e8974`
- deployed Git commit: `be8fd931a22d83cf0e9c7c9af9a1aeb8686d4827`
- status: `SUCCESS`
- Next.js: `16.3.4`
- production compile: passed
- TypeScript: passed
- observed npm audit: 0 vulnerabilities
- production container: started successfully
- `/api/health`: Railway healthcheck succeeded
- current route set includes `/`, `/answers`, `/api/evidence/website`, `/api/health`, `/sales-engine-app`, manifest, robots, and sitemap
- `FDOS_DEPLOY_REV` was aligned to the accepted revision for runtime provenance

The `Founder OS Standalone Web` workflow for the atomic bootstrap web commit `9e34e6e07818ac49eaf0a60c864f97697509e087` completed successfully. PHP lint for that commit also completed successfully.

## Verification boundary

### SOURCE COMPLETE / PRODUCTION RUNTIME VERIFIED

Verified at the current checkpoint:

- broad standalone shell builds and type-checks
- exact current accepted repository revision is deployed
- production health configuration is present and `/api/health` succeeds
- shared FDOS persistence tables and owner-scoped RLS exist
- FDOS-specific database index/RLS performance findings were remediated
- atomic first-Business bootstrap exists in production and the deployed client calls it
- evidence proposal apply RPC exists with account/pending-state gating
- website E2 capture route is in the production build
- Sales OS bridge route is in the production build
- current observed production dependency audit reports no vulnerabilities

### NOT YET PROVEN THROUGH A GENUINE PRODUCTION USER SESSION

- first Business Record creation/load through the deployed UI
- Business DNA save → sign out → fresh sign in → restore
- production UI create/read for Value, Decision, Risk, Opportunity, and Memory
- real authenticated website evidence capture through the deployed UI
- approve/reject evidence proposals through the deployed UI and verify resulting linked records
- two genuine-user isolation test
- Android/mobile and desktop visual/interaction acceptance

Do not describe those user-flow items as complete until they are actually exercised. A database function existing is not a human successfully using the application. Revolutionary concept, apparently.

## Next highest-value milestone

Run the real authenticated production acceptance loop:

`sign in → create/load Business Record → edit Business DNA → change stage → add Value + Decision + Risk + Opportunity + Memory → sign out → sign back in → verify restore → capture website evidence → approve/reject proposals → verify evidence links + memory → second-user isolation → mobile/desktop visual pass → KEEP / REVISE / REVERT`

Until that is complete, do not bury the project under another avalanche of modules. The core operating record must prove it survives actual human use first.

## Product guardrail

Every major new module should answer at least one of these questions:

- What is this business?
- What does it know?
- What is uncertain?
- Where is value created or lost?
- What could go wrong?
- What decision matters?
- What should happen next?
- What happened before?
- What did we learn?

If a feature cannot connect back to the shared Business Record, a measurable business outcome, evidence, a decision, a risk, or a learning loop, reconsider whether it belongs in Founder Dynasty OS.
