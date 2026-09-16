'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getActiveBusinessId } from '@/lib/business-store';
import { supabase } from '@/lib/supabase';

type CheckState = 'pass' | 'fail' | 'waiting';
type Check = { id: string; label: string; state: CheckState; detail: string };
type BusinessView = { id: string; name: string | null; stage: string | null; updatedAt: string | null };
type SwitchCheckpoint = {
  version: 1;
  userId: string;
  armedAt: string;
  startBusinessId: string;
  startBusinessName: string | null;
  completedAt: string | null;
  endBusinessId: string | null;
  endBusinessName: string | null;
};
type Snapshot = {
  capturedAt: string;
  runtime: { healthOk: boolean; sourceRevision: string | null; environment: string | null };
  browser: { width: number; height: number; userAgent: string };
  auth: { signedIn: boolean; userId: string | null };
  portfolio: { businessCount: number | null; activeBusinessId: string | null; activeBusinessName: string | null; activeSelectionStored: boolean };
  business: { loaded: boolean; businessId: string | null; name: string | null; stage: string | null; updatedAt: string | null };
  switchCheckpoint: SwitchCheckpoint | null;
  counts: Record<string, number | null>;
  checks: Check[];
};

const SWITCH_KEY = 'fdos.acceptance.business-switch.v1';

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

function readSwitchCheckpoint(): SwitchCheckpoint | null {
  try {
    const raw = window.sessionStorage.getItem(SWITCH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SwitchCheckpoint;
    return parsed?.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

function writeSwitchCheckpoint(value: SwitchCheckpoint | null) {
  try {
    if (value) window.sessionStorage.setItem(SWITCH_KEY, JSON.stringify(value));
    else window.sessionStorage.removeItem(SWITCH_KEY);
  } catch {
    // The diagnostics still work; only cross-reload switch proof is unavailable.
  }
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
    setMessage('Reading production runtime and account-owned records without changing business data…');

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

    let businesses: BusinessView[] = [];
    let activeBusiness: BusinessView | null = null;
    let activeSelectionStored = false;
    let switchCheckpoint = readSwitchCheckpoint();

    if (currentUser) {
      const businessQuery = await supabase
        .from('fdos_business_records')
        .select('id,name,stage,updated_at,created_at')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: true });

      if (businessQuery.error) {
        checks.push({ id: 'business-registry-read', label: 'The signed-in user can read the owned Business Registry', state: 'fail', detail: businessQuery.error.message });
      } else {
        businesses = (businessQuery.data || []).map((row: any) => ({ id: row.id, name: row.name, stage: row.stage, updatedAt: row.updated_at }));
        checks.push({ id: 'business-registry-read', label: 'The signed-in user can read the owned Business Registry', state: 'pass', detail: `${businesses.length} owned Business Record${businesses.length === 1 ? '' : 's'} visible.` });

        const storedId = getActiveBusinessId(currentUser.id);
        activeSelectionStored = Boolean(storedId);
        activeBusiness = businesses.find((business) => business.id === storedId) || businesses[0] || null;

        if (storedId && !businesses.some((business) => business.id === storedId)) {
          checks.push({ id: 'active-business-owner-check', label: 'Stored active Business belongs to the signed-in account', state: 'fail', detail: 'The browser stored an active Business ID that is not visible through the current user RLS scope. The application should fall back rather than trust it.' });
        } else if (activeBusiness) {
          checks.push({ id: 'active-business-owner-check', label: 'Active Business belongs to the signed-in account', state: 'pass', detail: `Active record: “${activeBusiness.name || 'Untitled Business'}” (${activeBusiness.stage || 'unknown stage'}).` });
        } else {
          checks.push({ id: 'active-business-owner-check', label: 'Active Business belongs to the signed-in account', state: 'waiting', detail: 'No persistent Business Record exists yet. Open the main app while signed in to create/load the first workspace.' });
        }

        checks.push({
          id: 'multi-business-ready',
          label: 'At least two owned Business Records exist for real switch testing',
          state: businesses.length >= 2 ? 'pass' : 'waiting',
          detail: businesses.length >= 2
            ? `${businesses.length} owned Business Records are available for A ↔ B browser testing.`
            : 'Create a second intentional business or idea in /portfolio before testing Business A ↔ Business B isolation.',
        });
      }
    }

    if (currentUser && activeBusiness) {
      for (const [key, table] of tables) {
        const q = await supabase.from(table).select('id', { count: 'exact', head: true }).eq('user_id', currentUser.id).eq('business_id', activeBusiness.id);
        counts[key] = q.error ? null : q.count ?? 0;
        checks.push({ id: `read-${table}`, label: `${table} is readable for the active Business through the current user's RLS scope`, state: q.error ? 'fail' : 'pass', detail: q.error ? q.error.message : `${q.count ?? 0} visible row${q.count === 1 ? '' : 's'} for active Business ${activeBusiness.id}.` });
      }
    } else {
      for (const [, table] of tables) checks.push({ id: `read-${table}`, label: `${table} is readable for the active Business through the current user's RLS scope`, state: 'waiting', detail: 'Requires a signed-in account with an active persistent Business Record.' });
    }

    if (currentUser && activeBusiness && switchCheckpoint) {
      if (switchCheckpoint.userId !== currentUser.id) {
        checks.push({ id: 'business-switch-proof', label: 'A genuine active-Business switch has been observed in this browser', state: 'fail', detail: 'The stored switch checkpoint belongs to a different authenticated account. Reset it rather than carrying acceptance evidence across identities.' });
      } else if (switchCheckpoint.startBusinessId !== activeBusiness.id) {
        const startStillOwned = businesses.some((business) => business.id === switchCheckpoint?.startBusinessId);
        if (startStillOwned) {
          const completed = switchCheckpoint.completedAt
            ? switchCheckpoint
            : { ...switchCheckpoint, completedAt: new Date().toISOString(), endBusinessId: activeBusiness.id, endBusinessName: activeBusiness.name };
          if (!switchCheckpoint.completedAt) writeSwitchCheckpoint(completed);
          switchCheckpoint = completed;
          checks.push({ id: 'business-switch-proof', label: 'A genuine active-Business switch has been observed in this browser', state: 'pass', detail: `PASS: this browser moved from “${completed.startBusinessName || completed.startBusinessId}” to “${activeBusiness.name || activeBusiness.id}”, and both records are owner-visible.` });
        } else {
          checks.push({ id: 'business-switch-proof', label: 'A genuine active-Business switch has been observed in this browser', state: 'fail', detail: 'The Business Record used to arm the checkpoint is no longer owner-visible.' });
        }
      } else {
        checks.push({ id: 'business-switch-proof', label: 'A genuine active-Business switch has been observed in this browser', state: 'waiting', detail: 'Switch to a different owned Business Record using the global selector or /portfolio, then return here. The reload is part of the privacy boundary.' });
      }
    } else {
      checks.push({ id: 'business-switch-proof', label: 'A genuine active-Business switch has been observed in this browser', state: 'waiting', detail: businesses.length >= 2 ? 'Arm a Business switch checkpoint below, then switch to another owned Business Record.' : 'Requires a signed-in account with at least two intentional Business Records.' });
    }

    checks.push({ id: 'restore-proof', label: 'Sign-out → fresh sign-in restore has been observed', state: 'waiting', detail: 'Use /acceptance/restore. This page does not manufacture a restore pass from source code or database state.' });
    checks.push({ id: 'second-user-proof', label: 'A second genuine user has been used to verify isolation', state: 'waiting', detail: 'This remains a manual production-user acceptance step. Database policy inspection is not substituted for a genuine second session.' });
    checks.push({ id: 'visual-proof', label: 'Mobile and desktop visual acceptance has been observed', state: 'waiting', detail: 'Record the real viewport/device result after inspecting the deployed UI.' });

    const next: Snapshot = {
      capturedAt: new Date().toISOString(),
      runtime: { healthOk, sourceRevision, environment },
      browser: { width: window.innerWidth, height: window.innerHeight, userAgent: navigator.userAgent },
      auth: { signedIn: Boolean(currentUser), userId: currentUser?.id || null },
      portfolio: { businessCount: currentUser ? businesses.length : null, activeBusinessId: activeBusiness?.id || null, activeBusinessName: activeBusiness?.name || null, activeSelectionStored },
      business: { loaded: Boolean(activeBusiness), businessId: activeBusiness?.id || null, name: activeBusiness?.name || null, stage: activeBusiness?.stage || null, updatedAt: activeBusiness?.updatedAt || null },
      switchCheckpoint,
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

  function armBusinessSwitchProof() {
    if (!user || !snapshot?.business.businessId || (snapshot.portfolio.businessCount || 0) < 2) return;
    const checkpoint: SwitchCheckpoint = {
      version: 1,
      userId: user.id,
      armedAt: new Date().toISOString(),
      startBusinessId: snapshot.business.businessId,
      startBusinessName: snapshot.business.name,
      completedAt: null,
      endBusinessId: null,
      endBusinessName: null,
    };
    writeSwitchCheckpoint(checkpoint);
    setMessage('Business switch checkpoint armed. Use the active-business selector or /portfolio to open a different business, then return here.');
    void runChecks();
  }

  function resetBusinessSwitchProof() {
    writeSwitchCheckpoint(null);
    setMessage('Business switch checkpoint cleared.');
    void runChecks();
  }

  async function copySnapshot() {
    if (!snapshot) return;
    try { await navigator.clipboard.writeText(JSON.stringify(snapshot, null, 2)); setCopied(true); }
    catch { setMessage('Clipboard access failed. The diagnostic results are still visible on this page.'); }
  }

  return (
    <main style={shell}>
      <p style={{ letterSpacing: '.12em', fontSize: 12, fontWeight: 800 }}>SMARTPICKSHOP HOLDINGS · FOUNDER DYNASTY OS 10.0</p>
      <h1 style={{ fontSize: 'clamp(2rem,6vw,4.2rem)', lineHeight: 1, marginBottom: 12 }}>Production acceptance diagnostics</h1>
      <p style={{ maxWidth: 800, fontSize: 18, lineHeight: 1.55 }}>This page reads the current deployed runtime, genuine Supabase browser session, active Business Record and account-owned FDOS records. It writes no synthetic business data. Browser-only acceptance markers live in sessionStorage so real reload/switch actions can be observed without contaminating Business Memory.</p>

      <section style={card}>
        <div style={grid}>
          <div><small>Browser account</small><h3>{user ? 'Signed in' : 'Signed out'}</h3></div>
          <div><small>Runtime health</small><h3>{snapshot?.runtime.healthOk ? 'Healthy' : snapshot ? 'Needs attention' : 'Checking'}</h3></div>
          <div><small>Owned businesses</small><h3>{snapshot?.portfolio.businessCount ?? '—'}</h3></div>
          <div><small>Checks passed</small><h3>{totals.pass}</h3></div>
          <div><small>Waiting on human proof</small><h3>{totals.waiting}</h3></div>
          <div><small>Failures</small><h3>{totals.fail}</h3></div>
        </div>
        <p>{message}</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" disabled={running} onClick={() => void runChecks()}>{running ? 'Running checks…' : 'Run browser checks again'}</button>
          <button type="button" disabled={!snapshot} onClick={() => void copySnapshot()}>{copied ? 'Snapshot copied' : 'Copy diagnostic snapshot'}</button>
          <a href="/acceptance/restore">Run sign-out → sign-in restore proof</a>
          <a href="/">Return to Founder Dynasty OS</a>
        </div>
      </section>

      {snapshot && <>
        <section style={card}>
          <h2>Current browser evidence</h2>
          <div style={grid}>
            <div><small>Deployed revision</small><p style={{ overflowWrap: 'anywhere' }}>{snapshot.runtime.sourceRevision || 'Not reported'}</p></div>
            <div><small>Active Business Record</small><p>{snapshot.business.loaded ? snapshot.business.name || 'Untitled Business' : 'Not loaded'}</p></div>
            <div><small>Business stage</small><p>{snapshot.business.stage || 'Not available'}</p></div>
            <div><small>Browser active-selection marker</small><p>{snapshot.portfolio.activeSelectionStored ? 'Present' : 'Using first owned record fallback'}</p></div>
            <div><small>Viewport</small><p>{snapshot.browser.width} × {snapshot.browser.height}</p></div>
          </div>
        </section>

        <section style={card}>
          <h2>Business A ↔ Business B browser proof</h2>
          <p>This verifies that this actual browser crossed from one owner-visible active Business Record to another through the product's hard reload boundary. It does not pretend that a switch alone proves every field is isolated; module reads below are still scoped to the active <code>business_id</code>, and second-user isolation remains separate.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" disabled={running || !user || (snapshot.portfolio.businessCount || 0) < 2} onClick={armBusinessSwitchProof}>Arm Business switch proof</button>
            <a href="/portfolio">Open Business Registry</a>
            <button type="button" disabled={!snapshot.switchCheckpoint} onClick={resetBusinessSwitchProof}>Reset switch proof</button>
          </div>
          {snapshot.switchCheckpoint && <div style={{ ...grid, marginTop: 14 }}>
            <div><small>Armed</small><p>{snapshot.switchCheckpoint.armedAt}</p></div>
            <div><small>Started on</small><p>{snapshot.switchCheckpoint.startBusinessName || snapshot.switchCheckpoint.startBusinessId}</p></div>
            <div><small>Completed</small><p>{snapshot.switchCheckpoint.completedAt || 'Not yet'}</p></div>
            <div><small>Ended on</small><p>{snapshot.switchCheckpoint.endBusinessName || snapshot.switchCheckpoint.endBusinessId || 'Not yet'}</p></div>
          </div>}
        </section>

        <section style={card}><h2>Read-only active-Business record counts</h2><div style={grid}>{Object.entries(snapshot.counts).map(([key, value]) => <div key={key}><small>{key}</small><h3>{value === null ? '—' : value}</h3></div>)}</div></section>
        <section style={card}><h2>Acceptance checks</h2><div style={{ display: 'grid', gap: 10 }}>{snapshot.checks.map((check) => <article key={check.id} style={{ border: '1px solid rgba(120,120,140,.22)', borderRadius: 14, padding: 14 }}><strong>{stateText(check.state)} · {check.label}</strong><p style={{ marginBottom: 0 }}>{check.detail}</p></article>)}</div></section>
        <section style={card}><h2>What still requires a real browser action</h2><p>Create/change real records only where they are genuinely part of the business. Exercise Business A and Business B, use the switch proof above, run the restore verifier, capture/review website Evidence, complete one observable Value Sprint, repeat account isolation with a second genuine user, and inspect both mobile and desktop. Waiting remains waiting until the browser actually proves it.</p></section>
      </>}
    </main>
  );
}
