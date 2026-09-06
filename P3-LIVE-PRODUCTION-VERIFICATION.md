# P3 — Live Production Deployment + External Verification

## P3 definition of done
P3 is not complete merely because the plugin is installable. `production_verified=true` requires:
1. P2 launch gate passes on the installed WordPress production runtime.
2. The WordPress server can retrieve its public homepage through HTTP(S).
3. The FDOS health REST route survives a real HTTP round trip and reports the deployed plugin version.
4. The public deployment-proof route survives a real HTTP round trip.
5. HTTPS is active.
6. WordPress is configured with a non-local hostname.
7. The canonical Shopify `*.myshopify.com` store identity is configured.
8. At least one actual HMAC-verified Shopify `orders/create` or `orders/paid` webhook from the expected store has been persisted.

## Evidence boundary
Internal tests remain E4 observations. HTTP round-trip observations and accepted external Shopify webhook reports are E2 evidence. A Shopify order event does not equal profit or prove attribution/causality.

## Known external prerequisite
A real public HTTPS WordPress deployment target is required before the P3 verifier can produce a green production result.
