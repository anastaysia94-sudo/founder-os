# Railway deployment checkpoint

This storefront is deployed from the existing Railway service slot formerly used by the inactive `sales-engine-app` service.

- Root directory: `/four-offer-launch`
- Start command: `npm start`
- Health check: `/health`
- Payment environment: `sandbox` until sandbox acceptance passes
- Public base URL: `https://sales-engine-app-production.up.railway.app`

The working `sales-engine-pwa` service is separate and remains unchanged. The prior Railway deployment snapshot remains available as rollback evidence.
