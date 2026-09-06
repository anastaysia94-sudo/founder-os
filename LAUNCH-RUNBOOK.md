# FDOS 1.0 Launch Runbook

## Pre-deploy
- Take a host/database snapshot.
- Keep the last known-good plugin ZIP.
- Confirm the production domain resolves over HTTPS.
- Install FDOS 1.0.1 without deleting existing FDOS tables.

## Required in-product gates
1. Founder OS → Founder Command Center → Run P1 Integration QA. Internal status must be PASS.
2. Founder OS → Launch Gate → Evaluate launch gate. Blocking gates must be empty.
3. Founder OS → Launch Settings → review retention. A value of 0 means no automatic deletion.
4. Founder OS → Production Verify → set canonical `*.myshopify.com` domain.
5. Configure the Shopify app client secret outside public source code.
6. Subscribe `orders/create` and `orders/paid` to `/wp-json/fdos/v1/shopify/webhook`.
7. Deliver a real Shopify test/live event.
8. Run Production Verify until `production_verified=true`.

## Public smoke test
- Open the page containing `[fdos_value_leak_scanner]` on mobile and desktop.
- Submit a business idea and confirm a result renders.
- Confirm the result page does not display raw HTML from API data.
- Confirm `scanner_completed` and `scanner_result_viewed` appear in Evidence Feed.
- Confirm `/wp-json/fdos/v1/health` returns the deployed version.

## Rollback
- Deactivate 1.0.1 if a blocking regression occurs.
- Reinstall the last known-good ZIP.
- Restore the host/database snapshot only if schema/data integrity was affected.
- Run P1 QA again after rollback.

## Truth boundary
Technical launch completion is not proof of product-market fit, profit, conversion lift, or ROI. Those require real market evidence and remain classified accordingly.
