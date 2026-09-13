# P3 — Live Production Deployment + External Verification

Updated: 2026-09-13

## Current P3 scope

P3 now applies to the standalone Founder Dynasty OS web application. The old WordPress/plugin + Shopify-webhook checklist is legacy and is not the production gate for the current product direction.

Production service: `founder-dynasty-os-web`  
Public domain: `https://founder-dynasty-os-web-production.up.railway.app`  
Runtime: Next.js standalone web + Supabase Auth/Postgres/RLS.

## P3 definition of done

P3 is complete only when all of the following are true:

1. The exact accepted Git commit is deployed to the production service.
2. Production build and TypeScript validation pass.
3. `GET /api/health` succeeds and reports a configured deployment revision plus required public Supabase configuration.
4. The production database schema and account-owner RLS required by the implemented web surfaces are present.
5. A real authenticated user can create or load the shared Business Record through the deployed UI.
6. Business DNA and Business Stage survive sign-out and a new signed-in session.
7. Value, Decision, Risk, Opportunity, and Business Memory records can be created and restored through the deployed UI.
8. A real authenticated website-evidence capture succeeds through `POST /api/evidence/website`.
9. The founder can approve one evidence proposal and reject one proposal through the production UI, with the approved change and Business Memory entry preserved.
10. A second genuine user session cannot read or mutate the first user's Business Record.
11. The accepted workflow passes mobile and desktop visual/interaction checks.

## Current production-runtime evidence

As of 2026-09-13, the current source-controlled production head includes the atomic Business Record bootstrap migration and client integration.

- current production deployment: `4fd5eadb-35c6-4bf2-b66d-e21f3e3e8974`
- deployed Git commit: `be8fd931a22d83cf0e9c7c9af9a1aeb8686d4827`
- deployment status: `SUCCESS`
- Next.js: `16.3.4`
- production compilation: passed
- TypeScript: passed
- production dependency audit: 0 vulnerabilities in the observed build
- `/api/health`: Railway healthcheck succeeded
- `/sales-engine-app`: present in the production route set
- Supabase `fdos_ensure_business()` exists as `SECURITY INVOKER` and is executable by authenticated users
- the web client uses `fdos_ensure_business()` instead of a client-side select-then-insert bootstrap race

These items establish **PRODUCTION RUNTIME VERIFIED** for the current source, not **PRODUCTION USER VERIFIED**.

## Evidence boundary

Internal/source tests are E4 observations unless independently verified at a stronger evidence level. Deployment state, database configuration, and inspected production configuration can be E1 Verified Facts. Real public HTTP behavior can be E2 Current External Evidence. Genuine user/customer behavior can become E3 Customer-Derived Evidence.

A healthy deployment is not proof of authenticated persistence, cross-user isolation, product-market fit, revenue, ROI, or customer success. Humanity has already stretched the word “done” far enough.

## Remaining P3 acceptance loop

`sign in → create/load Business Record → edit Business DNA → change stage → add Value + Decision + Risk + Opportunity + Memory → sign out → sign back in → verify restore → capture website evidence → approve/reject proposals → verify evidence links + memory → second-user isolation → mobile/desktop visual pass → KEEP / REVISE / REVERT`

Until that loop is exercised in genuine production browser sessions, P3 remains runtime-verified but user-acceptance incomplete.
