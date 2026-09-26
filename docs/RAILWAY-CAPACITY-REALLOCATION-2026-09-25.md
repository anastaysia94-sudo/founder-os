# Railway capacity reallocation record — 2026-09-25

Purpose: free one Railway free-plan service slot for SmartPickShop Trend Lab without touching active production services.

## Legacy service selected for retirement

Service: `founder-dynasty-os-v8`
Project: `same-day-customer-growth-pack`
Service ID: `928342aa-bf01-4ccf-a9b5-b2dce203351b`
Environment: production
Domain: `founder-dynasty-os-v8-production.up.railway.app`
Source: `anastaysia94-sudo/founder-os`
Root: `/fdos-production-v8`
Last successful deployment: `71bcad43-1815-45fe-b7ce-38412afc38ab`
Commit: `4489513c249537bbf18d14c9f4b6e0db49cc4a18`
Volume mount observed: volume `e6b98906-196d-403e-ae69-610af4d7b8b8` at `/data`

## Why this slot was selected

The current main Founder Dynasty OS production service is `founder-dynasty-os-web`, not the V8 service.

The V8 service showed only two HTTP requests in the checked 7-day window, both automated `robots.txt` requests from OAI-SearchBot. No normal-user traffic was observed.

The active `founder-dynasty-os-web` service showed substantial normal traffic and remains untouched.

Sales Engine PWA and Four-Offer/Sales Engine App remain separate services and are untouched.

## Rollback path

Source remains versioned in GitHub at `/fdos-production-v8`.
The last successful V8 deployment ID and commit are recorded above.
If V8 must be restored later, recreate a Railway service from the same repo/root and reattach/restore the preserved volume if available.

Do not delete or modify `founder-dynasty-os-web`.
