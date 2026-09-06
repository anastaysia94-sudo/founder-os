# Founder Dynasty OS — AI Continuation Instructions

This file is the canonical handoff for AI coding/research assistants working on **Founder Dynasty OS 10.0 (FDOS)** under **SmartPickShop Holdings**.

Supported assistants include ChatGPT/Codex, GitHub Copilot, Grok, Perplexity, and other capable coding/research agents.

## Mission

FDOS is a **Business Outcome Operating System**, not a template bundle. Its operating loop is:

**Founder input → evidence collection → Value Leak detection → opportunity ranking → recommended experiment → Value Sprint → KPI measurement → evidence classification → KEEP / REVISE / REVERT → next-best action.**

Optimize for measurable customer outcomes, implementation, retention, recurring revenue potential, licensing potential, referrals, and durable product value. Never invent commercial results.

## Current release state

The repository contains the FDOS Value Leak Scanner **v1.0.1 launch candidate**. The software includes the public scanner, evidence governance, live website evidence adapter, opportunity ranking, Value Sprints, experiments, conversion intelligence, Shopify HMAC webhook evidence, Founder Command Center, P1 integration QA, P2 Launch Gate, P3 Production Verification, health/retention/export controls, rollback guidance, safe uninstall behavior, CI, and an installable WordPress ZIP build workflow.

The source/build milestone is substantially complete. **Do not create arbitrary new modules just to show progress.** The highest-value unfinished milestone is real production deployment and external evidence.

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

## What is already implemented

Before proposing new work, inspect the repository. Preserve completed behavior, especially:

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

## Current production blocker

Do not falsely claim FDOS is publicly deployed. The outstanding milestone is a confirmed **public HTTPS WordPress production endpoint** where v1.0.1 can be installed and runtime gates executed.

Once a real WordPress URL exists, prioritize this sequence:

1. Back up the host/database.
2. Install the repository-built FDOS plugin ZIP.
3. Run **P1 Integration QA** in the real WordPress runtime; require PASS.
4. Run **P2 Launch Gate**; resolve every blocking failure.
5. Publish a public page containing `[fdos_value_leak_scanner]`.
6. Test logged out on mobile and desktop.
7. Confirm scanner evidence events appear in Founder Command Center.
8. Check WordPress Site Health and resolve critical issues.
9. Configure the canonical SmartPickShop `*.myshopify.com` domain in Production Verify.
10. Configure `FDOS_VLS_SHOPIFY_WEBHOOK_SECRET` server-side using the **client secret of the Shopify app that owns the HTTPS webhook subscriptions**. Never commit it.
11. Subscribe Shopify `orders/create` and `orders/paid` to `/wp-json/fdos/v1/shopify/webhook`.
12. Receive at least one genuine HMAC-verified Shopify webhook.
13. Run P3 until `production_verified=true`.
14. Capture the first genuine external Value Sprint: baseline → action → KPI result → KEEP/REVISE/REVERT.

The public core scanner may launch after P1/P2 and logged-out testing even before Shopify telemetry/P3 is complete, provided its status is represented accurately.

## Development rules

- Read `README.md`, `LAUNCH-TODAY.md`, `LAUNCH-RUNBOOK.md`, `SECURITY.md`, and GitHub Issue #1 before major changes.
- Inspect existing code before implementing anything; do not duplicate existing functionality.
- Preserve backward compatibility unless a migration is explicitly justified.
- Keep WordPress minimums aligned with the plugin headers (currently WordPress 6.0+, PHP 7.4+ unless intentionally changed and tested).
- Run PHP lint/tests after PHP changes. Keep CI green across the supported matrix.
- Never commit credentials, `.env`, `wp-config.php`, Shopify client secrets, access tokens, passwords, private keys, or production customer data.
- Use a branch + pull request for substantial or risky changes when practical; explain the evidence and rollback impact.
- Update documentation and changelog/release metadata when behavior changes.
- Do not mark a production checkbox complete without evidence from the real runtime.
- Do not silently delete or rewrite historical evidence.

## Commercial priorities after technical launch

The first market objective is not more architecture. It is one complete, real evidence loop:

**visitor → scan → useful finding → offer → Value Sprint → baseline → action → measured result → evidence classification → KEEP/REVISE/REVERT → next action**

Potential monetization ladder is a hypothesis to test, not a proven funnel:

**Free Value Leak Scan → Paid Deep Diagnostic → Paid Value Sprint → FDOS Pro → FDOS Business/Team → implementation services → consultant/agency tooling → licensing.**

Track qualified scans, useful findings, CTA progression, Value Sprint starts/completions, paid conversions, repeat use, retention, and referrals. Do not manufacture targets/results.

## Definition of truthful completion

Technical launch can be called complete only when there is evidence that the public HTTPS site works, the scanner works logged out, P1 passes, P2 has no blocking failures, critical Site Health issues are resolved or explicitly accepted, and production events are recorded correctly. Strong end-to-end production verification additionally requires the Shopify/P3 evidence path.

Product-market fit, profitability, recurring revenue, scalable acquisition, and durable retention can never be checked off merely because code exists.

## When asked to “continue”

Choose the **highest-value unfinished milestone**, execute as much as tools/access allow, preserve completed work, and clearly distinguish:

- what was actually changed,
- what was actually tested,
- what remains blocked by external access/infrastructure,
- what evidence would close the blocker.

Do not end with invented progress. Keep the receipts.