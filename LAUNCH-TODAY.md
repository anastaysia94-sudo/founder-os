# FDOS 1.0.1 — Launch Today Checklist

## What you need
- A public WordPress website using HTTPS.
- An Administrator login for that site.
- The FDOS 1.0.1 ZIP.
- Optional for Shopify order telemetry: a Shopify app you control. Shopify signs HTTPS webhooks using that app's client secret.

## Minimum public launch
1. Back up your WordPress site and database.
2. WordPress Admin → Plugins → Add New → Upload Plugin.
3. Upload the FDOS 1.0.1 ZIP → Install Now → Activate Plugin.
4. Founder OS → Founder Command Center → Run P1 Integration QA.
5. P1 must say PASS.
6. Founder OS → Launch Gate → Evaluate launch gate.
7. Fix every blocking FAIL.
8. Create a page called “Founder Dynasty OS” or “Free Value Leak Scan”.
9. Add this shortcode: `[fdos_value_leak_scanner]`
10. Publish the page.
11. Open it in a private/incognito window.
12. Submit a test business idea.
13. Confirm a ranked finding appears.
14. Founder OS → Founder Command Center → confirm `scanner_completed` and `scanner_result_viewed` appear.
15. WordPress Admin → Tools → Site Health → resolve critical issues before promotion.

At this point, the public scanner can launch even if Shopify telemetry is not connected yet.

## Shopify production-proof path
1. Create or use a Shopify app that you control.
2. Keep its client secret private.
3. In `wp-config.php` set `FDOS_VLS_SHOPIFY_WEBHOOK_SECRET` to that app client secret.
4. Founder OS → Production Verify → enter the canonical `*.myshopify.com` domain.
5. Copy the FDOS webhook endpoint. It ends in `/wp-json/fdos/v1/shopify/webhook`.
6. Create HTTPS webhook subscriptions owned by that same app for `ORDERS_CREATE` and `ORDERS_PAID`.
7. Trigger or deliver a real test or real order event.
8. Confirm FDOS records an HMAC-verified Shopify webhook.
9. Run Production Verify until `production_verified=true`.

## Never do these
- Never expose the Shopify app client secret in a page, post, screenshot, GitHub repo, public JavaScript, or email.
- Never call Shopify-reported order value profit.
- Never call a successful scanner result proven ROI.
- Never delete historical FDOS data unless you intentionally enabled that behavior.
