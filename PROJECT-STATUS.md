# Founder Dynasty OS 10.0 — Project Status

Updated: 2026-09-16

**Parent:** SmartPickShop Holdings  
**Canonical repository:** `anastaysia94-sudo/founder-os`

## Product direction

Founder Dynasty OS is a broad business operating intelligence system for any stage from raw idea through operating company, portfolio, long-term enterprise value, and succession.

The Same-Day Customer Growth Pack / Sales OS remains a major module under **Customers & Growth**, not the identity of the product.

Canonical product statement:

> **Founder Dynasty OS is the operating intelligence of the business.**

## Current standalone architecture

The primary `web/` product supports **multiple private, account-owned Business Records**. One Business Record is active at a time. Command Center, Intelligence, Workbench and Strategy/Dynasty all operate on that selected business.

A global Business Switcher and the private `/portfolio` registry let the founder create and move between independent businesses/ideas without combining their Business DNA, evidence, decisions, risks, opportunities, execution or memory.

### `/` — Founder Command Center
- Business Stage + Business DNA
- current goal and stage guidance
- Value Map
- Opportunity Engine
- Decision Engine
- Risk Center
- Business Memory
- E1–E8 evidence labels
- website Evidence capture + founder approval queue
- What Am I Missing? summary
- whole-OS neighborhood map
- Sales OS correctly nested under Customers & Growth

### `/intelligence` — Founder Intelligence Layer
- Idea Lab
- Business X-Ray
- detailed What Am I Missing? engine
- Value Sprints
- hypothesis → action → measure → result → KEEP / REVISE / REVERT
- top Opportunity → Sprint handoff
- Business Memory learning loop

### `/workbench` — Build & Run Workbench
- Finance Center
- E6 financial model assumptions
- Product & Offer Lab
- Draft / Testing / Active / Retired offer states
- Operations & Execution
- Planned / Active / Blocked / Done initiatives
- shared Business Memory updates

### `/strategy` — Strategy / Dynasty Workspace
- Business Model Lab
- Customer Intelligence
- Marketing & Distribution experiments
- Asset Map
- Founder Attention
- Scenario Lab
- Portfolio / Dynasty Mode
- strategy blind-spot questions

### `/portfolio` — Business Registry + Cross-Business Intelligence
Implemented:
- list account-owned Business Records;
- create another independent business or raw idea;
- choose starting Business Stage;
- switch the active business across the OS;
- descriptive account-wide totals for high risks, open decisions, blocked initiatives, pending Evidence review, running Value Sprints and planned Founder Attention;
- per-business opportunities, mapped assets, measured sprint loops and attention flags;
- no synthetic “best business” ranking, valuation, revenue score, PMF grade or forecast.

### Acceptance surfaces
- `/acceptance` — read-only production diagnostics for the **actual active Business Record**, account Business Registry, per-business RLS reads, and browser/runtime state.
- `/acceptance` can arm a browser-only Business A → Business B switch checkpoint in `sessionStorage`; after a real product switch/reload it can record that the browser moved between two owner-visible Business Records without writing synthetic business data.
- `/acceptance/restore` — snapshots the **selected active Business Record**, observes a genuine signed-out state, then requires the same account, same active business, and matching module row counts after sign-in.

These acceptance helpers still do not manufacture second-user isolation, visual acceptance, customer evidence, or a Value Sprint result.

### Other surfaces
- `/glossary` — searchable plain-English glossary.
- `/answers` — public answer-oriented search/AEO surface.
- `/sales-engine-app` — Customers & Growth → Sales OS bridge.

## Production data layer

The broad FDOS model has **19 RLS-enabled tables**:

### Core Business Record / Evidence
- `fdos_business_records`
- `fdos_value_items`
- `fdos_decisions`
- `fdos_risks`
- `fdos_opportunities`
- `fdos_memory`
- `fdos_evidence`
- `fdos_evidence_proposals`

### Learning / Build / Run
- `fdos_value_sprints`
- `fdos_financial_assumptions`
- `fdos_offer_hypotheses`
- `fdos_initiatives`

### Strategy / Assets / Dynasty
- `fdos_business_model_elements`
- `fdos_customer_insights`
- `fdos_distribution_experiments`
- `fdos_business_assets`
- `fdos_scenarios`
- `fdos_portfolio_theses`
- `fdos_attention_blocks`

Per-business child records remain scoped by authenticated user plus `business_id`. Relationship-aware RLS/Evidence constraints remain in place.

## Multi-business creation RPC

Production includes:

`public.fdos_create_business(text, text)`

Verified live properties:
- `SECURITY INVOKER`;
- owner derived from `auth.uid()`;
- all 12 Business Stages validated;
- independent Business Record created;
- initial E4 `Workspace created` Business Memory event written;
- `anon` execute: **false**;
- `authenticated` execute: **true**.

The first migration exposed an explicit `anon` execute grant that survived a `PUBLIC` revoke. A follow-up migration corrected it and the live privilege state was rechecked rather than assuming the SQL meant what we wished it meant.

## Evidence integrity

Permanent classes:
- E1 Verified Fact
- E2 Current External Evidence
- E3 Customer-Derived Evidence
- E4 Internal Observation
- E5 Strategic Hypothesis
- E6 Financial Model Assumption
- E7 Forecast
- E8 Illustrative Example

Rules preserved:
- manual Customer Intelligence notes are E4 unless genuine customer evidence exists;
- Business Model elements start E5;
- financial assumptions remain E6;
- scenarios remain E7;
- changing a UI status does not upgrade evidence class;
- external website observations remain E2 and require founder review before canonical changes;
- cross-business counts are descriptive records, not rankings/valuations;
- Sales OS offer values are not revenue and `paid` remains zero unless a real payment is recorded.

## Auth / private-state boundaries

The root `AuthPrivacyGuard` forces a hard client boundary on sign-out or direct auth-account switching.

The global Business Switcher also performs a hard page reload when changing the active Business Record. The selected business identifier is account-scoped in `sessionStorage` and revalidated against an owner-scoped database read before being trusted.

The acceptance helpers use browser-only `sessionStorage` checkpoints to observe real switch/restore boundaries without contaminating business records with synthetic acceptance rows.

## CI state

Current accepted second-account acceptance-helper revision:

`4d3da5bf2ea989b8aee37c2b4c911ed5f11eb0bd`

GitHub Actions on that merge:
- `Founder OS Standalone Web` run `36134679298`: **SUCCESS**;
- `PHP Lint` run `36134679441`: **SUCCESS**.

PR #18 also passed both workflows before merge. TypeScript, Next.js production build, dependency vulnerability gate, and the broad/multi-business source contract all passed.

This revision adds `/acceptance/account-isolation`, a no-write browser verifier that can prove a different genuine authenticated account sees zero Account A Business rows and zero Account A child rows across the FDOS module tables. The helper stores only temporary opaque IDs in `sessionStorage` while armed, then redacts those raw IDs after verification.

It does **not** mark second-user isolation complete until a different real browser account actually performs the test.

Earlier acceptance-proof stability revision `b3dc7a3c4a6ce97375b832bdab52cba93f1df342`, active-Business acceptance merge `a16a2cf3e0f8e11b6601f43a20559ca2a4e19c2c`, and Cross-Business Intelligence merge `d9dcbcd46e46a65f1b23e17d40a679bd0a53ad66` also passed their standalone web and PHP workflows.

## Production runtime

Railway service:
- service: `founder-dynasty-os-web`
- domain: `https://founder-dynasty-os-web-production.up.railway.app`
- environment: `production`
- root directory: `/web`
- healthcheck: `/api/health`
- watch pattern: `web/**`

Current production deployment:

`17d3a3ef-3fbf-40d2-8721-2d4167eff749`

Current deployed repository revision:

`4d3da5bf2ea989b8aee37c2b4c911ed5f11eb0bd`

Railway status: **SUCCESS**.

Observed production/deployment evidence on 2026-09-25:
- the exact second-account isolation revision was selected by Railway;
- production container started successfully with Next.js 16.3.4;
- container reached `Ready` in 73 ms;
- configured healthcheck remained `/api/health`;
- deployment reached `SUCCESS`;
- the main-branch CI for the exact revision passed TypeScript, production build, dependency vulnerability gate, and source-contract checks;
- `/acceptance/account-isolation` is included in the accepted source and protected by the standalone CI contract.

The previous deployment `bbf70c93-62be-40d0-a533-ed8ea56e26b8` proved the prior acceptance-stability web tree and public health provenance. It is superseded by the exact `4d3da5bf...` production deployment.

A direct unauthenticated network fetch from the local execution container was unavailable because that environment could not resolve the public host. That DNS limitation is not counted as a production failure; Railway's deployment/health state and exact-revision CI are the current runtime evidence.

## Live backend acceptance

`FDOS-PRODUCTION-BACKEND-ACCEPTANCE-2026-09-16.md` records production-policy evidence including:
- **19 / 19** FDOS tables exercised with an owner-scoped ephemeral record graph;
- Evidence Proposal approve/reject flow;
- foreign authenticated identity saw **0** owner Business rows and **0** owner child rows;
- Evidence linkage + Business Memory preserved;
- synthetic acceptance records cleaned back to **0** persistent FDOS rows;
- multi-business creation RPC privilege state verified as authenticated-only.

A fresh Supabase security-advisor pass after the multi-business migration did not list an FDOS table under `RLS enabled, no policy` and did not flag `fdos_create_business` as an exposed `SECURITY DEFINER` function. The project does have unrelated advisor findings plus a project-wide warning that leaked-password protection is disabled; those are separate from FDOS RLS correctness.

## Completion state

### SOURCE COMPLETE / CI VERIFIED / PRODUCTION RUNTIME VERIFIED / LIVE BACKEND ACCEPTANCE VERIFIED
Current planned technical surface includes:
- broad Founder Command Center;
- Business Stage + Business DNA;
- Value Map / Opportunities / Decisions / Risks / Business Memory;
- Idea Lab / Business X-Ray / Missing Intelligence / Value Sprints;
- Finance / Offer / Operations;
- Business Model / Customer Intelligence / Distribution;
- Assets / Founder Attention / Scenarios / Portfolio theses;
- multi-business Business Registry;
- global active-business switching;
- first Cross-Business Intelligence layer;
- active-business-aware switch/restore acceptance helpers;
- second-account isolation acceptance helper with post-verification ID redaction;
- searchable glossary and Answers surface;
- website Evidence capture/review architecture;
- 19-table RLS-protected persistence;
- authenticated-only atomic multi-business creation;
- auth/account and business-switch private-state boundaries;
- Sales OS correctly nested under Customers & Growth.

### PRODUCTION USER VERIFIED — NOT YET COMPLETE
Still requires genuine human/browser evidence:
- sign in on the exact deployed revision;
- create/load the first real Business Record through the UI;
- create a second intentional Business Record through `/portfolio`;
- **run the new `/acceptance` Business A → Business B switch proof**;
- verify no persisted/unsaved state bleed while switching;
- edit/save Business DNA and run `/acceptance/restore` through sign-out + fresh sign-in;
- use Value / Decision / Risk / Opportunity / Memory UI flows;
- Idea Lab write-back;
- run a real Value Sprint through observable result → KEEP / REVISE / REVERT;
- Workbench + Strategy/Dynasty writes;
- browser website Evidence capture → approve → reject;
- run `/acceptance/account-isolation` with a second genuine account and record a real zero-visibility PASS;
- Android/mobile visual and interaction pass;
- desktop visual and interaction pass.

There is currently only one genuine production auth user, so second-person browser isolation cannot truthfully be marked complete yet.

## Highest-value next milestone

**Do not add another department. Use the deployed acceptance helpers to close genuine production-user evidence for the system that now exists.**

Sequence:

`open production → sign in → create/load Business A → save DNA + stage + core records → create Business B intentionally → /acceptance: arm switch proof → switch A ↔ B → verify isolation → Intelligence + Value Sprint → /acceptance/restore: arm checkpoint → sign out → verify private state clears → fresh sign in → verify same active business restores → Evidence approve/reject → Workbench + Strategy writes → /acceptance/account-isolation with genuine Account B → mobile + desktop visual pass → KEEP / REVISE / REVERT`

## Product guardrail

Every future module must connect to a Business Record, Evidence, measurable outcome, Decision, Risk, Asset, Value Sprint, Business Memory, or an explainable cross-business relationship. Cross-business intelligence may compare businesses, but it may not erase the boundary between them.
