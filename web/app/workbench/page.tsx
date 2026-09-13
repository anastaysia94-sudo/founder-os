'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { blankBusiness, evidenceLabels, score, type BusinessRecord } from '@/lib/fdos';
import { addMemory, ensureBusiness, loadBusinessRecord } from '@/lib/business-store';
import {
  addFinancialAssumption,
  addInitiative,
  addOfferHypothesis,
  loadOperatingWorkbench,
  updateInitiativeStatus,
  updateOfferStatus,
} from '@/lib/operating-store';
import {
  blankOperatingWorkbench,
  getOperatingSignals,
  type FinancialAssumptionKind,
  type InitiativeStatus,
  type OfferStatus,
  type OperatingWorkbenchRecord,
} from '@/lib/operating-workbench';
import { supabase } from '@/lib/supabase';
import styles from './workbench.module.css';

const moneyKinds: FinancialAssumptionKind[] = ['Revenue', 'Cost', 'Price', 'Margin', 'Cash', 'Funding', 'Other'];
const offerStatuses: OfferStatus[] = ['Draft', 'Testing', 'Active', 'Retired'];
const initiativeStatuses: InitiativeStatus[] = ['Planned', 'Active', 'Blocked', 'Done'];

export default function OperatingWorkbench() {
  const [user, setUser] = useState<User | null>(null);
  const [record, setRecord] = useState<BusinessRecord>(blankBusiness);
  const [workbench, setWorkbench] = useState<OperatingWorkbenchRecord>(blankOperatingWorkbench);
  const [status, setStatus] = useState('Loading the shared business record…');
  const [busy, setBusy] = useState(false);
  const activeUserId = useRef<string | null>(null);
  const loadVersion = useRef(0);

  const [moneyDraft, setMoneyDraft] = useState({ title: '', kind: 'Revenue' as FinancialAssumptionKind, value: '', confidence: 50 });
  const [offerDraft, setOfferDraft] = useState({ name: '', customer: '', problem: '', promise: '', delivery: '', price: '' });
  const [initiativeDraft, setInitiativeDraft] = useState({ title: '', outcome: '', owner: '', dueDate: '', priority: 3 });

  const signals = useMemo(() => getOperatingSignals(workbench, record.dna.revenueModel), [workbench, record.dna.revenueModel]);
  const topOpportunity = useMemo(() => [...record.opportunities].sort((a, b) => score(b) - score(a))[0], [record.opportunities]);
  const currentSprint = record.valueSprints.find((item) => item.status === 'Running') || record.valueSprints.find((item) => item.status === 'Planned');

  function clearPrivateState(message: string) {
    loadVersion.current += 1;
    activeUserId.current = null;
    setRecord(blankBusiness);
    setWorkbench(blankOperatingWorkbench);
    setStatus(message);
  }

  async function hydrate(nextUser: User) {
    if (activeUserId.current !== nextUser.id) return false;
    const version = ++loadVersion.current;
    setStatus('Syncing the operating workbench…');
    try {
      const businessId = await ensureBusiness(nextUser);
      const [nextRecord, nextWorkbench] = await Promise.all([
        loadBusinessRecord(nextUser, businessId),
        loadOperatingWorkbench(nextUser, businessId),
      ]);
      if (version !== loadVersion.current || activeUserId.current !== nextUser.id) return false;
      setRecord(nextRecord);
      setWorkbench(nextWorkbench);
      setStatus('Shared business record synced.');
      return true;
    } catch (error: any) {
      if (version === loadVersion.current && activeUserId.current === nextUser.id) setStatus(`Could not load workbench: ${error.message}`);
      return false;
    }
  }

  useEffect(() => {
    let disposed = false;
    let authEpoch = 0;
    const applyUser = (nextUser: User | null, message: string) => {
      if (disposed) return;
      if (!nextUser) {
        setUser(null);
        clearPrivateState(message);
        return;
      }
      if (activeUserId.current && activeUserId.current !== nextUser.id) {
        setRecord(blankBusiness);
        setWorkbench(blankOperatingWorkbench);
      }
      activeUserId.current = nextUser.id;
      setUser(nextUser);
      void hydrate(nextUser);
    };
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      authEpoch += 1;
      applyUser(session?.user || null, 'Signed out.');
    });
    const initialEpoch = authEpoch;
    void supabase.auth.getUser().then(({ data }) => {
      if (!disposed && authEpoch === initialEpoch) applyUser(data.user || null, 'Sign in from the Command Center to use the private workbench.');
    });
    return () => {
      disposed = true;
      loadVersion.current += 1;
      activeUserId.current = null;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function createMoney(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !record.businessId) return;
    const actor = user;
    setBusy(true);
    try {
      await addFinancialAssumption(actor, record.businessId, { ...moneyDraft, evidence: 'E6' });
      await addMemory(actor, record.businessId, {
        kind: 'Financial assumption added',
        summary: `${moneyDraft.kind}: ${moneyDraft.title} = ${moneyDraft.value || 'value not specified'}`,
        evidence: 'E6',
      });
      setMoneyDraft({ title: '', kind: 'Revenue', value: '', confidence: 50 });
      await hydrate(actor);
      setStatus('Financial assumption saved as E6. It is a model input, not a bank statement from the future.');
    } catch (error: any) {
      if (activeUserId.current === actor.id) setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  function prefillOffer() {
    setOfferDraft((current) => ({
      ...current,
      customer: current.customer || record.dna.customer,
      problem: current.problem || record.dna.problem,
      promise: current.promise || record.dna.offer,
    }));
  }

  async function createOffer(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !record.businessId) return;
    const actor = user;
    setBusy(true);
    try {
      await addOfferHypothesis(actor, record.businessId, { ...offerDraft, status: 'Draft', evidence: 'E5' });
      await addMemory(actor, record.businessId, { kind: 'Offer hypothesis created', summary: offerDraft.name, evidence: 'E5' });
      setOfferDraft({ name: '', customer: '', problem: '', promise: '', delivery: '', price: '' });
      await hydrate(actor);
      setStatus('Offer hypothesis saved. Draft means possible, not proven. Civilization survives another label.');
    } catch (error: any) {
      if (activeUserId.current === actor.id) setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function changeOffer(offerId: string, nextStatus: OfferStatus) {
    if (!user || !record.businessId) return;
    const actor = user;
    setBusy(true);
    try {
      await updateOfferStatus(actor, record.businessId, offerId, nextStatus);
      await addMemory(actor, record.businessId, { kind: 'Offer status changed', summary: `Offer moved to ${nextStatus}.`, evidence: 'E4' });
      await hydrate(actor);
      setStatus(`Offer moved to ${nextStatus}.`);
    } catch (error: any) {
      if (activeUserId.current === actor.id) setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function createInitiative(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !record.businessId) return;
    const actor = user;
    setBusy(true);
    try {
      await addInitiative(actor, record.businessId, { ...initiativeDraft, dueDate: initiativeDraft.dueDate || undefined, status: 'Planned', evidence: 'E4' });
      await addMemory(actor, record.businessId, { kind: 'Initiative planned', summary: `${initiativeDraft.title}: ${initiativeDraft.outcome}`, evidence: 'E4' });
      setInitiativeDraft({ title: '', outcome: '', owner: '', dueDate: '', priority: 3 });
      await hydrate(actor);
      setStatus('Initiative added to execution. Plans remain plans until somebody does the inconvenient part.');
    } catch (error: any) {
      if (activeUserId.current === actor.id) setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function changeInitiative(initiativeId: string, nextStatus: InitiativeStatus) {
    if (!user || !record.businessId) return;
    const actor = user;
    setBusy(true);
    try {
      await updateInitiativeStatus(actor, record.businessId, initiativeId, nextStatus);
      await addMemory(actor, record.businessId, { kind: 'Initiative status changed', summary: `Initiative moved to ${nextStatus}.`, evidence: 'E4' });
      await hydrate(actor);
      setStatus(`Initiative moved to ${nextStatus}.`);
    } catch (error: any) {
      if (activeUserId.current === actor.id) setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={styles.page}>
      <a className={styles.back} href="/">← Command Center</a>
      <a className={styles.back} href="/intelligence">Intelligence Layer</a>
      <p className={styles.status}>{user?.email ? `${user.email} · ${status}` : status}</p>

      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>BUILD & RUN THE BUSINESS</p>
          <h1>Connect the offer, the money, and the work. <span>To the same reality.</span></h1>
          <p>Finance Center, Product & Offer Lab, and Operations & Execution now share the same business identity and Business Memory. No separate mini-apps inventing three mutually incompatible versions of the company.</p>
        </div>
        <aside className={styles.snapshot}>
          <small>SHARED BUSINESS</small><strong>{record.dna.name}</strong>
          <span>{record.dna.stage}</span>
          <small>CURRENT GOAL</small><span>{record.dna.currentGoal || 'Not defined yet.'}</span>
        </aside>
      </section>

      <section className={styles.summary}>
        <article><b>{signals.moneyScore}</b><span>economic clarity</span><div className={styles.meter}><span style={{ width: `${signals.moneyScore}%` }} /></div></article>
        <article><b>{signals.offerScore}</b><span>offer readiness</span><div className={styles.meter}><span style={{ width: `${signals.offerScore}%` }} /></div></article>
        <article><b>{signals.executionScore}</b><span>execution visibility</span><div className={styles.meter}><span style={{ width: `${signals.executionScore}%` }} /></div></article>
      </section>

      <section className={styles.panel} id="money">
        <div className={styles.panelHead}><div><p className={styles.eyebrow}>MONEY → FINANCE CENTER</p><h2>Model the economics without pretending assumptions are facts</h2><p className={styles.plain}>Financial assumptions are saved as E6. They can be useful, precise, even beautifully formatted, and still be assumptions. Numbers do not receive diplomatic immunity from evidence rules.</p></div></div>
        {user ? <form className={styles.formGrid} onSubmit={createMoney}>
          <label>Type<select value={moneyDraft.kind} onChange={(event) => setMoneyDraft({ ...moneyDraft, kind: event.target.value as FinancialAssumptionKind })}>{moneyKinds.map((kind) => <option key={kind}>{kind}</option>)}</select></label>
          <label>Assumption<input required value={moneyDraft.title} onChange={(event) => setMoneyDraft({ ...moneyDraft, title: event.target.value })} placeholder="Example: First-month average order value" /></label>
          <label>Current model value<input value={moneyDraft.value} onChange={(event) => setMoneyDraft({ ...moneyDraft, value: event.target.value })} placeholder="$75, 30%, 10 customers, etc." /></label>
          <label>Confidence: {moneyDraft.confidence}%<input type="range" min="0" max="100" value={moneyDraft.confidence} onChange={(event) => setMoneyDraft({ ...moneyDraft, confidence: Number(event.target.value) })} /></label>
          <button className={styles.button} disabled={busy}>Save financial assumption</button>
        </form> : <p className={styles.empty}>Sign in from the Command Center to save financial assumptions.</p>}
        <div className={styles.cards}>{workbench.financialAssumptions.map((item) => <article className={styles.card} key={item.id}><div className={styles.topline}><span className={styles.badge}>{item.kind}</span><span className={styles.badge}>{item.confidence}% confidence</span></div><h3>{item.title}</h3><p>{item.value || 'No numeric or descriptive value entered yet.'}</p><small>{item.evidence} · {evidenceLabels[item.evidence]}</small></article>)}{!workbench.financialAssumptions.length && <p className={styles.empty}>No financial assumptions yet.</p>}</div>
      </section>

      <section className={styles.panel} id="offers">
        <div className={styles.panelHead}><div><p className={styles.eyebrow}>PRODUCT & OFFER LAB</p><h2>Turn Business DNA into testable offers</h2><p className={styles.plain}>An offer starts as E5 strategic hypothesis. Moving it to Testing or Active changes its operating status, not its evidence class. The universe remains stubbornly unwilling to validate products because a dropdown changed.</p></div><button className={styles.secondary} onClick={prefillOffer}>Prefill from Business DNA</button></div>
        {user ? <form className={styles.formGrid} onSubmit={createOffer}>
          <label>Offer name<input required value={offerDraft.name} onChange={(event) => setOfferDraft({ ...offerDraft, name: event.target.value })} /></label>
          <label>First customer<input value={offerDraft.customer} onChange={(event) => setOfferDraft({ ...offerDraft, customer: event.target.value })} /></label>
          <label className={styles.wide}>Problem<textarea value={offerDraft.problem} onChange={(event) => setOfferDraft({ ...offerDraft, problem: event.target.value })} /></label>
          <label className={styles.wide}>Promise / useful outcome<textarea required value={offerDraft.promise} onChange={(event) => setOfferDraft({ ...offerDraft, promise: event.target.value })} /></label>
          <label>Delivery<input value={offerDraft.delivery} onChange={(event) => setOfferDraft({ ...offerDraft, delivery: event.target.value })} placeholder="How is value delivered?" /></label>
          <label>Price / value exchange<input value={offerDraft.price} onChange={(event) => setOfferDraft({ ...offerDraft, price: event.target.value })} /></label>
          <button className={styles.button} disabled={busy}>Create offer hypothesis</button>
        </form> : <p className={styles.empty}>Sign in to save offer hypotheses.</p>}
        <div className={styles.cards}>{workbench.offers.map((offer) => <article className={styles.card} key={offer.id}><div className={styles.topline}><span className={styles.badge}>{offer.status}</span><small>{offer.evidence} · {evidenceLabels[offer.evidence]}</small></div><h3>{offer.name}</h3><p><b>For:</b> {offer.customer || 'Customer not specified'}</p><p><b>Problem:</b> {offer.problem || 'Not specified'}</p><p><b>Promise:</b> {offer.promise || 'Not specified'}</p><div className={styles.facts}><div><small>DELIVERY</small><p>{offer.delivery || 'Not specified'}</p></div><div><small>PRICE</small><p>{offer.price || 'Not specified'}</p></div></div><div className={styles.actions}>{offerStatuses.map((next) => <button type="button" className={styles.secondary} disabled={busy || offer.status === next} key={next} onClick={() => changeOffer(offer.id, next)}>{next}</button>)}</div></article>)}{!workbench.offers.length && <p className={styles.empty}>No offer hypotheses yet.</p>}</div>
      </section>

      <section className={styles.panel} id="operations">
        <div className={styles.panelHead}><div><p className={styles.eyebrow}>OPERATIONS & EXECUTION</p><h2>Turn decisions into visible work and outcomes</h2><p className={styles.plain}>Initiatives are internal execution records, saved as E4. Done means the work was marked complete. It does not automatically mean it worked. Humans have enough trouble with that distinction already.</p></div></div>
        {user ? <form className={styles.formGrid} onSubmit={createInitiative}>
          <label>Initiative<input required value={initiativeDraft.title} onChange={(event) => setInitiativeDraft({ ...initiativeDraft, title: event.target.value })} /></label>
          <label>Owner<input value={initiativeDraft.owner} onChange={(event) => setInitiativeDraft({ ...initiativeDraft, owner: event.target.value })} placeholder="Founder, team, vendor, etc." /></label>
          <label className={styles.wide}>Outcome we want<textarea required value={initiativeDraft.outcome} onChange={(event) => setInitiativeDraft({ ...initiativeDraft, outcome: event.target.value })} /></label>
          <label>Priority (1 highest)<select value={initiativeDraft.priority} onChange={(event) => setInitiativeDraft({ ...initiativeDraft, priority: Number(event.target.value) })}>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
          <label>Due date<input type="date" value={initiativeDraft.dueDate} onChange={(event) => setInitiativeDraft({ ...initiativeDraft, dueDate: event.target.value })} /></label>
          <button className={styles.button} disabled={busy}>Plan initiative</button>
        </form> : <p className={styles.empty}>Sign in to save initiatives.</p>}
        <div className={styles.cards}>{workbench.initiatives.map((initiative) => <article className={styles.card} key={initiative.id}><div className={styles.topline}><span className={`${styles.badge} ${initiative.status === 'Blocked' ? styles.danger : ''}`}>{initiative.status}</span><span className={styles.badge}>Priority {initiative.priority}</span></div><h3>{initiative.title}</h3><p>{initiative.outcome}</p><div className={styles.facts}><div><small>OWNER</small><p>{initiative.owner || 'Not assigned'}</p></div><div><small>DUE</small><p>{initiative.dueDate || 'No date set'}</p></div></div><div className={styles.actions}>{initiativeStatuses.map((next) => <button type="button" className={styles.secondary} disabled={busy || initiative.status === next} key={next} onClick={() => changeInitiative(initiative.id, next)}>{next}</button>)}</div></article>)}{!workbench.initiatives.length && <p className={styles.empty}>No initiatives yet.</p>}</div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}><div><p className={styles.eyebrow}>CROSS-SYSTEM CONTEXT</p><h2>The workbench does not get its own private reality</h2></div></div>
        <div className={styles.crossLinks}>
          <article><small>BEST CURRENT OPPORTUNITY</small><h3>{topOpportunity?.title || 'None ranked yet'}</h3><p>{topOpportunity?.observation || 'Use the Command Center to capture and rank an opportunity.'}</p>{topOpportunity && <span className={styles.badge}>Priority {score(topOpportunity)}</span>}</article>
          <article><small>ACTIVE VALUE SPRINT</small><h3>{currentSprint?.title || 'No active sprint'}</h3><p>{currentSprint?.action || 'Use the Intelligence Layer to turn an opportunity into a measured test.'}</p><a href="/intelligence#value-sprints">Open Value Sprints →</a></article>
          <article><small>CURRENT BUSINESS GOAL</small><h3>{record.dna.currentGoal || 'Not defined yet'}</h3><p>Finance, offers and initiatives should support this goal or explain why the goal should change.</p><a href="/">Open Command Center →</a></article>
        </div>
      </section>
    </main>
  );
}
