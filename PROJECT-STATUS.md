# Founder Dynasty OS 10.0 — Project Status

**Parent:** SmartPickShop Holdings  
**Canonical repository:** `anastaysia94-sudo/founder-os`

## Current product direction

Founder Dynasty OS is a broad business operating system for any stage from raw idea through operating company, portfolio, and long-term enterprise value. The Same-Day Customer Growth Pack / Sales OS is a major module under Customers & Growth, not the identity of the product.

## Working now in source

### Broad standalone web shell

The `web/` application now has a first broad Founder Dynasty OS shell organized around one shared business record.

Implemented capabilities:

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
- mobile-responsive source layout

The shell uses a single `BusinessRecord` model in `web/lib/fdos.ts` so these sections can evolve around shared state rather than becoming unrelated dashboards.

## Production verification — 2026-09-08 PDT

A dedicated Railway production service now exists for the standalone `web/` track:

- service: `founder-dynasty-os-web`
- service ID: `a975d751-c824-447a-9437-915ac7148531`
- environment: production
- source repo: `anastaysia94-sudo/founder-os`
- source root: `/web`
- deployed commit: `82303e12fa1f495f7d502177fa45da392c6c40a5`
- deployment: `ea007f1e-330d-4758-bb4b-4aa315b0254d`
- Railway status: `SUCCESS`
- public domain: `https://founder-dynasty-os-web-production.up.railway.app`

Verified from production build/runtime evidence:

- Railway built the `/web` Next.js application successfully.
- Next.js compiled successfully and completed type checking.
- Static generation completed for 8 routes.
- `/` production route built successfully.
- Container started successfully.
- Next.js reported ready in 501 ms.
- Railway marked the deployment `SUCCESS`, which means the configured `/` health check passed.
- The deployed commit contains the broad Founder Command Center shell with Business Stage, Business DNA, Value Map, Opportunities, Risks, Decisions, Business Memory, evidence labels, and the Sales OS placed under Customers & Growth.

### Verification boundary

This checkpoint proves production build + container runtime + Railway health-check success for the deployed source. It does **not** yet prove every interaction visually in an independent external browser/device. A separate external mobile/desktop interaction pass should still verify editing, stage switching, navigation, tooltips, responsive layout, and the Sales OS link from the public domain.

## Important limitation

The current broad shell uses in-memory demonstration state. Editing Business DNA in the browser is not yet durable authenticated persistence. The displayed example opportunities, risks, decisions, and value items are explicitly model/demo content and must not be treated as verified customer, market, revenue, or production evidence.

## Existing major module

The Same-Day Customer Growth Pack / Sales OS remains under `sales-engine-app/` and `sales-engine/`. Preserve genuine prospect and pipeline history. Do not let Sales OS architecture redefine the broader Founder Dynasty OS product.

## Verified versus not yet verified

### Production verified

- broad web shell builds successfully on Railway
- broad web shell container starts successfully
- `/` passes Railway production health check
- public Railway domain exists
- deployed commit contains the shared BusinessRecord-driven shell
- Business Stage + Business DNA source is present in deployed commit
- Value Map / Opportunities / Risks / Decisions / Business Memory source is present in deployed commit
- Sales OS is placed as a connected module rather than the product center

### Still not fully verified

- independent external-browser visual/interaction pass
- mobile browser behavior on real device
- authenticated persistence for the shared BusinessRecord
- cross-device restoration
- account isolation for broad Founder OS data
- real external evidence adapters feeding Business DNA / Value Map / Decisions
- Sales OS link behavior from the standalone web domain

## Highest-value next milestone

Make the shared `BusinessRecord` durable and useful:

1. add a real workspace/business record store,
2. persist Business DNA and stage per authenticated user,
3. make Opportunities, Decisions, Risks, Value Map, and Memory reference that same record,
4. add one real evidence ingestion path,
5. run a real external mobile + desktop interaction pass against the production domain,
6. keep production verification evidence current as these systems become durable.

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
