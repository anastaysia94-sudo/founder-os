# Founder Dynasty OS 10.0 — Production/User Validation

Updated: 2026-09-16

This document tracks production and user validation evidence only. A deployment, migration, CI pass, outbound email, internal test, or database smoke test is not automatically a customer, payment, revenue event, or successful user workflow.

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

## Evidence Loop 003 — Standalone Founder Dynasty OS Production Acceptance

### Current accepted web runtime

Railway service: `founder-dynasty-os-web`  
Public domain: `https://founder-dynasty-os-web-production.up.railway.app`

Accepted current web revision:

`9ae56202470e75040c76a08a25b6f074d5808577`

Commit:

`chore(web): align TypeScript config with Next 16`

Railway deployment:

`d7fa868c-e074-46d9-abe2-77f3f3adcf38`

Observed on 2026-09-16:

- deployment status: `SUCCESS`;
- Railway identifies exact source commit `9ae56202470e75040c76a08a25b6f074d5808577`;
- repository: `anastaysia94-sudo/founder-os`;
- branch: `main`;
- root directory: `/web`;
- dependency installation completed with 0 reported vulnerabilities;
- Next.js 16.3.4 compilation passed;
- TypeScript passed;
- static generation completed;
- the committed TypeScript config required no automatic Next.js rewrite during this build;
- the production container started successfully;
- configured healthcheck remains `/api/health`;
- the deployment reached `SUCCESS`;
- stale commit `284c496...` is no longer the active deployment.

Current production build route set:

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

### Source provenance hardening

The health endpoint prefers Railway's automatically injected `RAILWAY_GIT_COMMIT_SHA`, falling back to `FDOS_DEPLOY_REV` only when necessary.

This matters because an earlier normal Railway redeploy reused stale source even though GitHub `main` had moved. Production provenance should report the code actually running, not a manually typed aspiration with a green badge attached to it.

### Build determinism hardening

Next.js 16 had been rewriting the repository TypeScript configuration during production builds by adding `.next/dev/types/**/*.ts` and changing JSX mode to `react-jsx`.

Those required values are now committed in `web/tsconfig.json`. The accepted `9ae562...` Railway build completed TypeScript and route generation without rewriting that config again. Build containers are now less inclined to perform surprise interior decorating.

### Current CI evidence

For web revision `9ae56202470e75040c76a08a25b6f074d5808577`:

- `Founder OS Standalone Web` run `35072232659`: **SUCCESS**;
- `PHP Lint` run `35072232717`: **SUCCESS**.

The standalone workflow verifies:

- dependency installation;
- high/critical dependency vulnerability gate;
- TypeScript;
- Next.js production build;
- Command Center contract;
- Intelligence Layer contract;
- Build & Run Workbench contract;
- Strategy / Dynasty workspace contract;
- Plain-English Glossary contract;
- Value Sprint persistence contract;
- operating-workbench persistence contract;
- strategy persistence contract;
- relationship-aware RLS migrations;
- Evidence persistence and authenticated RPC restrictions;
- acceptance diagnostics and noindex contract;
- health endpoint revision/cache behavior.

## Current broad product surface in accepted source

### `/` — Founder Command Center

Current source includes:

- Business Stage;
- Business DNA;
- current goal/focus;
- stage-specific job / proof / avoid guidance;
- best-ranked Opportunity;
- biggest saved Risk;
- unresolved Decision;
- latest Business Memory;
- What Am I Missing? summary;
- Value Map;
- Opportunity Engine;
- Risk Center;
- Decision Engine;
- Business Memory;
- Evidence Inbox and founder approval queue;
- whole-OS neighborhood map;
- Sales OS nested under Customers & Growth.

### `/intelligence` — Founder Intelligence Layer

Current source includes:

- Idea Lab;
- Business X-Ray;
- detailed What Am I Missing? engine;
- Value Sprints;
- top-Opportunity-to-Sprint prefill;
- hypothesis → action → measure → result → KEEP / REVISE / REVERT;
- Business Memory entries for sprint planning and decisions.

### `/workbench` — Build & Run Workbench

Current source includes:

- Finance Center;
- E6 financial model assumptions;
- Product & Offer Lab;
- Operations & Execution;
- stateful persistent records attached to the same Business Record.

### `/strategy` — Strategy / Dynasty Workspace

Current source includes:

- Business Model Lab;
- Customer Intelligence;
- Marketing & Distribution;
- Asset Map;
- Founder Attention;
- Scenario Lab;
- Portfolio / Dynasty Mode;
- evidence-aware strategic signals.

### `/glossary` — Plain-English Glossary

Current source includes a searchable glossary for business, evidence and technical terms. Technical vocabulary is not allowed to become a toll booth between the founder and their own business.

## Production data layer

The broad FDOS model contains **19 RLS-enabled tables**.

### Core Business Record / Evidence

- `fdos_business_records`
- `fdos_value_items`
- `fdos_decisions`
- `fdos_risks`
- `fdos_opportunities`
- `fdos_memory`
- `fdos_evidence`
- `fdos_evidence_proposals`

### Learning / Build / Run

- `fdos_value_sprints`
- `fdos_financial_assumptions`
- `fdos_offer_hypotheses`
- `fdos_initiatives`

### Strategy / Assets / Dynasty

- `fdos_business_model_elements`
- `fdos_customer_insights`
- `fdos_distribution_experiments`
- `fdos_business_assets`
- `fdos_scenarios`
- `fdos_portfolio_theses`
- `fdos_attention_blocks`

The migration set enforces owner/business relationships, same-business Evidence relationships, E1–E8 evidence classes, and covering indexes for the expanded foreign keys.

## Atomic Business Record bootstrap

`public.fdos_ensure_business()` remains the authenticated first-workspace bootstrap.

Verified source/database properties include:

- `SECURITY INVOKER`;
- explicit safe search path;
- ownership derived from `auth.uid()`;
- unauthenticated calls rejected;
- same-user first creation serialized with a transaction-scoped advisory lock;
- returns the existing earliest Business Record when present;
- otherwise creates the default Business Record and initial E4 `Workspace created` memory event atomically.

## Atomic website Evidence persistence

`public.fdos_store_website_evidence(...)` stores E2 website Evidence, generated review Proposals, and capture Business Memory in one transaction.

Verified source/database properties include:

- `SECURITY INVOKER`;
- explicit `search_path = public, pg_temp`;
- current user derived from `auth.uid()`;
- target Business ownership verified;
- Evidence identifier/timestamp and Proposal rows returned;
- failed persistence rolls back the capture rather than leaving half a loop.

## Protected mutation verification

The data stores require positive returned-row confirmation for sensitive mutations. A zero-row RLS-filtered mutation cannot be presented to the user as successful merely because the request itself did not throw.

## Relationship-aware tenant isolation

Owner-column RLS is not treated as sufficient by itself. Current policies/migrations constrain Business and optional Evidence relationships so a user cannot pair their own `user_id` with another account's Business/Evidence identifier and call that isolation.

## Auth/session privacy hardening

Current client source:

- version-tags hydration requests;
- ignores stale/superseded hydration;
- clears private Business Record state on sign-out;
- clears old private state before hydrating a directly switched account;
- clears Proposals, Evidence receipt, composer/edit state and website input with the private workspace;
- clears password state after successful authentication/sign-out;
- verifies an Evidence-capture session still belongs to the initiating user.

These safeguards are **SOURCE COMPLETE** and are present in the accepted current deployment. Their user-observed behavior still requires genuine browser acceptance.

## Production acceptance diagnostics

`/acceptance` is a read-only browser proof helper. It is designed to:

- call `/api/health` and display runtime revision;
- inspect whether a genuine Supabase browser session exists;
- read the authenticated user's earliest Business Record without creating one;
- perform RLS-scoped record-count reads across the broad FDOS model;
- record browser viewport and user agent;
- display PASS / FAIL / WAITING states;
- copy a JSON diagnostic snapshot;
- perform no acceptance-test writes;
- leave sign-out/restore, second-user isolation, and visual acceptance WAITING until those events actually happen.

The route is configured as owner-facing diagnostics, not content marketing:

- `index: false`;
- `follow: false`;
- nocache;
- omitted from sitemap.

## Sales OS neighborhood integration

`/sales-engine-app` bridges to the separately deployed Sales OS.

Sales remains a major operating module for prospecting, outreach, follow-up and CRM history under **Customers & Growth**. It does not define the broader product, and its offer prices are not automatically imported as revenue.

## What is verified now

### SOURCE COMPLETE / CI VERIFIED / CURRENT PRODUCTION RUNTIME VERIFIED

- exact accepted web revision `9ae56202470e75040c76a08a25b6f074d5808577` deployed;
- Railway deployment `d7fa868c-e074-46d9-abe2-77f3f3adcf38` is `SUCCESS`;
- stale Railway source issue is resolved for the current deployment;
- GitHub standalone web CI passed;
- PHP lint passed;
- broad route set builds in production;
- committed Next.js 16 TypeScript configuration no longer drifts during build;
- Command Center, Intelligence, Workbench, Strategy/Dynasty and Glossary source are in the accepted production revision;
- 19-table persistence model is represented by the current migration/source contract;
- RLS/Evidence relationship hardening remains part of the verified source/database layer;
- Sales OS remains nested under Customers & Growth;
- no commercial payment has been fabricated from offer values or pipeline status.

## What remains genuinely unproven

### PRODUCTION USER VERIFIED — NOT YET COMPLETE

Still requires a real authenticated production browser/session to demonstrate:

- sign in on the current deployed revision;
- first Business Record bootstrap/load;
- Business DNA save and restore after sign-out + fresh sign-in;
- private Business content disappears on sign-out;
- Value, Decision, Risk, Opportunity and Memory create/read flows;
- Idea Lab write-back;
- Value Sprint create/start/measure/KEEP-REVISE-REVERT flow using an observable result;
- Finance / Offer / Operations persistent writes;
- Strategy / Customer / Distribution / Asset / Attention / Scenario / Portfolio persistent writes;
- authenticated website Evidence capture;
- approve one Proposal and reject one Proposal;
- approved Evidence-linked changes and Business Memory survive restore;
- a second genuine user cannot read or mutate the first user's data;
- direct account switching clears old private UI before the next user's record appears;
- `/acceptance` observes expected account-owned state in those genuine sessions;
- Android/mobile visual/interaction acceptance;
- desktop visual/interaction acceptance.

These are not paperwork leftovers. They are the final boundary between “the software exists in production” and “a human has proven the production workflow.”

## Current decision

**KEEP** the broad shared-Business-Record architecture, E1–E8 discipline, Founder Command Center, Intelligence Layer, Workbench, Strategy/Dynasty workspace, Plain-English Glossary, account-owned persistence, founder approval before evidence-derived canonical changes, production source provenance, `/api/health`, noindex `/acceptance`, atomic Business bootstrap, atomic Evidence persistence, relationship-aware RLS, privacy guards, deterministic TypeScript config, and Sales OS nested under Customers & Growth.

**REVISE** the deployment provenance mechanism by preferring Railway's injected Git commit SHA and keep build configuration committed rather than relying on build-time mutation. Both revisions are implemented and deployed.

## Highest-value remaining acceptance loop

`open current production → sign in → create/load Business Record → edit Business DNA → change stage → add Value + Decision + Risk + Opportunity + Memory → Idea Lab + X-Ray → plan/run one Value Sprint → open /acceptance → sign out → confirm private state clears → sign back in → verify restore → website Evidence capture → approve one Proposal → reject one Proposal → Workbench writes → Strategy/Dynasty writes → second-user isolation → mobile + desktop visual pass → KEEP / REVISE / REVERT`

---

## Production completion rule

Keep these states separate:

- **SOURCE COMPLETE** — implementation exists and passes build/type/schema checks.
- **PRODUCTION RUNTIME VERIFIED** — exact accepted source/migrations are deployed and required runtime/dependency paths work.
- **PRODUCTION USER VERIFIED** — a genuine authenticated user completes the feature in deployed UI and state survives required session/device boundaries.
- **COMMERCIAL EVIDENCE** — genuine external customer/user behavior exists.

Do not collapse them. A green deploy icon is useful. It is not a customer, a payment, or a person successfully using the entire product. Computers remain annoyingly literal about this distinction.
