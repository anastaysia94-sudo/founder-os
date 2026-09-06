# GitHub Copilot Instructions — Founder Dynasty OS

Follow the repository-wide `AGENTS.md` as the canonical project handoff.

## Copilot-specific operating instructions

When proposing or editing code:

- Inspect existing implementations before generating new files/classes. Avoid duplicate modules.
- Preserve the FDOS E1–E8 Research & Evidence Integrity Layer and all truth boundaries.
- Treat v1.0.1 as a launch candidate awaiting real WordPress production deployment, not as proven production software.
- Prefer fixes that advance Issue #1 (production deployment + verification) over speculative feature expansion.
- Maintain WordPress/PHP compatibility stated by the plugin unless deliberately changing it with migration/testing.
- Follow WordPress security conventions: capability checks, sanitization/validation, escaping, nonces where appropriate, safe remote requests, and no secret exposure.
- Never place Shopify client secrets, credentials, tokens, customer data, or real `wp-config.php` values in code, docs, examples, tests, logs, or commits.
- Shopify webhook HMAC verification must use the client secret belonging to the Shopify app that owns the subscriptions; preserve raw-body verification and deduplication.
- Preserve the Facebook permission boundary: a URL alone is not permission to scrape or infer page content.
- Preserve safe uninstall and evidence-history behavior; destructive deletion remains explicit opt-in.
- Do not use `innerHTML` for untrusted/API result rendering.
- After PHP edits, run PHP lint and relevant tests. Do not claim CI/runtime success unless it actually ran.
- For substantial changes, update relevant docs/changelog and explain rollback/migration implications.

Commercial claims in UI/docs must remain evidence-grounded. Never turn hypotheses, Shopify order totals, KPI correlations, or illustrative examples into claims of profit, ROI, causation, customer success, or product-market fit.

When the user asks to continue, work on the highest-value unfinished milestone described in `AGENTS.md` and Issue #1.