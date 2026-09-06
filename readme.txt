=== FDOS Value Leak Scanner ===
Contributors: smartpickshop-holdings
Tags: founder-os, analytics, evidence, experiments, shopify
Requires at least: 6.0
Requires PHP: 7.4
Stable tag: 1.0.1
License: Proprietary

Evidence-governed business intake, value-leak analysis, Value Sprints, experiment tracking, Shopify evidence, Founder Command Center, deployment QA, and production verification.

== Installation ==
1. Back up WordPress and the database.
2. Install and activate this ZIP/plugin.
3. Open Founder OS > Founder Command Center and run P1 Integration QA.
4. Open Founder OS > Launch Gate and clear all blocking P2 checks.
5. Open Founder OS > Production Verify, configure the canonical Shopify shop domain, and copy the webhook target.
6. Configure FDOS_VLS_SHOPIFY_WEBHOOK_SECRET with the owning Shopify app client secret in wp-config.php or protected server configuration.
7. Subscribe Shopify orders/create and orders/paid to the HTTPS webhook target.
8. Run Production Verify. Do not label launch complete until production_verified=true.

== Privacy ==
Email addresses are hashed before storage. Public browser events are evidence receipts, not proof of unique humans. Automatic retention is disabled by default for intakes/browser events and can be configured by the owner. Uninstall data deletion is opt-in and disabled by default.
