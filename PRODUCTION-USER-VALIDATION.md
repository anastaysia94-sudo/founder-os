# Founder Dynasty OS 10.0 — Production/User Validation

Updated: 2026-09-16

This document tracks production and user validation evidence only. A deployment, migration, CI pass, backend smoke test, outbound email, or green badge is not automatically a customer, payment, revenue event, or successful human workflow.

## Evidence Loop 001 — Public Sales OS Delivery

Production service: `sales-engine-pwa`  
Public domain: `https://sales-engine-pwa-production.up.railway.app`

Previously observed public delivery successfully retrieved the Sales OS application and required assets. This is public-delivery evidence only. It does not prove prospect response, payment, revenue, or the standalone Founder Dynasty OS authenticated workflow.

**Decision: KEEP.**

---

## Evidence Loop 002 — Genuine Prospect Outreach

Genuine prospect outreach history remains in the canonical Sales OS pipeline. Offer price is not booked revenue; a sent email is not a reply; a reply is not payment.

The currently verified Sales OS payment total remains **$0** unless new direct payment evidence is recorded.

**Decision: OBSERVE.**

---

## Evidence Loop 003 — Standalone Founder Dynasty OS Production Runtime

Railway service: `founder-dynasty-os-web`  
Public domain: `https://founder-dynasty-os-web-production.up.railway.app`

Current production deployment:

`1eddfe30-e3ca-4954-b288-b0c5386fa91a`

Deployed repository revision:

`7fe9c285fa677fa722d08675d01841bc0a9d2427`

This deployed revision contains the merged multi-business Business Registry, global active-business switcher and Cross-Business Intelligence layer. Later root-level status/evidence documentation commits do not alter that accepted `web/` code tree.

Observed on 2026-09-16:
- deployment status: **SUCCESS**;
- Railway identified exact source commit `7fe9c285fa677fa722d08675d01841bc0a9d2427`;
- repository: `anastaysia94-sudo/founder-os`;
- branch: `main`;
- root directory: `/web`;
- Next.js production build succeeded;
- TypeScript completed successfully;
- all **15** generated/dynamic routes completed build generation;
- `/portfolio` and `/acceptance/restore` were present in the generated route set;
- production container reached **Ready**;
- configured healthcheck remained `/api/health`;
- deployment reached **SUCCESS**.

Current production route set:
- `/`
- `/acceptance`
- `/acceptance/restore`
- `/answers`
- `/api/evidence/website`
- `/api/health`
- `/glossary`
- `/intelligence`
- `/manifest.webmanifest`
- `/portfolio`
- `/robots.txt`
- `/sales-engine-app`
- `/sitemap.xml`
- `/strategy`
- `/workbench`

### CI evidence for Cross-Business Intelligence

Merged code revision:

`d9dcbcd46e46a65f1b23e17d40a679bd0a53ad66`

On that merge:
- `Founder OS Standalone Web` run `35089889819`: **SUCCESS**;
- `PHP Lint` run `35089890062`: **SUCCESS**.

PR #5 also passed its pre-merge standalone web and PHP lint runs. The standalone build typechecked, reported no high/critical dependency audit failure, compiled Next.js successfully, generated all 15 routes, and passed the broad/multi-business source contract.

### Canonical/site provenance

`NEXT_PUBLIC_SITE_URL` is configured for the production HTTPS origin. The health endpoint prefers Railway's injected `RAILWAY_GIT_COMMIT_SHA`, so runtime provenance reflects the repository source actually running.

---

## Evidence Loop 004 — Live Production Backend Acceptance

Detailed backend record:

`FDOS-PRODUCTION-BACKEND-ACCEPTANCE-2026-09-16.md`

The production Supabase project contains **19 RLS-enabled Founder Dynasty OS tables** spanning Business Records, core intelligence, Evidence, Value Sprints, Finance, Offers, Operations, Strategy, Customers, Distribution, Assets, Scenarios, Portfolio and Founder Attention.

Earlier ephemeral production-policy tests observed:

| Check | Observed |
|---|---:|
| FDOS tables accepting owner-scoped ephemeral records | **19 / 19** |
| Evidence Proposal approved through production RPC | **1** |
| Owner Business rows visible to foreign authenticated identity | **0** |
| Owner child rows visible to foreign authenticated identity | **0** |
| E2 website Evidence captured | **1** |
| Proposals created by website capture | **2** |
| Proposal approved | **1** |
| Proposal rejected | **1** |
| Evidence-linked canonical Decision created | **1** |
| Synthetic FDOS rows left after cleanup | **0** |

This is real production-policy backend evidence. It is deliberately **not** called genuine second-user browser proof.

### Multi-business creation RPC

Production now includes `public.fdos_create_business(text, text)`.

After deployment, function privileges were inspected live. The first permission pass revealed that revoking from `PUBLIC` did not remove an explicit `anon` execute grant. A follow-up migration corrected the privilege and the live state was checked again.

Current verified live properties:
- `SECURITY DEFINER`: **false**;
- therefore `SECURITY INVOKER`: **true**;
- anonymous execute: **false**;
- authenticated execute: **true**;
- owner derived from `auth.uid()`;
- all 12 Business Stages validated;
- function creates an independent Business Record plus the first E4 `Workspace created` Business Memory event.

This proves the live function definition and privilege boundary. It does not prove a human has created Business B through the browser.

### Supabase security advisor after the multi-business migration

A fresh security-advisor pass found **no Founder Dynasty OS table** in the `RLS enabled, no policy` findings and did not flag `fdos_create_business` as an authenticated `SECURITY DEFINER` RPC.

The advisor did report findings in unrelated schemas/modules and reported project-wide **leaked password protection disabled** for Supabase Auth. Those are real project-level findings, but they should not be mislabeled as failures of the FDOS RLS or multi-business RPC implementation.

---

## Broad product surface in accepted production source

### `/` — Founder Command Center
- active Business Record
- Business Stage + Business DNA
- current goal/focus
- stage-specific job / proof / avoid guidance
- Value Map
- ranked Opportunities
- Risks
- Decisions
- Business Memory
- Missing Intelligence
- Evidence Inbox + founder approval queue
- whole-OS neighborhood map
- Sales OS nested under Customers & Growth

### `/intelligence`
- Idea Lab
- Business X-Ray
- detailed What Am I Missing?
- Value Sprints
- Opportunity → Sprint handoff
- hypothesis → action → measure → result → KEEP / REVISE / REVERT

### `/workbench`
- Finance Center
- E6 financial assumptions
- Product & Offer Lab
- Operations & Execution
- records attached to the selected Business Record

### `/strategy`
- Business Model Lab
- Customer Intelligence
- Marketing & Distribution
- Asset Map
- Founder Attention
- Scenario Lab
- Portfolio / Dynasty Mode

### `/portfolio`
- account-owned Business Registry
- create another independent business/idea
- choose starting Business Stage
- switch active Business Record across major workspaces
- Cross-Business Intelligence totals for high risks, open decisions, blocked initiatives, pending Evidence review, running Value Sprints and planned Founder Attention
- per-business opportunities, assets, measured Value Sprint loops and explainable attention flags
- intentionally no “best business” ranking, valuation, PMF score or fabricated outcome

### `/answers` and `/glossary`
Public answer/discovery content and searchable plain-English definitions.

---

## Auth/account/business privacy boundaries

The runtime includes a root-level `AuthPrivacyGuard`. It forces a hard client boundary on sign-out or direct authentication-account switching so unsaved component-local business drafts cannot remain mounted across identities.

The multi-business layer adds a second boundary: switching the active Business Record performs a hard page reload. The active Business identifier is stored only in account-scoped `sessionStorage` and is validated by an owner-scoped database read before being trusted.

These safeguards are source, CI and runtime verified. **Actual human-browser observation of sign-out, restore and Business A ↔ Business B switching is still pending.**

---

## Production acceptance diagnostics

`/acceptance` remains a read-only browser proof helper and `/acceptance/restore` supports the real save/sign-out/sign-in restoration sequence.

They do not convert unperformed browser actions into green checks. Both remain owner-facing acceptance tooling, not commercial evidence.

---

## Evidence Loop 005 — Acceptance Proof Stability + Fresh Production Runtime

On 2026-09-25, the Business A → Business B acceptance helper was corrected so a completed genuine browser switch remains a completed proof even if the founder later navigates back to the original Business Record.

Merged fix revision:

`b3dc7a3c4a6ce97375b832bdab52cba93f1df342`

CI on that merge:
- `Founder OS Standalone Web` run `36133874028`: **SUCCESS**;
- `PHP Lint` run `36133873831`: **SUCCESS**.

The revised helper still fails invalid evidence when:
- the checkpoint belongs to another authenticated account;
- either recorded Business Record is no longer owner-visible; or
- the recorded start and end Business Records are the same.

Fresh Railway deployment:

`bbf70c93-62be-40d0-a533-ed8ea56e26b8`

Fresh deployed repository revision:

`84bdefefb9bf070f98f3adb28dc23d329bbbb366`

The later repository revision contains the merged web fix; a Sales lead-refresh commit landed before the forced rebuild selected its source revision.

Fresh public runtime checks observed:
- root Founder Dynasty OS page delivered successfully;
- `/acceptance` delivered the production diagnostics shell and remained `noindex, nofollow, nocache`;
- `/api/health` returned `ok: true`;
- health reported `sourceRevision: 84bdefefb9bf070f98f3adb28dc23d329bbbb366`;
- health reported `deploymentId: bbf70c93-62be-40d0-a533-ed8ea56e26b8`;
- health reported `environment: production`;
- Supabase URL, publishable-key, and source-revision configuration checks were all true.

This is production runtime evidence. It still does **not** convert the unperformed authenticated Business A ↔ B sequence into a human PASS.

---

## Current verification state

### SOURCE COMPLETE — current planned technical scope
The broad shared-record OS, multi-business Business Registry and first Cross-Business Intelligence layer are implemented.

### CI VERIFIED
The merged Cross-Business Intelligence revision passed standalone web CI and PHP lint on `main`.

### PRODUCTION RUNTIME VERIFIED
The multi-business/Cross-Business Intelligence web tree is live in Railway deployment `1eddfe30-e3ca-4954-b288-b0c5386fa91a`, sourced from repository revision `7fe9c285fa677fa722d08675d01841bc0a9d2427`, and reached `SUCCESS`/`Ready` with all 15 routes generated.

### LIVE BACKEND ACCEPTANCE VERIFIED
The 19-table RLS graph, Evidence loop, foreign-identity visibility check, cleanup behavior and multi-business RPC privilege boundary have been exercised/inspected against production policies.

### PRODUCTION USER VERIFIED — NOT YET COMPLETE
Still requires genuine browser/user actions:
- sign in on the deployed production site;
- create/load Business A through the deployed UI;
- edit Business DNA and save;
- create an intentional Business B through `/portfolio`;
- switch A ↔ B and confirm persisted records and unsaved drafts do not bleed across businesses;
- sign out → confirm private state disappears;
- fresh sign in → verify saved state/restore behavior;
- use Value / Decision / Risk / Opportunity / Memory flows in the browser;
- Idea Lab write-back;
- Value Sprint create/start/measure/KEEP-REVISE-REVERT with an observable result;
- Finance / Offer / Operations browser writes;
- Strategy / Customer / Distribution / Asset / Attention / Scenario / Portfolio browser writes;
- browser website Evidence capture → approve one Proposal → reject one Proposal;
- second genuine account browser isolation;
- Android/mobile visual/interaction acceptance;
- desktop visual/interaction acceptance.

There is currently only one genuine production auth user, so genuine second-person isolation cannot be truthfully marked complete yet.

### COMMERCIAL EVIDENCE — separate
No technical acceptance event is a customer, sale, payment, revenue event, ROI result or product-market-fit proof.

---

## Current decision

**KEEP** the broad multi-business shared-record architecture, E1–E8 discipline, Founder Command Center, Intelligence Layer, Workbench, Strategy/Dynasty workspace, Business Registry, first Cross-Business Intelligence layer, account/business isolation, production source provenance, website Evidence approval boundary, auth privacy guard, Business switch boundary, and Sales OS nested under Customers & Growth.

**REVISE** when genuine browser evidence identifies a defect or a measured Value Sprint provides evidence for change.

## Highest-value remaining acceptance loop

`open exact production → sign in → create/load Business A → save DNA/stage/core records → create Business B intentionally → switch A ↔ B and verify isolation → Intelligence/X-Ray → one real Value Sprint → /acceptance → sign out → verify private state clears → sign back in → verify restore → browser Evidence approve/reject → Workbench + Strategy writes → second genuine account → mobile + desktop visual pass → KEEP / REVISE / REVERT`

---

## Production completion rule

Keep these states separate:
- **SOURCE COMPLETE** — implementation exists and passes build/type/schema checks.
- **CI VERIFIED** — accepted code actually passed automated checks.
- **PRODUCTION RUNTIME VERIFIED** — accepted code/config is deployed and runtime checks pass.
- **LIVE BACKEND ACCEPTANCE VERIFIED** — production-policy database/RPC behavior has been exercised.
- **PRODUCTION USER VERIFIED** — a genuine authenticated human completes the deployed UI workflow across business/session/device boundaries.
- **COMMERCIAL EVIDENCE** — genuine external customer/user behavior exists.

A successful database transaction is not a human using the product. A green deploy is not a customer. A $150 offer field is not $150 revenue. Boring distinctions remain useful because reality is annoyingly resistant to marketing copy.
