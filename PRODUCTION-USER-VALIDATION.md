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

This loop covers the broad standalone `web/` product around the shared Business Record: Business Stage, Business DNA, Founder Command Center, Value Map, Decisions, Opportunities, Risks, Business Memory, authenticated persistence, website evidence capture, evidence proposal review, and Customers & Growth → Sales OS integration.

### Current accepted web runtime

Railway service: `founder-dynasty-os-web`  
Public domain: `https://founder-dynasty-os-web-production.up.railway.app`

Accepted web/runtime revision:

`77e14bd8ca8b04f42f50b7c19ef7673f7fec3f62`

Railway deployment:

`ed02e62d-de35-4fe4-b537-54e825cc1459`

Observed on 2026-09-13:

- deployment status: `SUCCESS`;
- Railway identifies source commit `77e14bd8ca8b04f42f50b7c19ef7673f7fec3f62`;
- Next.js `16.3.4` production compilation passed;
- TypeScript passed;
- static generation passed;
- production container started successfully;
- Railway `/api/health` succeeded on the first observed attempt;
- route set includes `/`, `/answers`, `/api/evidence/website`, `/api/health`, `/sales-engine-app`, `/manifest.webmanifest`, `/robots.txt`, and `/sitemap.xml`;
- `FDOS_DEPLOY_REV` was aligned to the accepted web revision before deployment.

### CI evidence

For accepted web revision `77e14bd8ca8b04f42f50b7c19ef7673f7fec3f62`:

- `Founder OS Standalone Web` run `34762781642`: **SUCCESS**;
- `PHP Lint` run `34762781636`: **SUCCESS**;
- dependency installation: success;
- high/critical vulnerability gate: success;
- TypeScript: success;
- production build: success;
- standalone/evidence-persistence production-testability contract: success.

Database-only hardening commits now trigger the same standalone workflow because `db/migrations/**` is part of the CI contract. Confirmed successful database-source validation includes:

- `fd7d30061ed0c9605f519bf46681c3d7e5a382d5` — business relationship-aware RLS; standalone run `34762915913`: **SUCCESS**; PHP Lint run `34762915861`: **SUCCESS**;
- `8ba2072e0f7aee73cc8d6d4a9f067007e30691ea` — evidence relationship-aware RLS; standalone run `34763093654`: **SUCCESS**; PHP Lint run `34763093699`: **SUCCESS**.

A database-only source mirror does not require pretending the unchanged web bundle has a different runtime revision. Web runtime provenance and database migration provenance are tracked separately.

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

### Atomic website evidence persistence

Source review found that website capture previously performed three independent persistence steps: Evidence, Proposals, then Business Memory. A later failure could therefore leave a partially persisted capture.

Production migration `add_atomic_fdos_website_evidence_capture` added `public.fdos_store_website_evidence(...)`.

Verified properties:

- `SECURITY INVOKER`;
- explicit `search_path = public, pg_temp`;
- derives the current user from `auth.uid()`;
- verifies the target Business Record belongs to the authenticated user;
- stores the E2 website evidence, all reviewable proposals, and the evidence-capture Business Memory event in one database transaction;
- returns the evidence identifier/timestamp plus inserted proposal data;
- an insertion failure rolls back the RPC call instead of leaving a half-written evidence loop.

Source mirror:

`db/migrations/20260913_add_atomic_fdos_website_evidence_capture.sql`

The deployed `/api/evidence/website` route now calls this RPC instead of performing independent writes. It also rejects HTML responses larger than the connector limit rather than silently treating a truncated page as complete evidence.

### Protected mutation verification

`web/lib/business-store.ts` now requires positive persistence confirmation for sensitive update/review operations:

- Business DNA update selects the updated row and fails if no owned row was actually changed;
- proposal rejection selects the changed pending proposal and fails if no owned pending proposal was actually updated;
- proposal approval fails if the apply RPC returns no result;
- insert helpers continue to request and validate inserted rows.

This prevents a zero-row RLS-filtered mutation from being reported to the UI as a successful save merely because PostgreSQL returned no transport error.

### RPC execution grants

A production ACL inspection found an important Supabase/Postgres detail: revoking execution from `PUBLIC` did not remove already-explicit `anon` grants on FDOS RPCs.

Production migration `restrict_fdos_rpc_execute_to_authenticated` explicitly removed `anon` execution from:

- `fdos_ensure_business()`;
- `fdos_apply_evidence_proposal(uuid)`;
- `fdos_store_website_evidence(...)`.

Post-migration ACL inspection verified those functions are executable by `authenticated` plus administrative/service roles, but not `anon`. All three FDOS application RPCs were also verified as `SECURITY INVOKER`.

Source mirror:

`db/migrations/20260913_restrict_fdos_rpc_execute_to_authenticated.sql`

### Relationship-aware RLS hardening

Owner-column RLS alone is not enough for a relational multi-tenant model. A user could theoretically write their own `user_id` together with another account's known `business_id`, producing cross-tenant referential contamination even if the foreign business remained unreadable.

Production migration `enforce_fdos_business_relationships_in_rls` hardened the child-table policies.

For Value, Decision, Risk, Opportunity, Memory, and Evidence rows, policies require both the current row owner and ownership of the referenced Business Record. Evidence Proposal SELECT/INSERT/UPDATE/DELETE policies additionally require the linked Evidence to belong to the same authenticated user and the same Business Record. Proposal policies are scoped to `authenticated` rather than `public`.

Source mirror:

`db/migrations/20260913_enforce_fdos_business_relationships_in_rls.sql`

A second relationship audit found that Value, Decision, Risk, Opportunity, and Memory rows can optionally carry `evidence_id`. Correct Business ownership alone therefore was still insufficient if a malicious caller supplied another tenant's known Evidence UUID.

Production migration `enforce_fdos_evidence_relationships_in_rls` now requires every non-null `evidence_id` on those child records to reference Evidence owned by the same authenticated user and attached to the same Business Record. Direct post-migration policy inspection confirmed Business relationship checks on the child tables and Business + Evidence relationship checks on all evidence-linked child policies and Evidence Proposal policies.

Source mirror:

`db/migrations/20260913_enforce_fdos_evidence_relationships_in_rls.sql`

### Database advisor verification

Fresh Supabase security and performance advisor scans were rerun after the evidence-relationship migration.

FDOS-specific results:

- no FDOS missing-RLS-policy finding;
- no FDOS authenticated `SECURITY DEFINER` function warning;
- no FDOS unindexed-foreign-key finding;
- no FDOS `auth_rls_initplan` warning;
- current FDOS performance notices are only `unused_index` informational notices, expected while the FDOS production tables contain no persistent workload data.

The shared Supabase project still reports findings owned by other products/schemas and a project-wide leaked-password-protection warning. Those are not evidence of an FDOS table-policy failure and are not permission to silently rewrite unrelated products.

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
- clears proposals, evidence receipt, composer/edit state, and website input with the private workspace;
- clears password state after successful authentication/sign-out;
- checks that the evidence-capture session still belongs to the user who initiated the capture;
- prevents rapid overlapping Business Stage writes while a stage save is busy.

These safeguards are **SOURCE COMPLETE** and **PRODUCTION RUNTIME VERIFIED**. They are not yet **PRODUCTION USER VERIFIED** because no genuine two-account browser acceptance event has been observed in this chat.

### Sales OS neighborhood integration

The standalone shell's `/sales-engine-app` route bridges to the separately deployed Sales OS rather than resolving to a nonexistent local asset path. Sales remains nested under Customers & Growth.

Bridge source commit: `adccb5a148da64bafb081303352dd582f854062d`.

The route exists in the accepted production build. Independent public-browser observation of the final redirect hop remains separate external evidence.

## What is verified

### SOURCE COMPLETE / PRODUCTION RUNTIME VERIFIED

At this checkpoint:

- broad standalone shell compiles and type-checks;
- accepted web revision `77e14bd8ca8b04f42f50b7c19ef7673f7fec3f62` is deployed to Railway;
- production container starts and `/api/health` succeeds;
- current CI dependency vulnerability gate passes;
- shared FDOS persistence tables exist and all eight have RLS enabled;
- atomic first-Business bootstrap exists in production;
- website Evidence + Proposals + Memory persistence is atomic in production;
- protected mutations verify that a row/result was actually changed;
- FDOS application RPCs no longer grant execution to `anon`;
- child-table RLS validates ownership of the referenced Business Record;
- every non-null child `evidence_id` validates ownership and same-Business attachment;
- proposal RLS validates owner, Business Record, and linked Evidence relationships;
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
- real authenticated website evidence capture succeeds;
- the founder approves one proposal and rejects one proposal through production UI;
- approved evidence-linked changes and Business Memory survive restore;
- a second genuine user cannot read or mutate the first user's data;
- direct account switching clears the first user's UI state before the second user's record appears;
- Android/mobile and desktop visual/interaction acceptance passes.

The database is now rather less willing to accept creative cross-tenant UUID arrangements, which is preferable to discovering them after people have data worth stealing. The browser still gets its own acceptance exam.

## Current decision

**KEEP** the broad shared-Business-Record architecture, account-owned Supabase persistence, E1–E8 evidence discipline, founder approval before evidence-derived canonical changes, exact-web-source provenance gate, `/api/health`, atomic Business bootstrap, atomic Evidence persistence, verified mutation responses, authenticated-only RPC grants, Business/Evidence relationship-aware RLS, account-switch privacy guards, and Sales OS nested under Customers & Growth.

**REVISE** the meaning of “done” only by making it stricter: user-facing features must clear source/build checks, exact-source production runtime checks, and a genuine authenticated production workflow before they are called 100% production-tested.

## Highest-value remaining acceptance loop

`sign in → create/load Business Record → edit Business DNA → change stage → add Value + Decision + Risk + Opportunity + Memory → sign out → confirm private state clears → sign back in → verify restore → capture website evidence → approve/reject proposals → verify evidence links + memory → switch to second user → verify immediate old-state clearing + read/write isolation → mobile/desktop visual pass → KEEP / REVISE / REVERT`

---

## Production completion rule

Keep these states separate:

- **SOURCE COMPLETE** — implementation exists and passes build/type/schema checks.
- **PRODUCTION RUNTIME VERIFIED** — the accepted source/migrations are deployed and required runtime/dependency paths work.
- **PRODUCTION USER VERIFIED** — a genuine authenticated user completes the feature in the deployed UI and state survives required session/device boundaries.
- **COMMERCIAL EVIDENCE** — genuine external customer/user behavior exists.

Do not collapse them. “It deployed” and “a person successfully used it” remain stubbornly different sentences.
