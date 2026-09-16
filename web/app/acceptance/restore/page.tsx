'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getActiveBusinessId } from '@/lib/business-store';
import { supabase } from '@/lib/supabase';

const CHECKPOINT_KEY = 'fdos.acceptance.restore-checkpoint.v2';

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

type Counts = Record<string, number | null>;
type BusinessSnapshot = {
  id: string;
  name: string | null;
  stage: string | null;
  updatedAt: string | null;
  selectionSource: 'stored-active' | 'first-owned-fallback';
  counts: Counts;
};
type RestoreCheckpoint = {
  version: 2;
  armedAt: string;
  userId: string;
  business: BusinessSnapshot;
  signedOutObservedAt: string | null;
  restoredAt: string | null;
};
type RestoreResult = {
  state: 'waiting' | 'pass' | 'fail';
  detail: string;
};

const shell: React.CSSProperties = { maxWidth: 1000, margin: '0 auto', padding: '32px 20px 64px' };
const card: React.CSSProperties = { border: '1px solid rgba(120,120,140,.28)', borderRadius: 18, padding: 20, marginTop: 18, background: 'rgba(255,255,255,.03)' };
const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 12 };

function readCheckpoint(): RestoreCheckpoint | null {
  try {
    const raw = window.sessionStorage.getItem(CHECKPOINT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RestoreCheckpoint;
    return parsed?.version === 2 ? parsed : null;
  } catch {
    return null;
  }
}

function writeCheckpoint(value: RestoreCheckpoint | null) {
  try {
    if (value) window.sessionStorage.setItem(CHECKPOINT_KEY, JSON.stringify(value));
    else window.sessionStorage.removeItem(CHECKPOINT_KEY);
  } catch {
    // The page remains usable, but cannot preserve a restore checkpoint without sessionStorage.
  }
}

function countsEqual(before: Counts, after: Counts) {
  return Object.keys(before).every((key) => before[key] !== null && before[key] === after[key]);
}

async function loadBusiness(user: User): Promise<BusinessSnapshot | null> {
  const storedActiveId = getActiveBusinessId(user.id);
  let businessData: any = null;
  let selectionSource: BusinessSnapshot['selectionSource'] = 'first-owned-fallback';

  if (storedActiveId) {
    const selected = await supabase
      .from('fdos_business_records')
      .select('id,name,stage,updated_at')
      .eq('user_id', user.id)
      .eq('id', storedActiveId)
      .maybeSingle();
    if (selected.error) throw selected.error;
    if (selected.data) {
      businessData = selected.data;
      selectionSource = 'stored-active';
    }
  }

  if (!businessData) {
    const first = await supabase
      .from('fdos_business_records')
      .select('id,name,stage,updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (first.error) throw first.error;
    businessData = first.data;
  }

  if (!businessData) return null;

  const counts: Counts = {};
  for (const [key, table] of tables) {
    const query = await supabase
      .from(table)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('business_id', businessData.id);
    if (query.error) throw query.error;
    counts[key] = query.count ?? 0;
  }

  return {
    id: businessData.id,
    name: businessData.name,
    stage: businessData.stage,
    updatedAt: businessData.updated_at,
    selectionSource,
    counts,
  };
}

export default function RestoreAcceptancePage() {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<BusinessSnapshot | null>(null);
  const [checkpoint, setCheckpoint] = useState<RestoreCheckpoint | null>(null);
  const [result, setResult] = useState<RestoreResult>({ state: 'waiting', detail: 'Loading the current browser session…' });
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
      setUser(currentUser);

      if (!currentUser) {
        setBusiness(null);
        if (stored) {
          const observed = stored.signedOutObservedAt
            ? stored
            : { ...stored, signedOutObservedAt: new Date().toISOString() };
          if (!stored.signedOutObservedAt) writeCheckpoint(observed);
          setCheckpoint(observed);
          setResult({
            state: 'waiting',
            detail: 'Signed-out browser state observed. Sign back in with the same account, return here, and the verifier will compare the same active Business Record graph.',
          });
        } else {
          setCheckpoint(null);
          setResult({ state: 'waiting', detail: 'Sign in, then arm a restore checkpoint before signing out.' });
        }
        return;
      }

      const currentBusiness = await loadBusiness(currentUser);
      setBusiness(currentBusiness);
      setCheckpoint(stored);

      if (!currentBusiness) {
        setResult({ state: 'waiting', detail: 'The account is signed in, but no persistent Business Record exists yet. Open the Founder Command Center once to create/load it.' });
        return;
      }

      if (!stored) {
        setResult({ state: 'waiting', detail: 'Current account and active Business Record are readable. Arm a checkpoint to begin the restore test.' });
        return;
      }

      if (!stored.signedOutObservedAt) {
        setResult({ state: 'waiting', detail: 'Checkpoint armed. Sign out from this page to create the genuine browser boundary.' });
        return;
      }

      const sameUser = stored.userId === currentUser.id;
      const sameBusiness = stored.business.id === currentBusiness.id;
      const sameCounts = countsEqual(stored.business.counts, currentBusiness.counts);
      if (sameUser && sameBusiness && sameCounts) {
        const completed = stored.restoredAt ? stored : { ...stored, restoredAt: new Date().toISOString() };
        if (!stored.restoredAt) writeCheckpoint(completed);
        setCheckpoint(completed);
        setResult({
          state: 'pass',
          detail: 'PASS: this browser observed sign-out, then the same authenticated user restored the same active Business Record with matching account-owned module row counts.',
        });
      } else {
        const problems = [
          !sameUser ? 'the authenticated user changed' : null,
          !sameBusiness ? 'the active Business Record changed' : null,
          !sameCounts ? 'one or more module row counts changed or could not be read' : null,
        ].filter(Boolean).join('; ');
        setResult({ state: 'fail', detail: `FAIL: ${problems}. This verifier does not convert an inconsistent restore into a pass.` });
      }
    } catch (error: any) {
      setResult({ state: 'fail', detail: error?.message || 'The restore verifier could not read the current production state.' });
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const { data } = supabase.auth.onAuthStateChange(() => void refresh());
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  const totalRows = useMemo(() => {
    if (!business) return 0;
    return Object.values(business.counts).reduce<number>((sum, value) => sum + (value || 0), 0);
  }, [business]);

  function armCheckpoint() {
    if (!user || !business) return;
    const next: RestoreCheckpoint = {
      version: 2,
      armedAt: new Date().toISOString(),
      userId: user.id,
      business,
      signedOutObservedAt: null,
      restoredAt: null,
    };
    writeCheckpoint(next);
    setCheckpoint(next);
    setResult({ state: 'waiting', detail: 'Checkpoint armed for the current active Business Record. Sign out now. The browser will reload at the privacy boundary, then this page will record the signed-out state.' });
  }

  async function signOutForTest() {
    if (!checkpoint || checkpoint.signedOutObservedAt) return;
    setBusy(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setResult({ state: 'fail', detail: error.message });
      setBusy(false);
    }
    // AuthPrivacyGuard reloads the app on a genuine sign-out. The next page load records the signed-out observation.
  }

  function resetTest() {
    writeCheckpoint(null);
    setCheckpoint(null);
    setResult({ state: 'waiting', detail: user ? 'Checkpoint cleared. Arm a new restore test when ready.' : 'Checkpoint cleared. Sign in before starting a new restore test.' });
  }

  async function copyEvidence() {
    const evidence = {
      capturedAt: new Date().toISOString(),
      result,
      browser: { width: window.innerWidth, height: window.innerHeight, userAgent: navigator.userAgent },
      authenticated: Boolean(user),
      currentUserId: user?.id || null,
      currentBusiness: business,
      checkpoint,
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(evidence, null, 2));
      setCopied(true);
    } catch {
      setResult({ state: 'fail', detail: 'Clipboard access failed. The on-screen evidence is still available.' });
    }
  }

  const badge = result.state === 'pass' ? 'PASS' : result.state === 'fail' ? 'FAIL' : 'WAITING';

  return (
    <main style={shell}>
      <p style={{ letterSpacing: '.12em', fontSize: 12, fontWeight: 800 }}>SMARTPICKSHOP HOLDINGS · FOUNDER DYNASTY OS 10.0</p>
      <h1 style={{ fontSize: 'clamp(2rem,6vw,4rem)', lineHeight: 1, marginBottom: 12 }}>Sign-out → sign-in restore proof</h1>
      <p style={{ maxWidth: 800, fontSize: 18, lineHeight: 1.55 }}>
        This verifier snapshots the <strong>currently active Business Record</strong>, observes a real signed-out browser state, then requires the same user and same active business to reappear with matching module row counts. It writes no synthetic business data.
      </p>

      <section style={card}>
        <div style={grid}>
          <div><small>Status</small><h2>{badge}</h2></div>
          <div><small>Browser account</small><h3>{user ? 'Signed in' : 'Signed out'}</h3></div>
          <div><small>Active Business Record</small><h3>{business?.name || (user ? 'Not loaded' : 'Private')}</h3></div>
          <div><small>Selection source</small><h3>{business?.selectionSource === 'stored-active' ? 'Active selector' : business ? 'First owned fallback' : '—'}</h3></div>
          <div><small>Visible child rows</small><h3>{business ? totalRows : '—'}</h3></div>
        </div>
        <p>{result.detail}</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" onClick={() => void refresh()} disabled={busy}>{busy ? 'Checking…' : 'Refresh proof'}</button>
          <button type="button" onClick={armCheckpoint} disabled={busy || !user || !business}>Arm active-Business checkpoint</button>
          <button type="button" onClick={() => void signOutForTest()} disabled={busy || !checkpoint || Boolean(checkpoint.signedOutObservedAt)}>Sign out for restore test</button>
          <button type="button" onClick={() => void copyEvidence()} disabled={busy || !checkpoint}>{copied ? 'Evidence copied' : 'Copy evidence JSON'}</button>
          <button type="button" onClick={resetTest} disabled={busy || !checkpoint}>Reset test</button>
        </div>
      </section>

      <section style={card}>
        <h2>Exact sequence</h2>
        <ol style={{ lineHeight: 1.8 }}>
          <li>Open the Business Record you actually want to verify using the global selector or <a href="/portfolio">Business Registry</a>.</li>
          <li>While signed in, click <strong>Arm active-Business checkpoint</strong>.</li>
          <li>Click <strong>Sign out for restore test</strong>. The global privacy guard should reload the browser at the auth boundary.</li>
          <li>On the signed-out page, this verifier records that the browser genuinely reached a signed-out session.</li>
          <li>Use <a href="/">Founder Command Center</a> to sign back in with the same account.</li>
          <li>Return to <code>/acceptance/restore</code>. A PASS requires the same user, same active Business Record, and matching readable module row counts.</li>
        </ol>
      </section>

      {checkpoint && (
        <section style={card}>
          <h2>Checkpoint evidence</h2>
          <div style={grid}>
            <div><small>Armed</small><p>{checkpoint.armedAt}</p></div>
            <div><small>Signed-out state observed</small><p>{checkpoint.signedOutObservedAt || 'Not yet'}</p></div>
            <div><small>Restore verified</small><p>{checkpoint.restoredAt || 'Not yet'}</p></div>
            <div><small>Business</small><p>{checkpoint.business.name || 'Untitled Business'}</p></div>
            <div><small>Business ID</small><p style={{ overflowWrap: 'anywhere' }}>{checkpoint.business.id}</p></div>
          </div>
        </section>
      )}

      <section style={card}>
        <h2>Scope</h2>
        <p>This can prove the same-account browser restore sequence for the active Business Record and that its account-owned record graph remains readable after reauthentication. Use <a href="/acceptance">the main diagnostics</a> for a real Business A ↔ Business B switch checkpoint. Second-user isolation, Evidence review, a completed Value Sprint outcome, and mobile/desktop visual acceptance remain separate production checks.</p>
        <p><a href="/acceptance">Back to all production acceptance diagnostics</a> · <a href="/">Founder Command Center</a></p>
      </section>
    </main>
  );
}
