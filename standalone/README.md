# FDOS Standalone Decision Lab

A browser-only Founder Dynasty OS interface with **no WordPress and no backend requirement**.

## Run
Open `index.html` in a modern browser. Data is stored only in that browser's `localStorage` until exported.

## Current features
- founder workspace basics
- E1–E8 Evidence Vault entries with confidence, provenance and limitations
- Opportunity Ranking using impact × evidence strength × speed × reversibility ÷ cost/complexity/risk
- Value Sprint creation with baseline, action, KPI, guardrails, deadline and decision rule
- portable schema-versioned JSON export
- local persistence

## Important boundaries
This build does not crawl websites, sync accounts, authenticate users, call AI models, ingest Shopify data, or prove business outcomes. It is a portable decision/evidence interface. Do not enter secrets or sensitive production/customer data into a shared browser.

Next milestone: schema-validated import/migration and Dynasty Vault decision history.