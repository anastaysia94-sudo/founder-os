# smartpickshop.dev

Public SmartPickShop Holdings landing site.

## Purpose

This is the public holding-company front door. It does not replace Founder Dynasty OS, Cashh Radar, the Shopify storefront, or other product runtimes. It routes visitors to verified public systems while keeping each product independent.

## Run locally

```bash
npm test
npm start
```

Default local port: 8080. Railway injects `PORT`.

## Health

- `/health`
- `/ready`

Both return JSON with service and canonical-domain identity.

## Production target

- canonical domain: `https://smartpickshop.dev/`
- secondary domain: `https://www.smartpickshop.dev/`
- current deployment target: Railway, same connected workspace used by Founder Dynasty OS
- Azure Static Web Apps remains a compatible future free-tier migration target for this static site.

## Domain rule

Do not claim the custom domain is live until:
1. Railway reports the custom domain attached;
2. the required DNS records resolve publicly;
3. Railway reports the certificate ready;
4. HTTPS returns the landing page;
5. `/health` returns 200.

The `.dev` TLD is HTTPS-only in modern browsers, so certificate readiness is a launch blocker rather than decorative paperwork.
