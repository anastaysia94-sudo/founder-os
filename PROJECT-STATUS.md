# Founder Dynasty OS 10.0 — Project Status

**Parent:** SmartPickShop Holdings  
**Canonical repository:** `anastaysia94-sudo/founder-os`

## Current product direction

Founder Dynasty OS is a broad business operating system for any stage from raw idea through operating company, portfolio, and long-term enterprise value. The Same-Day Customer Growth Pack / Sales OS is a major module under Customers & Growth, not the identity of the product.

## Broad standalone web shell

The `web/` application is organized around one shared Business Record rather than separate feature silos.

Current major areas:

- Business Stage from Idea through Dynasty
- editable Business DNA
- Founder Command Center
- Value Map
- Opportunities
- Risks
- Decisions
- Business Memory
- E1–E8 evidence labels
- plain-English explainable terms
- Customers & Growth → Sales OS neighborhood

## Authenticated shared Business Record — implemented 2026-09-08 PDT

The broad web track now uses Supabase Auth plus a per-user, per-business data model.

Production database tables:

- `public.fdos_business_records`
- `public.fdos_value_items`
- `public.fdos_decisions`
- `public.fdos_risks`
- `public.fdos_opportunities`
- `public.fdos_memory`
- `public.fdos_evidence`

All Founder OS tables have Row Level Security enabled. The application scopes reads and writes to the authenticated user and the selected Business Record.

The shared record now persists:

- Business DNA and Business Stage
- Value Map items
- Decisions
- Risks
- Opportunities
- Business Memory
- captured evidence

This architecture allows the same signed-in user to load the same business state from another browser/device once that live workflow is exercised.

## First real evidence source

The first evidence connector is now an authenticated server-side public website capture at:

`POST /api/evidence/website`

Behavior:

1. requires a valid signed-in session,
2. verifies the Business Record belongs to that user,
3. accepts public HTTP/HTTPS pages only,
4. rejects localhost/private-network destinations and re-checks redirects,
5. fetches HTML with timeout and response-size limits,
6. records the page title and description/text summary,
7. stores the capture in `fdos_evidence` as **E2 — Current External Evidence**,
8. adds a linked Business Memory event.

The connector deliberately does not turn a website statement into customer evidence, revenue evidence, a result, or a proven recommendation.

## Railway production verification — authenticated persistence release

Production service:

- service: `founder-dynasty-os-web`
- service ID: `a975d751-c824-447a-9437-915ac7148531`
- environment: production
- source root: `/web`
- public domain: `https://founder-dynasty-os-web-production.up.railway.app`
- deployment: `2ecb02b9-e07a-4592-bfb9-e2b44a5a834a`
- deployed commit: `29ccc4f2e0e4956048fb96534748d6f3fce9e966`
- Railway status: `SUCCESS`

Verified from build/deployment evidence:

- `founder-os-web` version 0.2.0 built successfully.
- Next.js 15.5.25 compiled successfully.
- Type validity checks completed.
- 9 routes were generated.
- `/api/evidence/website` is present as a dynamic server route.
- Docker image export completed.
- Railway marked the deployment `SUCCESS`.
- Supabase environment configuration is attached to the production service.

## Database verification

Supabase currently reports all seven `fdos_*` tables present with RLS enabled. At this checkpoint the tables contain zero broad-workspace rows because no authenticated production browser session has yet created the first Business Record after this release.

The FDOS updated-at trigger was also hardened with an explicit `search_path` after the Supabase security advisor flagged the initial function definition.

## Verification boundary

### Production/source verified

- database schema exists
- RLS enabled on all new Founder OS tables
- authenticated client integration compiled
- shared Business Record storage layer compiled
- Business DNA + Stage save path compiled
- Value Map / Decision / Risk / Opportunity / Memory save paths compiled
- website E2 evidence capture route compiled
- production deployment succeeded

### Still requires real user-flow proof

- first production sign-in to the broad web workspace
- first Business Record creation through the live UI
- edit/save/reload Business DNA through production
- create and restore a Value item, Decision, Risk, Opportunity, and Memory item
- sign out/sign back in restoration
- cross-browser or cross-device restoration
- second-user isolation validation through the live app
- first successful production website evidence capture and resulting `fdos_evidence` + `fdos_memory` rows
- real Android/mobile visual and interaction pass

Do not describe these live user-flow items as verified until they are actually exercised.

## Known engineering follow-up

The production npm install currently reports two dependency audit findings (one moderate and one high). They require investigation before applying any breaking `npm audit fix --force` change.

The current quick-add UI for Value Map, Decisions, Risks, Opportunities, and Memory uses browser prompts. Persistence is functional at source level, but these should be replaced by proper plain-English forms/cards for the intended premium Founder Dynasty OS experience.

## Existing major module

The Same-Day Customer Growth Pack / Sales OS remains under `sales-engine-app/` and `sales-engine/`. Preserve genuine prospect and pipeline history. Do not let Sales OS architecture redefine the broader Founder Dynasty OS product.

## Next highest-value milestone

Exercise the new persistent architecture in production and replace primitive quick-add prompts with first-class Founder Dynasty OS interfaces. Then allow captured evidence to inform Business DNA, Value Map, Risks, Decisions, and Opportunities through explicit evidence-linked actions rather than silent automatic claims.

## Product guardrail

Every major new module should answer one of these questions:

- What is this business?
- What does it know?
- What is uncertain?
- Where is value created or lost?
- What could go wrong?
- What decision matters?
- What should happen next?
- What happened before?
- What did we learn?

If a feature cannot connect back to the shared Business Record, a measurable business outcome, an evidence source, a decision, a risk, or a learning loop, reconsider whether it belongs in Founder Dynasty OS.
