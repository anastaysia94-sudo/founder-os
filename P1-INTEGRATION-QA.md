# P1 — End-to-End Integration QA: Definition of Done

P1 is complete when the installed plugin can verify, from inside WordPress, all of the following without leaving synthetic commercial evidence behind:

1. Required database tables exist.
2. Required REST routes are registered.
3. E1–E8 evidence taxonomy is intact.
4. Scanner produces a ranked finding and Value Sprint.
5. Intake persists.
6. Evidence events persist.
7. Duplicate event keys are idempotent.
8. Baseline and observation KPI windows aggregate correctly.
9. Experiment report produces the expected directional decision while retaining E4/no-causation semantics.
10. Founder Command Center consumes the same persisted experiment/evidence data.
11. Shopify HMAC validation accepts valid signatures and rejects invalid/tampered signatures.
12. Synthetic QA records are deleted.
13. Command Center no longer exposes synthetic QA records after cleanup.
14. A durable QA-run ledger retains only test status/report metadata.

External gates are deliberately excluded from P1 completion:
- public HTTPS deployment,
- live Shopify webhook delivery,
- genuine customer usage,
- real revenue/ROI evidence.

Those belong to deployment and real-world validation milestones and must not be fabricated.
