# Founder Dynasty OS — Browser Restore Acceptance Checkpoint

Date: 2026-09-16

## Purpose

This checkpoint records the latest work toward the remaining genuine production-user acceptance for Founder Dynasty OS 10.0. It preserves the distinction between source/CI proof, Railway runtime proof, and steps that still require a real authenticated browser user.

## New source capability

Commit:

`557065150fe581116f56125ca230df2dc282b7a2`

Message:

`feat(web): add genuine browser restore acceptance verifier`

New route:

`/acceptance/restore`

The verifier is deliberately account-owned and non-synthetic. It:

1. reads the currently authenticated Supabase user;
2. reads the user's first persistent `fdos_business_records` row;
3. captures exact row counts across the 18 child FDOS module tables;
4. stores a checkpoint only in browser `sessionStorage`;
5. requires an actual signed-out browser state to be observed;
6. requires the same user to sign back in;
7. requires the same Business Record to reappear;
8. requires the same readable account-owned module row counts before marking restore proof PASS;
9. exports the observed evidence as copyable JSON;
10. refuses to treat second-user isolation, visual QA, Evidence review, or a completed Value Sprint as proven by this narrower test.

Because the route is nested under `/acceptance`, it inherits the existing `index: false`, `follow: false`, `nocache: true` metadata boundary.

## CI proof for source commit

GitHub Actions for `557065150fe581116f56125ca230df2dc282b7a2`:

- Founder OS Standalone Web run `35088659081`: **SUCCESS**
  - dependency install: passed
  - high/critical vulnerability gate: passed
  - TypeScript: passed
  - Next.js production build: passed
  - existing standalone production-testability contract: passed
- PHP Lint run `35088659117`: **SUCCESS**

This proves the new route compiles and builds with the current product. It is not a substitute for production deployment or browser acceptance.

## Railway finding

Existing production service:

- project: `same-day-customer-growth-pack`
- service: `founder-dynasty-os-web`
- environment: `production`
- domain: `https://founder-dynasty-os-web-production.up.railway.app`
- root directory: `/web`
- watch pattern: `web/**`
- healthcheck: `/api/health`

A Railway redeploy was triggered as deployment:

`54d3de14-5e7e-45e2-a34a-fa64636cf4ce`

Result: **SUCCESS**

However, Railway correctly reused the service's already-associated source snapshot instead of fetching current GitHub HEAD. The redeploy therefore rebuilt:

`31ee76a27e3a825ba9efd9628b07990320c8d310`

not the new source commit `557065150fe581116f56125ca230df2dc282b7a2`.

The rebuilt runtime passed `/api/health` and reached Next.js Ready, so current production remains healthy. The new restore verifier is source-complete and CI-green but is **not yet present in the live Railway runtime**.

## Important Railway deployment rule

Railway documentation confirms that `serviceInstanceRedeploy` / ordinary redeploy reuses the latest deployment's existing commit. It does not check the connected GitHub repository for a newer commit.

To move the existing service to the new source without creating a duplicate service, the required operation is a specific-commit deployment using Railway's public API mutation equivalent to:

```graphql
mutation serviceInstanceDeployV2($serviceId: String!, $environmentId: String!, $commitSha: String!) {
  serviceInstanceDeployV2(serviceId: $serviceId, environmentId: $environmentId, commitSha: $commitSha)
}
```

with:

- `serviceId = a975d751-c824-447a-9437-915ac7148531`
- `environmentId = 0c78fdbd-27a2-4c9d-a085-d10e06c138c3`
- `commitSha = 557065150fe581116f56125ca230df2dc282b7a2`

Do **not** use ordinary redeploy for this step; it will continue to rebuild `31ee76a...`.

Do **not** create a second Railway service. Preserve the existing domain, environment variables, healthcheck, root directory, and service identity.

The connected Railway MCP in this session does not expose `serviceInstanceDeployV2(commitSha: ...)`, and Railway Agent was unavailable because its usage limit was reached. That is the current platform-operation boundary, not an application-code failure.

## Remaining genuine production-user acceptance after the source commit is live

1. Open `/acceptance/restore` while signed in.
2. Arm the checkpoint.
3. Sign out from the verifier and let `AuthPrivacyGuard` reload the browser boundary.
4. Confirm the verifier observes a signed-out state.
5. Sign back in with the same account through Founder Command Center.
6. Return to `/acceptance/restore` and require PASS for same user + same Business Record + matching module row counts.
7. Run `/acceptance` diagnostics again.
8. Exercise real UI writes across the major modules that are appropriate for the business stage.
9. Complete website Evidence capture and approve/reject review through the browser.
10. Complete one real Value Sprint through an observed outcome and KEEP / REVISE / REVERT.
11. Perform genuine second-account browser isolation.
12. Perform mobile and desktop visual/interaction acceptance.

## Status

**SOURCE: GREEN**  
**CI: GREEN**  
**CURRENT PRODUCTION RUNTIME: HEALTHY on `31ee76a...`**  
**NEW RESTORE VERIFIER IN PRODUCTION: BLOCKED ONLY BY SPECIFIC-COMMIT RAILWAY DEPLOY CAPABILITY**  
**GENUINE HUMAN/PRODUCTION-USER ACCEPTANCE: STILL REQUIRED**
