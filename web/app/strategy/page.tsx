'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { addMemory, ensureBusiness, loadBusinessRecord } from '@/lib/business-store';
import { blankBusiness, evidenceLabels, type BusinessRecord } from '@/lib/fdos';
import {
  addAttentionBlock,
  addBusinessAsset,
  addCustomerInsight,
  addDistributionExperiment,
  addModelElement,
  addPortfolioThesis,
  addScenario,
  loadStrategyDynasty,
  updateAttentionStatus,
  updateDistribution,
  updateModelStatus,
  updatePortfolioStatus,
  updateScenarioStatus,
} from '@/lib/strategy-store';
import {
  blankStrategyDynasty,
  getStrategyQuestions,
  getStrategySignals,
  type AssetKind,
  type AttentionStatus,
  type CustomerInsightKind,
  type DistributionStatus,
  type ModelArea,
  type ModelStatus,
  type PortfolioRole,
  type PortfolioStatus,
  type ScenarioStatus,
  type StrategyDynastyRecord,
} from '@/lib/strategy-dynasty';
import { supabase } from '@/lib/supabase';
import styles from './strategy.module.css';

const modelAreas: ModelArea[] = ['Problem', 'Customer', 'Value Proposition', 'Channel', 'Relationship', 'Revenue', 'Cost', 'Capability', 'Partner'];
const modelStatuses: ModelStatus[] = ['Hypothesis', 'Testing', 'Supported', 'Rejected'];
const insightKinds: CustomerInsightKind[] = ['Segment', 'Problem', 'Need', 'Trigger', 'Objection', 'Behavior', 'Language'];
const distributionStatuses: DistributionStatus[] = ['Planned', 'Running', 'Measured', 'Keep', 'Revise', 'Stop'];
const assetKinds: AssetKind[] = ['Brand', 'IP', 'Data', 'Process', 'Relationship', 'Software', 'Content', 'License', 'Physical', 'Other'];
const scenarioStatuses: ScenarioStatus[] = ['Open', 'Watching', 'Resolved'];
const portfolioRoles: PortfolioRole[] = ['Core', 'Experiment', 'Growth', 'Cash Engine', 'Option', 'Exit Candidate'];
const portfolioStatuses: PortfolioStatus[] = ['Explore', 'Build', 'Hold', 'Harvest', 'Exit'];
const attentionStatuses: AttentionStatus[] = ['Planned', 'Active', 'Stopped'];

export default function StrategyWorkspace() {
  const [user, setUser] = useState<User | null>(null);
  const [record, setRecord] = useState<BusinessRecord>(blankBusiness);
  const [strategy, setStrategy] = useState<StrategyDynastyRecord>(blankStrategyDynasty);
  const [status, setStatus] = useState('Loading strategy workspace…');
  const [busy, setBusy] = useState(false);
  const activeUserId = useRef<string | null>(null);
  const hydrateVersion = useRef(0);

  const [modelDraft, setModelDraft] = useState({ area: 'Problem' as ModelArea, statement: '', confidence: 50 });
  const [customerDraft, setCustomerDraft] = useState({ kind: 'Problem' as CustomerInsightKind, statement: '', implication: '' });
  const [distributionDraft, setDistributionDraft] = useState({ channel: '', audience: '', message: '', action: '', measure: '' });
  const [assetDraft, setAssetDraft] = useState({ kind: 'Software' as AssetKind, name: '', valueReason: '', control: '', transferability: 'Medium' as 'Low' | 'Medium' | 'High' });
  const [scenarioDraft, setScenarioDraft] = useState({ name: '', premise: '', upside: '', downside: '', earlySignal: '', decisionRule: '', probability: 50 });
  const [attentionDraft, setAttentionDraft] = useState({ area: '', outcome: '', weeklyMinutes: 120 });
  const [portfolioDraft, setPortfolioDraft] = useState({ name: '', role: 'Experiment' as PortfolioRole, thesis: '', nextCapital: '', nextAttention: '' });
  const [distributionResults, setDistributionResults] = useState<Record<string, string>>({});

  const signals = useMemo(() => getStrategySignals(strategy, record.dna), [strategy, record.dna]);
  const questions = useMemo(() => getStrategyQuestions(strategy, record.dna), [strategy, record.dna]);

  function clearPrivateState(message: string) {
    hydrateVersion.current += 1;
    activeUserId.current = null;
    setRecord(blankBusiness);
    setStrategy(blankStrategyDynasty);
    setStatus(message);
  }

  async function hydrate(nextUser: User) {
    if (activeUserId.current !== nextUser.id) return false;
    const version = ++hydrateVersion.current;
    setStatus('Syncing strategy, customers, assets and scenarios…');
    try {
      const businessId = await ensureBusiness(nextUser);
      const [nextRecord, nextStrategy] = await Promise.all([
        loadBusinessRecord(nextUser, businessId),
        loadStrategyDynasty(nextUser, businessId),
      ]);
      if (version !== hydrateVersion.current || activeUserId.current !== nextUser.id) return false;
      setRecord(nextRecord);
      setStrategy(nextStrategy);
      setStatus('Shared business record synced.');
      return true;
    } catch (error: any) {
      if (version === hydrateVersion.current && activeUserId.current === nextUser.id) setStatus(`Could not load strategy workspace: ${error.message}`);
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
        setStrategy(blankStrategyDynasty);
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
      if (!disposed && authEpoch === initialEpoch) applyUser(data.user || null, 'Sign in from the Command Center to use private strategy intelligence.');
    });
    return () => {
      disposed = true;
      hydrateVersion.current += 1;
      activeUserId.current = null;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function logAndReload(actor: User, kind: string, summary: string, evidence: 'E4' | 'E5' | 'E6' | 'E7') {
    if (!record.businessId) return;
    await addMemory(actor, record.businessId, { kind, summary, evidence });
    await hydrate(actor);
  }

  async function createModel(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !record.businessId) return;
    const actor = user;
    setBusy(true);
    try {
      await addModelElement(actor, record.businessId, { ...modelDraft, status: 'Hypothesis', evidence: 'E5' });
      await logAndReload(actor, 'Business model hypothesis added', `${modelDraft.area}: ${modelDraft.statement}`, 'E5');
      setModelDraft({ area: 'Problem', statement: '', confidence: 50 });
      setStatus('Business model hypothesis saved as E5. It is now organized speculation, which is useful, but still speculation.');
    } catch (error: any) { if (activeUserId.current === actor.id) setStatus(error.message); } finally { setBusy(false); }
  }

  async function changeModel(id: string, next: ModelStatus) {
    if (!user || !record.businessId) return;
    const actor = user;
    setBusy(true);
    try {
      await updateModelStatus(actor, record.businessId, id, next);
      await logAndReload(actor, 'Business model status changed', `Model element moved to ${next}.`, 'E4');
      setStatus(`Business model element moved to ${next}.`);
    } catch (error: any) { if (activeUserId.current === actor.id) setStatus(error.message); } finally { setBusy(false); }
  }

  function prefillModelFromDNA() {
    if (record.dna.customer.trim()) setModelDraft({ area: 'Customer', statement: record.dna.customer, confidence: 55 });
    else if (record.dna.problem.trim()) setModelDraft({ area: 'Problem', statement: record.dna.problem, confidence: 55 });
    else if (record.dna.offer.trim()) setModelDraft({ area: 'Value Proposition', statement: record.dna.offer, confidence: 55 });
  }

  async function createCustomer(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !record.businessId) return;
    const actor = user;
    setBusy(true);
    try {
      await addCustomerInsight(actor, record.businessId, { ...customerDraft, evidence: 'E4' });
      await logAndReload(actor, 'Customer intelligence added', `${customerDraft.kind}: ${customerDraft.statement}`, 'E4');
      setCustomerDraft({ kind: 'Problem', statement: '', implication: '' });
      setStatus('Customer insight saved as E4. Use E3 only when the customer actually supplied the evidence.');
    } catch (error: any) { if (activeUserId.current === actor.id) setStatus(error.message); } finally { setBusy(false); }
  }

  async function createDistribution(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !record.businessId) return;
    const actor = user;
    setBusy(true);
    try {
      await addDistributionExperiment(actor, record.businessId, { ...distributionDraft, result: '', status: 'Planned', evidence: 'E5' });
      await logAndReload(actor, 'Distribution experiment planned', `${distributionDraft.channel}: ${distributionDraft.measure}`, 'E5');
      setDistributionDraft({ channel: '', audience: '', message: '', action: '', measure: '' });
      setStatus('Distribution experiment planned. Now the annoying but useful part: observe what happens.');
    } catch (error: any) { if (activeUserId.current === actor.id) setStatus(error.message); } finally { setBusy(false); }
  }

  async function changeDistribution(id: string, next: DistributionStatus) {
    if (!user || !record.businessId) return;
    const actor = user;
    setBusy(true);
    try {
      await updateDistribution(actor, record.businessId, id, { status: next, result: distributionResults[id] });
      await logAndReload(actor, 'Distribution experiment updated', `Distribution experiment moved to ${next}.`, 'E4');
      setStatus(`Distribution experiment moved to ${next}.`);
    } catch (error: any) { if (activeUserId.current === actor.id) setStatus(error.message); } finally { setBusy(false); }
  }

  async function createAsset(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !record.businessId) return;
    const actor = user;
    setBusy(true);
    try {
      await addBusinessAsset(actor, record.businessId, { ...assetDraft, evidence: 'E4' });
      await logAndReload(actor, 'Business asset mapped', `${assetDraft.kind}: ${assetDraft.name}`, 'E4');
      setAssetDraft({ kind: 'Software', name: '', valueReason: '', control: '', transferability: 'Medium' });
      setStatus('Asset added to the map. The point is durable value, not accumulating nouns.');
    } catch (error: any) { if (activeUserId.current === actor.id) setStatus(error.message); } finally { setBusy(false); }
  }

  async function createScenario(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !record.businessId) return;
    const actor = user;
    setBusy(true);
    try {
      await addScenario(actor, record.businessId, { ...scenarioDraft, status: 'Open', evidence: 'E7' });
      await logAndReload(actor, 'Scenario created', `${scenarioDraft.name}: ${scenarioDraft.premise}`, 'E7');
      setScenarioDraft({ name: '', premise: '', upside: '', downside: '', earlySignal: '', decisionRule: '', probability: 50 });
      setStatus('Scenario saved as E7 Forecast. Probability is a planning input, not a prophecy with better typography.');
    } catch (error: any) { if (activeUserId.current === actor.id) setStatus(error.message); } finally { setBusy(false); }
  }

  async function changeScenario(id: string, next: ScenarioStatus) {
    if (!user || !record.businessId) return;
    const actor = user;
    setBusy(true);
    try {
      await updateScenarioStatus(actor, record.businessId, id, next);
      await logAndReload(actor, 'Scenario status changed', `Scenario moved to ${next}.`, 'E4');
      setStatus(`Scenario moved to ${next}.`);
    } catch (error: any) { if (activeUserId.current === actor.id) setStatus(error.message); } finally { setBusy(false); }
  }

  async function createAttention(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !record.businessId) return;
    const actor = user;
    setBusy(true);
    try {
      await addAttentionBlock(actor, record.businessId, { ...attentionDraft, status: 'Planned', evidence: 'E4' });
      await logAndReload(actor, 'Founder attention allocated', `${attentionDraft.weeklyMinutes} minutes/week: ${attentionDraft.area}`, 'E4');
      setAttentionDraft({ area: '', outcome: '', weeklyMinutes: 120 });
      setStatus('Founder attention block saved. A calendar is not strategy, but strategy with no time allocation is mostly decorative.');
    } catch (error: any) { if (activeUserId.current === actor.id) setStatus(error.message); } finally { setBusy(false); }
  }

  async function changeAttention(id: string, next: AttentionStatus) {
    if (!user || !record.businessId) return;
    const actor = user;
    setBusy(true);
    try {
      await updateAttentionStatus(actor, record.businessId, id, next);
      await logAndReload(actor, 'Founder attention status changed', `Attention block moved to ${next}.`, 'E4');
      setStatus(`Attention block moved to ${next}.`);
    } catch (error: any) { if (activeUserId.current === actor.id) setStatus(error.message); } finally { setBusy(false); }
  }

  async function createPortfolio(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !record.businessId) return;
    const actor = user;
    setBusy(true);
    try {
      await addPortfolioThesis(actor, record.businessId, { ...portfolioDraft, status: 'Explore', evidence: 'E5' });
      await logAndReload(actor, 'Portfolio thesis added', `${portfolioDraft.name}: ${portfolioDraft.role}`, 'E5');
      setPortfolioDraft({ name: '', role: 'Experiment', thesis: '', nextCapital: '', nextAttention: '' });
      setStatus('Portfolio thesis saved. Existence alone does not make a business “strategic,” despite several centuries of board decks suggesting otherwise.');
    } catch (error: any) { if (activeUserId.current === actor.id) setStatus(error.message); } finally { setBusy(false); }
  }

  async function changePortfolio(id: string, next: PortfolioStatus) {
    if (!user || !record.businessId) return;
    const actor = user;
    setBusy(true);
    try {
      await updatePortfolioStatus(actor, record.businessId, id, next);
      await logAndReload(actor, 'Portfolio status changed', `Portfolio thesis moved to ${next}.`, 'E4');
      setStatus(`Portfolio thesis moved to ${next}.`);
    } catch (error: any) { if (activeUserId.current === actor.id) setStatus(error.message); } finally { setBusy(false); }
  }

  return (
    <main className={styles.page}>
      <div className={styles.crumbs}><a href="/">Command Center</a><a href="/intelligence">Intelligence</a><a href="/workbench">Build & Run</a></div>
      <p className={styles.status}>{user?.email ? `${user.email} · ${status}` : status}</p>

      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>STRATEGY → CUSTOMERS → ASSETS → DYNASTY</p>
          <h1>Build a business that can <span>learn, compound and outlive today’s assumptions.</span></h1>
          <p>Business Model Lab, Customer Intelligence, Marketing & Distribution, Asset Map, Scenario Lab, Founder Attention and Portfolio / Dynasty now share the same business identity and Business Memory.</p>
        </div>
        <aside className={styles.dynastyScore}><small>DYNASTY READINESS SIGNAL</small><strong>{signals.dynastyReadiness}</strong><span>structural coverage, not a valuation or success forecast</span></aside>
      </section>

      <section className={styles.signalGrid}>
        <article><b>{signals.modelCoverage}</b><span>business model coverage</span></article>
        <article><b>{signals.customerClarity}</b><span>customer intelligence</span></article>
        <article><b>{signals.distributionLearning}</b><span>distribution learning</span></article>
        <article><b>{signals.assetStrength}</b><span>asset visibility</span></article>
        <article><b>{signals.scenarioReadiness}</b><span>scenario readiness</span></article>
        <article><b>{signals.attentionDiscipline}</b><span>attention discipline</span></article>
        <article><b>{signals.portfolioMaturity}</b><span>portfolio maturity</span></article>
      </section>

      <section className={styles.panel}>
        <p className={styles.eyebrow}>STRATEGIC BLIND SPOTS</p><h2>Questions the business still cannot answer well</h2>
        <div className={styles.questionGrid}>{questions.length ? questions.map((item) => <article key={`${item.area}-${item.question}`}><small>{item.area}</small><h3>{item.question}</h3><p>{item.next}</p></article>) : <p className={styles.empty}>No obvious setup gaps. Keep replacing hypotheses with evidence and outcomes.</p>}</div>
      </section>

      <section className={styles.panel} id="model">
        <div className={styles.panelHead}><div><p className={styles.eyebrow}>BUSINESS MODEL LAB</p><h2>Map how the business is supposed to work</h2><p className={styles.plain}>Each element begins as E5. “Supported” means you have enough evidence to operate with it for now, not that the universe signed a warranty.</p></div><button className={styles.secondary} onClick={prefillModelFromDNA}>Prefill from Business DNA</button></div>
        {user && <form className={styles.formGrid} onSubmit={createModel}><label>Area<select value={modelDraft.area} onChange={(e) => setModelDraft({ ...modelDraft, area: e.target.value as ModelArea })}>{modelAreas.map((x) => <option key={x}>{x}</option>)}</select></label><label>Confidence: {modelDraft.confidence}%<input type="range" min="0" max="100" value={modelDraft.confidence} onChange={(e) => setModelDraft({ ...modelDraft, confidence: Number(e.target.value) })} /></label><label className={styles.wide}>Current hypothesis<textarea required value={modelDraft.statement} onChange={(e) => setModelDraft({ ...modelDraft, statement: e.target.value })} /></label><button className={styles.button} disabled={busy}>Add model element</button></form>}
        <div className={styles.cards}>{strategy.model.map((item) => <article className={styles.card} key={item.id}><div className={styles.top}><span>{item.area}</span><small>{item.evidence} · {evidenceLabels[item.evidence]}</small></div><h3>{item.statement}</h3><p>{item.confidence}% confidence</p><div className={styles.actions}>{modelStatuses.map((next) => <button key={next} disabled={busy || item.status === next} onClick={() => changeModel(item.id, next)}>{next}</button>)}</div></article>)}{!strategy.model.length && <p className={styles.empty}>No model elements yet.</p>}</div>
      </section>

      <section className={styles.panel} id="customers">
        <div className={styles.panelHead}><div><p className={styles.eyebrow}>CUSTOMER INTELLIGENCE</p><h2>Record what customers teach the business</h2><p className={styles.plain}>Manual founder notes are E4. Customer-derived evidence belongs in E3 only when it actually came from customers. Revolutionary concept: labels should mean things.</p></div></div>
        {user && <form className={styles.formGrid} onSubmit={createCustomer}><label>Insight type<select value={customerDraft.kind} onChange={(e) => setCustomerDraft({ ...customerDraft, kind: e.target.value as CustomerInsightKind })}>{insightKinds.map((x) => <option key={x}>{x}</option>)}</select></label><label className={styles.wide}>What did we learn?<textarea required value={customerDraft.statement} onChange={(e) => setCustomerDraft({ ...customerDraft, statement: e.target.value })} /></label><label className={styles.wide}>What might this change?<textarea value={customerDraft.implication} onChange={(e) => setCustomerDraft({ ...customerDraft, implication: e.target.value })} /></label><button className={styles.button} disabled={busy}>Save customer insight</button></form>}
        <div className={styles.cards}>{strategy.customerInsights.map((item) => <article className={styles.card} key={item.id}><div className={styles.top}><span>{item.kind}</span><small>{item.evidence} · {evidenceLabels[item.evidence]}</small></div><h3>{item.statement}</h3><p>{item.implication || 'No implication recorded yet.'}</p></article>)}{!strategy.customerInsights.length && <p className={styles.empty}>No customer intelligence saved yet.</p>}</div>
      </section>

      <section className={styles.panel} id="distribution">
        <div className={styles.panelHead}><div><p className={styles.eyebrow}>MARKETING & DISTRIBUTION</p><h2>Test how useful demand is reached</h2><p className={styles.plain}>Channels are experiments until repeatable evidence says otherwise. Followers, impressions and vibes can be interesting; customer behavior is considerably harder to argue with.</p></div></div>
        {user && <form className={styles.formGrid} onSubmit={createDistribution}><label>Channel<input required value={distributionDraft.channel} onChange={(e) => setDistributionDraft({ ...distributionDraft, channel: e.target.value })} placeholder="Email, search, partner, event…" /></label><label>Audience<input value={distributionDraft.audience} onChange={(e) => setDistributionDraft({ ...distributionDraft, audience: e.target.value })} /></label><label className={styles.wide}>Message<textarea value={distributionDraft.message} onChange={(e) => setDistributionDraft({ ...distributionDraft, message: e.target.value })} /></label><label>Action<input value={distributionDraft.action} onChange={(e) => setDistributionDraft({ ...distributionDraft, action: e.target.value })} placeholder="What should they do?" /></label><label>Measure<input required value={distributionDraft.measure} onChange={(e) => setDistributionDraft({ ...distributionDraft, measure: e.target.value })} placeholder="How will we know?" /></label><button className={styles.button} disabled={busy}>Plan distribution test</button></form>}
        <div className={styles.cards}>{strategy.distribution.map((item) => <article className={styles.card} key={item.id}><div className={styles.top}><span>{item.channel}</span><span>{item.status}</span></div><h3>{item.audience || 'Audience not specified'}</h3><p>{item.message || 'No message recorded.'}</p><p><b>Measure:</b> {item.measure || 'Not defined'}</p><textarea className={styles.resultBox} value={distributionResults[item.id] ?? item.result} onChange={(e) => setDistributionResults((current) => ({ ...current, [item.id]: e.target.value }))} placeholder="What actually happened?" /><div className={styles.actions}>{distributionStatuses.map((next) => <button key={next} disabled={busy || item.status === next} onClick={() => changeDistribution(item.id, next)}>{next}</button>)}</div></article>)}{!strategy.distribution.length && <p className={styles.empty}>No distribution experiments yet.</p>}</div>
      </section>

      <section className={styles.two}>
        <section className={styles.panel} id="assets"><div className={styles.panelHead}><div><p className={styles.eyebrow}>ASSET MAP</p><h2>What can compound?</h2></div></div>{user && <form className={styles.formGrid} onSubmit={createAsset}><label>Asset type<select value={assetDraft.kind} onChange={(e) => setAssetDraft({ ...assetDraft, kind: e.target.value as AssetKind })}>{assetKinds.map((x) => <option key={x}>{x}</option>)}</select></label><label>Name<input required value={assetDraft.name} onChange={(e) => setAssetDraft({ ...assetDraft, name: e.target.value })} /></label><label className={styles.wide}>Why it creates durable value<textarea value={assetDraft.valueReason} onChange={(e) => setAssetDraft({ ...assetDraft, valueReason: e.target.value })} /></label><label>Control / ownership<input value={assetDraft.control} onChange={(e) => setAssetDraft({ ...assetDraft, control: e.target.value })} /></label><label>Transferability<select value={assetDraft.transferability} onChange={(e) => setAssetDraft({ ...assetDraft, transferability: e.target.value as any })}><option>Low</option><option>Medium</option><option>High</option></select></label><button className={styles.button} disabled={busy}>Map asset</button></form>}<div className={styles.cards}>{strategy.assets.map((item) => <article className={styles.card} key={item.id}><div className={styles.top}><span>{item.kind}</span><span>{item.transferability} transferability</span></div><h3>{item.name}</h3><p>{item.valueReason || 'Value reason not recorded.'}</p><small>{item.control || 'Control not recorded'} · {item.evidence}</small></article>)}{!strategy.assets.length && <p className={styles.empty}>No assets mapped yet.</p>}</div></section>

        <section className={styles.panel} id="attention"><div className={styles.panelHead}><div><p className={styles.eyebrow}>FOUNDER ATTENTION</p><h2>Make time allocation visible</h2><p className={styles.plain}>{signals.weeklyMinutes} planned/active minutes per week currently recorded.</p></div></div>{user && <form className={styles.formGrid} onSubmit={createAttention}><label>Area<input required value={attentionDraft.area} onChange={(e) => setAttentionDraft({ ...attentionDraft, area: e.target.value })} /></label><label>Minutes / week<input type="number" min="0" max="10080" value={attentionDraft.weeklyMinutes} onChange={(e) => setAttentionDraft({ ...attentionDraft, weeklyMinutes: Number(e.target.value) })} /></label><label className={styles.wide}>Outcome this time should produce<textarea value={attentionDraft.outcome} onChange={(e) => setAttentionDraft({ ...attentionDraft, outcome: e.target.value })} /></label><button className={styles.button} disabled={busy}>Allocate attention</button></form>}<div className={styles.cards}>{strategy.attention.map((item) => <article className={styles.card} key={item.id}><div className={styles.top}><span>{item.status}</span><span>{item.weeklyMinutes} min/week</span></div><h3>{item.area}</h3><p>{item.outcome || 'Outcome not defined.'}</p><div className={styles.actions}>{attentionStatuses.map((next) => <button key={next} disabled={busy || item.status === next} onClick={() => changeAttention(item.id, next)}>{next}</button>)}</div></article>)}{!strategy.attention.length && <p className={styles.empty}>No founder-attention blocks yet.</p>}</div></section>
      </section>

      <section className={styles.panel} id="scenarios">
        <div className={styles.panelHead}><div><p className={styles.eyebrow}>SCENARIO LAB</p><h2>Prepare for futures that would change the decision</h2><p className={styles.plain}>Scenarios are E7 forecasts. The useful parts are early signals and decision rules, not theatrical certainty about 2029.</p></div></div>
        {user && <form className={styles.formGrid} onSubmit={createScenario}><label>Name<input required value={scenarioDraft.name} onChange={(e) => setScenarioDraft({ ...scenarioDraft, name: e.target.value })} /></label><label>Probability: {scenarioDraft.probability}%<input type="range" min="0" max="100" value={scenarioDraft.probability} onChange={(e) => setScenarioDraft({ ...scenarioDraft, probability: Number(e.target.value) })} /></label><label className={styles.wide}>Premise<textarea value={scenarioDraft.premise} onChange={(e) => setScenarioDraft({ ...scenarioDraft, premise: e.target.value })} /></label><label>Upside<input value={scenarioDraft.upside} onChange={(e) => setScenarioDraft({ ...scenarioDraft, upside: e.target.value })} /></label><label>Downside<input value={scenarioDraft.downside} onChange={(e) => setScenarioDraft({ ...scenarioDraft, downside: e.target.value })} /></label><label>Early signal<input required value={scenarioDraft.earlySignal} onChange={(e) => setScenarioDraft({ ...scenarioDraft, earlySignal: e.target.value })} /></label><label>Decision rule<input required value={scenarioDraft.decisionRule} onChange={(e) => setScenarioDraft({ ...scenarioDraft, decisionRule: e.target.value })} /></label><button className={styles.button} disabled={busy}>Create scenario</button></form>}
        <div className={styles.cards}>{strategy.scenarios.map((item) => <article className={styles.card} key={item.id}><div className={styles.top}><span>{item.status}</span><span>{item.probability}% planning probability</span></div><h3>{item.name}</h3><p>{item.premise || 'No premise recorded.'}</p><p><b>Early signal:</b> {item.earlySignal}</p><p><b>Decision rule:</b> {item.decisionRule}</p><small>{item.evidence} · {evidenceLabels[item.evidence]}</small><div className={styles.actions}>{scenarioStatuses.map((next) => <button key={next} disabled={busy || item.status === next} onClick={() => changeScenario(item.id, next)}>{next}</button>)}</div></article>)}{!strategy.scenarios.length && <p className={styles.empty}>No scenarios yet.</p>}</div>
      </section>

      <section className={styles.panel} id="dynasty">
        <div className={styles.panelHead}><div><p className={styles.eyebrow}>PORTFOLIO / DYNASTY MODE</p><h2>Decide the role of this business beyond this quarter</h2><p className={styles.plain}>Portfolio thinking asks what deserves capital, attention, harvesting, holding or exit. “We own it” is not, by itself, a capital-allocation thesis.</p></div></div>
        {user && <form className={styles.formGrid} onSubmit={createPortfolio}><label>Name<input required value={portfolioDraft.name} onChange={(e) => setPortfolioDraft({ ...portfolioDraft, name: e.target.value })} placeholder={record.dna.name} /></label><label>Portfolio role<select value={portfolioDraft.role} onChange={(e) => setPortfolioDraft({ ...portfolioDraft, role: e.target.value as PortfolioRole })}>{portfolioRoles.map((x) => <option key={x}>{x}</option>)}</select></label><label className={styles.wide}>Investment thesis<textarea required value={portfolioDraft.thesis} onChange={(e) => setPortfolioDraft({ ...portfolioDraft, thesis: e.target.value })} /></label><label>Next capital decision<input value={portfolioDraft.nextCapital} onChange={(e) => setPortfolioDraft({ ...portfolioDraft, nextCapital: e.target.value })} /></label><label>Next attention decision<input value={portfolioDraft.nextAttention} onChange={(e) => setPortfolioDraft({ ...portfolioDraft, nextAttention: e.target.value })} /></label><button className={styles.button} disabled={busy}>Add portfolio thesis</button></form>}
        <div className={styles.cards}>{strategy.portfolio.map((item) => <article className={styles.card} key={item.id}><div className={styles.top}><span>{item.role}</span><span>{item.status}</span></div><h3>{item.name}</h3><p>{item.thesis}</p><div className={styles.factGrid}><div><small>NEXT CAPITAL</small><p>{item.nextCapital || 'Not specified'}</p></div><div><small>NEXT ATTENTION</small><p>{item.nextAttention || 'Not specified'}</p></div></div><small>{item.evidence} · {evidenceLabels[item.evidence]}</small><div className={styles.actions}>{portfolioStatuses.map((next) => <button key={next} disabled={busy || item.status === next} onClick={() => changePortfolio(item.id, next)}>{next}</button>)}</div></article>)}{!strategy.portfolio.length && <p className={styles.empty}>No portfolio theses yet. That is normal before Portfolio stage; Dynasty Mode should not cosplay as maturity.</p>}</div>
      </section>
    </main>
  );
}
