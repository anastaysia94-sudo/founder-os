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
- Current source contains explicit Railway revision/build/readiness work. Treat Railway as active only where current source/configuration and live evidence prove it.
- Historical chat summaries are context, not proof of the live build.
- Record source revision, deployment evidence, test result, blocker, and rollback path.

## Current source checkpoint

Founder OS readiness/product source reached `dbdc61d31b09d642327679f13a3ab66eda085a1f`. A newer hosting-config commit, `24d82f7547a556a37483606f9bfe0a696de63f6f`, pins the embedded Railway Trend Lab host to Trend Lab source `60d5ac6e489b9b58f018b39810656d79fc9e8a21`, which includes the explicit mobile-layout test and mobile comparison-table containment fix.

Other material changes since the prior continuity snapshot:
- `45ea1e7fe99756145061a281f399d0ef1373c127` forces Railway to build the current Four-Offer main snapshot.
- `1aff87dcce5236f47ddec5a77bd41855a6366611` adds a live Four-Offer readiness endpoint.
- `b0778e9041b6bd92cba98b529d856ea10cd2a903` applies the SmartPickShop steampunk/neon visual system to Founder OS web.
- `c4b4cd74afc876243b0c8b6bf680714cd45c53a1` triggers the branded Founder OS web build.
- `dbdc61d31b09d642327679f13a3ab66eda085a1f` adds Founder OS `/api/ready` with configuration/source-revision checks.
- Four-Offer checkout source has a readiness path that checks checkout config, PayPal API access, and required digital-delivery assets.

## Verification boundary

These are verified source/configuration changes, not proof that the live Railway/Supabase deployments are healthy or that payment/delivery succeeds. The Trend Lab host is now source-pinned correctly in code, but its live build still needs verification.

## Smallest next execution block

1. Identify the current live Founder OS, Four-Offer, and embedded Trend Lab deployment URLs and served source revisions.
2. Verify Founder OS `/api/ready`, Four-Offer readiness, and that the hosted Trend Lab actually serves pinned source `60d5ac6e489b9b58f018b39810656d79fc9e8a21`.
3. Confirm any active Railway deployment uses the current intended build/revision path rather than the retired direct-deploy workflow.
4. Complete one sandbox purchase → capture → ledger record → digital delivery/checksum flow.
5. Run Founder OS genuine-user acceptance for sign-in/recovery, Business A/B isolation, persistence/restore, and mobile.
6. Save exact deployment/test evidence before changing launch status.
