# P3 — Live Production Deployment + External Verification

Updated: 2026-09-13

## Current P3 scope

P3 applies to the standalone Founder Dynasty OS web application. The old WordPress/plugin + Shopify-webhook checklist is legacy and is not the production gate for the current product direction.

Production service: `founder-dynasty-os-web`  
Public domain: `https://founder-dynasty-os-web-production.up.railway.app`  
Runtime: Next.js standalone web + Supabase Auth/Postgres/RLS.

## P3 definition of done

P3 is complete only when all of the following are true:

1. The exact accepted web-source commit is deployed to production.
2. Production build and TypeScript validation pass.
3. `GET /api/health` succeeds and reports configured deployment provenance plus required public Supabase configuration.
4. The production database schema and account-owner RLS required by the implemented web surfaces are present.
5. A real authenticated user can create or load the shared Business Record through the deployed UI.
6. Business DNA and Business Stage survive sign-out and a new signed-in session.
7. Value, Decision, Risk, Opportunity, and Business Memory records can be created and restored through the deployed UI.
8. A real authenticated website-evidence capture succeeds through `POST /api/evidence/website`.
9. The founder can approve one evidence proposal and reject one proposal through the production UI, with the approved change and Business Memory entry preserved.
10. A second genuine user session cannot read or mutate the first user's Business Record.
11. The accepted workflow passes mobile and desktop visual/interaction checks.

## Current production-runtime evidence

Accepted web/runtime revision: `f82f488f231baf71e576024f9dfecde466e958f2`  
Railway deployment: `72a3c73a-c285-4473-a75b-97d7edf22764`

Observed on 2026-09-13:

- deployment status: `SUCCESS`
- Next.js: `16.3.4`
- production compilation: passed
- TypeScript: passed
- CI dependency vulnerability gate: passed
- standalone product build: passed
- implemented-surface/production-testability contract: passed
- PHP lint: passed
- `/api/health`: Railway healthcheck succeeded on the first observed attempt
- `/sales-engine-app`: present in the production route set
- atomic Business Record bootstrap client + production RPC remain in this deployed source lineage
- auth/session hardening now prevents an older in-flight hydration request from repopulating private Business Record state after sign-out or a user switch
- password state is cleared after successful authentication and sign-out
- website evidence capture refuses to proceed if the active session no longer matches the user who initiated the action

The auth/session hardening commit's `Founder OS Standalone Web` run `34761083989` completed successfully. PHP lint run `34761084005` also completed successfully.

These items establish **PRODUCTION RUNTIME VERIFIED** for the accepted source. They do not establish **PRODUCTION USER VERIFIED**.

## Database bootstrap evidence

Production Supabase includes authenticated `fdos_ensure_business()` as `SECURITY INVOKER`. It rejects unauthenticated calls, serializes same-user initial creation with a transaction-scoped advisory lock, returns an existing Business Record when one is present, and creates the default Business Record plus one E4 `Workspace created` memory event only when needed.

The client no longer performs browser-side `check then insert` first-record creation.

## Evidence boundary

Internal/source tests are E4 observations unless independently verified at a stronger evidence level. Deployment state, database configuration, and inspected production configuration can be E1 Verified Facts. Real public HTTP behavior can be E2 Current External Evidence. Genuine user/customer behavior can become E3 Customer-Derived Evidence.

A healthy deployment is not proof of authenticated persistence, cross-user isolation, product-market fit, revenue, ROI, or customer success. Humanity has already stretched the word “done” far enough.

## Remaining P3 acceptance loop

`sign in → create/load Business Record → edit Business DNA → change stage → add Value + Decision + Risk + Opportunity + Memory → sign out → sign back in → verify restore → capture website evidence → approve/reject proposals → verify evidence links + memory → second-user isolation → mobile/desktop visual pass → KEEP / REVISE / REVERT`

Until that loop is exercised in genuine production browser sessions, P3 remains runtime-verified but user-acceptance incomplete.
