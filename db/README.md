# Founder Dynasty OS — Database Changes

This directory preserves source-controlled database changes that have been applied to the production Supabase project for Founder Dynasty OS.

## Rule

A database change is not complete because SQL exists in a chat, migration editor, or local scratch file. For Founder Dynasty OS, database work is complete only when the relevant steps are satisfied:

1. the migration is reviewed for scope and does not silently modify unrelated products that share the Supabase project;
2. the migration is applied through the Supabase migration path;
3. required tables/functions/policies/indexes are inspected after application;
4. Supabase security and performance advisors are rerun when the change affects schema, RLS, functions, foreign keys, or indexes;
5. relevant advisor findings are either fixed or explicitly documented as out of scope;
6. persistence behavior is smoke-tested without leaving synthetic production data behind;
7. the exact applied change is mirrored under `db/migrations/`;
8. browser-level authenticated behavior remains a separate production-user acceptance requirement when the change backs a user-facing feature.

## Scope boundary

The production Supabase project contains data structures for products other than Founder Dynasty OS. Do not treat a project-wide advisor finding as permission to rewrite another product's schema. FDOS migrations should be narrowly scoped to `fdos_*` objects unless the owning product explicitly authorizes broader work.

## Current FDOS hardening migration

`migrations/20260913_optimize_fdos_rls_and_foreign_key_indexes.sql`

This mirrors the production migration that:

- added covering indexes for FDOS owner/user foreign keys and evidence-proposal foreign keys;
- optimized FDOS owner-policy calls from direct `auth.uid()` evaluation to `(select auth.uid())`;
- preserved the existing owner-isolation behavior.

After production application, the Supabase performance advisor no longer reported the earlier FDOS unindexed-foreign-key or `auth_rls_initplan` findings.

## Evidence discipline

Database schema/RLS verification is E1-style technical evidence about the system. It is not customer evidence and does not prove that a user completed the corresponding browser workflow. Keep those claims separate.
