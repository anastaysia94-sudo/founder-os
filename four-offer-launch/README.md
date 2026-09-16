# SmartPickShop Holdings — Four Offer Launch

This folder is the canonical combined storefront for the former **Four Offer Launch Kit** and **Four Offer Launch Kit2** workstreams.

## Offers

| Offer | Launch price | Delivery |
| --- | ---: | --- |
| Cashh Radar Opportunity Intelligence Brief | $100 starter / $200 expanded | Custom email delivery after paid intake |
| Remote Career Command Center DIY | $29 | Token-gated ZIP download |
| AI Project Handoff Pack | $19 | Token-gated ZIP download |
| L.N.C. 40 Project Printable — Expanded | $39 | Token-gated ZIP download |

Seller/payment contact: `anastaysia98@gmail.com`.

PayPal transactions are commercial checkout transactions for products/services, not personal/Friends & Family transfers.

## What is implemented

- Responsive storefront in `public/index.html`.
- Server-created PayPal Orders with prices and offer IDs defined server-side.
- PayPal-hosted buyer approval followed by server-side capture verification.
- Exact currency, amount, offer reference, and capture-status verification before fulfillment.
- Private Supabase payment ledger.
- Visitor/page-view/checkout/intake analytics with UTM attribution.
- Browser clients cannot submit `download_click`; genuine download events are written by the delivery backend.
- One visitor event per valid session UUID enforced in Postgres.
- Private Supabase digital-download vault.
- Token-gated downloads with expiration and maximum-download controls.
- Content SHA-256 headers and stored-file size validation.
- Deterministic, hashed delivery grants derived server-side after a verified payment.
- Safe fail-closed behavior: if PayPal/Supabase secrets are absent, API checkout is disabled and no payment is attempted.
- Zero-dollar two-hour traffic sprint and tracked campaign-link generator.
- CI smoke tests for server syntax, storefront boot, runtime config, fail-closed checkout, and campaign links.

## Supabase backend

Production endpoints:

- Analytics: `https://nqcshihyfhthywpseilx.supabase.co/functions/v1/four-offer-analytics`
- Delivery: `https://nqcshihyfhthywpseilx.supabase.co/functions/v1/four-offer-delivery`

Versioned source lives under:

```text
supabase/schema.sql
supabase/functions/four-offer-analytics/index.ts
supabase/functions/four-offer-delivery/index.ts
```

The analytics, file-vault, token, and payment-ledger tables have RLS enabled and direct access revoked from `anon` and `authenticated`. There are deliberately no browser RLS policies for these backend-only tables.

The three paid buyer ZIPs are loaded privately in Supabase and are **not** committed to this public Git repository.

## Required runtime secrets / settings

```text
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_ENV=sandbox
PUBLIC_BASE_URL=https://your-storefront.example
SUPABASE_SECRET_KEY=
DELIVERY_TOKEN_SECRET=
```

`PAYPAL_ENV` stays `sandbox` until sandbox checkout and fulfillment have passed. `PUBLIC_BASE_URL` must be the final HTTPS storefront origin because it is used for PayPal return/cancel URLs and same-origin checkout validation.

Do not commit any of these values. Use the deployment platform's secret-variable store.

### Optional hosted-link fallback

The runtime can still accept manually created PayPal commercial links through these optional variables:

```text
PAYPAL_CASHH_STARTER=
PAYPAL_CASHH_EXPANDED=
PAYPAL_REMOTE_CAREER_DIY=
PAYPAL_AI_HANDOFF=
PAYPAL_LNC_EXPANDED=
```

They are not required for the recommended Orders API flow. No PayPal URL should ever be invented from the seller email address.

## Checkout flow

```text
Offer button
  → POST /api/paypal/create-order
  → server creates fixed-price PayPal order
  → buyer approves on PayPal
  → PayPal returns to /paypal/return
  → server captures and verifies the order
  → payment ledger records COMPLETED
  → digital product: hashed token grant is created
  → protected download endpoint serves the exact ZIP
```

Cashh Radar service orders stop at the paid-intake page instead of creating a download token.

## Local run

```bash
cd four-offer-launch
npm start
```

The server listens on `PORT` when provided, otherwise port `3000`.

## Health check

```text
GET /health
```

With no credentials installed, expected shape is:

```json
{"ok":true,"paypal_api_ready":false,"paypal_environment":"sandbox"}
```

That is intentional: missing payment credentials disable checkout rather than silently degrading into an unverified payment flow.

## Current release gate

Repository code, private file delivery, analytics, and payment-ledger infrastructure are implemented. Remaining production gates are external/account-bound:

1. install the real PayPal REST app credentials and deployment secrets;
2. deploy the storefront only after explicit production deployment authorization;
3. run a complete PayPal sandbox purchase through capture and automatic delivery;
4. switch to live credentials only after sandbox acceptance;
5. run one controlled live purchase and verify the payment ledger, delivery grant, file checksum, and analytics event.

No sale, buyer, traffic target, or payment is considered real until the corresponding external evidence exists.
