# Founder Dynasty OS — AI Continuation Instructions

This file is the canonical handoff for AI coding/research assistants working on **Founder Dynasty OS 10.0 (FDOS)** under **SmartPickShop Holdings**.

Supported assistants include ChatGPT/Codex, GitHub Copilot, Grok, Perplexity, and other capable coding/research agents.

## Mission

FDOS is a **Business Outcome Operating System**, not a template bundle. Its operating loop is:

**Founder input → evidence collection → Value Leak detection → opportunity ranking → recommended experiment → Value Sprint → KPI measurement → evidence classification → KEEP / REVISE / REVERT → next-best action.**

Optimize for measurable customer outcomes, implementation, retention, recurring revenue potential, licensing potential, referrals, and durable product value. Never invent commercial results.

## Tracked Founder OS components

Founder OS now tracks these active components as one portfolio under SmartPickShop Holdings:

1. **Standalone Founder OS Web Track (`web/`)** — non-WordPress Next.js/React/TypeScript Founder Command Center and future primary web-product track.
2. **Same-Day Customer Growth Pack Android/Web Sales OS (`sales-engine-app/` + `sales-engine/`)** — installable mobile-first PWA sales operating system with a live prospect feed, scripts, pipeline tracking, offline support, and canonical CRM workbook.
3. **Legacy/compatibility WordPress FDOS Value Leak Scanner** — preserved source, evidence governance, experiments, Shopify verification, deployment QA, and production-verification tooling. WordPress is no longer required for feature development on the standalone web/Sales OS tracks.

### Same-Day Customer Growth Pack source-of-truth rules

- App feed: `sales-engine-app/data/leads.json`
- Canonical CRM workbook: `sales-engine/Same-Day-Customer-Growth-Pack-Live-CRM.xlsx`
- Human-readable audit artifacts: `sales-engine/README.md`, dated CSV snapshots, and outreach scripts.
- Refresh both the JSON feed and canonical workbook together when genuinely new verified prospect research is added.
- Never overwrite genuine pipeline/contact history (contact timestamps, replies, opt-outs, quotes, payment, fulfillment, notes, or real status changes) during a research refresh.
- Never invent contacts, outreach, replies, payments, customers, revenue, or performance results.
- Keep dated source URLs and verification dates for every research-derived opportunity.

## Current release state

The repository contains the FDOS Value Leak Scanner **v1.0.1 launch candidate**, a new standalone Founder OS web track, and the Same-Day Customer Growth Pack Sales OS. The WordPress software includes the public scanner, evidence governance, live website evidence adapter, opportunity ranking, Value Sprints, experiments, conversion intelligence, Shopify HMAC webhook evidence, Founder Command Center, P1 integration QA, P2 Launch Gate, P3 Production Verification, health/retention/export controls, rollback guidance, safe uninstall behavior, CI, and an installable WordPress ZIP build workflow.

The standalone web/Sales OS tracks should continue independently of WordPress unless a feature explicitly requires the legacy plugin.

## Research & Evidence Integrity Layer — NEVER REMOVE OR WEAKEN

Every major strategic claim must be classifiable as:

- **E1 — Verified Fact**
- **E2 — Current External Evidence**
- **E3 — Customer-Derived Evidence**
- **E4 — Internal Observation**
- **E5 — Strategic Hypothesis**
- **E6 — Financial Model Assumption**
- **E7 — Forecast**
- **E8 — Illustrative Example**

Rules:

1. Attribute externally derived claims to sources.
2. State uncertainty when evidence is insufficient.
3. Never fabricate market size, competitor pricing, customers, revenue, conversions, adoption, testimonials, regulations, partnerships, product capabilities, ROI, profit, or product-market fit.
4. Shopify-reported order value is not automatically profit or attributable FDOS revenue.
5. Before/after KPI movement is not automatically causation.
6. Build/test success is not production verification.
7. Preserve evidence confidence and limitations wherever the product already records them.
8. Prospect discovery is E2/current external evidence only when the supporting source is current and verifiable; a prospect becoming `Contact Ready` is not evidence that outreach occurred.

## What is already implemented

Before proposing new work, inspect the repository. Preserve completed behavior, especially:

- Standalone Founder OS web shell in `web/`
- Same-Day Customer Growth Pack Sales OS PWA in `sales-engine-app/`
- live JSON prospect feed and canonical CRM workbook
- sales scripts, pipeline-state model, offline service worker, PWA manifest, and GitHub Pages deployment workflow
- WordPress public Value Leak Scanner shortcode `[fdos_value_leak_scanner]`
- founder inputs: website URL, Facebook/business URL, business idea
- safe live website retrieval and E2 evidence findings
- Facebook permission boundary (do not scrape/infer page content merely from a submitted Facebook URL)
- opportunity scoring and ranked findings
- Value Sprint generation
- evidence event ledger and E1–E8 taxonomy
- allowlisted first-party conversion events
- Shopify HMAC verification and webhook deduplication
- `orders/create` and `orders/paid` normalization
- experiment creation/update/start/report and event correlation
- Founder Command Center
- P1 internal Integration QA
- P2 production Launch Gate
- P3 real production verification
- retention controls, owner export, health reporting, deployment logs
- safe uninstall: destructive deletion is opt-in, not default
- public rendering that avoids injecting API data through `innerHTML`
- CI PHP lint matrix
- automated WordPress ZIP + SHA-256 build workflow.

## Current production priorities

For the standalone tracks, prioritize functional deployment and persistence over additional speculative modules:

1. Keep the Sales OS feed and CRM synchronized without damaging pipeline history.
2. Get the Sales OS PWA publicly deployed and verify the live GitHub Pages URL.
3. Add persistent/authenticated storage where local-only state would otherwise be lost.
4. Connect the standalone Founder OS web track to permissioned evidence adapters and persistent workspaces.
5. Capture genuine external usage evidence and one complete Value Sprint / customer-growth workflow before claiming commercial validation.

The legacy WordPress production path remains available but is not a blocker for ongoing web/Sales OS feature development.

## Development rules

- Read `README.md`, `AGENTS.md`, component READMEs, security notes, and relevant GitHub issues/workflows before major changes.
- Inspect existing code before implementing anything; do not duplicate existing functionality.
- Preserve backward compatibility unless a migration is explicitly justified.
- Run relevant tests/CI after changes and never claim runtime success unless it actually ran.
- Never commit credentials, `.env`, `wp-config.php`, Shopify client secrets, access tokens, passwords, private keys, or production customer data.
- Use a branch + pull request for substantial or risky changes when practical; explain evidence and rollback impact.
- Update documentation and release metadata when behavior changes.
- Do not mark a production checkbox complete without evidence from the real runtime.
- Do not silently delete or rewrite historical evidence or sales-pipeline history.

## Commercial priorities

The first market objective is one complete, real evidence loop:

**verified prospect/visitor → specific offer → useful deliverable/Value Sprint → baseline → action → measured result → evidence classification → KEEP / REVISE / REVERT → next action**

Potential monetization ladders are hypotheses to test, not proven funnels. The Same-Day Customer Growth Pack currently uses a **$150 flat starter offer** in its canonical CRM/scripts; that is an offer configuration, not revenue evidence.

Track qualified scans/prospects, actual contacts, replies, CTA progression, paid conversions, fulfillment, repeat use, retention, and referrals. Do not manufacture targets/results.

## Definition of truthful completion

A component is deployable only when its real public runtime works and required data flows are verified. Product-market fit, profitability, recurring revenue, scalable acquisition, and durable retention can never be checked off merely because code, prospect research, or pipeline estimates exist.

## When asked to “continue” or refresh status

Choose the **highest-value unfinished milestone**, execute as much as tools/access allow, preserve completed work, and clearly distinguish:

- what was actually changed,
- what was actually tested,
- what is current but unproven commercially,
- what remains blocked by external access/infrastructure,
- what evidence would close the blocker.

For Sales OS refreshes, compare the JSON feed and CRM before writing. If no new verified research exists, do not churn the files simply to change a date. If new research exists, merge it while preserving genuine pipeline/contact history.

Do not end with invented progress. Keep the receipts.