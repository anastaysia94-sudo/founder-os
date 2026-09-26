# Four-Offer Hosting Migration Status — 2026-09-26

## Current target
Netlify Free, not Cloudflare.

## Why
- Cloudflare path was abandoned because its current service policy is not appropriate for this user's age.
- GitHub Pages preview workflow was tested, but Pages is not enabled for this repository; the workflow skipped deployment with HTTP 404.
- Netlify's Free plan is the current age-compatible $0 target.

## Verified repository state
- Netlify functions added for health, readiness, analytics, and disabled-delivery response.
- Netlify Blobs is used for analytics persistence.
- Checkout is intentionally disabled in the Netlify preview.
- Paid ZIPs are built for verification but explicitly removed from the public dist folder.
- Buyer-safe source packs exist for Remote Career DIY, AI Project Handoff, and L.N.C. Expanded.
- CI workflow: Netlify Four-Offer checks.
- CI run 36230843397: SUCCESS.
- Latest verified CI commit: 1974068a01dbd55cbd8a9c82095cd5072daa119a.

## Netlify project settings
Base directory: four-offer-launch/netlify
Build command: npm install && npm run build
Publish directory: dist
Functions directory: netlify/functions
Plan: Free

## Still requires account-side action
- Create/sign into an eligible Netlify account.
- Connect anastaysia94-sudo/founder-os.
- Set base directory to four-offer-launch/netlify.
- Publish the deploy.

## Live tests after connection
1. Open deployed storefront.
2. GET /api/health.
3. GET /api/ready.
4. POST/GET /api/analytics.
5. Confirm checkout buttons remain disabled.
6. Confirm /products/*.zip are not publicly accessible.
7. Test mobile and desktop layout.

## Rollback
Railway/Supabase production remains unchanged. Do not remove old services until a replacement is live and verified.
