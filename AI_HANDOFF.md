# AI Handoff — Founder Dynasty OS

Updated: 2026-09-26 America/Los_Angeles

## Identity

- Canonical repository: `anastaysia94-sudo/founder-os`
- Master project IDs: P002, P016
- Portfolio index: `anastaysia94-sudo/anastaysia94-sudo` → `CROSS_LLM_BOOTSTRAP.md`
- Machine-readable register: `portfolio/PROJECTS.json`

## Purpose

Business operating system plus the current Four-Offer Launch source path.

## Continuity rules

- Sales OS belongs with Cashh Radar, not Founder OS.
- Four-Offer Launch remains in its current source path until an explicit migration is completed and verified.
- The previously retired Railway direct-deploy workflow must not be resurrected blindly.
- However, current source now contains explicit Railway revision/build/readiness work. Treat Railway as active only where the current source/configuration proves it, not from the older handoff.
- Historical chat summaries are context, not proof of the live build.
- Record source revision, deployment evidence, test result, blocker, and rollback path.

## Current source checkpoint

Current observed main head: `dbdc61d31b09d642327679f13a3ab66eda085a1f`.

Changes since the prior continuity snapshot:
- `45ea1e7fe99756145061a281f399d0ef1373c127` forces Railway to build the current Four-Offer main snapshot.
- `1aff87dcce5236f47ddec5a77bd41855a6366611` adds a live Four-Offer readiness endpoint.
- `b0778e9041b6bd92cba98b529d856ea10cd2a903` applies the SmartPickShop steampunk/neon visual system to Founder OS web.
- `c4b4cd74afc876243b0c8b6bf680714cd45c53a1` triggers the branded Founder OS web build.
- Trend Lab hosting inside this repo is pinned to Trend Lab source `06ac015fd39906813ac75d13ae1dd2a3971cfa2f`.
- `dbdc61d31b09d642327679f13a3ab66eda085a1f` adds Founder OS `/api/ready` with configuration/source-revision checks.
- Four-Offer checkout source now has a readiness path that checks checkout config, PayPal API access, and required digital-delivery assets.

## Verification boundary

These are verified source changes, not proof that the live Railway/Supabase deployments are healthy or that payment/delivery succeeds.

## Smallest next execution block

1. Identify the current live Founder OS and Four-Offer deployment URLs and source revisions.
2. Verify Founder OS `/api/ready` and the current Four-Offer readiness path.
3. Confirm any active Railway deployment is using the current intended workflow/configuration rather than the retired direct-deploy workflow.
4. Complete one sandbox purchase → capture → ledger record → digital delivery/checksum flow.
5. Then run Founder OS genuine-user acceptance for sign-in/recovery, Business A/B isolation, persistence/restore, and mobile.
6. Save exact deployment/test evidence before changing launch status.
