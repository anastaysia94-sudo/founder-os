'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type CheckState = 'pass' | 'fail' | 'waiting';
type Check = { id: string; label: string; state: CheckState; detail: string };
type Snapshot = {
  capturedAt: string;
  runtime: { healthOk: boolean; sourceRevision: string | null; environment: string | null };
  browser: { width: number; height: number; userAgent: string };
  auth: { signedIn: boolean; userId: string | null };
  business: { loaded: boolean; businessId: string | null; name: string | null; stage: string | null; updatedAt: string | null };
  counts: Record<string, number | null>;
  checks: Check[];
};

const tables = [
  ['valueItems', 'fdos_value_items'],
  ['decisions', 'fdos_decisions'],
  ['risks', 'fdos_risks'],
  ['opportunities', 'fdos_opportunities'],
  ['memory', 'fdos_memory'],
  ['evidence', 'fdos_evidence'],
  ['evidenceProposals', 'fdos_evidence_proposals'],
  ['valueSprints', 'fdos_value_sprints'],
  ['financialAssumptions', 'fdos_financial_assumptions'],
  ['offerHypotheses', 'fdos_offer_hypotheses'],
  ['initiatives', 'fdos_initiatives'],
  ['businessModelElements', 'fdos_business_model_elements'],
  ['customerInsights', 'fdos_customer_insights'],
  ['distributionExperiments', 'fdos_distribution_experiments'],
  ['businessAssets', 'fdos_business_assets'],
  ['scenarios', 'fdos_scenarios'],
  ['portfolioTheses', 'fdos_portfolio_theses'],
  ['attentionBlocks', 'fdos_attention_blocks'],
] as const;

const shell: React.CSSProperties = { maxWidth: 1120, margin: '0 auto', padding: '32px 20px 64px' };
const card: React.CSSProperties = { border: '1px solid rgba(120,120,140,.28)', borderRadius: 18, padding: 20, marginTop: 18, background: 'rgba(255,255,255,.03)' };
const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 12 };

function stateText(state: CheckState) {
  if (state === 'pass') return 'PASS';
  if (state === 'fail') return 'FAIL';
  return 'WAITING';
}

export default function ProductionAcceptancePage() {
  const [user, setUser] = useState<User | null>(null);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('Checking the current browser session…');
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [copied, setCopied] = useState(false);

  const runChecks = useCallback(async () => {
    setRunning(true);
    setCopied(false);
    setMessage('Reading production runtime and account-owned records without changing them…');

    const checks: Check[] = [];
    const counts: Record<string, number | null> = Object.fromEntries(tables.map(([key]) => [key, null]));
    let sourceRevision: string | null = null;
    let environment: string | null = null;
    let healthOk = false;

    try {
      const response = await fetch('/api/health', { cache: 'no-store' });
      const body = await response.json();
      healthOk = response.ok && body?.ok === true;
      sourceRevision = typeof body?.sourceRevision === 'string' ? body.sourceRevision : null;
      environment = typeof body?.environment === 'string' ? body.environment : null;
      checks.push({ id: 'runtime-health', label: 'Exact deployed runtime answers its health check', state: healthOk ? 'pass' : 'fail', detail: healthOk ? `Runtime revision: ${sourceRevision || 'reported without a revision'}` : 'The health endpoint did not return a healthy result.' });
    } catch (error: any) {
      checks.push({ id: 'runtime-health', label: 'Exact deployed runtime answers its health check', state: 'fail', detail: error?.message || 'Health request failed.' });
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    const currentUser = userData.user || null;
    setUser(currentUser);
    checks.push({ id: 'auth-session', label: 'A genuine Supabase browser session is active', state: currentUser && !userError ? 'pass' : 'waiting', detail: currentUser ? 'Authenticated browser session is present.' : 'Sign in through the main Founder Dynasty OS page, then run these checks again.' });

    let businessId: string | null = null;
    let businessName: string | null = null;
    let businessStage: string | null = null;
    let updatedAt: string | null = null;

    if (currentUser) {
      const business = await supabase.from('fdos_business_records').select('id,name,stage,updated_at').eq('user_id', currentUser.id).order('created_at', { ascending: true }).limit(1).maybeSingle();
      if (business.error) checks.push({ id: 'business-read', label: 'The signed-in user can read an owned Business Record', state: 'fail', detail: business.error.message });
      else if (!business.data) checks.push({ id: 'business-read', label: 'The signed-in user can read an owned Business Record', state: 'waiting', detail: 'No persistent Business Record exists for this account yet. Open the main app while signed in to create/load the workspace.' });
      else {
        businessId = business.data.id;
        businessName = business.data.name;
        businessStage = business.data.stage;
        updatedAt = business.data.updated_at;
        checks.push({ id: 'business-read', label: 'The signed-in user can read an owned Business Record', state: 'pass', detail: `Loaded “${businessName || 'Untitled Business'}” at stage ${businessStage || 'unknown'}.` });
      }
    }

    if (currentUser && businessId) {
      for (const [key, table] of tables) {
        const q = await supabase.from(table).select('id', { count: 'exact', head: true }).eq('user_id', currentUser.id).eq('business_id', businessId);
        counts[key] = q.error ? null : q.count ?? 0;
        checks.push({ id: `read-${table}`, label: `${table} is readable through the current user's RLS scope`, state: q.error ? 'fail' : 'pass', detail: q.error ? q.error.message : `${q.count ?? 0} visible row${q.count === 1 ? '' : 's'}.` });
      }
    } else {
      for (const [, table] of tables) checks.push({ id: `read-${table}`, label: `${table} is readable through the current user's RLS scope`, state: 'waiting', detail: 'Requires a signed-in account with a persistent Business Record.' });
    }

    checks.push({ id: 'restore-proof', label: 'Sign-out → fresh sign-in restore has been observed', state: 'waiting', detail: 'This requires a real human browser sequence. The diagnostic page deliberately does not manufacture a pass from source code or database state.' });
    checks.push({ id: 'second-user-proof', label: 'A second genuine user has been used to verify isolation', state: 'waiting', detail: 'This remains a manual production-user acceptance step. Database policy inspection is not substituted for a genuine second session.' });
    checks.push({ id: 'visual-proof', label: 'Mobile and desktop visual acceptance has been observed', state: 'waiting', detail: 'Record the real viewport/device result after inspecting the deployed UI.' });

    const next: Snapshot = {
      capturedAt: new Date().toISOString(),
      runtime: { healthOk, sourceRevision, environment },
      browser: { width: window.innerWidth, height: window.innerHeight, userAgent: navigator.userAgent },
      auth: { signedIn: Boolean(currentUser), userId: currentUser?.id || null },
      business: { loaded: Boolean(businessId), businessId, name: businessName, stage: businessStage, updatedAt },
      counts,
      checks,
    };
    setSnapshot(next);
    setMessage('Read-only browser diagnostics complete. Waiting items still need the actual user workflow.');
    setRunning(false);
  }, []);

  useEffect(() => {
    void runChecks();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => data.subscription.unsubscribe();
  }, [runChecks]);

  const totals = useMemo(() => {
    if (!snapshot) return { pass: 0, fail: 0, waiting: 0 };
    return snapshot.checks.reduce((acc, item) => { acc[item.state] += 1; return acc; }, { pass: 0, fail: 0, waiting: 0 });
  }, [snapshot]);

  async function copySnapshot() {
    if (!snapshot) return;
    try { await navigator.clipboard.writeText(JSON.stringify(snapshot, null, 2)); setCopied(true); }
    catch { setMessage('Clipboard access failed. The diagnostic results are still visible on this page.'); }
  }

  return (
    <main style={shell}>
      <p style={{ letterSpacing: '.12em', fontSize: 12, fontWeight: 800 }}>SMARTPICKSHOP HOLDINGS · FOUNDER DYNASTY OS 10.0</p>
      <h1 style={{ fontSize: 'clamp(2rem,6vw,4.2rem)', lineHeight: 1, marginBottom: 12 }}>Production acceptance diagnostics</h1>
      <p style={{ maxWidth: 760, fontSize: 18, lineHeight: 1.55 }}>This page reads the current deployed runtime, Supabase browser session, and account-owned FDOS records across the Command Center, intelligence, build/run, strategy, asset and Dynasty layers. It writes no test data and refuses to turn unperformed browser steps into fake green checks.</p>

      <section style={card}>
        <div style={grid}>
          <div><small>Browser account</small><h3>{user ? 'Signed in' : 'Signed out'}</h3></div>
          <div><small>Runtime health</small><h3>{snapshot?.runtime.healthOk ? 'Healthy' : snapshot ? 'Needs attention' : 'Checking'}</h3></div>
          <div><small>Checks passed</small><h3>{totals.pass}</h3></div>
          <div><small>Still waiting on human proof</small><h3>{totals.waiting}</h3></div>
          <div><small>Failures</small><h3>{totals.fail}</h3></div>
        </div>
        <p>{message}</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" disabled={running} onClick={() => void runChecks()}>{running ? 'Running checks…' : 'Run browser checks again'}</button>
          <button type="button" disabled={!snapshot} onClick={() => void copySnapshot()}>{copied ? 'Snapshot copied' : 'Copy diagnostic snapshot'}</button>
          <a href="/">Return to Founder Dynasty OS</a>
        </div>
      </section>

      {snapshot && <>
        <section style={card}><h2>Current browser evidence</h2><div style={grid}><div><small>Deployed revision</small><p style={{ overflowWrap: 'anywhere' }}>{snapshot.runtime.sourceRevision || 'Not reported'}</p></div><div><small>Business Record</small><p>{snapshot.business.loaded ? snapshot.business.name || 'Untitled Business' : 'Not loaded'}</p></div><div><small>Business stage</small><p>{snapshot.business.stage || 'Not available'}</p></div><div><small>Viewport</small><p>{snapshot.browser.width} × {snapshot.browser.height}</p></div></div></section>
        <section style={card}><h2>Read-only account-owned record counts</h2><div style={grid}>{Object.entries(snapshot.counts).map(([key, value]) => <div key={key}><small>{key}</small><h3>{value === null ? '—' : value}</h3></div>)}</div></section>
        <section style={card}><h2>Acceptance checks</h2><div style={{ display: 'grid', gap: 10 }}>{snapshot.checks.map((check) => <article key={check.id} style={{ border: '1px solid rgba(120,120,140,.22)', borderRadius: 14, padding: 14 }}><strong>{stateText(check.state)} · {check.label}</strong><p style={{ marginBottom: 0 }}>{check.detail}</p></article>)}</div></section>
        <section style={card}><h2>What still requires a real browser action</h2><p>Use the app to create and change real records across Business DNA, core operating intelligence, Value Sprints, Finance, Offers, Operations, Strategy, Customer Intelligence, Distribution, Assets, Scenarios, Founder Attention and Portfolio/Dynasty as appropriate for the business stage. Then sign out, sign back in, verify restore, capture website Evidence, review Proposals, repeat isolation with a second genuine account, and inspect both mobile and desktop. Return here after each phase. Waiting remains waiting until the browser actually proves it.</p></section>
      </>}
    </main>
  );
}
