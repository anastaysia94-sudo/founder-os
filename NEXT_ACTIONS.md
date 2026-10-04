# NEXT ACTIONS

Updated: 2026-09-26 America/Los_Angeles

## Smallest next execution block
1. Determine the currently active Founder OS, Four-Offer, and embedded Trend Lab deployment URLs and served source revisions.
2. Check Founder OS `/api/ready`.
3. Check the Four-Offer readiness endpoint and verify checkout config, PayPal sandbox/API connectivity, and required delivery assets.
4. Confirm the embedded Trend Lab host actually serves pinned source `60d5ac6e489b9b58f018b39810656d79fc9e8a21`.
5. Confirm current Railway usage comes from the newer intended build/revision path, not the retired direct-deploy workflow.
6. Complete one sandbox purchase → capture → payment ledger entry → digital delivery/checksum test.
7. Run Founder OS sign-in/recovery, Business A/B isolation, persistence/restore, and mobile acceptance.
8. Record exact URLs, revisions, responses, and test evidence in STATUS.md.

## 2026-09-30 current execution sequence

Completed and do not repeat without contradictory evidence:
1. Founder production source refresh to exact revision `273c62847c9d4b04134863d91e0e20402830862b`.
2. Founder live `/api/health` and `/api/ready` verification on the Railway service domain.
3. Four-Offer active-topology verification on Supabase Edge Functions.
4. Exact deployed-source match for storefront, checkout, delivery, and analytics functions.
5. Four-Offer live sandbox health/readiness including PayPal API and all three digital delivery assets.
6. Production auth + Business A persistence already proven by the September 26 acceptance checkpoint.
7. Backend foreign-identity RLS isolation already proven.

First unfinished item:
1. Approve PayPal sandbox order `00965671D6122732R` using a sandbox buyer.
2. Return through the checkout callback and verify capture.
3. Require `four_offer_payments.status='COMPLETED'`, capture ID present, and a delivery-token hash.
4. Download the protected AI Project Handoff ZIP, require HTTP 200, compare response SHA-256 to `four_offer_downloads.sha256`, and verify the download count/event.
5. In a genuine Founder browser session, create a second Business Record for the same account and run the Business A↔B acceptance switch without data bleed.
6. Run `/acceptance/restore` through a real sign-out → same-account sign-in boundary and require PASS.
7. Run desktop interaction acceptance and mobile interaction acceptance.
8. Repair or deliberately retire the non-resolving `smartpickshop.dev` alias separately; it does not block the working Railway production URL.

Do not claim 100% until the sandbox buyer and genuine authenticated browser/device gates above have executable evidence.

## 2026-10-04 PT — repo maintenance notes (The Albino · Pit Keeper)
1. Review/merge PR #25 (manifest relative paths), then re-run `deploy-sales-engine-pages.yml` and confirm `https://anastaysia94-sudo.github.io/founder-os/manifest.webmanifest` serves `start_url: ./`.
2. Review/merge licence PR #24.
3. Anastaysia: add repo secrets `FDOS_E2E_EMAIL` / `FDOS_E2E_PASSWORD`, then re-run Founder Browser Acceptance.
4. Anastaysia: decide on `smartpickshop.dev` — approve Humperdinck's skip-unless-configured fix, or register the domain — then re-run Founder OS Live Readiness.
5. Earlier items (sandbox order `00965671D6122732R` approval, genuine browser acceptance) are unchanged.
