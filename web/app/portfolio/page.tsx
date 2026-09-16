'use client';

import { useEffect, useState } from 'react';
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
import { supabase } from '@/lib/supabase';
import styles from './portfolio.module.css';

const stages: BusinessStage[] = [
  'Idea', 'Exploring', 'Validating', 'Building', 'Pre-Launch', 'Launched',
  'Finding Traction', 'Growing', 'Systemizing', 'Scaling', 'Portfolio', 'Dynasty',
];

export default function PortfolioRegistryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [activeId, setActiveId] = useState('');
  const [name, setName] = useState('');
  const [stage, setStage] = useState<BusinessStage>('Idea');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Checking your business portfolio…');

  async function hydrate(nextUser: User) {
    setBusy(true);
    try {
      const ensuredId = await ensureBusiness(nextUser);
      const rows = await listBusinesses(nextUser);
      setBusinesses(rows);
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
            Each business now gets its own Business DNA, stage, Value Map, Decisions, Opportunities, Risks,
            Evidence, Value Sprints and Business Memory. Switching businesses changes the shared record used by
            every major Founder Dynasty OS workspace.
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
                <p className={styles.eyebrow}>YOUR BUSINESSES</p>
                <h2>Choose which Business Record the OS is operating on</h2>
                <p className={styles.plain}>The active business follows you into Command Center, Intelligence, Workbench and Strategy. No cross-business soup.</p>
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
