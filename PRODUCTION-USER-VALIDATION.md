# Founder Dynasty OS 10.0 — Production/User Validation

Updated: 2026-09-13

This document tracks production and user validation evidence only. A deployment, migration, CI pass, outbound email, internal test, or database smoke test is not automatically a customer, payment, revenue event, or successful user workflow.

## Evidence Loop 001 — Public Sales OS Delivery

Production service: `sales-engine-pwa`  
Public domain: `https://sales-engine-pwa-production.up.railway.app`

Previously observed public Chromium traffic successfully retrieved the Sales OS application and required assets. This is public-delivery evidence only. It does not prove prospect response, payment, revenue, or the standalone Founder Dynasty OS authenticated workflow.

**Decision: KEEP.**

---

## Evidence Loop 002 — Genuine Prospect Outreach

A real outreach email was sent to Therma Tech at `info@thermatechhvac.com`. The Gmail send event exists and the pipeline preserved the prospect as Contacted while reply, paid, fulfilled, and opt-out fields remained empty unless those events genuinely occurred.

**Decision: OBSERVE.** A sent email is not a reply, customer, payment, or revenue.

---

## Evidence Loop 003 — Standalone Founder Dynasty OS Production Acceptance

### Current accepted web runtime

Railway service: `founder-dynasty-os-web`  
Public domain: `https://founder-dynasty-os-web-production.up.railway.app`

Accepted web/runtime revision:

`284c496117247013e0bf46b75dce337b24fdb7d1`

Railway deployment:

`0609d837-7f1e-4298-9a67-200683bdd9c1`

Observed on 2026-09-13:

- deployment status: `SUCCESS`;
- Railway identifies exact source commit `284c496117247013e0bf46b75dce337b24fdb7d1`;
- Next.js 16.3.4 compilation passed;
- TypeScript passed;
- static generation passed;
- the production container started successfully;
- `/api/health` succeeded on the first observed Railway healthcheck attempt;
- the production route set includes `/`, `/acceptance`, `/answers`, `/api/evidence/website`, `/api/health`, `/sales-engine-app`, `/manifest.webmanifest`, `/robots.txt`, and `/sitemap.xml`;
- `FDOS_DEPLOY_REV` was aligned to the accepted revision before deployment.

### Current CI evidence

For accepted web revision `284c496117247013e0bf46b75dce337b24fdb7d1`:

- `Founder OS Standalone Web` run `34763437203`: **SUCCESS**;
- `PHP Lint` run `34763437224`: **SUCCESS**;
- dependency installation: success;
- high/critical dependency vulnerability gate: success;
- TypeScript: success;
- production build: success;
- standalone product, relational-RLS, Evidence persistence, acceptance-diagnostics, and noindex acceptance-route contract: success.

Database-only hardening commits are also covered because `db/migrations/**` triggers the standalone workflow. Web-runtime provenance and database-migration provenance remain separate when a database-only commit does not change the deployed `web/` tree.

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

Latest checked persistent production counts remain zero across all eight FDOS tables. No deployment, migration, CI check, or validation step inserted synthetic acceptance data.

A prior transactional database smoke test inserted representative rows and rolled the transaction back. That proved the tested schema shape, not browser-auth behavior.

### Atomic Business Record bootstrap

`public.fdos_ensure_business()` is the authenticated first-workspace bootstrap.

Verified properties:

- `SECURITY INVOKER`;
- explicit safe search path;
- ownership derived from `auth.uid()`;
- unauthenticated calls rejected;
- same-user first creation serialized with a transaction-scoped advisory lock;
- returns the existing earliest Business Record when present;
- otherwise creates the default Business Record and its initial E4 `Workspace created` memory event atomically.

Source mirror:

`db/migrations/20260913_add_atomic_fdos_business_bootstrap.sql`

### Atomic website Evidence persistence

`public.fdos_store_website_evidence(...)` stores the E2 website Evidence row, generated review Proposals, and capture Business Memory event in one database transaction.

Verified properties:

- `SECURITY INVOKER`;
- explicit `search_path = public, pg_temp`;
- derives current user from `auth.uid()`;
- verifies the target Business Record belongs to the authenticated user;
- returns the Evidence identifier/timestamp and inserted Proposal data;
- any failed persistence step rolls back the capture rather than leaving a half-written evidence loop.

The deployed `/api/evidence/website` route calls this RPC and rejects HTML responses larger than the connector limit rather than silently treating a truncated document as complete evidence.

Source mirror:

`db/migrations/20260913_add_atomic_fdos_website_evidence_capture.sql`

### Protected mutation verification

`web/lib/business-store.ts` now requires positive persistence confirmation for sensitive mutations:

- Business DNA save must return the updated owned row;
- Proposal rejection must return the changed owned pending Proposal;
- Proposal approval must return a non-empty apply-RPC result;
- record insert helpers request and validate inserted rows.

A zero-row RLS-filtered mutation therefore cannot be presented as successful merely because the HTTP/database request itself did not throw.

### RPC execution grants

Production ACL inspection found that removing EXECUTE from `PUBLIC` did not remove already-explicit `anon` grants.

Production migration `restrict_fdos_rpc_execute_to_authenticated` explicitly removed anonymous execution from:

- `fdos_ensure_business()`;
- `fdos_apply_evidence_proposal(uuid)`;
- `fdos_store_website_evidence(...)`.

Post-migration inspection verified authenticated/admin/service execution remains available while `anon` does not. All three FDOS application RPCs were verified as `SECURITY INVOKER`.

Source mirror:

`db/migrations/20260913_restrict_fdos_rpc_execute_to_authenticated.sql`

### Relationship-aware tenant isolation

Owner-column RLS alone is not sufficient in a relational multi-tenant model. A caller must not be able to pair their own `user_id` with a known foreign Business or Evidence UUID.

Production migration `enforce_fdos_business_relationships_in_rls` requires child rows to belong to the authenticated user and reference a Business Record owned by that same user. Evidence Proposal policies additionally validate linked Evidence ownership and same-Business attachment.

Production migration `enforce_fdos_evidence_relationships_in_rls` closes the optional-Evidence-link gap. Every non-null `evidence_id` on Value, Decision, Risk, Opportunity, and Memory rows must reference Evidence owned by the same authenticated user and attached to the same Business Record.

Source mirrors:

- `db/migrations/20260913_enforce_fdos_business_relationships_in_rls.sql`
- `db/migrations/20260913_enforce_fdos_evidence_relationships_in_rls.sql`

Direct policy inspection confirmed these relationship checks after migration.

### Database advisor verification

Fresh Supabase security and performance advisor scans after the current relationship migrations show no FDOS:

- missing-RLS-policy finding;
- authenticated `SECURITY DEFINER` function warning;
- unindexed-foreign-key finding;
- `auth_rls_initplan` warning.

Current FDOS performance notices are only unused-index INFO findings, expected while production FDOS tables contain no persistent workload data. Other products sharing the Supabase project still have their own findings, plus the project-wide leaked-password-protection warning; those are not silently rewritten as part of FDOS work.

### Auth/session privacy hardening

The deployed client:

- version-tags hydration requests;
- ignores stale/superseded hydration;
- clears private Business Record state on sign-out;
- clears the previous account's private state before hydrating a directly switched account;
- clears Proposals, Evidence receipt, composer/edit state, and website input with the private workspace;
- clears password state after successful authentication/sign-out;
- verifies an Evidence-capture session still belongs to the initiating user;
- prevents overlapping Business Stage writes while a stage save is active.

These safeguards are **SOURCE COMPLETE** and **PRODUCTION RUNTIME VERIFIED**, not yet **PRODUCTION USER VERIFIED**.

### Production acceptance diagnostics

The accepted production build includes `/acceptance`, a read-only browser proof helper. It:

- calls `/api/health` and displays runtime revision;
- checks whether a genuine Supabase browser session exists;
- reads the authenticated user's earliest Business Record without creating one;
- performs RLS-scoped record-count reads for Value, Decision, Risk, Opportunity, Memory, Evidence, and Evidence Proposal rows;
- records actual browser viewport and user agent;
- displays explicit PASS / FAIL / WAITING states;
- can copy a JSON diagnostic snapshot;
- performs no acceptance-test writes;
- deliberately leaves sign-out/restore, second-user isolation, and visual acceptance WAITING until those events actually happen.

The route now has dedicated metadata with:

- `index: false`;
- `follow: false`;
- `nocache: true`.

It is not included in the sitemap. In other words, the owner-facing diagnostic page exists without volunteering itself to search engines, because not every internal instrument panel needs a public fan club.

The route's existence and noindex configuration are production-runtime verified. Its browser-observed results become production-user evidence only after a genuine authenticated browser actually opens and exercises it.

### Sales OS neighborhood integration

`/sales-engine-app` bridges to the separately deployed Sales OS. Sales remains nested under Customers & Growth and does not define the broader product.

## What is verified

### SOURCE COMPLETE / PRODUCTION RUNTIME VERIFIED

- exact accepted web revision `284c496117247013e0bf46b75dce337b24fdb7d1` is deployed and healthy;
- current CI and PHP lint pass;
- `/api/health` succeeds;
- `/acceptance` is built, deployed, and noindex/no-follow/nocache;
- all eight FDOS tables exist with RLS;
- atomic first-Business bootstrap is in production;
- website Evidence + Proposals + Memory persistence is atomic;
- protected mutations verify an actual returned mutation;
- FDOS application RPCs are not executable by `anon`;
- child-table RLS validates referenced Business ownership;
- non-null child Evidence links validate same-user/same-Business ownership;
- Proposal RLS validates owner, Business, and linked Evidence relationships;
- stale-session/account-switch privacy protections are deployed;
- FDOS-specific advisor findings remain clear of the remediated classes;
- website Evidence capture and Sales OS bridge routes are present;
- no synthetic persistent FDOS acceptance data was created.

## What remains unproven

### PRODUCTION USER VERIFIED — NOT YET COMPLETE

Still requires genuine deployed-browser evidence that:

- a real user signs in and creates/loads the first persistent Business Record;
- Business DNA saves and restores after sign-out + fresh sign-in;
- private Business content disappears after sign-out;
- Value, Decision, Risk, Opportunity, and Memory are created/read through production UI;
- authenticated website Evidence capture succeeds;
- one Proposal is approved and one rejected through production UI;
- approved Evidence-linked changes and Business Memory survive restore;
- a second genuine user cannot read or mutate the first user's data;
- direct account switching clears old private UI before the next user's record appears;
- `/acceptance` observes the expected account-owned state in those real sessions;
- Android/mobile and desktop visual/interaction acceptance passes.

## Current decision

**KEEP** the broad shared-Business-Record architecture, account-owned persistence, E1–E8 discipline, founder approval before evidence-derived canonical changes, exact-source provenance gate, `/api/health`, noindex `/acceptance`, atomic Business bootstrap, atomic Evidence persistence, verified mutation responses, authenticated-only RPC grants, Business/Evidence relationship-aware RLS, account-switch privacy guards, and Sales OS nested under Customers & Growth.

**REVISE** only the definition of “done” by keeping it strict: a user-facing feature must clear source/build checks, exact-source production runtime checks, and a genuine authenticated production workflow before it is called 100% production-tested.

## Highest-value remaining acceptance loop

`sign in → create/load Business Record → edit Business DNA → change stage → add Value + Decision + Risk + Opportunity + Memory → open /acceptance and capture snapshot → sign out → confirm private state clears → sign back in → verify restore → rerun /acceptance → capture website Evidence → approve one Proposal → reject one Proposal → verify Evidence links + Memory → switch to second user → verify old-state clearing + read/write isolation → rerun /acceptance → mobile/desktop visual pass → KEEP / REVISE / REVERT`

---

## Production completion rule

Keep these states separate:

- **SOURCE COMPLETE** — implementation exists and passes build/type/schema checks.
- **PRODUCTION RUNTIME VERIFIED** — exact accepted source/migrations are deployed and required runtime/dependency paths work.
- **PRODUCTION USER VERIFIED** — a genuine authenticated user completes the feature in deployed UI and state survives required session/device boundaries.
- **COMMERCIAL EVIDENCE** — genuine external customer/user behavior exists.

Do not collapse them. “It deployed” and “a person successfully used it” remain stubbornly different sentences.
