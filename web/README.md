# Founder Dynasty OS — Standalone Web

This is the primary non-WordPress web product track for **Founder Dynasty OS 10.0** under **SMARTPICKSHOP HOLDINGS**.

It is not a Sales OS and it is not a generic dashboard. The Same-Day Customer Growth Pack remains a connected module inside the broader Founder Dynasty OS product.

## Implemented broad shell

The standalone web app currently implements one shared account-owned business record that connects:

- **Business Stage** — Idea → Exploring → Validating → Building → Pre-Launch → Launched → Finding Traction → Growing → Systemizing → Scaling → Portfolio → Dynasty
- **Business DNA** — business/idea name, purpose, problem, customer, offer, revenue model, advantage, constraint, and current goal
- **Founder Command Center** — current goal plus counts for open decisions, high risks, pending evidence proposals, and business-memory entries
- **Value Map** — Created, Captured, Leak, At Risk, Opportunity, and Asset items
- **Opportunity Engine** — evidence-labelled opportunities with transparent scoring inputs
- **Decision tracking** — open/decided/learning records linked to evidence where available
- **Risk tracking** — Low/Medium/High risks with responses and evidence labels
- **Business Memory** — dated events and founder notes attached to the same business record
- **Evidence Inbox** — authenticated website evidence capture as E2 Current External Evidence
- **Founder review queue** — evidence-derived proposals are reviewable and are not automatically applied to Business DNA, Value, Decisions, Risks, or Opportunities
- **E1–E8 evidence taxonomy** — preserves verified facts, external evidence, customer evidence, internal observations, hypotheses, financial assumptions, forecasts, and examples as distinct classes
- **Plain-English term help** — user-facing definitions for specialized concepts
- **Authenticated cloud persistence** — Supabase-backed account-owned business records with row-level security
- **Production metadata** — web manifest, robots, sitemap, structured metadata, and responsive/mobile layout

## Source-of-truth rule

All of the modules above read from and write to the same shared business record. Do not create disconnected copies of Business DNA, opportunities, decisions, risks, value items, or memory for individual screens.

Evidence can propose a change. Founder approval makes it canonical.

## Production acceptance boundary

An implemented feature is not considered production-complete merely because source code exists.

For a source-implemented feature to be called complete, verify as applicable:

1. production build succeeds;
2. TypeScript/build validation succeeds;
3. deployed Railway service is healthy;
4. relevant database tables/functions exist;
5. RLS/ownership boundaries are present;
6. create/read/update flow works for the shared business record;
7. logout/session behavior does not expose another account's data;
8. mobile and desktop layouts remain usable;
9. external evidence actions preserve E1–E8 integrity;
10. no claim of customers, revenue, results, ROI, or product-market fit is inferred from implementation or testing.

Any item that has not been exercised in the real production runtime must remain explicitly marked **NOT YET PROVEN**.

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

Continue outward from the shared business record rather than narrowing the product around Sales OS. The next broad layers should deepen Founder Command Center intelligence, Business DNA, Value Map, Decisions, Opportunities, Risks, Business Memory, and stage-aware recommendations before adding disconnected feature islands.

Read the repository root `PRODUCT-VISION.md` and `AGENTS.md` before major product-direction changes.
