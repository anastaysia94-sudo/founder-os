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

This loop covers the broad standalone `web/` product around the shared Business Record:

- Business Stage
- Business DNA
- Founder Command Center
- Value Map
- Decisions
- Opportunities
- Risks
- Business Memory
- authenticated persistence
- website evidence capture
- evidence proposal review
- Customers & Growth → Sales OS integration

### Current accepted production runtime

Railway service: `founder-dynasty-os-web`  
Public domain: `https://founder-dynasty-os-web-production.up.railway.app`

Accepted web/runtime revision:

`f82f488f231baf71e576024f9dfecde466e958f2`

Railway deployment:

`72a3c73a-c285-4473-a75b-97d7edf22764`

Observed on 2026-09-13:

- deployment status: `SUCCESS`
- Next.js: `16.3.4`
- production compilation: passed
- TypeScript: passed
- production route generation: passed
- production container: started successfully and reported ready
- Railway `/api/health`: succeeded on the first observed attempt
- route set includes `/`, `/answers`, `/api/evidence/website`, `/api/health`, `/sales-engine-app`, `/manifest.webmanifest`, `/robots.txt`, and `/sitemap.xml`
- `FDOS_DEPLOY_REV` was aligned to `f82f488f231baf71e576024f9dfecde466e958f2` for this deployment

### CI evidence for the accepted auth-safe web revision

`Founder OS Standalone Web` run `34761083989`: **SUCCESS**

Verified workflow steps include:

- dependency installation: success
- high/critical vulnerability gate: success
- TypeScript: success
- standalone production build: success
- implemented-surface / production-testability contract: success

`PHP Lint` run `34761084005`: **SUCCESS**.

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

RLS is enabled on the implemented FDOS tables with account-owner policies. The evidence-proposal apply RPC requires an owned pending proposal before applying it and records approved changes in Business Memory.

A prior production-database transaction smoke test inserted representative shared-record rows and rolled the transaction back. It proved schema compatibility for that test shape, not browser auth/RLS behavior.

### Database performance hardening

Production migration `optimize_fdos_rls_and_foreign_key_indexes` added covering indexes and optimized FDOS owner RLS expressions. The prior FDOS unindexed-foreign-key and `auth_rls_initplan` findings cleared on advisor re-scan.

Source mirror:

`db/migrations/20260913_optimize_fdos_rls_and_foreign_key_indexes.sql`

### Atomic Business Record bootstrap

Production migration `add_atomic_fdos_business_bootstrap` created `public.fdos_ensure_business()`.

Verified properties:

- `SECURITY INVOKER`
- explicit safe search path
- derives owner from `auth.uid()`
- rejects unauthenticated calls
- serializes same-user initial creation with a transaction-scoped advisory lock
- returns an existing earliest Business Record if present
- otherwise creates the default Business Record plus one E4 `Workspace created` memory event
- public execution revoked
- authenticated execution granted

The web client calls this RPC instead of using browser-side check-then-insert creation.

Web integration commit: `9e34e6e07818ac49eaf0a60c864f97697509e087`  
Migration mirror: `db/migrations/20260913_add_atomic_fdos_business_bootstrap.sql`

### Auth/session stale-state hardening

A source audit identified a separate privacy/consistency risk: an asynchronous hydration request started for one auth state could theoretically finish after sign-out or after another user became active and repaint stale private Business Record state into the page.

The accepted production web revision `f82f488f231baf71e576024f9dfecde466e958f2` now:

- tracks the active authenticated user outside stale async closures;
- version-tags hydration requests so superseded work cannot apply state;
- clears Business Record, proposals, evidence receipt, composer/edit state, and website input on sign-out;
- rejects hydration attempts for a user who is no longer active;
- clears password state after successful authentication and successful sign-out;
- checks that the current Supabase session still belongs to the user who initiated website evidence capture;
- serializes Business Stage persistence at the UI level by disabling stage controls while that write is busy.

The first implementation pass was tightened once more after review so an old user action cannot call `hydrate(oldUser)` and re-assert that old identity in the guard itself. The final deployed `hydrate()` rejects mismatched users before starting work.

This protection is **source complete and production-runtime verified** because CI passes and the exact web revision is deployed. It is **not yet production-user verified** because no genuine account-switch browser acceptance event has been observed in this chat.

### Sales OS neighborhood integration

The standalone shell's `/sales-engine-app` route bridges to the separately deployed Sales OS rather than resolving to a nonexistent local asset path.

Bridge source commit: `adccb5a148da64bafb081303352dd582f854062d`.

The bridge requires an HTTPS destination. `/sales-engine-app` is present in the accepted production route set. Independent public-browser observation of the final redirect hop remains separate external evidence.

## What is verified

### SOURCE COMPLETE / PRODUCTION RUNTIME VERIFIED

At this checkpoint:

- broad standalone shell compiles and type-checks;
- accepted auth-safe web revision is deployed to Railway;
- production container starts;
- `/api/health` succeeds;
- current CI dependency vulnerability gate passes;
- shared FDOS persistence tables exist;
- account-owner RLS is configured on implemented FDOS tables;
- FDOS-specific index/RLS performance findings were remediated;
- atomic first-Business bootstrap exists in production and is used by the client;
- stale-session hydration protections are deployed;
- evidence-proposal application has account/pending-state gating;
- website evidence route is present in production;
- Sales OS bridge route is present in production.

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
- switching users does not reveal stale first-user UI state;
- Android/mobile and desktop visual/interaction acceptance passes.

The database can be correct and the source can be careful while a browser still finds some new way to be irritating. That is why the last mile stays a separate gate.

## Current decision

**KEEP** the broad shared-Business-Record architecture, account-owned Supabase persistence, E1–E8 evidence discipline, founder approval before evidence-derived canonical changes, current-source provenance gate, `/api/health`, optimized RLS/index structure, atomic bootstrap RPC, stale-session privacy guards, and Sales OS nested under Customers & Growth.

**REVISE** the meaning of “done” only by making it stricter: user-facing features must clear source/build checks, exact-source production runtime checks, and a genuine authenticated production workflow before they are called 100% production-tested.

## Highest-value remaining acceptance loop

`sign in → create/load Business Record → edit Business DNA → change stage → add Value + Decision + Risk + Opportunity + Memory → sign out → confirm private state clears → sign back in → verify restore → capture website evidence → approve/reject proposals → verify evidence links + memory → switch to second user → verify isolation/no stale first-user state → mobile/desktop visual pass → KEEP / REVISE / REVERT`

---

## Production completion rule

Keep these states separate:

- **SOURCE COMPLETE** — implementation exists and passes build/type/schema checks.
- **PRODUCTION RUNTIME VERIFIED** — the exact accepted source is deployed and required runtime/dependency paths work.
- **PRODUCTION USER VERIFIED** — a genuine authenticated user completes the feature in the deployed UI and state survives required session/device boundaries.
- **COMMERCIAL EVIDENCE** — genuine external customer/user behavior exists.

Do not collapse them. “It deployed” and “a person successfully used it” remain stubbornly different sentences.
