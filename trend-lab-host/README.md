# Trend Lab Railway hosting shim

This folder is only a Railway hosting shim used to reuse the retired legacy `founder-dynasty-os-v8` service slot.

Canonical Trend Lab source remains separate:
`anastaysia94-sudo/smartpickshop-trend-lab`

The Docker build clones an explicitly pinned, CI-verified commit from that repository, builds it, and runs the Next.js production server. Update `TRENDLAB_COMMIT` in `Dockerfile` only after the canonical repo's `verify` and `browser verify` workflows pass.

Reason for this shim:
Railway Free plan currently blocks provisioning an additional service. The legacy V8 Founder Dynasty OS service had no normal user traffic in the checked 7-day window and has been superseded by `founder-dynasty-os-web`.

Rollback:
Change the Railway service root back to `/fdos-production-v8` and Dockerfile to `Dockerfile`, then redeploy the recorded V8 revision if needed.

Railway host slot activated: 2026-09-25. Canonical Trend Lab remains the separate repository above.


Current verified Trend Lab source pin: `f411aa8640d1a57c5cdc0db2420c027284a0807b` (Next.js 16.3.6 security upgrade).
