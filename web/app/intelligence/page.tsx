'use client';

import { useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  blankBusiness,
  evidenceLabels,
  getBusinessXRay,
  getIdeaLabPrompts,
  getMissingIntelligence,
  getXRayScore,
  score,
  type BusinessDNA,
  type BusinessRecord,
  type ValueSprint,
  type ValueSprintDecision,
  type ValueSprintStatus,
} from '@/lib/fdos';
import {
  addMemory,
  addValueSprint,
  ensureBusiness,
  loadBusinessRecord,
  saveDNA,
  updateValueSprint,
} from '@/lib/business-store';
import { supabase } from '@/lib/supabase';
import styles from './intelligence.module.css';

type SprintDraft = {
  title: string;
  hypothesis: string;
  action: string;
  measure: string;
  baseline: string;
  target: string;
};

const emptySprint: SprintDraft = {
  title: '',
  hypothesis: '',
  action: '',
  measure: '',
  baseline: '',
  target: '',
};

export default function IntelligenceWorkspace() {
  const [user, setUser] = useState<User | null>(null);
  const [record, setRecord] = useState<BusinessRecord>(blankBusiness);
  const [status, setStatus] = useState('Loading the shared business record…');
  const [busy, setBusy] = useState(false);
  const [ideaDrafts, setIdeaDrafts] = useState<Partial<Record<keyof BusinessDNA, string>>>({});
  const [sprintDraft, setSprintDraft] = useState<SprintDraft>(emptySprint);
  const [resultDrafts, setResultDrafts] = useState<Record<string, string>>({});

  const xray = useMemo(() => getBusinessXRay(record), [record]);
  const xrayScore = useMemo(() => getXRayScore(record), [record]);
  const missing = useMemo(() => getMissingIntelligence(record), [record]);
  const prompts = useMemo(() => getIdeaLabPrompts(record), [record]);
  const topOpportunity = useMemo(
    () => [...record.opportunities].sort((a, b) => score(b) - score(a))[0],
    [record.opportunities],
  );

  async function load(nextUser: User) {
    setStatus('Loading the shared business record…');
    try {
      const businessId = await ensureBusiness(nextUser);
      const next = await loadBusinessRecord(nextUser, businessId);
      setRecord(next);
      setStatus('Shared business record synced.');
    } catch (error: any) {
      setStatus(`Could not load workspace: ${error.message}`);
    }
  }

  useEffect(() => {
    let disposed = false;
    void supabase.auth.getUser().then(({ data }) => {
      if (disposed) return;
      setUser(data.user || null);
      if (data.user) void load(data.user);
      else setStatus('Sign in from the Command Center to use the private intelligence workspace.');
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (disposed) return;
      setUser(session?.user || null);
      if (session?.user) void load(session.user);
      else {
        setRecord(blankBusiness);
        setStatus('Signed out.');
      }
    });
    return () => {
      disposed = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function saveIdeaAnswer(field: keyof BusinessDNA, value: string) {
    if (!user || !record.businessId || field === 'stage') return;
    const nextDna = { ...record.dna, [field]: value } as BusinessDNA;
    setBusy(true);
    try {
      await saveDNA(user, record.businessId, nextDna);
      await addMemory(user, record.businessId, {
        kind: 'Idea Lab updated Business DNA',
        summary: `Founder updated ${String(field)} from Idea Lab.`,
        evidence: 'E4',
      });
      setIdeaDrafts((current) => ({ ...current, [field]: undefined }));
      await load(user);
      setStatus('Idea Lab answer saved to the shared Business DNA.');
    } catch (error: any) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  function useTopOpportunity() {
    if (!topOpportunity) return;
    setSprintDraft({
      title: topOpportunity.title,
      hypothesis: topOpportunity.observation,
      action: `Run the smallest reversible version of: ${topOpportunity.title}`,
      measure: 'Define one observable before/after measure.',
      baseline: '',
      target: '',
    });
    document.getElementById('value-sprints')?.scrollIntoView({ behavior: 'smooth' });
  }

  async function createSprint(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !record.businessId) return;
    setBusy(true);
    try {
      await addValueSprint(user, record.businessId, {
        ...sprintDraft,
        result: '',
        status: 'Planned',
        evidence: 'E4',
      });
      await addMemory(user, record.businessId, {
        kind: 'Value Sprint planned',
        summary: sprintDraft.title,
        evidence: 'E4',
      });
      setSprintDraft(emptySprint);
      await load(user);
      setStatus('Value Sprint saved. It is planned, not magically proven by the existence of a form.');
    } catch (error: any) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function moveSprint(sprint: ValueSprint, nextStatus: ValueSprintStatus, decision?: ValueSprintDecision) {
    if (!user || !record.businessId) return;
    setBusy(true);
    try {
      const result = resultDrafts[sprint.id] ?? sprint.result;
      await updateValueSprint(user, record.businessId, sprint.id, {
        status: nextStatus,
        decision,
        result,
      });
      if (decision) {
        await addMemory(user, record.businessId, {
          kind: `Value Sprint ${decision}`,
          summary: `${sprint.title}: ${result || 'Decision recorded without a written result.'}`,
          evidence: 'E4',
        });
      }
      await load(user);
      setStatus(decision ? `Sprint decision recorded: ${decision}.` : `Sprint moved to ${nextStatus}.`);
    } catch (error: any) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={styles.page}>
      <a className={styles.back} href="/">← Founder Command Center</a>
      <div className={styles.statusLine}>{user?.email ? `${user.email} · ${status}` : status}</div>

      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>FOUNDER INTELLIGENCE LAYER</p>
          <h1>Turn uncertainty into <span>questions, tests and memory.</span></h1>
          <p>
            Idea Lab shapes the business. Business X-Ray shows structural weak spots. What Am I Missing? exposes unanswered questions. Value Sprints turn one improvement into a measurable KEEP / REVISE / REVERT loop.
          </p>
        </div>
        <aside className={styles.scoreCard}>
          <small>BUSINESS X-RAY</small>
          <strong>{xrayScore}</strong>
          <span>overall structural signal, not a vanity “business grade”</span>
        </aside>
      </section>

      <section className={styles.panel} id="xray">
        <div className={styles.panelHead}>
          <div>
            <p className={styles.eyebrow}>BUSINESS X-RAY</p>
            <h2>Where the business is structurally strong or thin</h2>
            <p className={styles.plain}>Scores are derived from the shared record. They are diagnostics, not claims about revenue, product-market fit or future success.</p>
          </div>
          {topOpportunity && <button className={styles.secondary} onClick={useTopOpportunity}>Turn top opportunity into a sprint</button>}
        </div>
        <div className={styles.xrayGrid}>
          {xray.map((signal) => (
            <article className={styles.signal} key={signal.id}>
              <div className={styles.signalTop}><span className={styles.state}>{signal.state}</span><b>{signal.score}</b></div>
              <h3>{signal.label}</h3>
              <div className={styles.meter}><span style={{ width: `${signal.score}%` }} /></div>
              <p>{signal.why}</p>
              <p className={styles.next}><b>Next:</b> {signal.next}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.panel} id="idea-lab">
        <div className={styles.panelHead}>
          <div>
            <p className={styles.eyebrow}>IDEA LAB</p>
            <h2>Make the idea clearer without pretending it is validated</h2>
            <p className={styles.plain}>Answers save directly into Business DNA as founder-approved E4 internal observations. Outside proof still has to come from outside. Annoyingly, reality refuses to accept autocomplete as market validation.</p>
          </div>
        </div>
        <div className={styles.promptGrid}>
          {prompts.map((prompt) => {
            const value = ideaDrafts[prompt.writesTo] ?? record.dna[prompt.writesTo];
            return (
              <article className={styles.prompt} key={prompt.id}>
                <small>{prompt.title}</small>
                <h3>{prompt.question}</h3>
                <textarea
                  value={value}
                  onChange={(event) => setIdeaDrafts((current) => ({ ...current, [prompt.writesTo]: event.target.value }))}
                  placeholder="Write the current best answer. It can change when evidence improves."
                />
                <button className={styles.button} disabled={busy || !user || !String(value).trim()} onClick={() => saveIdeaAnswer(prompt.writesTo, String(value))}>
                  Save to Business DNA
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.panel} id="missing">
        <div>
          <p className={styles.eyebrow}>WHAT AM I MISSING?</p>
          <h2>Highest-value unanswered questions</h2>
          <p className={styles.plain}>This engine reads across Business DNA, evidence classes, Value Map, decisions, risks, opportunities and Value Sprints. Empty fields are only the beginning. Missing proof counts too.</p>
        </div>
        {missing.length ? (
          <div className={styles.missingGrid}>
            {missing.map((item) => (
              <article className={styles.missing} key={item.id}>
                <div className={styles.missingTop}><small>{item.area}</small><span className={styles.level}>{item.level}</span></div>
                <h3>{item.question}</h3>
                <p>{item.why}</p>
                <p className={styles.next}><b>Do next:</b> {item.next}</p>
              </article>
            ))}
          </div>
        ) : <p className={styles.empty}>No obvious structural gaps from the current record. The next missing information should come from new evidence and outcomes.</p>}
      </section>

      <section className={styles.panel} id="value-sprints">
        <div className={styles.panelHead}>
          <div>
            <p className={styles.eyebrow}>VALUE SPRINTS</p>
            <h2>Test one improvement, measure it, then decide</h2>
            <p className={styles.plain}>A sprint is deliberately small: hypothesis → action → measure → result → KEEP / REVISE / REVERT. No ceremonial 47-slide transformation program required.</p>
          </div>
          <div className={styles.sprintTools}>{topOpportunity && <button className={styles.secondary} onClick={useTopOpportunity}>Prefill from best opportunity</button>}</div>
        </div>

        {user ? (
          <form className={styles.sprintForm} onSubmit={createSprint}>
            <label>What are we testing?<input required value={sprintDraft.title} onChange={(event) => setSprintDraft({ ...sprintDraft, title: event.target.value })} /></label>
            <label>How will we know?<input required value={sprintDraft.measure} onChange={(event) => setSprintDraft({ ...sprintDraft, measure: event.target.value })} /></label>
            <label className={styles.wide}>Hypothesis<textarea required value={sprintDraft.hypothesis} onChange={(event) => setSprintDraft({ ...sprintDraft, hypothesis: event.target.value })} /></label>
            <label className={styles.wide}>Smallest useful action<textarea required value={sprintDraft.action} onChange={(event) => setSprintDraft({ ...sprintDraft, action: event.target.value })} /></label>
            <label>Baseline<input value={sprintDraft.baseline} onChange={(event) => setSprintDraft({ ...sprintDraft, baseline: event.target.value })} placeholder="What is true before the test?" /></label>
            <label>Target<input value={sprintDraft.target} onChange={(event) => setSprintDraft({ ...sprintDraft, target: event.target.value })} placeholder="What result would count as useful?" /></label>
            <button className={styles.button} disabled={busy}>Plan Value Sprint</button>
          </form>
        ) : <p className={styles.empty}>Sign in from the Command Center to save Value Sprints.</p>}

        <div className={styles.sprintList}>
          {record.valueSprints.map((sprint) => (
            <article className={styles.sprint} key={sprint.id}>
              <div className={styles.sprintTop}>
                <div><small>{sprint.evidence} · {evidenceLabels[sprint.evidence]}</small><h3>{sprint.title}</h3></div>
                <span className={styles.status}>{sprint.status}</span>
              </div>
              <p><b>Hypothesis:</b> {sprint.hypothesis}</p>
              <p><b>Action:</b> {sprint.action}</p>
              <div className={styles.sprintFacts}>
                <div><small>MEASURE</small><p>{sprint.measure || 'Not defined'}</p></div>
                <div><small>BASELINE</small><p>{sprint.baseline || 'Not recorded'}</p></div>
                <div><small>TARGET</small><p>{sprint.target || 'Not recorded'}</p></div>
              </div>
              <textarea
                value={resultDrafts[sprint.id] ?? sprint.result}
                onChange={(event) => setResultDrafts((current) => ({ ...current, [sprint.id]: event.target.value }))}
                placeholder="What actually happened? Record the observable result before making the decision."
              />
              <div className={styles.sprintActions}>
                {sprint.status === 'Planned' && <button className={styles.secondary} disabled={busy} onClick={() => moveSprint(sprint, 'Running')}>Start</button>}
                {!['Keep', 'Revise', 'Revert'].includes(sprint.status) && <button className={styles.secondary} disabled={busy} onClick={() => moveSprint(sprint, 'Measured')}>Mark measured</button>}
                <button className={styles.decisionButton} disabled={busy} onClick={() => moveSprint(sprint, 'Keep', 'Keep')}>KEEP</button>
                <button className={styles.decisionButton} disabled={busy} onClick={() => moveSprint(sprint, 'Revise', 'Revise')}>REVISE</button>
                <button className={styles.decisionButton} disabled={busy} onClick={() => moveSprint(sprint, 'Revert', 'Revert')}>REVERT</button>
              </div>
            </article>
          ))}
          {!record.valueSprints.length && <p className={styles.empty}>No Value Sprints yet. That is either a fresh workspace or a very sophisticated commitment to discussing improvements indefinitely.</p>}
        </div>
      </section>
    </main>
  );
}
