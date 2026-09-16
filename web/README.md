# Founder Dynasty OS — Standalone Web

This is the primary non-WordPress web product track for **Founder Dynasty OS 10.0** under **SMARTPICKSHOP HOLDINGS**.

It is not a Sales OS and it is not a generic dashboard. The Same-Day Customer Growth Pack remains a connected module inside the broader Founder Dynasty OS product.

## Implemented broad operating system

The standalone web app supports multiple private, account-owned Business Records. One Business Record is active at a time, and every major workspace reads from that selected business instead of inventing its own version of reality.

Each Business Record connects:

- **Business Stage** — Idea → Exploring → Validating → Building → Pre-Launch → Launched → Finding Traction → Growing → Systemizing → Scaling → Portfolio → Dynasty
- **Business DNA** — business/idea name, purpose, problem, customer, offer, revenue model, advantage, constraint, and current goal
- **Founder Command Center** — current goal plus open decisions, high risks, pending evidence proposals, opportunities and recent business memory
- **Value Map** — Created, Captured, Leak, At Risk, Opportunity, and Asset items
- **Opportunity Engine** — evidence-labelled opportunities with transparent scoring inputs
- **Decision tracking** — open/decided/learning records linked to evidence where available
- **Risk tracking** — Low/Medium/High risks with responses and evidence labels
- **Business Memory** — dated events and founder notes attached to the same business record
- **Value Sprints** — hypothesis → action → measure → result → KEEP / REVISE / REVERT
- **Evidence Inbox** — authenticated website evidence capture as E2 Current External Evidence
- **Founder review queue** — evidence-derived proposals are reviewable and are not automatically applied to Business DNA, Value, Decisions, Risks, or Opportunities
- **E1–E8 evidence taxonomy** — preserves verified facts, external evidence, customer evidence, internal observations, hypotheses, financial assumptions, forecasts, and examples as distinct classes
- **Plain-English term help** — user-facing definitions for specialized concepts
- **Authenticated cloud persistence** — Supabase-backed account/business-owned records with row-level security
- **Production metadata** — web manifest, robots, sitemap, structured metadata, and responsive/mobile layout

## Multi-business / portfolio registry

`/portfolio` is the private Business Registry. A signed-in founder can:

- see every Business Record owned by the account;
- create another independent business or raw idea;
- choose its starting Business Stage;
- switch the active business;
- carry that active selection into Command Center, Intelligence, Workbench and Strategy/Dynasty.

The global active-business switcher uses an account-scoped browser session selection. Switching performs a hard page reload so unsaved component-local state from the previous business cannot remain mounted in the next business workspace.

`fdos_create_business(...)` performs authenticated atomic Business Record creation and writes the initial E4 `Workspace created` Business Memory event. Anonymous execution is explicitly denied.

## Cross-business intelligence

The private `/portfolio` surface now also reads owner-scoped signals across Business Records without merging their canonical histories.

Current account-wide signals include:

- high risks;
- open decisions;
- blocked initiatives;
- Evidence proposals waiting for review;
- running Value Sprints;
- planned weekly Founder Attention.

Per-business comparison also shows saved opportunities, mapped assets and measured Value Sprint loops. Attention flags explain where an individual business currently has high risks, blocked work, pending Evidence review or unresolved decisions.

These are **descriptive operating signals**, not a ranking of which business is best, a valuation, a success score, revenue evidence, product-market fit, or a forecast. Cross-business intelligence can compare the records; it does not rewrite them.

## Source-of-truth rule

Inside a business, all modules read from and write to the same selected Business Record. Do not create disconnected copies of Business DNA, opportunities, decisions, risks, value items, Value Sprints, evidence, or memory for individual screens.

Across businesses, preserve `business_id` isolation. Cross-business intelligence may compare account-owned businesses, but it must never collapse their canonical records into one data soup.

Evidence can propose a change. Founder approval makes it canonical.

## Production acceptance boundary

An implemented feature is not considered production-complete merely because source code exists.

For a source-implemented feature to be called complete, verify as applicable:

1. production build succeeds;
2. TypeScript/build validation succeeds;
3. deployed Railway service is healthy;
4. **the production deployment commit contains the current `web/` source being accepted**;
5. relevant database tables/functions exist;
6. RLS/ownership boundaries are present;
7. create/read/update works for the selected Business Record;
8. creating and switching between multiple Business Records does not mix private state;
9. logout/session behavior does not expose another account's data;
10. mobile and desktop layouts remain usable;
11. external evidence actions preserve E1–E8 integrity;
12. no claim of customers, revenue, results, ROI, or product-market fit is inferred from implementation or testing.

A healthy deployment of an older commit does not validate newer source. Any item that has not been exercised in the real production runtime must remain explicitly marked **NOT YET PROVEN**.

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run start
```

## Build direction

The broad architecture, multi-business registry and first cross-business intelligence layer now exist. The highest-value milestone is **genuine production-user acceptance** of what is already built: real browser sign-in, persistence/restore, business creation and switching, browser Evidence review, module writes, mobile/desktop interaction, and one observable Value Sprint loop.

After that evidence is closed, expand Cross-Business Intelligence only where it produces explainable decisions about shared constraints, assets, founder attention, portfolio roles or reusable capabilities.

Sales OS remains under **Customers & Growth**. It is a major neighborhood, not the municipal government.

Read the repository root `PRODUCT-VISION.md` and `AGENTS.md` before major product-direction changes.
