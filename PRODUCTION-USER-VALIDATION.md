# Founder Dynasty OS 10.0 — Production/User Validation

Updated: 2026-09-13

This document tracks production and user validation evidence only. It does not convert deployments, research, outbound messages, internal tests, database smoke tests, or implemented surfaces into claims of customers, revenue, ROI, product-market fit, or successful fulfillment.

## Evidence Loop 001 — Public Sales OS Delivery

Production service: `sales-engine-pwa`  
Public domain: `https://sales-engine-pwa-production.up.railway.app`

Previously observed production Chromium traffic received successful responses for the Sales OS application and required assets. Railway reported the service healthy in that verification window.

**Decision: KEEP.** This proves sampled public delivery, not authenticated Founder Dynasty OS persistence, prospect response, payment, revenue, or commercial conversion.

---

## Evidence Loop 002 — Genuine Prospect Outreach

A real outreach email was sent to Therma Tech at `info@thermatechhvac.com`. The Gmail send event exists and the pipeline preserved the prospect as Contacted while reply, paid, fulfilled, and opt-out fields remained empty unless those events genuinely occurred.

**Decision: OBSERVE.** A sent email is not a reply, customer, payment, or revenue.

---

## Evidence Loop 003 — Standalone Founder Dynasty OS Production Acceptance

### Scope

This loop covers the broad standalone `web/` product around the shared Business Record: Business Stage, Business DNA, Founder Command Center, Value Map, Decisions, Opportunities, Risks, Business Memory, authenticated persistence, website evidence capture, evidence proposal review, browser acceptance diagnostics, and Customers & Growth → Sales OS integration.

### Current accepted web runtime

Railway service: `founder-dynasty-os-web`  
Public domain: `https://founder-dynasty-os-web-production.up.railway.app`

Accepted web/runtime revision:

`7b0cc70772e3fa71d6bee87b3e0e4127584d339c`

Railway deployment:

`f4b7ec54-ea2a-4e3c-8c9b-bf92f77327b7`

Observed on 2026-09-13:

- deployment status: `SUCCESS`;
- Railway identifies source commit `7b0cc70772e3fa71d6bee87b3e0e4127584d339c`;
- Next.js `16.3.4` production compilation passed;
- npm production build reported zero dependency vulnerabilities;
- TypeScript passed;
- static generation passed;
- production container started successfully;
- Railway `/api/health` succeeded on the first observed attempt;
- route set includes `/`, `/acceptance`, `/answers`, `/api/evidence/website`, `/api/health`, `/sales-engine-app`, `/manifest.webmanifest`, `/robots.txt`, and `/sitemap.xml`;
- `FDOS_DEPLOY_REV` was aligned to the accepted web revision before deployment.

### CI evidence

For accepted web revision `7b0cc70772e3fa71d6bee87b3e0e4127584d339c`:

- `Founder OS Standalone Web` run `34763277139`: **SUCCESS**;
- `PHP Lint` run `34763277146`: **SUCCESS**;
- dependency installation: success;
- high/critical vulnerability gate: success;
- TypeScript: success;
- production build: success;
- relational-RLS / acceptance-diagnostics / evidence-persistence production-testability contract: success.

Database-only hardening commits are also covered because `db/migrations/**` now triggers the standalone workflow. Confirmed successful migration-source validation includes:

- `fd7d30061ed0c9605f519bf46681c3d7e5a382d5` — Business relationship-aware RLS; standalone run `34762915913`: **SUCCESS**; PHP Lint run `34762915861`: **SUCCESS**;
- `8ba2072e0f7aee73cc8d6d4a9f067007e30691ea` — Evidence relationship-aware RLS; standalone run `34763093654`: **SUCCESS**; PHP Lint run `34763093699`: **SUCCESS**.

Web runtime provenance and database migration provenance remain distinct when a database-only source mirror does not change the deployed web bundle.

### Production data layer

Implemented FDOS tables:

- `fdos_business_records`
- `fdos_value_items`
- `fdos_decisions`
- `fdos_risks`
- `fdos_opportunities`
- `fdos_memory`
- `fdos_evidence`
- `fdos_evidence_proposals`

RLS is enabled on all eight tables.

A fresh production count after the current hardening work returned zero persistent rows in all eight FDOS tables. No deployment, migration, CI check, or validation step inserted synthetic acceptance data.

A prior production-database transaction smoke test inserted representative shared-record rows and rolled the transaction back. It proved schema compatibility for that test shape, not browser auth/RLS behavior.

### Atomic Business Record bootstrap

Production `public.fdos_ensure_business()` is the authenticated first-workspace bootstrap.

Verified properties:

- `SECURITY INVOKER`;
- explicit safe search path;
- ownership derived from `auth.uid()`;
- unauthenticated calls rejected by function logic;
- same-user first creation serialized with a transaction-scoped advisory lock;
- existing earliest Business Record returned when present;
- otherwise the default Business Record plus one E4 `Workspace created` memory event is created atomically.

Migration mirror:

`db/migrations/20260913_add_atomic_fdos_business_bootstrap.sql`

### Atomic website Evidence persistence

Production `public.fdos_store_website_evidence(...)` stores the E2 website Evidence row, all reviewable Proposals, and the capture Business Memory event in one database transaction.

Verified properties:

- `SECURITY INVOKER`;
- explicit `search_path = public, pg_temp`;
- derives the current user from `auth.uid()`;
- verifies the target Business Record belongs to the authenticated user;
- returns the Evidence identifier/timestamp plus inserted Proposal data;
- an insertion failure rolls back the capture rather than leaving a partial evidence loop.

Source mirror:

`db/migrations/20260913_add_atomic_fdos_website_evidence_capture.sql`

The deployed `/api/evidence/website` route calls this RPC and rejects HTML bodies larger than the connector limit instead of silently recording a truncated document as complete evidence.

### Protected mutation verification

`web/lib/business-store.ts` requires positive persistence confirmation for sensitive update/review operations:

- Business DNA update selects the updated row and fails if no owned row was actually changed;
- Proposal rejection selects the changed pending Proposal and fails if no owned pending Proposal was actually updated;
- Proposal approval fails if the apply RPC returns no result;
- insert helpers request and validate inserted rows.

A zero-row RLS-filtered mutation therefore cannot masquerade as a successful save merely because the request itself returned no transport error.

### RPC execution grants

Production ACL inspection found that revoking execution from `PUBLIC` did not remove already-explicit `anon` grants on FDOS RPCs.

Production migration `restrict_fdos_rpc_execute_to_authenticated` explicitly removed `anon` execution from:

- `fdos_ensure_business()`;
- `fdos_apply_evidence_proposal(uuid)`;
- `fdos_store_website_evidence(...)`.

Post-migration ACL inspection verified those functions are executable by `authenticated` plus administrative/service roles, but not `anon`. All three FDOS application RPCs were verified as `SECURITY INVOKER`.

Source mirror:

`db/migrations/20260913_restrict_fdos_rpc_execute_to_authenticated.sql`

### Relationship-aware RLS hardening

Owner-column RLS alone is not enough for a relational multi-tenant model. A user could otherwise pair their own `user_id` with a known foreign Business or Evidence UUID and create cross-tenant referential contamination even while the foreign row remained unreadable.

Production migration `enforce_fdos_business_relationships_in_rls` requires Value, Decision, Risk, Opportunity, Memory, and Evidence rows to belong to the current user **and** reference a Business Record owned by that user. Evidence Proposal policies additionally require linked Evidence to belong to that same authenticated user and Business Record, and those policies are scoped to `authenticated`.

Source mirror:

`db/migrations/20260913_enforce_fdos_business_relationships_in_rls.sql`

Production migration `enforce_fdos_evidence_relationships_in_rls` closes the corresponding optional-Evidence-link gap. Every non-null `evidence_id` on Value, Decision, Risk, Opportunity, and Memory rows must now reference Evidence owned by the same authenticated user and attached to the same Business Record.

Direct post-migration policy inspection confirmed Business relationship checks on the child tables and Business + Evidence relationship checks on all evidence-linked child policies and Evidence Proposal policies.

Source mirror:

`db/migrations/20260913_enforce_fdos_evidence_relationships_in_rls.sql`

### Database advisor verification

Fresh Supabase security and performance advisor scans were rerun after the latest relationship migration.

FDOS-specific results:

- no FDOS missing-RLS-policy finding;
- no FDOS authenticated `SECURITY DEFINER` function warning;
- no FDOS unindexed-foreign-key finding;
- no FDOS `auth_rls_initplan` warning;
- current FDOS performance notices are only `unused_index` informational notices, expected while the production FDOS tables contain no persistent workload data.

The shared Supabase project still reports findings owned by other products/schemas and a project-wide leaked-password-protection warning. Those are not FDOS table-policy failures and are not permission to silently rewrite unrelated products.

Relevant Supabase references:

- database linter: https://supabase.com/docs/guides/database/database-linter
- password security / leaked-password protection: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

### Auth/session privacy hardening

The deployed web client:

- tracks the active authenticated user outside stale async closures;
- version-tags hydration requests so superseded results cannot repaint private state;
- ignores hydration for users who are no longer active;
- clears private Business Record state on sign-out;
- clears the previous account's private state before hydrating a newly active account;
- clears Proposals, Evidence receipt, composer/edit state, and website input with the private workspace;
- clears password state after successful authentication/sign-out;
- checks that the Evidence-capture session still belongs to the user who initiated the capture;
- prevents rapid overlapping Business Stage writes while a stage save is busy.

These safeguards are **SOURCE COMPLETE** and **PRODUCTION RUNTIME VERIFIED**. They are not yet **PRODUCTION USER VERIFIED** because no genuine two-account browser acceptance event has been observed in this chat.

### Production acceptance diagnostics

The accepted deployment now includes `/acceptance`, a read-only browser proof helper intended to make the remaining genuine-user acceptance loop observable without planting synthetic data.

The page:

- calls `/api/health` and displays the runtime revision;
- checks whether a genuine Supabase browser session exists;
- reads the earliest Business Record owned by that authenticated user without creating one;
- performs RLS-scoped count reads against Value, Decision, Risk, Opportunity, Memory, Evidence, and Evidence Proposal tables;
- records the real browser viewport and user agent;
- explicitly leaves sign-out/restore, second-user isolation, and visual acceptance as `WAITING` until a person actually performs them;
- can copy a JSON diagnostic snapshot for inspection;
- performs no acceptance-test writes.

This helper is itself production-runtime verified because `/acceptance` is present in the accepted Railway production build. Its browser-observed results remain genuine production-user evidence only after the page is actually opened in an authenticated browser.

### Sales OS neighborhood integration

The standalone shell's `/sales-engine-app` route bridges to the separately deployed Sales OS rather than resolving to a nonexistent local asset path. Sales remains nested under Customers & Growth.

Bridge source commit: `adccb5a148da64bafb081303352dd582f854062d`.

## What is verified

### SOURCE COMPLETE / PRODUCTION RUNTIME VERIFIED

At this checkpoint:

- broad standalone shell compiles and type-checks;
- accepted web revision `7b0cc70772e3fa71d6bee87b3e0e4127584d339c` is deployed to Railway;
- production container starts and `/api/health` succeeds;
- `/acceptance` is emitted by the production build;
- current CI dependency vulnerability gate passes;
- shared FDOS persistence tables exist and all eight have RLS enabled;
- atomic first-Business bootstrap exists in production;
- website Evidence + Proposals + Memory persistence is atomic in production;
- protected mutations verify that a row/result was actually changed;
- FDOS application RPCs no longer grant execution to `anon`;
- child-table RLS validates ownership of the referenced Business Record;
- every non-null child `evidence_id` validates ownership and same-Business attachment;
- Proposal RLS validates owner, Business Record, and linked Evidence relationships;
- stale-session/account-switch privacy protections are deployed;
- FDOS-specific index/RLS advisor findings remain clear after the latest migrations;
- website E2 capture route and Sales OS bridge route are present in production;
- no synthetic persistent FDOS data was created by this hardening work.

## What remains unproven

### PRODUCTION USER VERIFIED — NOT YET COMPLETE

Still requires genuine deployed-browser evidence that:

- a real user signs in and creates or loads the first persistent Business Record;
- Business DNA saves and restores after sign-out + fresh sign-in;
- private Business Record content disappears after sign-out;
- Value, Decision, Risk, Opportunity, and Memory can be created/read through the production UI;
- real authenticated website Evidence capture succeeds;
- the founder approves one Proposal and rejects one Proposal through production UI;
- approved evidence-linked changes and Business Memory survive restore;
- a second genuine user cannot read or mutate the first user's data;
- direct account switching clears the first user's UI state before the second user's record appears;
- `/acceptance` observes the expected account-owned state in those genuine sessions;
- Android/mobile and desktop visual/interaction acceptance passes.

The database is now substantially less willing to accept creative cross-tenant UUID arrangements, and the browser now has a diagnostic witness stand. Neither is permission to mark an unperformed user flow green.

## Current decision

**KEEP** the broad shared-Business-Record architecture, account-owned Supabase persistence, E1–E8 evidence discipline, founder approval before evidence-derived canonical changes, exact-web-source provenance gate, `/api/health`, `/acceptance`, atomic Business bootstrap, atomic Evidence persistence, verified mutation responses, authenticated-only RPC grants, Business/Evidence relationship-aware RLS, account-switch privacy guards, and Sales OS nested under Customers & Growth.

**REVISE** the meaning of “done” only by making it stricter: user-facing features must clear source/build checks, exact-source production runtime checks, and a genuine authenticated production workflow before they are called 100% production-tested.

## Highest-value remaining acceptance loop

`sign in → create/load Business Record → edit Business DNA → change stage → add Value + Decision + Risk + Opportunity + Memory → open /acceptance and capture snapshot → sign out → confirm private state clears → sign back in → verify restore → rerun /acceptance → capture website Evidence → approve/reject Proposals → verify Evidence links + Memory → switch to second user → verify immediate old-state clearing + read/write isolation → rerun /acceptance → mobile/desktop visual pass → KEEP / REVISE / REVERT`

---

## Production completion rule

Keep these states separate:

- **SOURCE COMPLETE** — implementation exists and passes build/type/schema checks.
- **PRODUCTION RUNTIME VERIFIED** — the accepted source/migrations are deployed and required runtime/dependency paths work.
- **PRODUCTION USER VERIFIED** — a genuine authenticated user completes the feature in the deployed UI and state survives required session/device boundaries.
- **COMMERCIAL EVIDENCE** — genuine external customer/user behavior exists.

Do not collapse them. “It deployed” and “a person successfully used it” remain stubbornly different sentences.
