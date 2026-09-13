# Founder Dynasty OS 10.0 — Standalone Launch Runbook

Updated: 2026-09-13

This is the launch runbook for the current standalone Founder Dynasty OS web application. The historical WordPress/plugin launch path is not the active production path.

## Production targets

- Repository: `anastaysia94-sudo/founder-os`
- Web source: `/web`
- Railway service: `founder-dynasty-os-web`
- Public domain: `https://founder-dynasty-os-web-production.up.railway.app`
- Production health path: `/api/health`
- Persistence/auth: Supabase Auth + account-owned FDOS tables with RLS

## Pre-deploy

1. Confirm the intended Git commit and note its full SHA.
2. Confirm CI passes `npm audit --audit-level=high`, TypeScript, production build, and the standalone route/surface contract.
3. Confirm required production variable names exist without exposing their values: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `FDOS_DEPLOY_REV`.
4. Set `FDOS_DEPLOY_REV` to the exact source revision being accepted.
5. Confirm the production database migrations required by that source have already been applied and mirrored under `db/migrations/`.
6. Do not seed fake customers, revenue, replies, payments, or “successful” user activity to make acceptance look complete.

## Deployment gate

A deployment may be marked **PRODUCTION RUNTIME VERIFIED** only when:

1. Railway identifies the deployment as the intended Git commit.
2. production compilation succeeds;
3. TypeScript succeeds;
4. dependency audit has no blocking high-severity finding;
5. the Next.js container starts successfully;
6. Railway `/api/health` succeeds;
7. the expected current routes are emitted, including `/`, `/api/health`, `/api/evidence/website`, and `/sales-engine-app` when present in accepted source.

Current runtime checkpoint on 2026-09-13:

- deployment: `4fd5eadb-35c6-4bf2-b66d-e21f3e3e8974`
- Git revision: `be8fd931a22d83cf0e9c7c9af9a1aeb8686d4827`
- status: `SUCCESS`
- Next.js 16.3.4 production build: passed
- TypeScript: passed
- observed production install audit: 0 vulnerabilities
- `/api/health`: succeeded

## Required authenticated user acceptance

Runtime success is not the finish line. Before calling the implemented shared-record workflow production-user verified, exercise it through the deployed app with genuine authenticated sessions:

1. Sign in with a real account.
2. Create or load the shared Business Record.
3. Edit and save Business DNA.
4. Change Business Stage.
5. Add one Value item, Decision, Risk, Opportunity, and Business Memory entry.
6. Sign out.
7. Sign back in in a fresh session and confirm the same state restores.
8. Capture a real public webpage as E2 evidence.
9. Review generated proposals; approve at least one and reject at least one.
10. Confirm approved changes retain their evidence/source linkage and create the expected Business Memory event.
11. Sign in as a second genuine user and verify the first user's records cannot be read or modified.
12. Check desktop and Android/mobile layout and core interactions.
13. Record KEEP / REVISE / REVERT with observed evidence.

## Business Record bootstrap rule

The deployed client now calls the authenticated `fdos_ensure_business()` RPC. The production function is `SECURITY INVOKER`, rejects unauthenticated calls, serializes same-user initial creation with a transaction-scoped advisory lock, returns an existing Business Record when present, and creates the default Business Record plus one E4 `Workspace created` memory event only when needed.

Do not replace this with client-side “check then insert” logic. Two tabs should not be allowed to invent two first businesses merely because computers are fast and humans click things twice.

## Rollback

If a deployment introduces a blocking regression:

1. preserve the observed failure evidence and affected commit/deployment IDs;
2. restore the previous known-good application revision using the deployment platform;
3. do not roll back a production database migration blindly if newer writes may depend on it;
4. use a forward-compatible corrective migration when safer than destructive schema rollback;
5. rerun `/api/health` and the relevant acceptance subset after recovery;
6. classify the outcome as REVISE or REVERT in Business Memory / validation records as appropriate.

## Truth boundary

**SOURCE COMPLETE**, **PRODUCTION RUNTIME VERIFIED**, **PRODUCTION USER VERIFIED**, and **COMMERCIAL EVIDENCE** are separate states. A green build does not prove a successful login. A successful login does not prove a customer. A customer does not automatically prove profit. Annoying, perhaps, but considerably cheaper than lying to ourselves.
