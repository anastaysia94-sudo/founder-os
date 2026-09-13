# Founder Dynasty OS — Database Changes

This directory preserves source-controlled database changes that have been applied to the production Supabase project for Founder Dynasty OS.

## Rule

A database change is not complete because SQL exists in a chat, migration editor, or local scratch file. For Founder Dynasty OS, database work is complete only when the relevant steps are satisfied:

1. the migration is reviewed for scope and does not silently modify unrelated products that share the Supabase project;
2. the migration is applied through the Supabase migration path;
3. required tables/functions/policies/indexes are inspected after application;
4. exposed RPCs are checked for their actual `SECURITY INVOKER` / `SECURITY DEFINER` mode, safe `search_path`, and effective EXECUTE ACLs;
5. do not assume `REVOKE ... FROM PUBLIC` removed a role-specific grant: inspect the effective grants and explicitly revoke `anon` when an RPC must require authentication;
6. RLS review checks relationship integrity, not only matching owner columns: a child row must not be able to point at another account's Business Record or Evidence merely because its own `user_id` matches the caller;
7. Supabase security and performance advisors are rerun when the change affects schema, RLS, functions, foreign keys, or indexes;
8. relevant advisor findings are either fixed or explicitly documented as out of scope;
9. persistence behavior is smoke-tested without leaving synthetic production data behind;
10. the exact applied change is mirrored under `db/migrations/`;
11. browser-level authenticated behavior remains a separate production-user acceptance requirement when the change backs a user-facing feature.

## Scope boundary

The production Supabase project contains data structures for products other than Founder Dynasty OS. Do not treat a project-wide advisor finding as permission to rewrite another product's schema. FDOS migrations should be narrowly scoped to `fdos_*` objects unless the owning product explicitly authorizes broader work.

## Current FDOS production hardening migrations

### Foreign-key indexes and RLS initialization

`migrations/20260913_optimize_fdos_rls_and_foreign_key_indexes.sql`

This migration:

- added covering indexes for FDOS owner/user foreign keys and Evidence Proposal foreign keys;
- optimized FDOS owner-policy calls from direct `auth.uid()` evaluation to `(select auth.uid())`;
- preserved owner-isolation behavior.

The Supabase performance advisor no longer reports the earlier FDOS unindexed-foreign-key or `auth_rls_initplan` findings.

### Atomic first-Business bootstrap

`migrations/20260913_add_atomic_fdos_business_bootstrap.sql`

This migration created `fdos_ensure_business()` so first-workspace creation is serialized and the Business Record plus initial E4 memory event are created together.

### Atomic website Evidence persistence

`migrations/20260913_add_atomic_fdos_website_evidence_capture.sql`

This migration created `fdos_store_website_evidence(...)`, which writes the E2 Evidence row, all generated review proposals, and the Evidence-capture Business Memory event in one transaction. Partial evidence loops are therefore rolled back rather than left behind.

### RPC execution restriction

`migrations/20260913_restrict_fdos_rpc_execute_to_authenticated.sql`

A production ACL inspection found that explicit `anon` EXECUTE grants could survive a revoke from `PUBLIC`. This migration explicitly removes anonymous execution from FDOS application RPCs and retains authenticated execution.

### Relationship-aware RLS

`migrations/20260913_enforce_fdos_business_relationships_in_rls.sql`

This migration strengthens child-table policies so owner identity and referenced Business ownership must agree. Evidence Proposal policies also require the linked Evidence to belong to the same user and Business Record.

This matters because `user_id = auth.uid()` alone is not enough to prevent a malicious caller from supplying another tenant's known `business_id` as a foreign key. Multi-tenant isolation should validate the relationship, not merely admire the UUIDs and hope everyone behaves.

## Verification discipline

After an FDOS database migration, inspect at least the relevant subset of:

- table RLS enablement;
- policy roles, USING expressions, and WITH CHECK expressions;
- function security mode and configured search path;
- effective function EXECUTE grants, including explicit role grants;
- foreign-key indexes;
- security advisor output;
- performance advisor output;
- persistent row counts when synthetic smoke work is expected to roll back.

For database-only commits, track database migration provenance separately from web runtime provenance. Do not perform a meaningless web redeployment solely to make the repository HEAD SHA match when the deployed `web/` tree is unchanged.

## Evidence discipline

Database schema/RLS verification is E1-style technical evidence about the system. It is not customer evidence and does not prove that a user completed the corresponding browser workflow. Keep those claims separate.
