# Founder Dynasty OS 10.0 — Production Backend Acceptance Evidence

Date: 2026-09-16

This document records live Supabase backend acceptance evidence for the broad Founder Dynasty OS data model. The checks were intentionally ephemeral: they exercised the authenticated RLS surface using the existing production project, then deleted the temporary Business Record so no synthetic Founder Dynasty OS business data remained.

This is **backend acceptance evidence**, not a substitute for genuine browser/user acceptance.

## Production target

- Supabase project: Founder Dynasty OS production data project
- FDOS tables checked: **19**
- RLS: enabled on all 19 FDOS tables
- Authenticated FDOS RPCs checked: `fdos_ensure_business`, `fdos_store_website_evidence`, `fdos_apply_evidence_proposal`
- All three RPCs are `SECURITY INVOKER`
- anonymous execution is denied
- authenticated execution is allowed

## Broad persistence + RLS smoke test

An authenticated production-role transaction created an ephemeral Business Record and exercised every FDOS persistence neighborhood:

1. `fdos_business_records`
2. `fdos_value_items`
3. `fdos_decisions`
4. `fdos_risks`
5. `fdos_opportunities`
6. `fdos_memory`
7. `fdos_evidence`
8. `fdos_evidence_proposals`
9. `fdos_value_sprints`
10. `fdos_financial_assumptions`
11. `fdos_offer_hypotheses`
12. `fdos_initiatives`
13. `fdos_business_model_elements`
14. `fdos_customer_insights`
15. `fdos_distribution_experiments`
16. `fdos_business_assets`
17. `fdos_scenarios`
18. `fdos_portfolio_theses`
19. `fdos_attention_blocks`

Observed result:

| Check | Expected | Observed |
|---|---:|---:|
| Owner-visible FDOS tables containing the ephemeral records | 19 | **19** |
| Evidence proposals successfully approved through RPC | 1 | **1** |
| Business rows visible after switching the authenticated JWT identity to a foreign UUID | 0 | **0** |
| Child FDOS rows visible to that foreign identity | 0 | **0** |
| Owner Business Records remaining after cleanup | 0 | **0** |

The foreign-identity check exercised RLS as the `authenticated` role. It is stronger than merely inspecting policy text, but it still does not replace a genuine second-account browser session.

## Website Evidence loop smoke test

A second ephemeral transaction exercised the Evidence capture/review loop.

`fdos_store_website_evidence(...)` was called with one temporary E2 website Evidence item and two review proposals. One proposal was approved through `fdos_apply_evidence_proposal(...)`; the other was rejected through the same authenticated RLS update path used by the web client.

Observed result:

| Check | Expected | Observed |
|---|---:|---:|
| E2 Evidence rows captured | 1 | **1** |
| Pending Proposals created by capture | 2 | **2** |
| Proposal approved | 1 | **1** |
| Proposal rejected | 1 | **1** |
| Approved Decision linked back to the E2 Evidence and source URL | 1 | **1** |
| `External evidence captured` Business Memory events | at least 1 | **1** |
| Business Records remaining after cleanup | 0 | **0** |

## Cleanup verification

After both acceptance transactions, the sum of persistent rows across all 19 `fdos_*` tables was checked again.

**Persistent synthetic FDOS rows remaining: 0.**

No temporary acceptance row was left behind and no synthetic test outcome should be interpreted as a customer, revenue event, market validation, or genuine founder workflow.

## Security/advisor observation

The current Supabase security advisor produced no FDOS-specific RLS-without-policy finding and no FDOS `SECURITY DEFINER` RPC warning. Project-wide advisor findings exist for unrelated schemas/modules and Auth currently reports leaked-password protection disabled; those are separate project-security workstreams and should not be mislabeled as Founder Dynasty OS RLS failures.

The performance advisor currently marks many new FDOS indexes as unused. That is expected while the production FDOS tables contain no genuine user records; unused-index telemetry before real workload exists is not evidence that the indexes should be removed.

## Acceptance boundary

### Proven now

- broad 19-table schema is live;
- all 19 FDOS tables have RLS enabled;
- authenticated owner can create/read the broad record graph under production policies;
- a foreign authenticated identity sees zero ephemeral owner rows in the tested graph;
- Business deletion cascades the ephemeral graph cleanly;
- Evidence capture creates E2 Evidence + review Proposals + Business Memory atomically;
- approving an Evidence Proposal creates an Evidence-linked canonical record;
- rejecting a Proposal leaves it rejected rather than applying it;
- cleanup returns production FDOS data to zero synthetic rows.

### Still requires genuine browser/user evidence

- real production-page sign in;
- Business Record bootstrap through the deployed browser client;
- real save → sign out → fresh sign in → restore;
- actual private-state clearing on sign-out/account switch;
- second genuine account isolation in separate browser sessions;
- real UI create/update flows across the major modules;
- real browser website Evidence capture/approve/reject;
- mobile visual acceptance;
- desktop visual acceptance;
- a real Value Sprint carried through an observable result and a founder KEEP / REVISE / REVERT decision.

Those checks remain deliberately unclaimed. Founder Dynasty OS is supposed to distinguish evidence from wishful thinking, even when wishful thinking would make the progress report shorter.
