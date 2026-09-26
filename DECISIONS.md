# DECISIONS

Updated: 2026-09-26

## Standing project decisions
- Sales OS does not belong here.
- Four-Offer Launch remains here until a deliberate, verified migration.
- The retired Railway direct-deploy workflow must not be blindly restored.
- Newer Railway build/revision/readiness source may represent the current intended deployment path; determine active hosting from current source/configuration and live evidence rather than the older blanket handoff.
- Founder OS and Four-Offer readiness endpoints are evidence surfaces, not substitutes for real sandbox purchase/delivery and user acceptance.
- The embedded Trend Lab Railway host is source-pinned to `60d5ac6e489b9b58f018b39810656d79fc9e8a21`; update that pin deliberately when Trend Lab source changes and verify the hosted revision after each pin change.
- Another LLM or developer must begin with AI_HANDOFF.md and repository evidence.
- Never commit credentials, tokens, private customer data, or secrets.
- Record what changed, why, verification evidence, remaining blocker, and rollback risk after material work.
