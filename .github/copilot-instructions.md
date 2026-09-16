# GitHub Copilot Instructions — Founder Dynasty OS 10.0

Follow repository-wide `AGENTS.md` as the canonical operating instruction file. Read `PRODUCT-VISION.md` and `PROJECT-STATUS.md` before substantial product work.

## Product identity

Founder Dynasty OS is the operating intelligence of a business from raw idea through validation, launch, operation, growth, portfolio management, enterprise value and succession.

The **primary product track is the standalone Next.js / React / TypeScript application under `web/`, backed by Supabase.** The legacy WordPress/plugin surface is compatibility/history unless a task explicitly targets it.

Do not drift back toward:
- a sales-centered product;
- a CRM with extra panels;
- a generic SaaS dashboard;
- a WordPress-first architecture;
- disconnected mini-apps with incompatible business state.

The Same-Day Customer Growth Pack / Sales OS belongs under:

`Founder Dynasty OS → Customers & Growth → Sales OS`

## Shared Business Record rule

Major modules should attach to the same authenticated, account-owned Business Record and connect to Evidence, Value, a Decision, Risk, Opportunity, Value Sprint, Asset, measurable outcome, or Business Memory where appropriate.

Before adding a table or module, inspect existing `web/lib/*`, current migrations, and the 19-table FDOS data model. Avoid duplicate records that describe the same business reality in different places.

## Evidence integrity

Preserve the permanent E1–E8 Research & Evidence Integrity Layer:

- E1 Verified Fact
- E2 Current External Evidence
- E3 Customer-Derived Evidence
- E4 Internal Observation
- E5 Strategic Hypothesis
- E6 Financial Model Assumption
- E7 Forecast
- E8 Illustrative Example

A status change does not automatically upgrade an evidence class. A price field is not revenue. A test record is not a customer. A passing build is not production-user acceptance.

Never fabricate contacts, outreach, replies, payments, customers, revenue, ROI, PMF, capabilities, deployment or test results.

## Current major standalone surfaces

- `/` — Founder Command Center / Business Stage / Business DNA / Value / Decisions / Risks / Opportunities / Memory / Evidence
- `/intelligence` — Idea Lab / Business X-Ray / What Am I Missing? / Value Sprints
- `/workbench` — Finance / Product & Offer / Operations
- `/strategy` — Business Model / Customer Intelligence / Distribution / Assets / Founder Attention / Scenarios / Portfolio-Dynasty
- `/glossary` — plain-English glossary
- `/acceptance` — read-only noindex production diagnostics
- `/sales-engine-app` — bridge to Customers & Growth → Sales OS

## Auth and privacy

Preserve account-scoped RLS and the global `AuthPrivacyGuard` mounted in the root layout. The guard exists because unsaved local React drafts must not survive sign-out or direct account switches even when persisted rows are correctly tenant-scoped.

When adding new client state:
- assume it may contain private business information;
- ensure it is cleared across auth identity boundaries;
- do not put secrets/private business content in long-lived browser storage unless explicitly designed, scoped and justified;
- do not weaken RLS to make a UI problem disappear.

## Implementation rules

When proposing or editing code:

- Inspect existing implementations before generating new files/classes.
- Prefer extending shared domain/store layers over duplicating concepts.
- Keep TypeScript strict and the Next.js production build green.
- Keep external Evidence source attribution attached where applicable.
- Preserve founder approval before Evidence-derived proposals alter canonical records.
- Use plain English in user-facing UI; specialized terms must remain explainable through the glossary/tooltips.
- Never use unsafe rendering for untrusted source content.
- Never commit secrets, tokens, passwords, private customer data, or real environment values.
- Run relevant TypeScript/build/CI checks after web changes.
- After database changes, preserve RLS, ownership relationships, Evidence integrity and rollback/migration safety; inspect Supabase advisors.
- Update status/validation docs when the technical or evidence boundary materially changes.

## Completion / verification states

Keep these distinct:

1. **SOURCE COMPLETE** — implementation exists.
2. **CI VERIFIED** — automated checks actually passed.
3. **PRODUCTION RUNTIME VERIFIED** — exact accepted source is deployed and healthy.
4. **LIVE BACKEND ACCEPTANCE VERIFIED** — production-policy persistence/RPC behavior was exercised.
5. **PRODUCTION USER VERIFIED** — a genuine authenticated user completed the deployed UI workflow across required session/device/account boundaries.
6. **COMMERCIAL EVIDENCE** — real external customer/user behavior exists.

Do not collapse those states because the words all contain reassuring nouns.

## Current priority

At the 2026-09-16 checkpoint, the broad standalone OS, CI, Railway runtime and live backend acceptance are already substantially complete. The highest-value unfinished milestone is **genuine production-user/browser acceptance of the existing system**, not speculative feature expansion.

Before working, read the current status rather than trusting this file's date forever:

- `PROJECT-STATUS.md`
- `PRODUCTION-USER-VALIDATION.md`
- `FDOS-PRODUCTION-BACKEND-ACCEPTANCE-2026-09-16.md`

When the user says “continue,” execute the highest-value unfinished milestone those files actually show.
