# STATUS

Updated: 2026-09-26 America/Los_Angeles

## Purpose
Founder Dynasty OS and current Four-Offer Launch source.

## VERIFIED SOURCE STATE
- Founder OS readiness/product source reached `dbdc61d31b09d642327679f13a3ab66eda085a1f`.
- The old Railway direct-deploy workflow remains retired and should not simply be restored.
- Newer source contains explicit Railway build/revision work for the current Four-Offer path, so the prior blanket "do not use Railway" handoff is stale.
- Four-Offer source includes a readiness check covering checkout config, PayPal API access, and the three required digital-delivery assets.
- Founder OS web exposes `/api/ready`, checking Supabase configuration and a deployment/source revision.
- Founder OS web uses the SmartPickShop steampunk/neon visual system.
- Hosting-config commit `24d82f7547a556a37483606f9bfe0a696de63f6f` pins the embedded Trend Lab Railway host to Trend Lab source `60d5ac6e489b9b58f018b39810656d79fc9e8a21`, including its explicit mobile-layout test and mobile table-containment fix.

## VERIFICATION PENDING
- Live Founder OS readiness response and source-revision match.
- Live Four-Offer readiness response and current Railway/Supabase deployment state.
- Live embedded Trend Lab source-revision match to `60d5ac6e489b9b58f018b39810656d79fc9e8a21`.
- Sandbox purchase/payment/capture/ledger/delivery proof.
- Genuine Founder OS user acceptance for sign-in/recovery, business isolation, persistence/restore, and mobile.

## Current gate
Verify the actual live deployment topology first, then readiness, embedded Trend Lab source match, and one complete sandbox purchase/delivery flow. Do not infer health from source commits alone.

## 2026-09-30 live acceptance reconciliation

### Founder Dynasty OS
- Active production service: `founder-dynasty-os-web` on Railway project `same-day-customer-growth-pack`.
- Active production URL: `https://founder-dynasty-os-web-production.up.railway.app`.
- Production deployment `3f644f63-75f8-493a-b031-cbec79eb4fc1` is SUCCESS.
- Exact served source revision: `273c62847c9d4b04134863d91e0e20402830862b`.
- Live `/api/health`: HTTP 200 / `ok=true`; deployment ID and source revision reported correctly.
- Live `/api/ready`: HTTP 200 / `ready=true`; Supabase URL, publishable key, and source revision checks are all true.
- GitHub live-readiness run `36771290433` proved the Railway service-domain health/readiness contract. The run's only failure was the separate custom-domain check because `smartpickshop.dev` did not resolve in DNS from the GitHub runner.
- Production authentication is already verified by `docs/PRODUCTION-AUTH-AND-ACCEPTANCE-CHECKPOINT-2026-09-26.md`: signup, confirmation, password sign-in, authenticated reads/writes, and Business A save/reload passed. Do not reopen auth architecture without new failing evidence.
- Backend RLS/foreign-identity isolation is already verified. Genuine browser Business A↔B switching, same-account sign-out→sign-in restore, and full desktop/mobile visual interaction remain separate acceptance gates.

### Four-Offer Launch
- Active launch path is Supabase Edge Functions in project `nqcshihyfhthywpseilx`; the stale Railway `sales-engine-app` path is not the acceptance target.
- Active storefront URL: `https://nqcshihyfhthywpseilx.supabase.co/functions/v1/four-offer-storefront`.
- Active checkout URL: `https://nqcshihyfhthywpseilx.supabase.co/functions/v1/four-offer-checkout`.
- `four-offer-storefront`, `four-offer-checkout`, `four-offer-delivery`, and `four-offer-analytics` are ACTIVE and each deployed `index.ts` is an exact byte-for-byte match to the corresponding file on current `founder-os/main`.
- GitHub live-readiness run `36771460849` passed: storefront marker present; checkout health `ok=true`, sandbox configured; readiness `ready=true`; checkout config, PayPal API, and all three digital delivery assets passed.
- Fresh sandbox acceptance order created by run `36771657661`: `00965671D6122732R`, offer `ai-project-handoff`, USD 19.00. Buyer approval URL was generated successfully.
- Human gate: the sandbox buyer must approve order `00965671D6122732R`. Capture, COMPLETED payment ledger state, delivery token, protected ZIP download, checksum, and download-event proof must remain unclaimed until that approval occurs.

### Current truth boundary
Deployments, source matches, readiness, and sandbox-order creation are verified. No new real customer revenue is claimed. The remaining transaction gate is sandbox-only and the remaining Founder gates require genuine authenticated browser interaction.

