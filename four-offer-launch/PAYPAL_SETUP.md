# PayPal setup — Four Offer Launch

The seller/payment contact is `anastaysia98@gmail.com`.

This project does **not** fabricate a PayPal URL from an email address and does **not** ask buyers to use Friends & Family for product/service purchases.

## Recommended checkout architecture

Use PayPal's Orders v2 API from the storefront server:

```text
buyer clicks offer
  → server creates PayPal order with the exact server-side offer and price
  → buyer approves on PayPal
  → PayPal returns buyer to this storefront
  → server captures the order through PayPal
  → server verifies completed status, offer reference, currency and amount
  → payment ledger records the result
  → digital purchase receives a protected download token
```

The browser does not choose the price. A return/thank-you URL by itself is not accepted as proof of payment.

## Required runtime values

Keep these in deployment secret storage, never in Git:

```text
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_ENV=sandbox
PUBLIC_BASE_URL=https://your-final-storefront.example
SUPABASE_SECRET_KEY=
DELIVERY_TOKEN_SECRET=
```

`PAYPAL_ENV` defaults to sandbox behavior unless explicitly set to `live`.

`PUBLIC_BASE_URL` must be the exact final HTTPS storefront origin. It is used for PayPal return/cancel URLs and the server's same-origin checkout check.

## Offer catalog enforced by the server

| Offer slug | Product | Price | Type |
| --- | --- | ---: | --- |
| `cashh-starter` | Cashh Radar Opportunity Intelligence Brief — Starter | USD 100.00 | Service |
| `cashh-expanded` | Cashh Radar Opportunity Intelligence Brief — Expanded | USD 200.00 | Service |
| `remote-career-diy` | Remote Career Command Center DIY | USD 29.00 | Digital |
| `ai-project-handoff` | AI Project Handoff Pack | USD 19.00 | Digital |
| `lnc-expanded` | L.N.C. 40 Project Printable — Expanded | USD 39.00 | Digital |

Those values live in `paypal-orders.js`; the checkout request accepts an offer slug, not a buyer-supplied amount.

## PayPal REST endpoints used

Sandbox API base:

```text
https://api-m.sandbox.paypal.com
```

Live API base:

```text
https://api-m.paypal.com
```

OAuth access token:

```text
POST /v1/oauth2/token
```

Create an order:

```text
POST /v2/checkout/orders
```

Capture an approved order:

```text
POST /v2/checkout/orders/{ORDER-ID}/capture
```

The implementation sends `PayPal-Request-Id` values for idempotency-sensitive order/capture calls.

## Verification before fulfillment

`paypal-orders.js` rejects fulfillment unless the captured response matches the expected purchase:

- order status is `COMPLETED`;
- capture status is `COMPLETED`;
- `reference_id` matches the expected offer slug;
- `custom_id` matches `four-offer:{offer_slug}`;
- currency is `USD`;
- captured amount exactly matches the server-side catalog price;
- if PayPal returns a payee email, it must match `anastaysia98@gmail.com`.

A completed digital purchase is then recorded in `four_offer_payments`, and `fulfillment.js` creates a seven-day hashed delivery grant allowing up to three downloads.

## Digital delivery security

The buyer-facing token is derived server-side using `DELIVERY_TOKEN_SECRET`. Only its SHA-256 hash is stored in the database.

The private delivery endpoint:

1. hashes the presented token;
2. verifies the token row, expiry and remaining use count;
3. claims one download use;
4. retrieves the private ZIP;
5. verifies its stored byte length;
6. serves it with `Cache-Control: private, no-store` and its expected SHA-256 header;
7. records the genuine download event server-side.

Browser clients cannot directly read the payment, token, analytics, or download-vault tables.

## Sandbox acceptance before live checkout

Do not switch `PAYPAL_ENV=live` merely because the page renders. A sandbox purchase should first prove the entire chain:

```text
create order
→ PayPal approval
→ capture completed
→ payment ledger row completed
→ digital token created (for a download offer)
→ ZIP downloads successfully
→ exact size/SHA-256 matches
→ download counter increments
→ analytics records the genuine download
```

Cashh Radar is a service offer, so its successful checkout leads to a paid-intake page instead of a ZIP token.

## Optional PayPal hosted-link fallback

The storefront still understands these optional environment variables:

```text
PAYPAL_CASHH_STARTER=
PAYPAL_CASHH_EXPANDED=
PAYPAL_REMOTE_CAREER_DIY=
PAYPAL_AI_HANDOFF=
PAYPAL_LNC_EXPANDED=
```

They are a fallback for real PayPal-hosted **commercial** checkout links, not the recommended automated-fulfillment architecture. If none are configured and the Orders API is also unavailable, the page falls back to a prefilled email request rather than inventing a checkout destination.

## Transaction type

Every offer on this page is a product or service purchase. Treat it as a commercial PayPal transaction. Do not disguise it as a personal transfer or Friends & Family payment.
