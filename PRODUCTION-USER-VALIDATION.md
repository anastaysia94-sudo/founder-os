# Founder Dynasty OS 10.0 — Production/User Validation

Updated: 2026-09-16

This document tracks production and user validation evidence only. A deployment, migration, CI pass, outbound email, backend smoke test, or green badge is not automatically a customer, payment, revenue event, or successful human workflow.

## Evidence Loop 001 — Public Sales OS Delivery

Production service: `sales-engine-pwa`  
Public domain: `https://sales-engine-pwa-production.up.railway.app`

Previously observed public Chromium traffic successfully retrieved the Sales OS application and required assets. This is public-delivery evidence only. It does not prove prospect response, payment, revenue, or the standalone Founder Dynasty OS authenticated workflow.

**Decision: KEEP.**

---

## Evidence Loop 002 — Genuine Prospect Outreach

A real outreach email was sent to Therma Tech at `info@thermatechhvac.com`. The pipeline preserved the prospect as Contacted while reply, paid, fulfilled, and opt-out fields remained empty unless those events genuinely occurred.

Current canonical pipeline state still records `paid: 0`; the standard offer value is not booked revenue.

**Decision: OBSERVE.** A sent email is not a reply, customer, payment, or revenue.

---

## Evidence Loop 003 — Standalone Founder Dynasty OS Production Runtime

Railway service: `founder-dynasty-os-web`  
Public domain: `https://founder-dynasty-os-web-production.up.railway.app`

Accepted privacy-hardened **web code revision**:

`8cf11db3c798f5a90d19e892c217ab88d79232e6`

Commit:

`fix(web): enforce auth privacy boundary across modules`

Current production deployment:

`6a976ff8-bc37-4c7c-864d-767bb3f5556b`

Current deployed **repository revision**:

`31ee76a27e3a825ba9efd9628b07990320c8d310`

The later repository revision contains the same accepted `web/` code tree plus current AI/status documentation. It was rebuilt after production canonical-site configuration was added.

Observed on 2026-09-16:
- deployment status: **SUCCESS**;
- Railway identified exact repository revision `31ee76a27e3a825ba9efd9628b07990320c8d310`;
- repository: `anastaysia94-sudo/founder-os`;
- branch: `main`;
- root directory: `/web`;
- dependency installation reported **0 vulnerabilities**;
- Next.js 16.3.4 compiled successfully;
- TypeScript completed successfully;
- all 13 generated/dynamic routes completed build generation;
- production container started and became Ready;
- configured healthcheck remained `/api/health`;
- deployment reached `SUCCESS`.

Current production route set:
- `/`
- `/acceptance`
- `/answers`
- `/api/evidence/website`
- `/api/health`
- `/glossary`
- `/intelligence`
- `/manifest.webmanifest`
- `/robots.txt`
- `/sales-engine-app`
- `/sitemap.xml`
- `/strategy`
- `/workbench`

### Production canonical / sitemap configuration

`NEXT_PUBLIC_SITE_URL` is set to the production HTTPS domain.

The existing metadata/sitemap implementation therefore has the production origin available for:
- canonical metadata;
- Open Graph URL;
- structured WebApplication URL;
- sitemap entries for `/`, `/answers`, and `/glossary`.

`/acceptance` remains intentionally excluded/noindex.

### Source provenance hardening

The health endpoint prefers Railway's automatically injected `RAILWAY_GIT_COMMIT_SHA`, falling back to `FDOS_DEPLOY_REV` only when necessary. Production provenance therefore reports the repository revision actually running instead of a manually maintained aspiration wearing a cheerful status badge.

### Build determinism hardening

Next.js 16 TypeScript defaults are committed in `web/tsconfig.json`, including `jsx: react-jsx` and `.next/dev/types/**/*.ts`. Production builds do not depend on Next rewriting those settings inside the build container.

### Current CI evidence

For the last web-changing revision `8cf11db3c798f5a90d19e892c217ab88d79232e6`:
- `Founder OS Standalone Web` run `35073170177`: **SUCCESS**;
- `PHP Lint` run `35073170169`: **SUCCESS**.

The standalone workflow verifies dependency/vulnerability gates, TypeScript, Next.js production build, Command Center, Intelligence Layer, Workbench, Strategy/Dynasty, Glossary, persistence contracts, RLS migrations, Evidence restrictions, acceptance diagnostics/noindex behavior, and health endpoint behavior.

---

## Evidence Loop 004 — Live Production Backend Acceptance

Detailed record:

`FDOS-PRODUCTION-BACKEND-ACCEPTANCE-2026-09-16.md`

The live Supabase production project contains **19 RLS-enabled Founder Dynasty OS tables** across the shared Business Record, core intelligence, Evidence, Value Sprints, Finance, Offers, Operations, Strategy, Customers, Distribution, Assets, Scenarios, Portfolio and Founder Attention.

A production-policy acceptance transaction used ephemeral owner-scoped data, exercised all 19 tables, changed the authenticated JWT identity to a foreign UUID for an RLS visibility check, and then deleted the temporary Business Record.

Observed:

| Check | Observed |
|---|---:|
| FDOS tables accepting owner-scoped ephemeral records | **19 / 19** |
| Evidence Proposal approved through production RPC | **1** |
| Owner Business rows visible to foreign authenticated identity | **0** |
| Owner child rows visible to foreign authenticated identity | **0** |
| Owner Business rows remaining after cleanup | **0** |

This is real production-policy backend evidence. It is stronger than merely reading policy definitions, but it is deliberately **not** called genuine second-user browser proof.

### Live website Evidence loop acceptance

A second ephemeral production transaction exercised the Evidence loop:

| Check | Observed |
|---|---:|
| E2 Evidence captured | **1** |
| pending review Proposals created | **2** |
| Proposal approved | **1** |
| Proposal rejected | **1** |
| approved Decision retaining E2 Evidence/source link | **1** |
| `External evidence captured` Business Memory events | **1** |
| Business Records remaining after cleanup | **0** |

After both tests, the sum of persistent synthetic rows across all 19 `fdos_*` tables was checked again:

**0 synthetic FDOS rows remained.**

No acceptance record is a customer, payment, sale, or market validation event.

### Production RPC security

Verified live:
- `fdos_ensure_business`
- `fdos_store_website_evidence`
- `fdos_apply_evidence_proposal`

All three are `SECURITY INVOKER`; anonymous execution is denied and authenticated execution is allowed.

---

## Broad product surface in the accepted source

### `/` — Founder Command Center
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
- persistent records attached to the same Business Record

### `/strategy`
- Business Model Lab
- Customer Intelligence
- Marketing & Distribution
- Asset Map
- Founder Attention
- Scenario Lab
- Portfolio / Dynasty Mode

### `/answers`
Public answer-oriented discovery content intended for search/AEO entry points.

### `/glossary`
Searchable plain-English glossary for business, Evidence and technical terms.

---

## Auth/session privacy hardening

The accepted runtime includes a root-level `AuthPrivacyGuard` in addition to each workspace's scoped hydration guards.

It watches Supabase identity changes and creates a hard client boundary on:
- sign-out from an authenticated account; or
- direct account switching.

The guard updates/clears the previous account identifier in browser `sessionStorage` and reloads the application once at that boundary. The reload clears unsaved local React state across **all** mounted modules, including Idea Lab drafts, Value Sprint drafts/results, Finance drafts, Offer drafts, Initiative drafts, Strategy drafts, Customer notes, Distribution experiments, Asset drafts, Scenario drafts, Founder Attention drafts and Portfolio drafts.

This closes the source-level privacy gap where persisted records were account-scoped but unsaved component-local drafts could otherwise remain mounted during an in-place identity change.

**Source, CI and runtime deployment are verified. Genuine browser observation of sign-out/account-switch behavior is still pending.**

---

## AI handoff integrity

The canonical AI continuation material was audited after the broad standalone rebuild. Stale instructions that still centered WordPress deployment were corrected in:
- `AGENTS.md`
- `AI-HANDOFF.md`
- `.github/copilot-instructions.md`

Current assistants are now directed toward the standalone shared-Business-Record product and genuine production-user acceptance rather than historical WordPress-first milestones.

---

## Production acceptance diagnostics

`/acceptance` remains a read-only browser proof helper. It:
- calls `/api/health` and displays runtime revision;
- inspects the genuine Supabase browser session;
- reads the authenticated user's earliest Business Record without manufacturing one;
- performs RLS-scoped record-count reads across the broad FDOS model;
- records viewport and user agent;
- reports PASS / FAIL / WAITING;
- can copy a diagnostic snapshot;
- performs no synthetic acceptance writes;
- leaves sign-out/restore, second-user isolation and visual acceptance WAITING until a person actually performs them.

The route remains `index: false`, `follow: false`, nocache and omitted from sitemap.

---

## Sales OS neighborhood integration

`/sales-engine-app` bridges to the separately deployed Sales OS.

Sales remains a major operating module for prospecting, outreach, follow-up and CRM history under **Customers & Growth**. It does not define Founder Dynasty OS, and offer values are not imported as revenue. The currently verified Sales OS payment total remains **$0** unless new direct payment evidence appears.

---

## Current verification state

### SOURCE COMPLETE
Broad shared-Business-Record architecture and the current planned module surface are implemented.

### CI VERIFIED
The accepted privacy-hardened web revision passes standalone web CI and PHP lint.

### PRODUCTION RUNTIME VERIFIED
The accepted web code tree is live on Railway in deployment `6a976ff8-bc37-4c7c-864d-767bb3f5556b`, with production canonical URL configuration, and reached `SUCCESS` with the configured healthcheck.

### LIVE BACKEND ACCEPTANCE VERIFIED
All 19 FDOS persistence neighborhoods, the Evidence capture/review RPC loop, cleanup behavior and a foreign-identity RLS visibility check have been exercised against production policies with no synthetic FDOS rows left behind.

### PRODUCTION USER VERIFIED — NOT YET COMPLETE
Still requires genuine browser/user actions:
- sign in on the deployed production site;
- create/load the first real Business Record through the deployed UI;
- edit Business DNA and save;
- sign out → confirm private persisted state and unsaved drafts disappear;
- fresh sign in → verify restore;
- use core Value / Decision / Risk / Opportunity / Memory flows in the browser;
- Idea Lab write-back;
- real Value Sprint create/start/measure/KEEP-REVISE-REVERT with an observable result;
- Finance / Offer / Operations browser writes;
- Strategy / Customer / Distribution / Asset / Attention / Scenario / Portfolio browser writes;
- browser website Evidence capture → approve one Proposal → reject one Proposal;
- second genuine account browser isolation;
- direct account-switch privacy observation;
- Android/mobile visual/interaction acceptance;
- desktop visual/interaction acceptance.

There is currently only one production auth user, so genuine second-user browser proof cannot exist yet without creating a second real test/user account.

---

## Current decision

**KEEP** the broad shared-Business-Record architecture, E1–E8 discipline, Founder Command Center, Intelligence Layer, Workbench, Strategy/Dynasty workspace, Answers/AEO surface, Plain-English Glossary, account-owned persistence, production source provenance, production canonical-site configuration, `/api/health`, noindex `/acceptance`, atomic Business bootstrap, atomic Evidence persistence, relationship-aware RLS, global auth/privacy boundary, deterministic TypeScript config, corrected AI handoff, and Sales OS nested under Customers & Growth.

**REVISE** only when genuine browser evidence reveals a real defect or a measured Value Sprint provides a reason to change the system.

## Highest-value remaining acceptance loop

`open production → sign in → create/load Business Record → edit Business DNA → change stage → Value + Decision + Risk + Opportunity + Memory → Idea Lab/X-Ray → run one Value Sprint → /acceptance → sign out → verify all private state/drafts clear → sign back in → verify restore → browser Evidence capture → approve + reject → Workbench writes → Strategy/Dynasty writes → second genuine account → mobile + desktop visual pass → KEEP / REVISE / REVERT`

---

## Production completion rule

Keep these states separate:
- **SOURCE COMPLETE** — implementation exists and passes build/type/schema checks.
- **CI VERIFIED** — the accepted web code actually passed automated checks.
- **PRODUCTION RUNTIME VERIFIED** — accepted code/config is deployed and runtime checks pass.
- **LIVE BACKEND ACCEPTANCE VERIFIED** — production-policy database/RPC behavior has been exercised.
- **PRODUCTION USER VERIFIED** — a genuine authenticated human completes the deployed UI workflow across session/device boundaries.
- **COMMERCIAL EVIDENCE** — genuine external customer/user behavior exists.

A successful database transaction is not a human using the product. A green deploy is not a customer. A $150 offer field is not $150 revenue. Keeping those facts separate is exactly the kind of boring discipline this OS is supposed to enforce.
