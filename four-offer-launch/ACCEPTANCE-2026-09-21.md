# Four Offer launch acceptance — 2026-09-21

## Verdict

NOT LAUNCH COMPLETE. Hosted preview/readiness and a real PayPal sandbox purchase remain unverified because the connected Vercel account rejects access to the SmartPickShop team. No customer, sale, or revenue is claimed.

## Implemented fixes

PR #13: https://github.com/anastaysia94-sudo/founder-os/pull/13
Merged implementation: c3fb92ec548876e76f1a5f4df935de7b49863968

- Replaced CommonJS require calls inside both .mjs acceptance tools with ES imports. They previously crashed with `ReferenceError: require is not defined in ES module scope`.
- Payment capture now requests `Prefer: return=representation`, supplying the full resource needed to validate capture, offer and amount. PayPal documents the default as a minimal response: https://developer.paypal.com/api/orders/v2/orders-capture
- Added subprocess regression tests for tool startup, missing-secret refusal, and evidence writing on success, rejection and network failure. Updated capture test to simulate PayPal's default minimal response.

## Code verification

- Local `npm run check`: passed.
- Local `npm test`: 16 passed, 0 failed. External payment responses are mocked in these tests.
- Post-merge Four Offer Launch Smoke: success, https://github.com/anastaysia94-sudo/founder-os/actions/runs/35618443234
- Post-merge PHP Lint: success, https://github.com/anastaysia94-sudo/founder-os/actions/runs/35618443272

## Independent live ZIP delivery

This was a delivery-only backend acceptance test using a temporary one-download grant. It was NOT a purchase and did not create a payment ledger entry.

- Offer: ai-project-handoff
- Filename: AI-Project-Handoff-Download.zip
- HTTP: 200
- Content-Type: application/zip
- Actual and expected byte length: 6721
- Actual, expected and response-header SHA-256: 78fc91f1025da7a8eaa893c9fbd916a735eb2a963bafd695ac025e1860329210
- ZIP integrity: passed; 2 entries.
- Download count: 0 -> 1, max_downloads=1.
- last_downloaded_at: 2026-09-21T15:22:26.997Z
- Server-side download_click event observed at 2026-09-21T15:22:27.700583Z.
- Temporary grant and the exact generated analytics event were removed afterward; remaining test grants=0.
- No credentials or raw download tokens are retained in this report.

## Hosted evidence and blocker

At 2026-09-21T15:20:42Z, the known storefront /health returned HTTP 302 to Vercel authentication, not an application health response.

Known deployment origin: https://four-offer-launch-smart-pick-shop-holdings-llc.vercel.app
Vercel project: four-offer-launch (prj_EskDtayXwoGXx2Qo5ljKt4tc8fI3)
Team: smart-pick-shop-holdings-llc (team_zITyBUG7KPfN1Krp4bJAOhwD)
Source: founder-os/main, root four-offer-launch.

Both team-scoped deployment inspection and authenticated URL fetching returned 403. The provider explicitly requires re-authentication to the team. The earlier browser sign-in did not yield verified success.

## Next acceptance sequence

1. Restore authorized Vercel access to this team and inspect the deployment's actual revision and runtime settings.
2. Deploy the corrected main revision in sandbox mode; ensure the required PayPal, Supabase and delivery secrets are configured securely.
3. Run tools/verify-live-deployment.mjs against the authenticated deployment and require READY_FOR_SANDBOX_PURCHASE.
4. Approve one USD 19 sandbox AI Project Handoff order using a sandbox buyer account.
5. Run tools/verify-sandbox-purchase.mjs with its real order ID and securely supplied sandbox secrets; retain redacted evidence.
6. Keep live commercial acceptance separate from sandbox and independent delivery tests.

## Further integration checks to resolve before claiming completion

- Sandbox receiver identity: the current Node checkout compares returned payee email to the live seller email. Confirm the actual sandbox merchant identity and configure an explicit sandbox expectation if different.
- Browser analytics: the versioned Edge Function origin allowlist does not include Vercel. Confirm current deployed source and the final storefront origin before updating the allowlist or implementing a same-origin route.
- A separate existing four-offer-checkout Edge Function was discovered; reconcile whether any hosted storefront uses it. The merged Node fix alone does not change that separate deployed function.
