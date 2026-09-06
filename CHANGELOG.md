# Changelog

## 1.0.0 — Launch Candidate
- Preserves v0.1–v0.8 evidence, scanner, conversion, Shopify, experiment, QA, deployment, and production-verification work.
- Adds `fdos_manage` capability for administrator-level FDOS control.
- Adds experiment correlation to evidence events with indexed `experiment_id`.
- Adds experiment list/get/update REST operations.
- Adds owner-controlled retention and daily maintenance.
- Adds scheduled health reports.
- Adds full FDOS JSON export.
- Adds opt-in destructive uninstall cleanup; default is data preservation.
- Refactors public scanner JS/CSS into enqueued assets and removes API-result `innerHTML` interpolation.
- Adds first-party `scanner_result_viewed` receipt after successful result rendering.
- Bumps schema/plugin version to 1.0.0.

## 1.0.1 — Launch-Day Correction
- Corrects Shopify HTTPS webhook HMAC guidance: use the client secret of the Shopify app that owns the webhook subscription.
- Adds a plain-English same-day launch checklist.
