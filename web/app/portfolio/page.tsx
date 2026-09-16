'use client';

import { useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  createBusiness,
  ensureBusiness,
  getActiveBusinessId,
  listBusinesses,
  setActiveBusinessId,
  type BusinessSummary,
} from '@/lib/business-store';
import type { BusinessStage } from '@/lib/fdos';
import {
  getAttentionReasons,
  getPortfolioTotals,
  loadPortfolioSignals,
  type PortfolioSignal,
} from '@/lib/portfolio-intelligence';
import { supabase } from '@/lib/supabase';
import styles from './portfolio.module.css';

const stages: BusinessStage[] = [
  'Idea', 'Exploring', 'Validating', 'Building', 'Pre-Launch', 'Launched',
  'Finding Traction', 'Growing', 'Systemizing', 'Scaling', 'Portfolio', 'Dynasty',
];

export default function PortfolioRegistryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [signals, setSignals] = useState<Record<string, PortfolioSignal>>({});
  const [activeId, setActiveId] = useState('');
  const [name, setName] = useState('');
  const [stage, setStage] = useState<BusinessStage>('Idea');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Checking your business portfolio…');

  const totals = useMemo(() => getPortfolioTotals(signals), [signals]);
  const minutesLabel = totals.plannedAttentionMinutes >= 60
    ? `${Math.round((totals.plannedAttentionMinutes / 60) * 10) / 10}h`
    : `${totals.plannedAttentionMinutes}m`;

  async function hydrate(nextUser: User) {
    setBusy(true);
    try {
      const ensuredId = await ensureBusiness(nextUser);
      const rows = await listBusinesses(nextUser);
      const nextSignals = await loadPortfolioSignals(nextUser, rows.map((business) => business.id));
      setBusinesses(rows);
      setSignals(nextSignals);
      setActiveId(getActiveBusinessId(nextUser.id) || ensuredId);
      setStatus(`${rows.length} business record${rows.length === 1 ? '' : 's'} available.`);
    } catch (error: any) {
      setStatus(error?.message || 'Could not load business records.');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    let disposed = false;
    void supabase.auth.getUser().then(({ data }) => {
      if (disposed) return;
      const nextUser = data.user || null;
      setUser(nextUser);
      if (nextUser) void hydrate(nextUser);
      else setStatus('Sign in from the Command Center to manage multiple businesses.');
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (disposed) return;
      const nextUser = session?.user || null;
      setUser(nextUser);
      if (nextUser) void hydrate(nextUser);
      else {
        setBusinesses([]);
        setSignals({});
        setActiveId('');
        setStatus('Signed out.');
      }
    });

    return () => {
      disposed = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  function openBusiness(id: string) {
    if (!user) return;
    setActiveBusinessId(user.id, id);
    window.location.href = '/';
  }

  async function addBusiness(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setStatus('Creating a separate shared Business Record…');
    try {
      await createBusiness(user, name, stage);
      setName('');
      setStage('Idea');
      window.location.href = '/';
    } catch (error: any) {
      setStatus(error?.message || 'Could not create the business.');
      setBusy(false);
    }
  }

  return (
    <main className={styles.page}>
      <a className={styles.back} href="/">← Founder Command Center</a>

      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>PORTFOLIO / BUSINESS REGISTRY</p>
          <h1>One founder. <span>More than one business reality.</span></h1>
          <p>
            Each business gets its own Business DNA, stage, Value Map, Decisions, Opportunities, Risks,
            Evidence, Value Sprints and Business Memory. The portfolio layer compares signals without blending
            those records into one giant corporate soup.
          </p>
        </div>
        <aside className={styles.summary}>
          <small>BUSINESS RECORDS</small>
          <strong>{businesses.length}</strong>
          <span>{status}</span>
        </aside>
      </section>

      {!user ? (
        <section className={styles.panel}>
          <h2>Sign in first</h2>
          <p>Portfolio records are private and account-owned. Use the Command Center sign-in, then return here.</p>
          <a className={styles.primary} href="/">Go to Command Center</a>
        </section>
      ) : (
        <>
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <div>
                <p className={styles.eyebrow}>CROSS-BUSINESS INTELLIGENCE</p>
                <h2>See where attention is already being demanded</h2>
                <p className={styles.plain}>
                  These are counts from account-owned operating records, not a score of which business is “best.”
                  The point is to expose competing risks, decisions, blocked work, evidence review and founder time before they quietly collide.
                </p>
              </div>
            </div>

            <div className={styles.portfolioTotals}>
              <article><b>{totals.highRisks}</b><span>high risks</span></article>
              <article><b>{totals.openDecisions}</b><span>open decisions</span></article>
              <article><b>{totals.blockedInitiatives}</b><span>blocked initiatives</span></article>
              <article><b>{totals.pendingEvidence}</b><span>evidence reviews waiting</span></article>
              <article><b>{totals.runningSprints}</b><span>running Value Sprints</span></article>
              <article><b>{minutesLabel}</b><span>planned weekly founder attention</span></article>
            </div>

            {businesses.length < 2 ? (
              <div className={styles.comparisonEmpty}>
                <strong>Cross-business comparison is ready.</strong>
                <span>Add a second Business Record when there is genuinely another business or idea to compare. No need to invent a subsidiary just to make the dashboard look ambitious.</span>
              </div>
            ) : (
              <div className={styles.compareGrid}>
                {businesses.map((business) => {
                  const signal = signals[business.id];
                  const reasons = getAttentionReasons(signal);
                  return (
                    <article key={business.id}>
                      <div className={styles.cardTop}>
                        <span className={styles.stage}>{business.stage}</span>
                        {business.id === activeId && <span className={styles.activeTag}>ACTIVE</span>}
                      </div>
                      <h3>{business.name}</h3>
                      <div className={styles.signalMatrix}>
                        <span><b>{signal?.highRisks || 0}</b> high risks</span>
                        <span><b>{signal?.openDecisions || 0}</b> open decisions</span>
                        <span><b>{signal?.opportunities || 0}</b> opportunities</span>
                        <span><b>{signal?.runningSprints || 0}</b> running sprints</span>
                        <span><b>{signal?.assets || 0}</b> mapped assets</span>
                        <span><b>{signal?.completedSprintLoops || 0}</b> measured loops</span>
                      </div>
                      <small>ATTENTION SIGNALS</small>
                      <p>{reasons.length ? reasons.join(' · ') : 'No high-risk, blocked, pending-review or open-decision flags in the current record.'}</p>
                      <button type="button" disabled={busy || business.id === activeId} onClick={() => openBusiness(business.id)}>
                        {business.id === activeId ? 'Currently open' : 'Open this business'}
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <div>
                <p className={styles.eyebrow}>YOUR BUSINESSES</p>
                <h2>Choose which Business Record the OS is operating on</h2>
                <p className={styles.plain}>The active business follows you into Command Center, Intelligence, Workbench and Strategy. The comparison layer reads across businesses, but edits stay attached to the one you opened.</p>
              </div>
            </div>

            <div className={styles.grid}>
              {businesses.map((business) => {
                const active = business.id === activeId;
                return (
                  <article className={`${styles.card} ${active ? styles.active : ''}`} key={business.id}>
                    <div className={styles.cardTop}>
                      <span className={styles.stage}>{business.stage}</span>
                      {active && <span className={styles.activeTag}>ACTIVE</span>}
                    </div>
                    <h3>{business.name}</h3>
                    <small>CURRENT GOAL</small>
                    <p>{business.currentGoal || 'No current goal defined.'}</p>
                    <small>LAST UPDATED</small>
                    <p>{business.updatedAt ? new Date(business.updatedAt).toLocaleString() : 'Not available'}</p>
                    <button type="button" disabled={busy || active} onClick={() => openBusiness(business.id)}>
                      {active ? 'Currently open' : 'Open this business'}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          <section className={styles.panel}>
            <p className={styles.eyebrow}>ADD A BUSINESS / IDEA</p>
            <h2>Create another independent Business Record</h2>
            <p className={styles.plain}>Use this for a separate company, side project, raw idea, operating business, portfolio company or future venture. It starts empty on purpose. Humans already have enough software that confidently invents company history.</p>
            <form className={styles.form} onSubmit={addBusiness}>
              <label>
                Business or idea name
                <input required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} placeholder="Example: Resonance" />
              </label>
              <label>
                Starting stage
                <select value={stage} onChange={(event) => setStage(event.target.value as BusinessStage)}>
                  {stages.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <button className={styles.primary} disabled={busy}>{busy ? 'Working…' : 'Create and open business'}</button>
            </form>
          </section>
        </>
      )}
    </main>
  );
}
