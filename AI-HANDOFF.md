# FDOS Multi-AI Continuation Handoff

Use this document when opening Founder Dynasty OS in ChatGPT, Grok, Perplexity, or another AI assistant. `AGENTS.md` remains the canonical technical/project instruction file in this repository.

Repository: `anastaysia94-sudo/founder-os`

## Shared context for every assistant

Founder Dynasty OS 10.0 (FDOS), under SmartPickShop Holdings, is a Business Outcome Operating System centered on evidence-grounded business diagnosis and measurable experiments. The current repository is the v1.0.1 WordPress launch candidate. Preserve all existing completed work and the E1–E8 Research & Evidence Integrity Layer.

The highest-value unfinished milestone is **real production deployment and external verification**, not another arbitrary module. A public HTTPS WordPress endpoint is required to execute the real P1/P2/public scanner/P3 launch path. Never fabricate deployment, customers, revenue, conversions, ROI, product-market fit, or external validation.

Before working, read:

1. `AGENTS.md`
2. `README.md`
3. `LAUNCH-TODAY.md`
4. `LAUNCH-RUNBOOK.md`
5. `SECURITY.md`
6. GitHub Issue #1

Then inspect the code relevant to the task before changing anything.

---

## Prompt for ChatGPT / Codex

> Continue Founder Dynasty OS 10.0 from the repository `anastaysia94-sudo/founder-os`. Read `AGENTS.md` first and treat it as the canonical handoff, then read the launch/security docs and Issue #1. Inspect the actual repository before proposing work. Preserve everything already implemented and preserve the E1–E8 Research & Evidence Integrity Layer. Do not invent deployment, users, customers, revenue, results, ROI, causation, product-market fit, or capabilities. Choose the highest-value unfinished milestone and execute as much as your available tools permit. Prioritize real WordPress production deployment, P1/P2 runtime proof, public scanner validation, Shopify HMAC webhook proof, P3 verification, and the first genuine external Value Sprint over new speculative modules. Make code changes directly in GitHub when authorized, keep secrets out of source control, run/inspect tests and CI, update documentation when behavior changes, and report exactly what changed, what was actually tested, what remains externally blocked, and what evidence closes the blocker.

### ChatGPT/Codex working style

Use connected GitHub tools when available rather than asking the user to manually copy files. Use web research for current WordPress/Shopify facts when needed and prefer official documentation. If production/browser/hosting access is unavailable, improve only the pieces that genuinely reduce the deployment gap; do not call the project live.

---

## Prompt for GitHub Copilot

Copilot should automatically receive `.github/copilot-instructions.md` where supported. If a chat prompt is needed, use:

> Work on `anastaysia94-sudo/founder-os`. Read `AGENTS.md` and `.github/copilot-instructions.md` before editing. Preserve the E1–E8 evidence model and existing FDOS behavior. Inspect before implementing; do not duplicate modules. Prioritize Issue #1 and launch-readiness work. Never commit secrets or production customer data. Keep PHP/WordPress compatibility, security, HMAC verification, deduplication, safe rendering, retention, and safe-uninstall boundaries intact. Run relevant validation and clearly separate actual test evidence from assumptions.

---

## Prompt for Grok

> Continue the Founder Dynasty OS 10.0 project from `anastaysia94-sudo/founder-os`. First read `AGENTS.md`, then `README.md`, `LAUNCH-TODAY.md`, `LAUNCH-RUNBOOK.md`, `SECURITY.md`, and Issue #1. Treat repository code and verified runtime evidence as authoritative over conversational assumptions. Preserve completed work and the E1–E8 Research & Evidence Integrity Layer. Do not fabricate commercial or technical results. Focus on the highest-value unfinished launch milestone: public HTTPS WordPress deployment → real P1 → real P2 → logged-out public scanner → verified evidence events → Shopify app-owned HMAC webhook → P3 `production_verified=true` → first genuine external Value Sprint. If you have GitHub write access, commit changes through a focused branch/PR or authorized direct update; if not, produce precise patches. Never expose credentials. For any current factual research, cite primary/official sources and distinguish external evidence from hypothesis. End each work cycle with actual changes/tests/blockers/evidence needed, not generic suggestions.

### Grok research role

Grok can be especially useful for broad current-market discovery, but external claims must still be source-attributed and mapped to the FDOS evidence boundary. Social/community observations are evidence inputs, not automatic facts about customer demand or willingness to pay.

---

## Prompt for Perplexity

> Continue research and launch support for Founder Dynasty OS 10.0 using `anastaysia94-sudo/founder-os` as the project source of truth. Read `AGENTS.md` plus the README, launch runbooks, security notes, and Issue #1 before recommending changes. Preserve the E1–E8 Research & Evidence Integrity Layer. Your priority is evidence-backed launch execution and commercial validation, not speculative feature generation. For WordPress, Shopify, security, APIs, regulations, market/competitor/pricing research, prefer current primary sources and provide source URLs/citations, publication/update dates when available, limitations, and the exact FDOS claim each source supports. Separate verified/current evidence from hypotheses, forecasts, assumptions, examples, and customer-derived evidence. Never infer revenue, ROI, causation, PMF, or customer success from traffic/order/KPI signals alone. When code changes are necessary and GitHub write access exists, inspect the existing implementation first and preserve compatibility/security; otherwise provide an implementation-ready patch and test plan. Always state what is verified, what remains uncertain, and what next evidence would change the decision.

### Perplexity research output format

For substantial research, return a compact evidence table with:

- claim/question
- evidence class
- primary source
- source date
- confidence
- limitation
- product/strategy implication
- recommended validation step.

Do not turn a research summary into a claim that implementation or deployment occurred.

---

## GitHub contribution protocol for any AI

1. Confirm the repository and current branch/HEAD.
2. Read `AGENTS.md` and task-relevant source files.
3. Check existing issues/workflows before creating duplicates.
4. For meaningful/risky work, prefer a focused branch + PR when tool access permits.
5. Never commit secrets. Examples must contain obvious placeholders only.
6. Keep commits scoped and messages descriptive.
7. Run the relevant validation. For PHP changes, at minimum lint changed PHP and inspect GitHub CI.
8. Do not merge or label production gates complete without the required evidence.
9. Update docs/changelog/release metadata when behavior or deployment requirements change.
10. Leave the repository in a state another assistant can continue from without relying on hidden chat history.

## Canonical continuation summary

**Built:** FDOS v1.0.1 launch candidate and GitHub CI/build pipeline.

**Not yet proven:** real public WordPress deployment, real production P1/P2, live public scanner runtime, real Shopify webhook receipt by production FDOS, P3 green, external Value Sprint, revenue/PMF.

**Next milestone:** close GitHub Issue #1 with real deployment evidence.

**Rule:** Build weird. Measure what works. Keep the receipts.