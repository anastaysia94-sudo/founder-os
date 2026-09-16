# SmartPickShop Holdings — Four Offer Launch

This folder contains the combined storefront for the Four Offer Launch Kit workstreams.

## Offers

| Offer | Launch price | Delivery |
| --- | ---: | --- |
| Cashh Radar Opportunity Intelligence Brief | $100 starter / $200 expanded | Custom email delivery after intake |
| Remote Career Command Center DIY | $29 | Token-gated ZIP download |
| AI Project Handoff Pack | $19 | Token-gated ZIP download |
| L.N.C. 40 Project Printable — Expanded | $39 | Token-gated ZIP download |

Seller/payment contact: `anastaysia98@gmail.com`.

PayPal transactions are commercial checkout transactions for products/services, not personal/Friends & Family transfers.

## What is implemented

- Responsive storefront UI in `public/index.html`.
- Runtime payment-link configuration via `/config.js`.
- Visitor/page-view/checkout/intake/download analytics.
- Supabase-backed private digital-download vault.
- Token-gated download endpoint with expiration and maximum-download controls.
- Content SHA-256 header on downloads.
- PayPal link placeholders that degrade safely to a prefilled email request until real PayPal-hosted links are supplied.

## Supabase endpoints

- Analytics: `https://nqcshihyfhthywpseilx.supabase.co/functions/v1/four-offer-analytics`
- Delivery: `https://nqcshihyfhthywpseilx.supabase.co/functions/v1/four-offer-delivery`

The underlying download tables have RLS enabled and direct access revoked from `anon` and `authenticated`. The public delivery endpoint authorizes with a hashed one-time/limited-use token and performs server-side access using Supabase secret credentials.

## Required runtime environment variables

Set these only after the corresponding real PayPal-hosted commercial checkout links exist:

```text
PAYPAL_CASHH_STARTER=
PAYPAL_CASHH_EXPANDED=
PAYPAL_REMOTE_CAREER_DIY=
PAYPAL_AI_HANDOFF=
PAYPAL_LNC_EXPANDED=
```

No PayPal URL should be invented from the seller email address.

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

Expected result:

```json
{"ok":true}
```

## Current release gate

The storefront and protected download infrastructure are ready. A public production deployment and actual automated post-payment issuance remain blocked on real PayPal checkout/webhook configuration. Until those links are present, purchase buttons intentionally open a checkout-request email rather than sending a buyer to an unverified URL.
