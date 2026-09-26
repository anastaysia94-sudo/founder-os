# Netlify Four-Offer deployment

This folder is the age-compatible, no-surprise-billing replacement target for the Four-Offer storefront.

## Netlify project settings
- Base directory: four-offer-launch/netlify
- Build command: npm install && npm run build
- Publish directory: dist
- Functions directory: netlify/functions
- Plan: Free

## What is live-capable
- Static storefront
- Product ZIP build
- /api/health
- /api/ready
- /api/analytics using Netlify Blobs

## What is intentionally disabled
- Payment processing
- Payment-gated digital delivery

Do not add payment credentials to this deployment unless an eligible account owner is handling the payment provider and its terms.
