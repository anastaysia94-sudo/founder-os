# PayPal setup — Four Offer Launch

This project intentionally does **not** invent PayPal URLs from the seller email address. The live account is expected to be the PayPal account for `anastaysia98@gmail.com`.

## Current PayPal path

PayPal currently supports two useful approaches for this launch:

1. Create hosted Payment Links in the PayPal Business dashboard.
2. Create reusable hosted payment links with the Payment Links & Buttons REST API.

For full automatic delivery, a server-verified payment event is required. A browser redirect alone is not treated as proof of payment.

## Recommended production configuration

1. Use a PayPal Business account associated with `anastaysia98@gmail.com`.
2. Create/select a REST app in the PayPal Developer Dashboard.
3. Enable Payment Links & Buttons for the app if using the Payment Links API.
4. Create fixed-price commercial checkout products:
   - Remote Career Command Center DIY — USD 29.00
   - AI Project Handoff Pack — USD 19.00
   - L.N.C. 40 Project Printable Expanded — USD 39.00
   - Cashh Radar Starter — USD 100.00
   - Cashh Radar Expanded — USD 200.00
5. Test in sandbox before live mode.
6. Configure the final public storefront/confirmation URL after deployment.
7. Subscribe a verified HTTPS webhook listener to successful payment capture events before enabling unattended fulfillment.

## Relevant PayPal endpoints

Sandbox API base:

```text
https://api-m.sandbox.paypal.com
```

Live API base:

```text
https://api-m.paypal.com
```

OAuth token:

```text
POST /v1/oauth2/token
```

Create Payment Link:

```text
POST /v1/checkout/payment-resources
```

Verify a webhook signature:

```text
POST /v1/notifications/verify-webhook-signature
```

## Secret values

Never commit these values to GitHub:

```text
PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET
PAYPAL_WEBHOOK_ID
PAYPAL_MERCHANT_ID
```

Use deployment/runtime secret storage only.

## Webhook rule

Fulfillment must not run merely because the customer reached a thank-you page. Process a digital delivery only after a server-side verification establishes a completed payment for the expected seller, currency, amount, and product. Successful captures are idempotent: the same PayPal capture/order must not create multiple independent delivery grants.

## Current storefront variables

The storefront already accepts these runtime URLs:

```text
PAYPAL_CASHH_STARTER
PAYPAL_CASHH_EXPANDED
PAYPAL_REMOTE_CAREER_DIY
PAYPAL_AI_HANDOFF
PAYPAL_LNC_EXPANDED
```

Until a real value is installed, the purchase button falls back to a prefilled checkout-request email instead of silently sending the buyer somewhere unverified.

## Transaction type

These are purchases of products/services, so PayPal checkout must be a commercial transaction. Do not configure the sales page to request or disguise payment as a personal/Friends & Family transfer.
