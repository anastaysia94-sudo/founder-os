# Trend Lab Railway hosting shim

This folder is only a Railway hosting shim used to reuse the retired legacy `founder-dynasty-os-v8` service slot.

Canonical Trend Lab source remains separate:
`anastaysia94-sudo/smartpickshop-trend-lab`

The Docker build clones the latest `main` branch from that repository, builds it, and runs the Next.js production server.

Reason for this shim:
Railway Free plan currently blocks provisioning an additional service. The legacy V8 Founder Dynasty OS service had no normal user traffic in the checked 7-day window and has been superseded by `founder-dynasty-os-web`.

Rollback:
Change the Railway service root back to `/fdos-production-v8` and Dockerfile to `Dockerfile`, then redeploy the recorded V8 revision if needed.
