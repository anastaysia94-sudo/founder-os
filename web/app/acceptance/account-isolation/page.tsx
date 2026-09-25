'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

const CHECKPOINT_KEY = 'fdos.acceptance.account-isolation.v1';

const childTables = [
  'fdos_value_items',
  'fdos_decisions',
  'fdos_risks',
  'fdos_opportunities',
  'fdos_memory',
  'fdos_evidence',
  'fdos_evidence_proposals',
  'fdos_value_sprints',
  'fdos_financial_assumptions',
  'fdos_offer_hypotheses',
  'fdos_initiatives',
  'fdos_business_model_elements',
  'fdos_customer_insights',
  'fdos_distribution_experiments',
  'fdos_business_assets',
  'fdos_scenarios',
  'fdos_portfolio_theses',
  'fdos_attention_blocks',
] as const;

type ResultState = 'waiting' | 'pass' | 'fail';

type Checkpoint = {
  version: 1;
  armedAt: string;
  sourceUserId: string | null;
  sourceBusinessIds: string[];
  sourceBusinessCount: number;
  signedOutObservedAt: string | null;
  verifiedAt: string | null;
  differentUserObserved: boolean | null;
  sourceBusinessRowsVisibleToSecondUser: number | null;
  sourceChildRowsVisibleToSecondUser: number | null;
  result: ResultState;
  detail: string;
};

type CurrentAccount = {
  user: User | null;
  businessCount: number | null;
};

const shell: React.CSSProperties = { maxWidth: 1000, margin: '0 auto', padding: '32px 20px 64px' };
const card: React.CSSProperties = { border: '1px solid rgba(120,120,140,.28)', borderRadius: 18, padding: 20, marginTop: 18, background: 'rgba(255,255,255,.03)' };
const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 12 };

function readCheckpoint(): Checkpoint | null {
  try {
    const raw = window.sessionStorage.getItem(CHECKPOINT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Checkpoint;
    return parsed?.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

function writeCheckpoint(value: Checkpoint | null) {
  try {
    if (value) window.sessionStorage.setItem(CHECKPOINT_KEY, JSON.stringify(value));
    else window.sessionStorage.removeItem(CHECKPOINT_KEY);
  } catch {
    // The page remains usable, but cross-auth proof cannot persist without sessionStorage.
  }
}

async function loadOwnedBusinessIds(user: User) {
  const query = await supabase
    .from('fdos_business_records')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });
  if (query.error) throw query.error;
  return (query.data || []).map((row: any) => String(row.id));
}

export default function AccountIsolationAcceptancePage() {
  const [account, setAccount] = useState<CurrentAccount>({ user: null, businessCount: null });
  const [checkpoint, setCheckpoint] = useState<Checkpoint | null>(null);
  const [state, setState] = useState<ResultState>('waiting');
  const [detail, setDetail] = useState('Reading the current browser session…');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(async () => {
    setBusy(true);
    setCopied(false);

    try {
      const stored = readCheckpoint();
      const { data, error } = await supabase.auth.getUser();
      if (error && !data.user) throw error;
      const currentUser = data.user || null;

      if (!currentUser) {
        setAccount({ user: null, businessCount: null });
        if (stored) {
          const observed = stored.signedOutObservedAt
            ? stored
            : { ...stored, signedOutObservedAt: new Date().toISOString() };
          if (!stored.signedOutObservedAt) writeCheckpoint(observed);
          setCheckpoint(observed);
          setState('waiting');
          setDetail('A signed-out browser state has been observed. Sign in with a different genuine account, then return here to test whether Account A records remain invisible.');
        } else {
          setCheckpoint(null);
          setState('waiting');
          setDetail('Sign in as Account A, then arm an isolation checkpoint.');
        }
        return;
      }

      const ownedIds = await loadOwnedBusinessIds(currentUser);
      setAccount({ user: currentUser, businessCount: ownedIds.length });
      setCheckpoint(stored);

      if (!stored) {
        setState('waiting');
        setDetail(ownedIds.length
          ? 'Account is signed in and owns at least one Business Record. Arm a checkpoint to begin the second-account isolation test.'
          : 'This account has no Business Record yet. Open Founder Dynasty OS once before starting the isolation test.');
        return;
      }

      if (stored.verifiedAt && (stored.result === 'pass' || stored.result === 'fail')) {
        setState(stored.result);
        setDetail(stored.detail);
        return;
      }

      if (stored.sourceUserId === currentUser.id) {
        setState('waiting');
        setDetail('Checkpoint armed for Account A. Sign out here or switch directly to a different genuine account. The global auth privacy guard should reload the app at the identity boundary.');
        return;
      }

      if (!stored.sourceUserId || stored.sourceBusinessIds.length === 0) {
        const invalid: Checkpoint = {
          ...stored,
          sourceUserId: null,
          sourceBusinessIds: [],
          verifiedAt: new Date().toISOString(),
          differentUserObserved: true,
          sourceBusinessRowsVisibleToSecondUser: null,
          sourceChildRowsVisibleToSecondUser: null,
          result: 'fail',
          detail: 'FAIL: the source-account checkpoint no longer contains the temporary Business IDs required to perform the isolation read.',
        };
        writeCheckpoint(invalid);
        setCheckpoint(invalid);
        setState('fail');
        setDetail(invalid.detail);
        return;
      }

      const sourceIds = [...stored.sourceBusinessIds];

      const businessRead = await supabase
        .from('fdos_business_records')
        .select('id', { count: 'exact', head: true })
        .in('id', sourceIds);

      let businessVisible = businessRead.error ? null : businessRead.count ?? 0;
      let childVisible = 0;
      let childReadError: string | null = null;

      if (!businessRead.error) {
        for (const table of childTables) {
          const query = await supabase
            .from(table)
            .select('id', { count: 'exact', head: true })
            .in('business_id', sourceIds);
          if (query.error) {
            childReadError = `${table}: ${query.error.message}`;
            break;
          }
          childVisible += query.count ?? 0;
        }
      }

      const passed = !businessRead.error && !childReadError && businessVisible === 0 && childVisible === 0;
      const completed: Checkpoint = {
        ...stored,
        sourceUserId: null,
        sourceBusinessIds: [],
        verifiedAt: new Date().toISOString(),
        differentUserObserved: true,
        sourceBusinessRowsVisibleToSecondUser: businessVisible,
        sourceChildRowsVisibleToSecondUser: childReadError ? null : childVisible,
        result: passed ? 'pass' : 'fail',
        detail: passed
          ? `PASS: a different authenticated account was observed, and it could read 0 of Account A's ${stored.sourceBusinessCount} Business Records and 0 child rows across the FDOS module tables. Temporary source IDs were redacted from sessionStorage after verification.`
          : `FAIL: second-account isolation could not be proven. Business rows visible: ${businessVisible === null ? 'read error' : businessVisible}; child rows visible: ${childReadError ? childReadError : childVisible}.`,
      };

      writeCheckpoint(completed);
      setCheckpoint(completed);
      setState(completed.result);
      setDetail(completed.detail);
    } catch (error: any) {
      setState('fail');
      setDetail(error?.message || 'The account-isolation verifier could not read the current production state.');
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const { data } = supabase.auth.onAuthStateChange(() => void refresh());
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  const canArm = Boolean(account.user && (account.businessCount || 0) > 0 && !checkpoint);
  const canSignOut = Boolean(account.user && checkpoint && !checkpoint.verifiedAt && checkpoint.sourceUserId === account.user.id);

  const statusLabel = useMemo(() => state === 'pass' ? 'PASS' : state === 'fail' ? 'FAIL' : 'WAITING', [state]);

  async function armCheckpoint() {
    if (!account.user) return;
    setBusy(true);
    try {
      const ids = await loadOwnedBusinessIds(account.user);
      if (!ids.length) {
        setState('waiting');
        setDetail('This account has no Business Record to protect yet.');
        return;
      }

      const next: Checkpoint = {
        version: 1,
        armedAt: new Date().toISOString(),
        sourceUserId: account.user.id,
        sourceBusinessIds: ids,
        sourceBusinessCount: ids.length,
        signedOutObservedAt: null,
        verifiedAt: null,
        differentUserObserved: null,
        sourceBusinessRowsVisibleToSecondUser: null,
        sourceChildRowsVisibleToSecondUser: null,
        result: 'waiting',
        detail: 'Checkpoint armed for Account A.',
      };
      writeCheckpoint(next);
      setCheckpoint(next);
      setState('waiting');
      setDetail('Checkpoint armed. Sign out or switch to a different genuine account, then return here. The temporary source Business IDs stay only in this browser session and are automatically redacted after verification.');
    } catch (error: any) {
      setState('fail');
      setDetail(error?.message || 'Could not arm the isolation checkpoint.');
    } finally {
      setBusy(false);
    }
  }

  async function signOutForTest() {
    if (!canSignOut) return;
    setBusy(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setState('fail');
      setDetail(error.message);
      setBusy(false);
    }
    // AuthPrivacyGuard reloads the client at the genuine identity boundary.
  }

  function resetTest() {
    writeCheckpoint(null);
    setCheckpoint(null);
    setState('waiting');
    setDetail(account.user ? 'Checkpoint cleared. Arm a new test when ready.' : 'Checkpoint cleared. Sign in as Account A to begin.');
  }

  async function copyEvidence() {
    const evidence = {
      capturedAt: new Date().toISOString(),
      result: state,
      detail,
      browser: { width: window.innerWidth, height: window.innerHeight, userAgent: navigator.userAgent },
      currentAccountSignedIn: Boolean(account.user),
      currentBusinessCount: account.businessCount,
      checkpoint,
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(evidence, null, 2));
      setCopied(true);
    } catch {
      setState('fail');
      setDetail('Clipboard access failed. The on-screen evidence is still available.');
    }
  }

  return (
    <main style={shell}>
      <p style={{ letterSpacing: '.12em', fontSize: 12, fontWeight: 800 }}>SMARTPICKSHOP HOLDINGS · FOUNDER DYNASTY OS 10.0</p>
      <h1 style={{ fontSize: 'clamp(2rem,6vw,4rem)', lineHeight: 1, marginBottom: 12 }}>Second-account isolation proof</h1>
      <p style={{ maxWidth: 800, fontSize: 18, lineHeight: 1.55 }}>
        This verifier tests the part source code cannot honestly prove by itself: whether a second genuine signed-in account can see Account A's private Founder Dynasty OS records. It writes no business data.
      </p>

      <section style={card}>
        <div style={grid}>
          <div><small>Status</small><h2>{statusLabel}</h2></div>
          <div><small>Current browser account</small><h3>{account.user ? 'Signed in' : 'Signed out'}</h3></div>
          <div><small>Current account businesses</small><h3>{account.businessCount ?? '—'}</h3></div>
          <div><small>Account A businesses checkpointed</small><h3>{checkpoint?.sourceBusinessCount ?? '—'}</h3></div>
        </div>
        <p>{detail}</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" disabled={busy} onClick={() => void refresh()}>{busy ? 'Checking…' : 'Refresh proof'}</button>
          <button type="button" disabled={busy || !canArm} onClick={() => void armCheckpoint()}>Arm Account A checkpoint</button>
          <button type="button" disabled={busy || !canSignOut} onClick={() => void signOutForTest()}>Sign out Account A</button>
          <button type="button" disabled={busy || !checkpoint} onClick={() => void copyEvidence()}>{copied ? 'Evidence copied' : 'Copy evidence JSON'}</button>
          <button type="button" disabled={busy || !checkpoint} onClick={resetTest}>Reset test</button>
        </div>
      </section>

      <section style={card}>
        <h2>Exact sequence</h2>
        <ol style={{ lineHeight: 1.8 }}>
          <li>Sign in as Account A and make sure it owns at least one real Business Record.</li>
          <li>Click <strong>Arm Account A checkpoint</strong>.</li>
          <li>Either click <strong>Sign out Account A</strong> or use a direct account switch.</li>
          <li>Sign in as a different genuine Account B.</li>
          <li>Return to this page. PASS requires Account B to see zero Account A Business rows and zero child rows across the FDOS module tables.</li>
          <li>Copy the evidence JSON if you want a durable acceptance receipt, then reset the test.</li>
        </ol>
      </section>

      {checkpoint && (
        <section style={card}>
          <h2>Checkpoint evidence</h2>
          <div style={grid}>
            <div><small>Armed</small><p>{checkpoint.armedAt}</p></div>
            <div><small>Signed-out state observed</small><p>{checkpoint.signedOutObservedAt || 'Not required for a direct account switch'}</p></div>
            <div><small>Different account observed</small><p>{checkpoint.differentUserObserved === null ? 'Not yet' : checkpoint.differentUserObserved ? 'Yes' : 'No'}</p></div>
            <div><small>Verified</small><p>{checkpoint.verifiedAt || 'Not yet'}</p></div>
            <div><small>Account A Business rows visible to B</small><p>{checkpoint.sourceBusinessRowsVisibleToSecondUser ?? '—'}</p></div>
            <div><small>Account A child rows visible to B</small><p>{checkpoint.sourceChildRowsVisibleToSecondUser ?? '—'}</p></div>
          </div>
        </section>
      )}

      <section style={card}>
        <h2>Privacy behavior</h2>
        <p>While the test is armed, this browser session temporarily stores only Account A's opaque user ID and Business IDs so Account B can attempt the exact owner-scoped reads. After a second-account verification finishes, those raw IDs are automatically removed from the checkpoint. No Business DNA, customer notes, evidence text, revenue data, or other private business content is stored in the acceptance checkpoint.</p>
        <p><a href="/acceptance">Back to production acceptance diagnostics</a> · <a href="/acceptance/restore">Run sign-out → sign-in restore proof</a> · <a href="/">Founder Command Center</a></p>
      </section>
    </main>
  );
}
