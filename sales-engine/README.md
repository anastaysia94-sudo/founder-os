# Same-Day Customer Growth Pack — Live Sales Engine

**Canonical workbook:** `Same-Day-Customer-Growth-Pack-Live-CRM.xlsx`  
**Last refreshed:** 2026-09-05 (America/Los_Angeles)

This folder is the persistent source of truth for the Same-Day Customer Growth Pack prospecting workflow.

## Operating rules

1. Research current higher-ticket service businesses before each refresh.
2. Every lead must have a verifiable source and a dated evidence-based marketing opportunity.
3. Never invent a phone number, email address, contact person, offer, review count, customer result, reply, payment, or revenue.
4. Reverify time-sensitive promotions, hours, financing terms, deadlines, and contact details before outreach.
5. Cold outreach sequence is limited to: initial contact + up to 2 respectful follow-ups, then stop unless the prospect replies.
6. Immediately suppress prospects who opt out or say not to contact them.
7. The default offer is the **$150 flat Same-Day Customer Growth Pack**, no subscription.
8. Default low-friction CTA: **“Want me to send two business-specific examples first?”**
9. Never guarantee leads, bookings, rankings, ROI, response rates, or revenue.
10. Update CRM stages only after the real-world event actually occurs.

## Workbook sheets

- `Priority Leads` — ranked, verified prospects with individualized initial outreach and reply/follow-up scripts.
- `Outreach Scripts` — reusable initial, follow-up, objection, close, delivery follow-up, and upsell templates.
- `Pipeline` — contact timestamps, reply state, quote/payment/fulfillment, next action, and opt-out tracking.
- `Dashboard` — live counts and revenue/pipeline formulas.
- `Sources` — evidence URLs, verification date, and reverify triggers.
- `Update Rules` — non-negotiable integrity and maintenance rules.

## Update protocol for ChatGPT / Copilot / other AI assistants

When asked to refresh the leads:

1. Read this README and the current lead source files first.
2. Research current prospects on the web.
3. Prefer recently active, higher-ticket service businesses with a concrete, supportable marketing opportunity and a reachable contact channel.
4. Preserve real pipeline history; do not reset actual outreach/replies/payments.
5. Replace stale prospects only when a stronger verified prospect exists or the old lead can no longer be verified.
6. Update `Last refreshed`, verification dates, sources, scripts, and the canonical workbook.
7. Commit with a message such as `sales: refresh Same-Day Growth Pack leads YYYY-MM-DD`.

## Binary workbook note

The `.xlsx` workbook is the preferred working artifact. The accompanying text files in this folder are deliberately kept human-readable so the lead data and outreach logic remain auditable and recoverable even when a tool cannot directly edit binary Excel files.
