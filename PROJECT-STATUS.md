# Founder Dynasty OS 10.0 — Project Status

**Parent:** SmartPickShop Holdings  
**Canonical repository:** `anastaysia94-sudo/founder-os`

## Current product direction

Founder Dynasty OS is a broad business operating system for any stage from raw idea through operating company, portfolio, and long-term enterprise value. The Same-Day Customer Growth Pack / Sales OS is a major module under Customers & Growth, not the identity of the product.

## Broad standalone web shell

The `web/` application is organized around one shared Business Record rather than separate feature silos.

Current major areas:

- Business Stage from Idea through Dynasty
- editable Business DNA
- Founder Command Center
- Value Map
- Opportunities
- Risks
- Decisions
- Business Memory
- E1–E8 evidence labels
- plain-English explainable terms
- Customers & Growth → Sales OS neighborhood

## Authenticated shared Business Record

The broad web track uses Supabase Auth plus a per-user, per-business data model. Production tables now include:

- `public.fdos_business_records`
- `public.fdos_value_items`
- `public.fdos_decisions`
- `public.fdos_risks`
- `public.fdos_opportunities`
- `public.fdos_memory`
- `public.fdos_evidence`
- `public.fdos_evidence_proposals`

All FDOS tables have Row Level Security enabled with account-scoped policies. The shared record persists Business DNA and Business Stage, Value Map items, Decisions, Risks, Opportunities, Business Memory, captured evidence, and evidence-derived proposal review state.

## Evidence-linked operating intelligence

The website evidence connector at `POST /api/evidence/website` now does more than store a page. It separates source evidence from interpretation and creates reviewable proposed actions.

When a signed-in founder captures a public webpage:

1. the page itself is saved as **E2 — Current External Evidence**,
2. the source URL stays attached to the evidence record,
3. Founder Dynasty OS can propose a Value Map item,
4. it can propose a Risk,
5. it can propose a Decision,
6. it can propose an Opportunity,
7. where appropriate, it can propose a Business DNA change,
8. none of those proposals are applied automatically,
9. the founder must explicitly Approve and apply or Reject each proposal,
10. approved changes retain their evidence/source link and write a Business Memory event.

Direct observations from a captured page stay E2. Interpretive opportunities, risks, and strategic questions are labeled E5 hypotheses rather than being promoted into facts. This is a core integrity rule.

Approval is handled by the `fdos_apply_evidence_proposal(uuid)` database function using `SECURITY INVOKER`, explicit `search_path`, account ownership checks, and one transaction so proposal status and the resulting business-record change cannot drift apart.

## Plain-English record creation interfaces

Primitive browser `prompt()` quick-add interactions have been replaced in the standalone web track by proper Founder Dynasty OS forms/cards for:

- Value Map items
- Opportunities
- Risks
- Decisions
- Founder/Business Memory notes

Manual founder entries are stored as **E4 — Internal Observation**, which records that the founder/business entered the information without pretending it is external market proof.

The evidence inbox now includes proposal cards showing:

- the proposed target area,
- why the proposal exists,
- what data would change,
- its supporting source link,
- Approve and apply,
- Reject.

## Dependency security remediation — 2026-09-08 PDT

The previous production build used Next.js 15.5.25 and npm reported two dependency findings: one moderate and one high.

Targeted dependency review identified the vulnerable direct framework dependency and the runtime dependency set was upgraded and pinned rather than running an indiscriminate breaking `npm audit fix --force`.

Current exact runtime versions:

- `next` 16.3.4
- `react` 19.2.8
- `react-dom` 19.2.8
- `@supabase/supabase-js` 2.116.0

Current exact development versions:

- `@types/node` 22.18.6
- `@types/react` 19.1.16
- `@types/react-dom` 19.1.9
- `typescript` 5.9.2

Railway production build installation is hardened to:

`npm install --ignore-scripts && npm run build`

Latest correct-source production deployment:

- deployment: `8ac92b65-717d-4dac-bd97-839781742219`
- deployed Git commit: `6804c96f0efaf1d98b9184e7996da9f69b4a088e`
- Railway status: `SUCCESS`
- application version: `founder-os-web@0.3.0`
- Next.js runtime: `16.3.4`
- npm audit result during build: **0 vulnerabilities**
- TypeScript: passed
- production build: passed
- `/api/evidence/website`: present as a dynamic route
- `/` Railway health check: succeeded
- container runtime: ready successfully

This supersedes the earlier dependency-audit finding. No moderate/high npm findings remain in the production dependency install at this checkpoint.

## Supabase security verification

A fresh Supabase security-advisor pass after the FDOS evidence-proposal migrations reports no FDOS-specific missing-RLS-policy finding, no FDOS mutable-search-path warning, and no FDOS `SECURITY DEFINER` exposure. Remaining advisor notices currently belong to other schemas/products in the shared project, plus the project-level leaked-password-protection setting; they are not generated by the new Founder Dynasty OS proposal tables/RPC.

## CI verification

The latest main commit aligns the standalone-web CI contract with the actual implemented surfaces: Business DNA, Value Map, Decisions, Business Memory, Opportunities, Risks, Evidence, and Sales. The corresponding `Founder OS Standalone Web` GitHub Actions run completed successfully.

## Verification boundary

### Production/source verified

- dependency audit now reports zero vulnerabilities in production build
- Next.js 16.3.4 production build and TypeScript pass
- hardened `--ignore-scripts` install works in production
- new evidence proposal schema exists with RLS
- atomic approval RPC exists with `SECURITY INVOKER`
- evidence/source links can persist on Value Map / Decision / Risk / Opportunity / Memory rows
- browser quick-add prompts are removed from the standalone web source
- plain-English record composer forms compile
- evidence approval/rejection UI compiles
- website E2 capture route compiles
- latest GitHub standalone web workflow passes
- latest correct-source Railway deployment succeeds and health check passes

### Still requires real signed-in user-flow proof

- first production Business Record creation through the current live UI
- edit/save/reload Business DNA through production
- create and restore each manual record type through the new forms
- first successful production website capture through the current UI
- approve and reject live evidence proposals and verify resulting rows
- sign out/sign back in restoration
- cross-browser or cross-device restoration
- second-user isolation validation through the live app
- real Android/mobile visual and interaction pass

Do not describe those live user-flow items as verified until they are actually exercised.

## Dependency hardening follow-up

The direct dependencies are now exact-pinned and production audit is clean. A repository `package-lock.json` is still desirable for fully reproducible transitive dependency resolution. Automated lockfile generation from the working container timed out, so no lockfile was fabricated or falsely claimed. Exact pins plus the hardened production install substantially reduce drift until the lockfile is generated successfully.

## Existing major module

The Same-Day Customer Growth Pack / Sales OS remains under `sales-engine-app/` and `sales-engine/`. Preserve genuine prospect and pipeline history. Do not let Sales OS architecture redefine the broader Founder Dynasty OS product.

## Next highest-value milestone

Exercise the evidence intelligence loop end-to-end in a real authenticated production session: capture a real E2 source, inspect the generated proposals, approve one, reject one, confirm linked changes in the shared Business Record and Business Memory, then verify the same state restores in a second browser/device.

After that, deepen the proposal engine from basic source-to-action mappings into evidence-aware comparison: show conflicts between new evidence and existing Business DNA, identify corroborating or contradictory sources, and make the Command Center rank changes by evidence strength, business stage, reversibility, likely value, and risk.

## Product guardrail

Every major new module should answer one of these questions:

- What is this business?
- What does it know?
- What is uncertain?
- Where is value created or lost?
- What could go wrong?
- What decision matters?
- What should happen next?
- What happened before?
- What did we learn?

If a feature cannot connect back to the shared Business Record, a measurable business outcome, an evidence source, a decision, a risk, or a learning loop, reconsider whether it belongs in Founder Dynasty OS.
