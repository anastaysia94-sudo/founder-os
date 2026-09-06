# Founder Dynasty OS 10.0 — FDOS Value Leak Scanner

Founder Dynasty OS (FDOS) is a Business Outcome Operating System project under SmartPickShop Holdings. The v1.0.1 launch candidate packages a WordPress-based Value Leak Scanner, evidence governance, opportunity ranking, Value Sprints, experiment tracking, conversion intelligence, Shopify webhook evidence, launch diagnostics, and production verification.

## Core operating loop

Founder input → evidence collection → Value Leak detection → opportunity ranking → recommended experiment → Value Sprint → KPI measurement → evidence classification → KEEP / REVISE / REVERT → next-best action.

## Research & Evidence Integrity Layer

FDOS preserves explicit evidence classes:

- E1 Verified Fact
- E2 Current External Evidence
- E3 Customer-Derived Evidence
- E4 Internal Observation
- E5 Strategic Hypothesis
- E6 Financial Model Assumption
- E7 Forecast
- E8 Illustrative Example

Externally derived claims require source attribution, uncertainty must be explicit where evidence is insufficient, and the project must not fabricate market size, pricing, results, testimonials, adoption statistics, regulations, partnerships, or product capabilities.

## AI continuation / project handoff

This repository is designed so the project can be continued without relying on hidden chat history:

- **`AGENTS.md`** — canonical project state, operating rules, evidence boundaries, implemented capabilities, production blocker, development rules, and definition of truthful completion.
- **`.github/copilot-instructions.md`** — repository instructions for GitHub Copilot.
- **`AI-HANDOFF.md`** — ready-to-use continuation prompts and working instructions for ChatGPT/Codex, GitHub Copilot, Grok, and Perplexity, plus a shared GitHub contribution protocol.

Any AI assistant continuing FDOS should read `AGENTS.md` first, inspect the actual repository, preserve completed work, and prioritize the highest-value unfinished milestone rather than generating duplicate modules.

## Launch status

This repository contains the FDOS v1.0.1 launch candidate source. Build validation does not equal production verification. A real production deployment still requires installation on a public HTTPS WordPress host, passing P1/P2 runtime gates, configuring the Shopify app client secret server-side, receiving an HMAC-verified Shopify webhook, and passing P3 production verification.

See `LAUNCH-TODAY.md`, `LAUNCH-RUNBOOK.md`, and GitHub Issue #1 for the deployment sequence.