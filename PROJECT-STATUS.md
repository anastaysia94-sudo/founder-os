# Founder Dynasty OS 10.0 — Project Status

**Parent:** SmartPickShop Holdings  
**Canonical repository:** `anastaysia94-sudo/founder-os`

## Current product direction

Founder Dynasty OS is a broad business operating system for any stage from raw idea through operating company, portfolio, and long-term enterprise value. The Same-Day Customer Growth Pack / Sales OS is a major module under Customers & Growth, not the identity of the product.

## Working now in source

### Broad standalone web shell

The `web/` application now has a first broad Founder Dynasty OS shell organized around one shared business record.

Implemented source-level capabilities:

- Business Stage selector from Idea through Dynasty
- editable Business DNA record
- Founder Command Center priority view
- Value Map
- ranked Opportunities
- Risk Center
- Decision Engine shell
- Business Memory timeline
- evidence labels E1–E8
- explainable plain-English terms
- explicit Sales OS neighborhood under Customers & Growth
- mobile-responsive layout

The shell uses a single `BusinessRecord` model in `web/lib/fdos.ts` so these sections can evolve around shared state rather than becoming unrelated dashboards.

## Important limitation

The current broad shell uses in-memory demonstration state. Editing Business DNA in the browser is not yet durable authenticated persistence. The displayed example opportunities, risks, decisions, and value items are explicitly model/demo content and must not be treated as verified customer, market, revenue, or production evidence.

## Existing major module

The Same-Day Customer Growth Pack / Sales OS remains under `sales-engine-app/` and `sales-engine/`. Preserve genuine prospect and pipeline history. Do not let Sales OS architecture redefine the broader Founder Dynasty OS product.

## Verified versus not yet verified

### Source implemented

- broad BusinessRecord type model
- broad Founder Command Center shell
- Business Stage + Business DNA interface
- Value / Opportunity / Risk / Decision / Memory views
- Sales OS placed as a connected module rather than product center

### Not yet runtime-verified

- production build of this new broad shell
- live deployment of this shell
- mobile browser behavior
- authenticated persistence for the shared BusinessRecord
- cross-device restoration
- account isolation for broad Founder OS data
- real external evidence adapters feeding Business DNA / Value Map / Decisions

No CI status was attached to the latest shell commit at the time of this checkpoint, so source implementation must not be described as production-verified.

## Highest-value next milestone

Make the shared `BusinessRecord` durable and useful:

1. add a real workspace/business record store,
2. persist Business DNA and stage per authenticated user,
3. make Opportunities, Decisions, Risks, Value Map, and Memory reference that same record,
4. add one real evidence ingestion path,
5. build and verify the standalone web shell,
6. deploy and test it on mobile + desktop.

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

If a feature cannot connect back to the shared business record, a measurable business outcome, an evidence source, a decision, a risk, or a learning loop, reconsider whether it belongs in Founder Dynasty OS.
