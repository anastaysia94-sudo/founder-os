# P2 — Production Deployment Readiness

## Definition of Done
P2 build completion requires:
- owner-only deployment controls;
- environment diagnostics;
- blocking vs warning classification;
- HTTPS and admin-HTTPS checks;
- PHP and WordPress version checks;
- database and FDOS table checks;
- REST API route checks;
- WordPress auth key/salt checks;
- confirmation of a passing P1 QA run on the installed site;
- Shopify webhook-secret readiness status;
- smoke test covering health, Command Center aggregation, backup manifest generation, and critical routes;
- checksummed backup manifest generation;
- restore-manifest dry-run validation;
- deployment logging;
- rollback instructions;
- final launch-gate evaluation.

## Truth boundary
A green P2 launch gate means the current WordPress runtime passed the checks FDOS can observe internally. It does not by itself prove DNS propagation, CDN/WAF behavior, external uptime, real-device rendering, search indexing, or actual Shopify webhook delivery. Those are verified after real deployment.
