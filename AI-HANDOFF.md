# Founder Dynasty OS 10.0 — Multi-AI Continuation Handoff

Use this document when continuing Founder Dynasty OS in ChatGPT, Codex, GitHub Copilot, Grok, Perplexity, or another capable assistant. `AGENTS.md` is the canonical repository-wide operating instruction file. `PRODUCT-VISION.md` is the canonical product-direction document. `PROJECT-STATUS.md` and `PRODUCTION-USER-VALIDATION.md` define the current verification boundary.

Repository: `anastaysia94-sudo/founder-os`

## Product identity every assistant must preserve

Founder Dynasty OS 10.0 (FDOS), under **SMARTPICKSHOP HOLDINGS**, is the operating intelligence of a business from a raw idea through validation, building, launch, operations, customers, finance, growth, systemization, scaling, portfolio management, enterprise value, and succession.

It is **not**:
- a Sales OS with extra tabs;
- a CRM with a founder-themed skin;
- a generic dashboard;
- merely a WordPress plugin;
- a project manager pretending to understand the business.

The Same-Day Customer Growth Pack / Sales OS is one important module under:

`Founder Dynasty OS → Customers & Growth → Sales OS`

Sales does not own the whole damn city.

## Canonical operating loop

`UNDERSTAND → FIND THE HIGHEST-VALUE PROBLEM / OPPORTUNITY → SEPARATE EVIDENCE FROM ASSUMPTIONS → CHOOSE AN ACTION → EXECUTE → MEASURE → LEARN → KEEP / REVISE / REVERT → UPDATE BUSINESS MEMORY / MODEL → CHOOSE THE NEXT ACTION`

## Permanent Evidence model

Preserve E1–E8 everywhere:

- E1 Verified Fact
- E2 Current External Evidence
- E3 Customer-Derived Evidence
- E4 Internal Observation
- E5 Strategic Hypothesis
- E6 Financial Model Assumption
- E7 Forecast
- E8 Illustrative Example

Never fabricate or silently upgrade evidence. Do not invent customers, replies, outreach, payments, revenue, ROI, adoption, product-market fit, results, capabilities, partnerships, or validation.

A price/offer field is not revenue. A sent email is not a customer. A green deployment is not human acceptance. A test transaction is not commercial evidence.

## Current primary product track

The primary standalone product is the Next.js / React / TypeScript application under `web/`, backed by Supabase.

Current major surfaces:

- `/` — Founder Command Center: Business Stage, Business DNA, Value Map, Opportunities, Decisions, Risks, Business Memory, Evidence Inbox, Missing Intelligence and the whole-OS map.
- `/intelligence` — Idea Lab, Business X-Ray, What Am I Missing?, Value Sprints and KEEP / REVISE / REVERT.
- `/workbench` — Finance Center, Product & Offer Lab, Operations & Execution.
- `/strategy` — Business Model Lab, Customer Intelligence, Marketing & Distribution, Asset Map, Founder Attention, Scenario Lab, Portfolio / Dynasty Mode.
- `/glossary` — searchable plain-English definitions for business, Evidence and technical terms.
- `/acceptance` — read-only noindex production acceptance diagnostics.
- `/sales-engine-app` — bridge to the separately deployed Customers & Growth → Sales OS.

The older WordPress/plugin implementation is legacy/compatibility work unless a task explicitly targets it. **Do not steer the primary product back toward WordPress because an old document said so.**

## Shared Business Record

All major modules must connect to the same authenticated, account-owned Business Record and, where appropriate, Evidence, a Decision, Risk, Opportunity, Value Sprint, Asset, measurable outcome, or Business Memory.

Current production FDOS persistence spans 19 RLS-enabled tables across:
- core Business Record + Evidence;
- Value / Opportunities / Decisions / Risks / Memory;
- Value Sprints;
- Finance / Offers / Initiatives;
- Business Model / Customer Intelligence / Distribution;
- Assets / Scenarios / Portfolio / Founder Attention.

Do not create a separate mini-database for a new module just because it is convenient. A business gets one reality, not seven feuding data kingdoms.

## Current production state

Read `PROJECT-STATUS.md` before changing code. At the 2026-09-16 checkpoint:

- broad standalone source: **complete for the current planned scope**;
- standalone web CI: **passing**;
- production Railway runtime: **verified**;
- live production backend acceptance: **verified** with ephemeral data, RLS visibility checks, Evidence capture, Proposal approve/reject and zero synthetic rows left behind;
- global auth/privacy boundary: **implemented and deployed** so local unsaved drafts are cleared across sign-out/account switches;
- genuine production-user/browser acceptance: **still incomplete**;
- commercial evidence: must remain separate.

Accepted privacy-hardened web code revision:

`8cf11db3c798f5a90d19e892c217ab88d79232e6`

Railway deployment recorded in `PROJECT-STATUS.md`:

`7c04e794-081c-4268-89da-7a8ccca94941`

Do not assume those identifiers remain current forever. Verify `main`, CI and Railway before making a current-status claim.

## Highest-value unfinished milestone

**Genuine production-user acceptance, not another department.**

The remaining proof loop is:

`open current production → real sign in → create/load Business Record → save Business DNA → exercise core Value / Decision / Risk / Opportunity / Memory flows → Idea Lab / X-Ray → run a real Value Sprint → /acceptance → sign out → confirm private state + drafts clear → fresh sign in → verify restore → browser Evidence capture → approve + reject → Workbench writes → Strategy/Dynasty writes → second genuine account isolation → mobile + desktop visual acceptance → KEEP / REVISE / REVERT`

Do not mark those steps complete merely because source code, SQL or CI suggests they should work.

## Read before changing anything

1. `AGENTS.md`
2. `PRODUCT-VISION.md`
3. `PROJECT-STATUS.md`
4. `PRODUCTION-USER-VALIDATION.md`
5. `FDOS-PRODUCTION-BACKEND-ACCEPTANCE-2026-09-16.md`
6. `README.md`
7. task-relevant source files

Use `LAUNCH-*`, legacy WordPress docs, or historical issue material only when the task actually targets those legacy surfaces.

---

## ChatGPT / Codex continuation prompt

> Continue Founder Dynasty OS 10.0 from `anastaysia94-sudo/founder-os`. Read `AGENTS.md`, `PRODUCT-VISION.md`, `PROJECT-STATUS.md`, and `PRODUCTION-USER-VALIDATION.md` first. Treat the standalone `web/` product and shared Supabase Business Record as the primary product track. Preserve the E1–E8 Evidence model and the full any-business lifecycle. Keep Sales OS under Customers & Growth instead of centering the product around sales. Inspect the current repository, CI and production state before changing anything. Execute the highest-value unfinished milestone rather than inventing another generic module. Never fabricate users, customer evidence, outreach, replies, payments, revenue, ROI, PMF, or acceptance. Make authorized code changes directly, test them, deploy when appropriate, verify the exact deployed revision, and update the status/validation docs when the evidence boundary changes. Distinguish SOURCE COMPLETE, CI VERIFIED, PRODUCTION RUNTIME VERIFIED, LIVE BACKEND ACCEPTANCE VERIFIED, PRODUCTION USER VERIFIED, and COMMERCIAL EVIDENCE.

## GitHub Copilot continuation prompt

> Work on `anastaysia94-sudo/founder-os`. Read `AGENTS.md`, `PRODUCT-VISION.md`, `.github/copilot-instructions.md`, and `PROJECT-STATUS.md` before editing. The primary product is the standalone Next.js/Supabase Founder Dynasty OS, not the legacy WordPress plugin. Preserve E1–E8, account isolation, the shared Business Record, Business Memory, and the Sales OS neighborhood boundary. Inspect before adding files; avoid duplicate modules. Run relevant tests and never promote assumptions or test data into customer/revenue claims.

## Grok continuation prompt

> Continue Founder Dynasty OS 10.0 from `anastaysia94-sudo/founder-os`. Use `AGENTS.md`, `PRODUCT-VISION.md`, `PROJECT-STATUS.md`, and `PRODUCTION-USER-VALIDATION.md` as the current handoff. The primary product is the standalone web OS for any business stage. Keep Sales OS nested under Customers & Growth. Preserve E1–E8 and explicitly label outside research, hypotheses, forecasts and customer evidence. Focus current research or implementation on a real unresolved product/validation need rather than generic feature generation. Never infer payment, demand, ROI, PMF or success from internal tests or lead lists.

## Perplexity continuation prompt

> Continue research/verification support for Founder Dynasty OS 10.0 using `anastaysia94-sudo/founder-os` as source of truth. Read the canonical vision/status/validation docs first. Prefer current primary sources for external facts and map each claim to E1–E8 with date, source, confidence and limitation. The standalone web OS is primary; legacy WordPress is not the product center. Do not convert market research, traffic, offer prices, pipeline status or internal tests into customer/revenue claims. Research should change a Decision, Risk, Opportunity, Business Model hypothesis, Scenario, Value Sprint or Business Memory entry, not merely create a decorative report.

## Contribution protocol for any AI

1. Confirm repository, current `main`, and task-relevant deployed revision.
2. Read canonical vision/status docs before editing.
3. Inspect existing implementations before creating new modules.
4. Preserve the shared Business Record and E1–E8 truth boundary.
5. Keep secrets, credentials and private user/customer data out of source control and responses.
6. Use focused commits with descriptive messages.
7. Run relevant TypeScript/build/CI/database validation.
8. Never mark browser/human acceptance complete without browser/human evidence.
9. Never mark commercial outcomes complete without genuine external evidence.
10. Update `PROJECT-STATUS.md` / `PRODUCTION-USER-VALIDATION.md` when behavior or proof materially changes.
11. Leave the repo continuable without hidden chat history.

## Canonical continuation summary

**Built:** broad standalone Founder Dynasty OS around a shared Business Record, including Command Center, Business DNA/Stage, Value, Opportunities, Decisions, Risks, Memory, Idea Lab, X-Ray, Missing Intelligence, Value Sprints, Finance, Offers, Operations, Strategy, Customers, Distribution, Assets, Founder Attention, Scenarios, Portfolio/Dynasty, Glossary, Evidence review and Sales OS integration.

**Verified technically:** CI, production Railway runtime, 19-table production-policy backend persistence/RLS smoke test, website Evidence capture/approve/reject backend loop, cleanup, and auth/privacy source boundary.

**Not yet genuinely proven:** full real browser workflow across session/device/account boundaries and external commercial outcomes.

**Next milestone:** complete production-user/browser acceptance of what already exists before adding another shiny organizational chart to the software.
