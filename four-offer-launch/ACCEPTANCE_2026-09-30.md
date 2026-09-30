# Four-Offer Commercial Acceptance — 2026-09-30

## VERIFIED

- Canonical repo: `anastaysia94-sudo/founder-os`
- Active Supabase project: `nqcshihyfhthywpseilx`
- Active edge functions:
  - `four-offer-storefront`
  - `four-offer-checkout`
  - `four-offer-delivery`
  - `four-offer-analytics`
- Checkout health probe returned HTTP 200:
  - `{"ok":true,"paypal_environment":"sandbox","configured":true}`
- Checkout readiness probe returned HTTP 200:
  - `ready: true`
  - `checkout_config: true`
  - `paypal_api: true`
  - `delivery_assets: true`
  - required digital offers: 3
- Fresh PayPal sandbox order creation returned HTTP 201.
- Fresh acceptance order:
  - offer: `ai-project-handoff`
  - amount: `$19.00 USD`
  - PayPal order: `97N48787SL7350054`
  - PayPal approval URL was returned successfully.

## NOT YET VERIFIED

The PayPal buyer approval step has not been completed for the fresh acceptance order. Therefore capture, COMPLETED ledger state, delivery-token creation, protected ZIP download, and final download-event evidence for this specific acceptance transaction are not yet claimable.

This is an external buyer-authentication gate, not an application-code gate. Do not mark Priority #1 100% commercially accepted until a real PayPal sandbox buyer approves the order and the resulting capture + protected delivery evidence are observed.

## Infrastructure note

The older Railway `sales-engine-app` service is stale/broken and reuses an old source snapshot on manual redeploy. The live acceptance path is the active Supabase Edge Function stack above. Do not block Four-Offer acceptance on the stale Railway service.
