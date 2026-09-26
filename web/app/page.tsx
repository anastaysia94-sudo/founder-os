'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  blankBusiness,
  dnaCompleteness,
  evidenceLabels,
  getMissingQuestions,
  score,
  stageGuidance,
  type BusinessDNA,
  type BusinessRecord,
  type BusinessStage,
  type EvidenceProposal,
} from '@/lib/fdos';
import { supabase } from '@/lib/supabase';
import {
  addDecision,
  addMemory,
  addOpportunity,
  addRisk,
  addValue,
  approveEvidenceProposal,
  ensureBusiness,
  loadBusinessRecord,
  loadEvidenceProposals,
  rejectEvidenceProposal,
  saveDNA,
} from '@/lib/business-store';

const stages: BusinessStage[] = [
  'Idea',
  'Exploring',
  'Validating',
  'Building',
  'Pre-Launch',
  'Launched',
  'Finding Traction',
  'Growing',
  'Systemizing',
  'Scaling',
  'Portfolio',
  'Dynasty',
];

const glossary: Record<string, string> = {
  Evidence: 'Information that supports a claim. Founder Dynasty OS labels important claims so you can tell what is known from what is assumed.',
  'Business Stage': 'Where the business is in its life cycle right now. The stage changes what the system should prioritize.',
  'Business DNA': 'The living record of what the business is: purpose, customer, problem, offer, money model, advantage, limits and current goal.',
  'Founder Command Center': 'The cross-business view that pulls the most important signals from the shared business record into one place.',
  'Value Map': 'Where the business creates, captures, loses, risks, or owns value.',
  'Business Memory': 'A dated record of decisions, evidence, changes and lessons.',
  Opportunity: 'A possible action or change that may make the business more useful, resilient or valuable.',
  Risk: 'Something that could hurt the business or make an important goal harder to reach.',
  CRM: 'Customer Relationship Management. A system for keeping track of possible and existing customers.',
};

const operatingAreas = [
  {
    name: 'Idea & Strategy',
    description: 'Shape the idea, business model, scenarios and strategic choices.',
    modules: ['Idea Lab', 'Business Model Lab', 'Scenario Lab'],
  },
  {
    name: 'Product & Offer',
    description: 'Decide what gets built, for whom, and why the offer deserves to exist.',
    modules: ['Product / Offer Lab', 'Customer Problem', 'Value Proposition'],
  },
  {
    name: 'Customers & Growth',
    description: 'Understand customers, earn attention, sell, retain and grow demand.',
    modules: ['Customer Intelligence', 'Marketing & Distribution', 'Sales OS'],
    sales: true,
  },
  {
    name: 'Money',
    description: 'Track economics, assumptions, forecasts, cash and financial decisions.',
    modules: ['Finance Center', 'Assumptions', 'Forecasts'],
  },
  {
    name: 'Operations & Execution',
    description: 'Turn decisions into projects, systems, ownership and repeatable delivery.',
    modules: ['Operations Engine', 'Projects', 'Founder Attention'],
  },
  {
    name: 'Research & Evidence',
    description: 'Keep facts, outside evidence, customer evidence and hypotheses distinct.',
    modules: ['Research Engine', 'Evidence Integrity', 'Evidence Inbox'],
  },
  {
    name: 'Assets & Risk',
    description: 'Protect what matters and build assets that compound enterprise value.',
    modules: ['Risk Center', 'Asset Map', 'Business X-Ray'],
  },
  {
    name: 'Dynasty',
    description: 'Think beyond one product: portfolio allocation, succession and durable enterprise value.',
    modules: ['Portfolio Mode', 'Cross-Business Intelligence', 'Dynasty Mode'],
  },
];

function Term({ children }: { children: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="termWrap">
      <button type="button" className="term" onClick={() => setOpen(!open)} aria-expanded={open}>
        {children}
      </button>
      {open && (
        <span className="termBubble" role="tooltip">
          <b>{children}</b>
          {glossary[children]}
          <button type="button" onClick={() => setOpen(false)} aria-label="Close definition">×</button>
        </span>
      )}
    </span>
  );
}

function Field({ label, value, onChange, wide = false }: { label: string; value: string; onChange: (v: string) => void; wide?: boolean }) {
  return (
    <label className={wide ? 'wide' : ''}>
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SourceLink({ url }: { url?: string }) {
  return url ? (
    <a className="sourceLink" href={url} target="_blank" rel="noreferrer">
      View supporting source ↗
    </a>
  ) : null;
}

type ComposerKind = 'value' | 'decision' | 'risk' | 'opportunity' | 'memory';
type ComposerState = {
  kind: ComposerKind;
  title: string;
  detail: string;
  secondary: string;
  category: string;
} | null;

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [record, setRecord] = useState<BusinessRecord>(blankBusiness);
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [recovering, setRecovering] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('Checking your workspace…');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [evidenceResult, setEvidenceResult] = useState<any>(null);
  const [proposals, setProposals] = useState<EvidenceProposal[]>([]);
  const [composer, setComposer] = useState<ComposerState>(null);
  const [busy, setBusy] = useState(false);
  const activeUserId = useRef<string | null>(null);
  const hydrateVersion = useRef(0);

  const ranked = useMemo(() => [...record.opportunities].sort((a, b) => score(b) - score(a)), [record.opportunities]);
  const highRisks = record.risks.filter((risk) => risk.level === 'High').length;
  const openDecisions = record.decisions.filter((decision) => decision.status === 'Open').length;
  const pending = proposals.filter((proposal) => proposal.status === 'pending');
  const completeness = dnaCompleteness(record.dna);
  const missingQuestions = getMissingQuestions(record);
  const guide = stageGuidance[record.dna.stage];
  const topOpportunity = ranked[0];
  const topRisk = [...record.risks].sort((a, b) => ({ High: 3, Medium: 2, Low: 1 }[b.level] - { High: 3, Medium: 2, Low: 1 }[a.level]))[0];
  const topDecision = record.decisions.find((decision) => decision.status === 'Open') || record.decisions[0];
  const latestMemory = record.memory[0];
  const salesHref = process.env.NEXT_PUBLIC_SALES_OS_URL || '/sales-engine-app/';

  const updateDNA = (key: keyof BusinessDNA, value: string) => {
    setRecord((current) => ({ ...current, dna: { ...current.dna, [key]: value } }));
  };

  function clearPrivateData(message: string) {
    hydrateVersion.current += 1;
    setRecord(blankBusiness);
    setProposals([]);
    setEvidenceResult(null);
    setComposer(null);
    setEditing(false);
    setWebsiteUrl('');
    setStatus(message);
  }

  function clearPrivateState(message: string) {
    activeUserId.current = null;
    clearPrivateData(message);
  }

  async function hydrate(nextUser: User) {
    if (activeUserId.current !== nextUser.id) return false;
    const version = ++hydrateVersion.current;
    setStatus('Loading your business record…');
    try {
      const businessId = await ensureBusiness(nextUser);
      const [loaded, nextProposals] = await Promise.all([
        loadBusinessRecord(nextUser, businessId),
        loadEvidenceProposals(nextUser, businessId),
      ]);
      if (version !== hydrateVersion.current || activeUserId.current !== nextUser.id) return false;
      setRecord(loaded);
      setProposals(nextProposals);
      setStatus('Cloud sync ready.');
      return true;
    } catch (error: any) {
      if (version === hydrateVersion.current && activeUserId.current === nextUser.id) {
        setStatus(`Cloud sync error: ${error.message}`);
      }
      return false;
    }
  }

  useEffect(() => {
    let disposed = false;
    let authEpoch = 0;

    const applySessionUser = (nextUser: User | null, message: string) => {
      if (disposed) return;
      if (nextUser) {
        const switchingAccounts = activeUserId.current !== null && activeUserId.current !== nextUser.id;
        if (switchingAccounts) clearPrivateData('Switching private workspace…');
        activeUserId.current = nextUser.id;
        setUser(nextUser);
        void hydrate(nextUser);
      } else {
        setUser(null);
        clearPrivateState(message);
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      authEpoch += 1;
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
      applySessionUser(session?.user || null, 'Signed out.');
    });

    const initialEpoch = authEpoch;
    void supabase.auth.getUser().then(({ data }) => {
      if (disposed || authEpoch !== initialEpoch) return;
      if (data.user && new URLSearchParams(window.location.search).get('recovery') === '1') setRecovering(true);
      applySessionUser(data.user || null, 'Sign in to save this business across devices.');
    });

    return () => {
      disposed = true;
      hydrateVersion.current += 1;
      activeUserId.current = null;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function auth(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus(authMode === 'signin' ? 'Signing in…' : 'Creating account…');
    try {
      const result = authMode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      if (result.error) throw result.error;
      setPassword('');
      if (authMode === 'signup' && !result.data.session) {
        setStatus('Account created. Check your email if confirmation is required.');
      }
    } catch (error: any) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function requestPasswordReset() {
    if (!email.trim()) {
      setStatus('Enter your account email first, then choose Send password reset email.');
      return;
    }
    setBusy(true);
    setStatus('Sending password reset email…');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/?recovery=1`,
      });
      if (error) throw error;
      setStatus('Password reset email sent. Open the recovery link, then set a new password here.');
    } catch (error: any) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function updateRecoveredPassword(event: React.FormEvent) {
    event.preventDefault();
    if (newPassword.length < 8) {
      setStatus('Use at least 8 characters for the new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus('The two new-password fields do not match.');
      return;
    }
    setBusy(true);
    setStatus('Updating password…');
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword('');
      setConfirmPassword('');
      setRecovering(false);
      window.history.replaceState({}, '', window.location.pathname);
      setStatus('Password updated. Your account is signed in.');
    } catch (error: any) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setPassword('');
    } catch (error: any) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function persistDNA(next = record.dna) {
    if (!user || !record.businessId) return;
    const actor = user;
    setBusy(true);
    try {
      await saveDNA(actor, record.businessId, next);
      await addMemory(actor, record.businessId, {
        kind: 'Business DNA updated',
        summary: 'Founder approved changes to the shared Business DNA record.',
        evidence: 'E4',
      });
      const applied = await hydrate(actor);
      if (applied) setStatus('Business DNA saved.');
    } catch (error: any) {
      if (activeUserId.current === actor.id) setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function changeStage(stage: BusinessStage) {
    const dna = { ...record.dna, stage };
    setRecord((current) => ({ ...current, dna }));
    if (!user || !record.businessId) return;
    const actor = user;
    setBusy(true);
    try {
      await saveDNA(actor, record.businessId, dna);
      await addMemory(actor, record.businessId, {
        kind: 'Business stage changed',
        summary: `Business stage changed to ${stage}.`,
        evidence: 'E4',
      });
      await hydrate(actor);
    } catch (error: any) {
      if (activeUserId.current === actor.id) setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  function openComposer(kind: ComposerKind) {
    const defaults: Record<ComposerKind, ComposerState> = {
      value: { kind, title: '', detail: '', secondary: '', category: 'Opportunity' },
      decision: { kind, title: '', detail: '', secondary: '', category: 'Open' },
      risk: { kind, title: '', detail: '', secondary: '', category: 'Medium' },
      opportunity: { kind, title: '', detail: '', secondary: '', category: '55' },
      memory: { kind, title: 'Founder note', detail: '', secondary: '', category: 'E4' },
    };
    setComposer(defaults[kind]);
  }

  async function saveComposer(event: React.FormEvent) {
    event.preventDefault();
    if (!composer || !user || !record.businessId) return;
    const actor = user;
    setBusy(true);
    try {
      if (composer.kind === 'value') {
        await addValue(actor, record.businessId, {
          kind: composer.category as any,
          title: composer.title,
          detail: composer.detail,
          evidence: 'E4',
        });
      }
      if (composer.kind === 'decision') {
        await addDecision(actor, record.businessId, {
          question: composer.title,
          status: 'Open',
          next: composer.detail,
          evidence: 'E4',
        });
      }
      if (composer.kind === 'risk') {
        await addRisk(actor, record.businessId, {
          title: composer.title,
          level: composer.category as any,
          response: composer.detail,
          evidence: 'E4',
        });
      }
      if (composer.kind === 'opportunity') {
        await addOpportunity(actor, record.businessId, {
          title: composer.title,
          observation: composer.detail,
          evidence: 'E4',
          confidence: Number(composer.category) || 55,
          impact: 6,
          speed: 6,
          reversibility: 7,
          cost: 4,
          complexity: 4,
          risk: 3,
        });
      }
      if (composer.kind === 'memory') {
        await addMemory(actor, record.businessId, {
          kind: composer.title || 'Founder note',
          summary: composer.detail,
          evidence: 'E4',
        });
      }
      if (activeUserId.current === actor.id) setComposer(null);
      const applied = await hydrate(actor);
      if (applied) setStatus('Saved to the shared business record.');
    } catch (error: any) {
      if (activeUserId.current === actor.id) setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function captureWebsiteEvidence(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !record.businessId) return;
    const actor = user;
    setBusy(true);
    setEvidenceResult(null);
    setStatus('Checking the website and capturing external evidence…');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token || session.user.id !== actor.id) {
        throw new Error('Your session changed. Sign in again before capturing evidence.');
      }
      const response = await fetch('/api/evidence/website', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ businessId: record.businessId, url: websiteUrl }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Could not capture evidence.');
      if (activeUserId.current === actor.id) {
        setEvidenceResult(body.evidence);
        setStatus(`Captured E2 evidence and created ${body.proposals?.length || 0} proposals for your review.`);
      }
      await hydrate(actor);
    } catch (error: any) {
      if (activeUserId.current === actor.id) setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function reviewProposal(proposal: EvidenceProposal, approve: boolean) {
    if (!user) return;
    const actor = user;
    setBusy(true);
    try {
      if (approve) await approveEvidenceProposal(proposal.id);
      else await rejectEvidenceProposal(actor, proposal.id);
      const applied = await hydrate(actor);
      if (applied) setStatus(approve ? 'Proposal approved and applied.' : 'Proposal rejected. Nothing was changed.');
    } catch (error: any) {
      if (activeUserId.current === actor.id) setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <header className="topbar">
        <div>
          <p className="eyebrow">SMARTPICKSHOP HOLDINGS</p>
          <strong>Founder Dynasty OS 10.0</strong>
        </div>
        <nav>
          <a href="#command">Command Center</a>
          <a href="#dna">Business DNA</a>
          <a href="#value">Value</a>
          <a href="#opportunities">Actions</a>
          <a href="#decisions">Decisions</a>
          <a href="#memory">Memory</a>
          <a href="#system-map">Whole OS</a>
        </nav>
      </header>

      {recovering && user ? (
        <section className="panel authPanel">
          <div>
            <p className="eyebrow">RECOVER YOUR PRIVATE WORKSPACE</p>
            <h2>Set a new Founder Dynasty OS password.</h2>
            <p className="plainIntro">The recovery link proved access to the account email. Choose a new password here, then the same account-owned business record remains attached to this user.</p>
          </div>
          <form className="authForm" onSubmit={updateRecoveredPassword}>
            <label>New password<input type="password" required minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>
            <label>Confirm new password<input type="password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>
            <button disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button>
            <p className="authStatus" role="status" aria-live="polite">{status}</p>
          </form>
        </section>
      ) : !user ? (
        <section className="panel authPanel">
          <div>
            <p className="eyebrow">YOUR PRIVATE BUSINESS WORKSPACE</p>
            <h2>Sign in to keep one business record across devices.</h2>
            <p className="plainIntro">
              Business DNA, value, decisions, risks, opportunities, evidence and memory all stay attached to the same account-owned business record.
            </p>
          </div>
          <form className="authForm" onSubmit={auth}>
            <label>Email<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <label>Password<input type="password" required minLength={6} autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            <button disabled={busy}>{busy ? (authMode === 'signin' ? 'Signing in…' : 'Creating account…') : (authMode === 'signin' ? 'Sign in' : 'Create account')}</button>
            {authMode === 'signin' && <button type="button" className="ghostButton" disabled={busy} onClick={() => void requestPasswordReset()}>Send password reset email</button>}
            <button type="button" className="ghostButton" disabled={busy} onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}>
              {authMode === 'signin' ? 'Need an account? Create one' : 'Already have an account? Sign in'}
            </button>
            <p className="authStatus" role="status" aria-live="polite">{status}</p>
          </form>
        </section>
      ) : (
        <section className="syncBar">
          <span><b>{user.email}</b> · {status}</span>
          <button onClick={signOut} disabled={busy}>Sign out</button>
        </section>
      )}

      <section className="hero" id="command">
        <div>
          <p className="eyebrow">THE OPERATING INTELLIGENCE OF THE BUSINESS</p>
          <h1>Run the whole business. <span>Not just the sales tab.</span></h1>
          <p className="lede">
            One shared business record now connects stage, strategy, value, evidence, opportunities, decisions, risks and memory. Sales stays powerful, but it lives inside Customers & Growth instead of trying to annex the entire republic.
          </p>
        </div>
        <div className="stageBadge">
          <small><Term>Business Stage</Term></small>
          <b>{record.dna.stage}</b>
          <span>{record.dna.name}</span>
          <div className="completionMini"><span style={{ width: `${completeness}%` }} /></div>
          <small>{completeness}% of core Business DNA defined</small>
        </div>
      </section>

      <section className="commandGrid">
        <article className="focusCard">
          <p className="eyebrow"><Term>Founder Command Center</Term></p>
          <h2>{record.dna.currentGoal || 'Define the next useful goal.'}</h2>
          <p>
            This is the current focus pulled from the same record used by value, decisions, risks, opportunities, evidence and memory.
          </p>
          <button onClick={() => document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' })}>See best next actions</button>
        </article>
        <div className="signalGrid">
          <article><b>{openDecisions}</b><span>open decisions</span></article>
          <article><b>{highRisks}</b><span>high risks</span></article>
          <article><b>{pending.length}</b><span>evidence proposals waiting</span></article>
          <article><b>{record.memory.length}</b><span>memory entries</span></article>
        </div>
      </section>

      <section className="stageIntelligence">
        <article><small>YOUR JOB AT THIS STAGE</small><p>{guide.job}</p></article>
        <article><small>WHAT NEEDS PROOF</small><p>{guide.prove}</p></article>
        <article><small>WHAT TO AVOID</small><p>{guide.avoid}</p></article>
      </section>

      <section className="commandSignals">
        <article>
          <small>BEST NEXT OPPORTUNITY</small>
          <h3>{topOpportunity?.title || 'No opportunity ranked yet'}</h3>
          <p>{topOpportunity?.observation || 'Add a possible next move and the system will rank it.'}</p>
          {topOpportunity && <span className="signalScore">Priority {score(topOpportunity)}</span>}
        </article>
        <article>
          <small>BIGGEST SAVED RISK</small>
          <h3>{topRisk?.title || 'No risk saved yet'}</h3>
          <p>{topRisk?.response || 'Record the threat most likely to block the current goal.'}</p>
          {topRisk && <span className={`risk ${topRisk.level.toLowerCase()}`}>{topRisk.level}</span>}
        </article>
        <article>
          <small>OPEN CHOICE</small>
          <h3>{topDecision?.question || 'No decision saved yet'}</h3>
          <p>{topDecision?.next || 'Record the decision that deserves a deliberate answer.'}</p>
        </article>
        <article>
          <small>LATEST LEARNING</small>
          <h3>{latestMemory?.kind || 'Business Memory is empty'}</h3>
          <p>{latestMemory?.summary || 'Lessons, changes and decisions will collect here as the business evolves.'}</p>
        </article>
      </section>

      <section className="panel missingPanel">
        <div className="panelHead">
          <div>
            <p className="eyebrow">WHAT AM I MISSING?</p>
            <h2>Questions the shared record cannot answer yet</h2>
            <p className="plainIntro">Blank space is useful. The OS should expose uncertainty instead of decorating it with fake confidence.</p>
          </div>
          <div className="completionDial" aria-label={`${completeness}% Business DNA complete`}>
            <b>{completeness}%</b><span>DNA defined</span>
          </div>
        </div>
        {missingQuestions.length ? (
          <div className="missingGrid">{missingQuestions.map((question) => <article key={question}>{question}</article>)}</div>
        ) : (
          <p className="empty">Core fields are filled. The next gaps should come from evidence, outcomes and new decisions rather than blank setup fields.</p>
        )}
      </section>

      <section className="panel" id="dna">
        <div className="panelHead">
          <div>
            <p className="eyebrow">SHARED BUSINESS RECORD</p>
            <h2><Term>Business DNA</Term></h2>
            <p className="plainIntro">This is the current working model of the business. Every major module should read from this record instead of inventing its own version of reality.</p>
          </div>
          <div className="buttonRow">
            <button className="smallButton" onClick={() => setEditing(!editing)}>{editing ? 'Done editing' : 'Edit Business DNA'}</button>
            {user && <button className="smallButton" onClick={() => persistDNA()} disabled={busy}>Save approved edits</button>}
          </div>
        </div>
        <div className="stageRail">
          {stages.map((stage) => (
            <button key={stage} className={record.dna.stage === stage ? 'active' : ''} onClick={() => changeStage(stage)} disabled={busy}>
              {stage}
            </button>
          ))}
        </div>
        {editing ? (
          <div className="dnaForm">
            <label>Business / idea name<input value={record.dna.name} onChange={(event) => updateDNA('name', event.target.value)} /></label>
            <Field label="Why this business exists" value={record.dna.purpose} onChange={(value) => updateDNA('purpose', value)} />
            <Field label="Problem it is trying to solve" value={record.dna.problem} onChange={(value) => updateDNA('problem', value)} />
            <Field label="Who it is for" value={record.dna.customer} onChange={(value) => updateDNA('customer', value)} />
            <Field label="What it offers" value={record.dna.offer} onChange={(value) => updateDNA('offer', value)} />
            <Field label="How it may make money" value={record.dna.revenueModel} onChange={(value) => updateDNA('revenueModel', value)} />
            <Field label="Possible advantage" value={record.dna.advantage} onChange={(value) => updateDNA('advantage', value)} />
            <Field label="Main limit or constraint" value={record.dna.constraint} onChange={(value) => updateDNA('constraint', value)} />
            <Field label="Most important current goal" value={record.dna.currentGoal} onChange={(value) => updateDNA('currentGoal', value)} wide />
          </div>
        ) : (
          <div className="dnaGrid">
            {[
              ['Purpose', record.dna.purpose],
              ['Problem', record.dna.problem],
              ['Customer', record.dna.customer],
              ['Offer', record.dna.offer],
              ['Money model', record.dna.revenueModel],
              ['Advantage', record.dna.advantage],
              ['Constraint', record.dna.constraint],
              ['Current goal', record.dna.currentGoal],
            ].map(([key, value]) => (
              <article key={key}><small>{key}</small><p>{value || 'Not defined yet.'}</p></article>
            ))}
          </div>
        )}
      </section>

      <section className="panel" id="value">
        <div className="panelHead">
          <div><p className="eyebrow">WHERE VALUE LIVES OR LEAKS</p><h2><Term>Value Map</Term></h2></div>
          {user && <button className="smallButton" onClick={() => openComposer('value')}>Add value item</button>}
        </div>
        <div className="valueGrid">
          {record.valueMap.length ? record.valueMap.map((item) => (
            <article key={item.id}>
              <span className={`kind ${item.kind.replace(' ', '').toLowerCase()}`}>{item.kind}</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              <small>{item.evidence} · {evidenceLabels[item.evidence]}</small>
              <SourceLink url={item.sourceUrl} />
            </article>
          )) : <p className="empty">No saved value items yet.</p>}
        </div>
      </section>

      <section className="two" id="opportunities">
        <div className="panel">
          <div className="panelHead">
            <div><p className="eyebrow">OPPORTUNITY ENGINE</p><h2>Best next actions</h2></div>
            {user && <button className="smallButton" onClick={() => openComposer('opportunity')}>Add opportunity</button>}
          </div>
          <div className="stack">
            {ranked.length ? ranked.map((opportunity) => (
              <article className="op" key={opportunity.id}>
                <div>
                  <span className="evidence">{opportunity.evidence} · {evidenceLabels[opportunity.evidence]}</span>
                  <h3>{opportunity.title}</h3>
                  <p>{opportunity.observation}</p>
                  <SourceLink url={opportunity.sourceUrl} />
                </div>
                <strong title="Priority score">{score(opportunity)}</strong>
              </article>
            )) : <p className="empty">No saved opportunities yet.</p>}
          </div>
        </div>
        <div className="panel">
          <div className="panelHead">
            <div><p className="eyebrow">RISK CENTER</p><h2>What could hurt us?</h2></div>
            {user && <button className="smallButton" onClick={() => openComposer('risk')}>Add risk</button>}
          </div>
          <div className="stack">
            {record.risks.length ? record.risks.map((risk) => (
              <article className="miniCard" key={risk.id}>
                <div className="miniHead"><b>{risk.title}</b><span className={`risk ${risk.level.toLowerCase()}`}>{risk.level}</span></div>
                <p>{risk.response}</p>
                <small>{risk.evidence} · {evidenceLabels[risk.evidence]}</small>
                <SourceLink url={risk.sourceUrl} />
              </article>
            )) : <p className="empty">No saved risks yet.</p>}
          </div>
        </div>
      </section>

      <section className="panel" id="decisions">
        <div className="panelHead">
          <div><p className="eyebrow">DECISION ENGINE</p><h2>Choices worth remembering</h2></div>
          {user && <button className="smallButton" onClick={() => openComposer('decision')}>Add decision</button>}
        </div>
        <div className="decisionGrid">
          {record.decisions.length ? record.decisions.map((decision) => (
            <article key={decision.id}>
              <span className="tag">{decision.status}</span>
              <h3>{decision.question}</h3>
              <p><b>Next:</b> {decision.next}</p>
              <small>{decision.evidence} · {evidenceLabels[decision.evidence]}</small>
              <SourceLink url={decision.sourceUrl} />
            </article>
          )) : <p className="empty">No saved decisions yet.</p>}
        </div>
      </section>

      <section className="panel" id="memory">
        <div className="panelHead">
          <div><p className="eyebrow">BUSINESS MEMORY</p><h2><Term>Business Memory</Term></h2></div>
          {user && <button className="smallButton" onClick={() => openComposer('memory')}>Add founder note</button>}
        </div>
        <div className="timeline">
          {record.memory.length ? record.memory.map((memory) => (
            <article key={memory.id}>
              <time>{memory.date}</time>
              <div>
                <b>{memory.kind}</b>
                <p>{memory.summary}</p>
                <small>{memory.evidence} · {evidenceLabels[memory.evidence]}</small>
                <SourceLink url={memory.sourceUrl} />
              </div>
            </article>
          )) : <p className="empty">No memory entries yet.</p>}
        </div>
      </section>

      <section className="panel" id="evidence">
        <div className="panelHead">
          <div>
            <p className="eyebrow">REAL EVIDENCE → REVIEWABLE CHANGES</p>
            <h2>Evidence inbox</h2>
            <p className="plainIntro">Capture a public webpage. The source is stored as E2. Founder Dynasty OS can propose useful follow-up items, but important changes still require founder approval.</p>
          </div>
        </div>
        {user ? (
          <form className="evidenceForm" onSubmit={captureWebsiteEvidence}>
            <label>Public webpage to examine<input type="url" placeholder="https://example.com" required value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} /></label>
            <button disabled={busy}>Capture website evidence</button>
          </form>
        ) : <p className="empty">Sign in to capture evidence.</p>}
        {evidenceResult && (
          <article className="evidenceReceipt">
            <span className="evidence">E2 · Current External Evidence</span>
            <h3>{evidenceResult.title}</h3>
            <p>{evidenceResult.summary}</p>
            <SourceLink url={evidenceResult.url} />
          </article>
        )}
        <div className="proposalHead">
          <div><p className="eyebrow">FOUNDER APPROVAL QUEUE</p><h3>{pending.length ? `${pending.length} proposed changes need a decision` : 'No proposals waiting'}</h3></div>
        </div>
        <div className="proposalGrid">
          {pending.map((proposal) => (
            <article className="proposalCard" key={proposal.id}>
              <div className="proposalTop"><span className="targetTag">{proposal.targetType === 'dna' ? 'Business DNA' : proposal.targetType}</span><span className="evidence">Source: E2</span></div>
              <h3>{proposal.title}</h3>
              <p>{proposal.rationale}</p>
              <div className="proposalPreview"><b>What would change</b><pre>{JSON.stringify(proposal.payload, null, 2)}</pre></div>
              <SourceLink url={proposal.sourceUrl} />
              <div className="reviewButtons">
                <button disabled={busy} onClick={() => reviewProposal(proposal, true)}>Approve and apply</button>
                <button className="rejectButton" disabled={busy} onClick={() => reviewProposal(proposal, false)}>Reject</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel" id="system-map">
        <div className="panelHead">
          <div>
            <p className="eyebrow">THE WHOLE OPERATING SYSTEM</p>
            <h2>One business record, many operating neighborhoods</h2>
            <p className="plainIntro">Modules specialize. The shared business record keeps them from becoming eight tiny kingdoms with incompatible truths.</p>
          </div>
        </div>
        <div className="systemMap">
          {operatingAreas.map((area) => (
            <article className={area.sales ? 'areaCard salesArea' : 'areaCard'} key={area.name}>
              <div className="areaTitle"><h3>{area.name}</h3>{area.sales && <span>Sales OS lives here</span>}</div>
              <p>{area.description}</p>
              <div className="moduleChips">{area.modules.map((module) => <span key={module}>{module}</span>)}</div>
              {area.sales && <a className="insideLink" href={salesHref}>Open Same-Day Customer Growth Pack / Sales OS →</a>}
            </article>
          ))}
        </div>
      </section>

      <section className="panel neighborhood" id="sales">
        <div>
          <p className="eyebrow">CUSTOMERS & GROWTH → SALES</p>
          <h2>Same-Day Customer Growth Pack / Sales OS</h2>
          <p>Sales remains a major connected module for prospect research, outreach, follow-up and <Term>CRM</Term> history. It reads from the larger business context, but it does not define the identity of Founder Dynasty OS.</p>
        </div>
        <a className="moduleLink" href={salesHref}>Open Sales OS →</a>
      </section>

      {composer && (
        <div className="modalBackdrop" role="presentation" onMouseDown={() => setComposer(null)}>
          <form className="recordComposer" onSubmit={saveComposer} onMouseDown={(event) => event.stopPropagation()}>
            <div className="composerHead">
              <div><p className="eyebrow">ADD TO THE SHARED BUSINESS RECORD</p><h2>{composer.kind === 'memory' ? 'Add a founder note' : `Add ${composer.kind}`}</h2></div>
              <button type="button" className="closeButton" onClick={() => setComposer(null)}>×</button>
            </div>
            <label>{composer.kind === 'decision' ? 'Decision to make' : composer.kind === 'memory' ? 'Type of note' : 'Short title'}
              <input required value={composer.title} onChange={(event) => setComposer({ ...composer, title: event.target.value })} />
            </label>
            <label>{composer.kind === 'decision' ? 'What should happen next?' : composer.kind === 'risk' ? 'How should the business respond?' : composer.kind === 'memory' ? 'What happened or what did you learn?' : 'Why does this matter?'}
              <textarea required value={composer.detail} onChange={(event) => setComposer({ ...composer, detail: event.target.value })} />
            </label>
            {composer.kind === 'value' && (
              <label>Type<select value={composer.category} onChange={(event) => setComposer({ ...composer, category: event.target.value })}><option>Created</option><option>Captured</option><option>Leak</option><option>At Risk</option><option>Opportunity</option><option>Asset</option></select></label>
            )}
            {composer.kind === 'risk' && (
              <label>How serious is it?<select value={composer.category} onChange={(event) => setComposer({ ...composer, category: event.target.value })}><option>Low</option><option>Medium</option><option>High</option></select></label>
            )}
            {composer.kind === 'opportunity' && (
              <label>How confident are you right now? <span>{composer.category}%</span><input type="range" min="0" max="100" value={composer.category} onChange={(event) => setComposer({ ...composer, category: event.target.value })} /></label>
            )}
            <p className="formNote">Manual founder entries are saved as E4 Internal Observation. That means “we recorded this,” not “the market proved this.”</p>
            <div className="reviewButtons"><button disabled={busy}>Save to business record</button><button type="button" className="rejectButton" onClick={() => setComposer(null)}>Cancel</button></div>
          </form>
        </div>
      )}

      <footer>Founder Dynasty OS 10.0 · A SMARTPICKSHOP HOLDINGS PRODUCT · The operating intelligence of the business</footer>
    </main>
  );
}
