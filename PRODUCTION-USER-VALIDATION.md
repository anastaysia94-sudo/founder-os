# Founder Dynasty OS 10.0 — Production/User Validation

Updated: 2026-09-12

This document tracks production and user validation evidence only. It does not convert deployments, researched prospects, outbound messages, internal tests, database smoke tests, or implemented product surfaces into claims of customers, revenue, ROI, product-market fit, or successful fulfillment.

## Evidence Loop 001 — Public Sales OS Delivery

### Hypothesis
A real external browser can reach the Same-Day Customer Growth Pack production PWA and retrieve the minimum assets needed to present the live sales operating system and prospect feed without server-side failure.

### External action
Production service: `sales-engine-pwa`
Public domain: `https://sales-engine-pwa-production.up.railway.app`
Production environment: Railway project `same-day-customer-growth-pack`.

### Observed evidence
- Railway reports the current `sales-engine-pwa` deployment as `SUCCESS` with one running replica and no current service issues.
- Railway healthcheck for `/` succeeded.
- Observed external Chromium traffic received HTTP 200 responses for `/`, `/styles.css`, `/supabase-config.js`, `/app.js`, `/manifest.webmanifest`, `/data/scripts.json`, `/data/leads.json`, `/favicon.ico`, `/icon.svg`, and `/sw.js`.
- The sampled production HTTP window contained 2xx/3xx responses and no observed 4xx or 5xx responses.
- Observed response latency in that window was low: sampled p50 approximately 2 ms and p99 approximately 12 ms at the Railway edge/service measurement layer.

### Evidence classification
- E1 Verified Fact: deployment state, healthcheck state, repository configuration, RLS configuration.
- E2 Current External Evidence: real public-domain HTTP requests and returned status codes.
- E4 Internal Observation: interpretation that the production delivery path is functioning for the sampled requests.
- No E3 Customer-Derived Evidence is claimed from this loop because no authenticated external user or customer feedback is present.

### Decision
**KEEP** the current public Railway PWA delivery path.

**REVISE** the production validation milestone: architecture work is not the priority. The next required proof is authenticated-user persistence and a real workflow event written/read through Supabase from the production client.

### Limitations
This loop proves public delivery of the PWA assets in the sampled production traffic. It does not prove visual correctness on every device, authentication success, cross-device persistence, offline reconciliation, prospect response, payment, customer acquisition, revenue, or commercial conversion.

---

## Evidence Loop 002 — Genuine Prospect Outreach (in observation)

### Hypothesis
A verified prospect can be contacted through the current evidence-backed sales workflow, with the real contact event preserved separately from research refreshes.

### External action observed
On 2026-09-07 a real outreach email was sent from the connected Gmail account to Therma Tech at `info@thermatechhvac.com` using the prospect-specific Same-Day Customer Growth Pack message. Gmail message/thread ID: `1a07d94dc355abc7`.

### Current observed result
- Send event exists in Gmail and is labeled SENT.
- No genuine reply was present at the immediate follow-up check.
- Pipeline history records Therma Tech as `Contacted` while leaving reply, paid, fulfilled, and opt-out fields empty unless those events actually occur.

### Evidence classification
- E1 Verified Fact: Gmail send event and message identifier.
- E2 Current External Evidence: verified prospect/contact endpoint used for outreach.
- E4 Internal Observation: pipeline transition from Contact Ready to Contacted.
- E3 Customer-Derived Evidence: **none yet**.

### Decision state
**OBSERVE**. Do not count the send as a reply, customer, payment, revenue, or successful conversion. If a genuine reply occurs, classify and record it. If no reply occurs after the defined follow-up window, record that non-response as the outcome and use it to REVISE targeting/message strategy rather than inventing success.

---

## Evidence Loop 003 — Standalone Founder Dynasty OS Web Production Acceptance

### Scope
This loop covers the source-implemented broad standalone `web/` surfaces around the shared business record: Business Stage, Business DNA, Founder Command Center, Value Map, Decisions, Opportunities, Risks, Business Memory, authenticated persistence structure, evidence capture/review structure, metadata, and production deployment.

### Source state verified
The `web/` source currently connects the broad shell to one shared `BusinessRecord` model containing:

- Business DNA and stage;
- value items;
- decisions;
- risks;
- opportunities;
- business memory;
- evidence-linked proposals.

The Supabase-backed store loads and writes these modules against one account-owned business ID rather than maintaining unrelated local copies.

### Production build/runtime evidence
Railway service: `founder-dynasty-os-web`
Public domain: `https://founder-dynasty-os-web-production.up.railway.app`
Production deployment: `8ac92b65-717d-4dac-bd97-839781742219`
Deployed source commit: `6804c96f0efaf1d98b9184e7996da9f69b4a088e`

Observed Railway evidence:

- deployment status: `SUCCESS`;
- production build executed `npm install --ignore-scripts && npm run build`;
- npm audit in the Railway build reported `0 vulnerabilities` for the installed production dependency set at that deployment;
- Next.js compilation completed successfully;
- TypeScript validation completed successfully;
- static generation completed successfully;
- build emitted `/`, `/answers`, `/api/evidence/website`, `/manifest.webmanifest`, `/robots.txt`, and `/sitemap.xml`;
- production container started successfully with Next.js 16.3.4;
- Railway healthcheck on `/` succeeded;
- subsequent observed crawler requests to `/robots.txt` returned HTTP 200.

### Production data-layer evidence
On 2026-09-12 the production Supabase project was inspected directly.

Verified tables:

- `fdos_business_records`
- `fdos_value_items`
- `fdos_decisions`
- `fdos_risks`
- `fdos_opportunities`
- `fdos_memory`
- `fdos_evidence`
- `fdos_evidence_proposals`

RLS is enabled on every listed FDOS table. Owner-scoped policies use `auth.uid() = user_id`; the proposal table has explicit SELECT/INSERT/UPDATE/DELETE owner policies.

The `fdos_apply_evidence_proposal` RPC exists and requires the proposal to be pending and owned by `auth.uid()` before applying it. It records the approved proposal in Business Memory.

A production-database transactional smoke test inserted a temporary Business Record plus representative Value, Decision, Risk, Opportunity, Memory, and Evidence rows inside a single transaction, verified the Business Record existed, and rolled the transaction back. No smoke-test rows were left behind.

### What this proves

**VERIFIED:**

- the broad standalone shell compiles and type-checks in the real production build environment;
- the deployed service starts and passes its Railway root healthcheck;
- the shared FDOS persistence tables exist in production;
- owner-scoped RLS is configured on the implemented FDOS tables;
- the production schema accepts the representative shared-record persistence shapes exercised by the rollback smoke test;
- the evidence-proposal apply function has an owner/pending-state gate in its database implementation.

### What is not yet proven

**NOT YET PROVEN:**

- a real browser session signing into the standalone Founder Dynasty OS web app and creating its first `fdos_business_records` row;
- Business DNA save → logout → second-session login → restore through the standalone web UI;
- UI-level create/read flows for Value, Decision, Risk, Opportunity, and Memory in a real authenticated production browser;
- website evidence capture through the deployed `/api/evidence/website` route with a real authenticated token;
- founder approve/reject of evidence proposals through the production UI;
- second-user isolation through two genuine authenticated browser sessions;
- visual correctness on every supported Android/desktop viewport.

The production database currently contains no persistent FDOS business records, so authenticated standalone-web workflow completion must not be claimed yet.

### Current decision

**KEEP** the shared Business Record architecture and broad-shell direction.

**REVISE** the definition of "done": any source-implemented Founder Dynasty OS web feature must clear both build/schema checks and a real authenticated production UI workflow before it is called 100% production-tested.

The highest-value remaining acceptance loop is:

`sign in → create/load Business Record → edit Business DNA → change stage → add Value + Decision + Risk + Opportunity + Memory → log out → sign back in → verify restore → capture website evidence → approve/reject proposals → verify evidence links + memory → second-user isolation → mobile/desktop visual pass → KEEP / REVISE / REVERT`.

---

## Sales OS Authenticated Persistence Validation Status

The Sales OS has separate authenticated-persistence evidence and should not be used as proof that the standalone Founder Dynasty OS web client has completed the same browser-level workflow.

## Production completion rule

For every source-implemented feature, distinguish:

- **SOURCE COMPLETE** — implementation exists and passes build/type/schema checks;
- **PRODUCTION RUNTIME VERIFIED** — deployed runtime and relevant external dependency path work;
- **PRODUCTION USER VERIFIED** — a real authenticated user completes the feature in the deployed UI and state survives the required session/device boundaries;
- **COMMERCIAL EVIDENCE** — genuine external customer/user behavior exists.

Do not collapse these categories. Humans have already invented enough ways to call something "done" while quietly meaning four different things.
