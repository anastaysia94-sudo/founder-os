# FDOS Portable Core

This directory starts the **WordPress-independent product core** for Founder Dynasty OS.

It is intentionally framework-neutral so FDOS can evolve into a web app, API/service, desktop/mobile wrapper, or another host without rewriting its central business logic.

## Included in v1.1 core foundation

- canonical E1–E8 evidence taxonomy
- opportunity ranking formula
- Value Sprint generation
- portable intake analysis with explicit adapter boundaries
- in-memory evidence ledger
- evidence-mix calculation
- experiment-correlated KPI windows
- experiment lifecycle and KEEP / REVISE / REVERT reporting
- explicit causation limitation
- Node/browser compatibility
- automated Node 18/20/22 CI tests.

## Important architecture boundary

`core/fdos-core.js` contains no WordPress APIs. It does not fetch websites or social networks by itself. External observations belong in permissioned evidence adapters and should enter the ledger with the appropriate evidence class, source reference, confidence, and limitation.

The existing WordPress plugin remains in the repository as one delivery adapter. Future feature development should increasingly place reusable domain logic in `core/` and keep host-specific UI/storage/auth/integration code in adapters.

## Run tests

```bash
node core/fdos-core.test.js
```

## Next non-WordPress feature milestones

1. Portable persistence adapter (IndexedDB/local JSON first; server DB adapter later).
2. Standalone responsive Founder Command Center consuming the portable core.
3. Project/workspace model so one founder can manage multiple businesses/products.
4. Decision History / Dynasty Vault with immutable evidence-aware decision records.
5. Evidence-source registry and adapter contract for web, Shopify, manual/customer research, and future sources.
6. Opportunity portfolio view with filters for evidence class, confidence, speed, risk, project, and status.
7. Export/import format so data can move between local web app, API, and legacy WordPress adapter without losing evidence provenance.

These milestones must preserve the E1–E8 integrity rules in `AGENTS.md`.