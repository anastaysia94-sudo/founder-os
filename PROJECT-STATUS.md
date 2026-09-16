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

### Other surfaces
- `/glossary` — searchable plain-English glossary.
- `/answers` — public answer-oriented search/AEO surface.
- `/acceptance` — read-only production diagnostics.
- `/acceptance/restore` — browser restore proof support.
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

Production now includes:

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

This is source/CI/runtime verified. Genuine browser observation of sign-out, restore and business-switch behavior remains production-user acceptance.

## CI state

Cross-Business Intelligence merge commit:

`d9dcbcd46e46a65f1b23e17d40a679bd0a53ad66`

GitHub Actions on that merge:
- `Founder OS Standalone Web` run `35089889819`: **SUCCESS**;
- `PHP Lint` run `35089890062`: **SUCCESS**.

PR #5 also passed its pre-merge standalone web and PHP lint runs.

The web workflow typechecks, builds the Next.js production app, performs dependency vulnerability checks and verifies the broad/multi-business contract. The production build generated **15 routes**, including `/portfolio` and `/acceptance/restore`.

## Production runtime

Railway service:
- service: `founder-dynasty-os-web`
- domain: `https://founder-dynasty-os-web-production.up.railway.app`
- environment: `production`
- root directory: `/web`
- healthcheck: `/api/health`

Current production deployment:

`1eddfe30-e3ca-4954-b288-b0c5386fa91a`

Deployed repository revision:

`7fe9c285fa677fa722d08675d01841bc0a9d2427`

That revision contains the merged multi-business registry and Cross-Business Intelligence web code plus updated canonical handoff material. Later repository-only status/evidence documentation does not change the deployed `web/` code tree.

Railway status: **SUCCESS**.

Observed production build/runtime evidence:
- exact source commit identified by Railway: `7fe9c285...`;
- Next.js production build succeeded;
- TypeScript completed successfully;
- production route generation completed for all 15 routes;
- `/portfolio` is in the generated route set;
- production container reached `Ready`;
- configured healthcheck completed and deployment reached `SUCCESS`.

## Live backend acceptance

`FDOS-PRODUCTION-BACKEND-ACCEPTANCE-2026-09-16.md` records production-policy evidence including:
- **19 / 19** FDOS tables exercised with an owner-scoped ephemeral record graph;
- Evidence Proposal approve/reject flow;
- foreign authenticated identity saw **0** owner Business rows and **0** owner child rows;
- Evidence linkage + Business Memory preserved;
- synthetic acceptance records cleaned back to **0** persistent FDOS rows;
- multi-business creation RPC privilege state verified as authenticated-only.

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
- switch between businesses and verify no persisted or unsaved state bleed;
- edit/save Business DNA and restore it after sign-out + fresh sign-in;
- use Value / Decision / Risk / Opportunity / Memory UI flows;
- Idea Lab write-back;
- run a real Value Sprint through observable result → KEEP / REVISE / REVERT;
- Workbench + Strategy/Dynasty writes;
- browser website Evidence capture → approve → reject;
- second genuine-account isolation;
- Android/mobile visual and interaction pass;
- desktop visual and interaction pass.

There is currently only one genuine production auth user, so second-person browser isolation cannot truthfully be marked complete yet.

## Highest-value next milestone

**Do not add another department. Complete genuine production-user acceptance of the broad multi-business system that now exists.**

Sequence:

`open production → sign in → create/load Business A → save DNA + stage + core records → create Business B intentionally → switch A ↔ B and verify isolation → Intelligence + Value Sprint → /acceptance → sign out → verify private state clears → fresh sign in → verify restore → Evidence approve/reject → Workbench + Strategy writes → second genuine account → mobile + desktop visual pass → KEEP / REVISE / REVERT`

## Product guardrail

Every future module must connect to a Business Record, Evidence, measurable outcome, Decision, Risk, Asset, Value Sprint, Business Memory, or an explainable cross-business relationship. Cross-business intelligence may compare businesses, but it may not erase the boundary between them.
