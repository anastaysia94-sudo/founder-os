# Founder Dynasty OS 10.0 — Production/User Validation

Updated: 2026-09-13

This document tracks production and user validation evidence only. It does not convert deployments, research, outbound messages, internal tests, database smoke tests, or implemented surfaces into claims of customers, revenue, ROI, product-market fit, or successful fulfillment.

## Evidence Loop 001 — Public Sales OS Delivery

### Hypothesis
A real external browser can reach the Same-Day Customer Growth Pack production PWA and retrieve the minimum assets needed to present the live Sales OS without server-side failure.

### Observed evidence
Production service: `sales-engine-pwa`  
Public domain: `https://sales-engine-pwa-production.up.railway.app`

Previously observed production Chromium traffic received successful responses for the application and required assets. Railway reported the service healthy in that verification window.

### Decision
**KEEP** the public Railway Sales OS delivery path.

This does not prove authenticated Founder Dynasty OS persistence, prospect response, payment, revenue, or commercial conversion.

---

## Evidence Loop 002 — Genuine Prospect Outreach (observation)

A real outreach email was sent to Therma Tech at `info@thermatechhvac.com`. The Gmail send event exists and the pipeline preserved the prospect as Contacted while reply, paid, fulfilled, and opt-out fields remained empty unless those events genuinely occurred.

### Decision
**OBSERVE**. A sent email is not a reply, a customer, a payment, or revenue.

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
- authenticated persistence structure
- website evidence capture
- evidence proposal review
- Customers & Growth → Sales OS integration

### Current exact production runtime

Railway service: `founder-dynasty-os-web`  
Public domain: `https://founder-dynasty-os-web-production.up.railway.app`

Current accepted production checkpoint:

- deployment: `4fd5eadb-35c6-4bf2-b66d-e21f3e3e8974`
- deployed Git commit: `be8fd931a22d83cf0e9c7c9af9a1aeb8686d4827`
- deployment status: `SUCCESS`
- application: `founder-os-web@0.3.0`
- Next.js: `16.3.4`
- production compilation: passed
- TypeScript: passed
- static generation: passed
- observed production install audit: 37 packages, **0 vulnerabilities**
- production container: started successfully
- Railway healthcheck path: `/api/health`
- `/api/health`: succeeded on the first observed healthcheck attempt
- production route set includes `/`, `/answers`, `/api/evidence/website`, `/api/health`, `/sales-engine-app`, `/manifest.webmanifest`, `/robots.txt`, and `/sitemap.xml`
- `FDOS_DEPLOY_REV` was aligned to the accepted repository revision

### CI evidence

Atomic-bootstrap web integration commit:

`9e34e6e07818ac49eaf0a60c864f97697509e087`

For that commit:

- `Founder OS Standalone Web` run `34760724373`: **SUCCESS**
- `PHP Lint` run `34760724411`: **SUCCESS**

The later repository-head commit `be8fd931a22d83cf0e9c7c9af9a1aeb8686d4827` mirrors the already-applied production database migration and is the exact revision Railway deployed.

### Production data-layer evidence

Verified FDOS tables:

- `fdos_business_records`
- `fdos_value_items`
- `fdos_decisions`
- `fdos_risks`
- `fdos_opportunities`
- `fdos_memory`
- `fdos_evidence`
- `fdos_evidence_proposals`

RLS is enabled on the implemented FDOS tables with account-owner policies. The proposal table has explicit owner operations. The evidence-apply RPC requires an owned pending proposal before applying it and records the approved change in Business Memory.

A prior production-database transaction smoke test inserted representative shared-record rows and rolled the transaction back. It proved schema compatibility for that test shape but did not prove browser auth/RLS behavior. No smoke-test rows were intentionally left behind.

### Database performance hardening

Production migration `optimize_fdos_rls_and_foreign_key_indexes` added covering indexes and changed FDOS owner RLS expressions to `(select auth.uid())` where appropriate. The prior FDOS unindexed-foreign-key and `auth_rls_initplan` findings cleared on advisor re-scan.

Source mirror:

`db/migrations/20260913_optimize_fdos_rls_and_foreign_key_indexes.sql`

### Atomic Business Record bootstrap hardening

The previous browser-side first-record path used a select followed by a conditional insert. Two overlapping auth hydration paths could therefore race during first use.

Production migration `add_atomic_fdos_business_bootstrap` created `public.fdos_ensure_business()` with these properties:

- `SECURITY INVOKER`
- explicit safe search path
- derives the current owner from `auth.uid()`
- rejects unauthenticated calls
- takes a same-user transaction-scoped advisory lock before checking/creating
- returns the existing earliest Business Record if one is already present
- otherwise creates the default Business Record plus one E4 `Workspace created` memory event
- public execution revoked
- authenticated execution granted

A production inspection confirmed the function exists as non-`SECURITY DEFINER` and the authenticated role can execute it.

The web client now calls `fdos_ensure_business()` instead of performing its own check-then-insert sequence.

Web integration commit:

`9e34e6e07818ac49eaf0a60c864f97697509e087`

Production migration mirror:

`db/migrations/20260913_add_atomic_fdos_business_bootstrap.sql`

Mirror/current deployed repository head:

`be8fd931a22d83cf0e9c7c9af9a1aeb8686d4827`

### Sales OS neighborhood integration

The standalone shell's `/sales-engine-app` route now bridges to the separately deployed Sales OS rather than resolving to a nonexistent local application path.

Bridge source commit:

`adccb5a148da64bafb081303352dd582f854062d`

The bridge validates its configured destination, requires HTTPS, and issues a temporary redirect. `/sales-engine-app` is present in the current production route set. An independent public-browser observation of the final redirect hop remains separate external evidence and has not been fabricated.

## What this proves

### SOURCE COMPLETE / PRODUCTION RUNTIME VERIFIED

Verified at this checkpoint:

- the broad standalone shell compiles and type-checks;
- the exact accepted repository revision is deployed to Railway production;
- the deployed service starts successfully;
- `/api/health` succeeds while enforcing required public runtime configuration and deployment provenance;
- current dependency audit in the observed production build reports zero vulnerabilities;
- the shared FDOS persistence tables exist;
- account-owner RLS is configured on implemented FDOS tables;
- FDOS-specific index/RLS performance findings were remediated;
- evidence-proposal application has an owner/pending-state gate;
- the website evidence route is present in production;
- the Sales OS bridge route is present in production;
- atomic first-Business bootstrap exists in production;
- the deployed client uses the atomic bootstrap RPC.

## What is not yet proven

### PRODUCTION USER VERIFIED — NOT YET COMPLETE

Still requires genuine deployed-browser evidence:

- a real user signs into the standalone Founder Dynasty OS app and creates or loads the first persistent `fdos_business_records` row;
- Business DNA save → sign out → fresh sign in → restore through the UI;
- UI create/read flows for Value, Decision, Risk, Opportunity, and Memory;
- website evidence capture through the deployed UI with a real authenticated token;
- founder approve/reject of evidence proposals through the production UI;
- approved evidence-linked changes and Business Memory are observed after restore;
- second-user isolation is verified using two genuine authenticated sessions;
- mobile/Android and desktop visual/interaction acceptance is completed.

A function existing in Postgres and a green healthcheck do not magically become a user journey. Computers are annoyingly literal that way.

## Current decision

**KEEP**:

- broad shared-Business-Record architecture
- account-owned Supabase persistence
- E1–E8 evidence discipline
- founder approval before evidence-derived canonical changes
- current-source provenance gate
- `/api/health`
- optimized RLS/index structure
- atomic bootstrap RPC
- Sales OS nested under Customers & Growth

**REVISE** the definition of “done” only by making it stricter: every source-implemented user-facing feature must clear source/build checks, exact-source production runtime checks, and a genuine authenticated production workflow before it is called 100% production-tested.

## Highest-value remaining acceptance loop

`sign in → create/load Business Record → edit Business DNA → change stage → add Value + Decision + Risk + Opportunity + Memory → sign out → sign back in → verify restore → capture website evidence → approve/reject proposals → verify evidence links + memory → second-user isolation → mobile/desktop visual pass → KEEP / REVISE / REVERT`

---

## Production completion rule

Keep these states separate:

- **SOURCE COMPLETE** — implementation exists and passes build/type/schema checks.
- **PRODUCTION RUNTIME VERIFIED** — the exact accepted source is deployed and required runtime/dependency paths work.
- **PRODUCTION USER VERIFIED** — a genuine authenticated user completes the feature in the deployed UI and state survives required session/device boundaries.
- **COMMERCIAL EVIDENCE** — genuine external customer/user behavior exists.

Do not collapse them. “It deployed” and “a person successfully used it” are different sentences for a reason.
