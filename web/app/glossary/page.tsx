'use client';

import { useMemo, useState } from 'react';
import { glossaryEntries } from '@/lib/glossary';
import styles from './glossary.module.css';

const categories = ['All', 'Core', 'Evidence', 'Strategy', 'Customers', 'Money', 'Execution', 'Assets', 'Dynasty', 'Technical'] as const;
type Category = (typeof categories)[number];

export default function GlossaryPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category>('All');

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return glossaryEntries
      .filter((entry) => category === 'All' || entry.category === category)
      .filter((entry) => !q || [entry.term, entry.plain, entry.category, ...(entry.aliases || [])].some((value) => value.toLowerCase().includes(q)))
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [query, category]);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>FOUNDER DYNASTY OS · PLAIN ENGLISH</p>
          <h1>Business language without the <span>corporate fog machine.</span></h1>
          <p>
            Search the words Founder Dynasty OS uses. Definitions explain what each term means here, why it exists, and where a label is only an assumption, forecast, diagnostic, or planning tool rather than proof.
          </p>
        </div>
        <aside className={styles.countCard}><strong>{glossaryEntries.length}</strong><span>plain-English terms</span></aside>
      </section>

      <section className={styles.controls} aria-label="Glossary search and categories">
        <label>
          <span>Search words or meanings</span>
          <input autoFocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try evidence, margin, customer, RLS…" />
        </label>
        <div className={styles.categories}>
          {categories.map((item) => <button type="button" key={item} className={category === item ? styles.active : ''} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
      </section>

      <section className={styles.resultHead}>
        <div><p className={styles.eyebrow}>SEARCHABLE GLOSSARY</p><h2>{entries.length} matching {entries.length === 1 ? 'term' : 'terms'}</h2></div>
        {(query || category !== 'All') && <button type="button" onClick={() => { setQuery(''); setCategory('All'); }}>Clear filters</button>}
      </section>

      <section className={styles.grid}>
        {entries.map((entry) => (
          <article className={styles.card} id={entry.term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')} key={entry.term}>
            <div className={styles.cardTop}><span>{entry.category}</span>{entry.aliases?.length ? <small>Also: {entry.aliases.join(', ')}</small> : null}</div>
            <h3>{entry.term}</h3>
            <p>{entry.plain}</p>
            {entry.example ? <div className={styles.example}><small>EXAMPLE</small><p>{entry.example}</p></div> : null}
          </article>
        ))}
        {!entries.length && <div className={styles.empty}><h3>No matching term.</h3><p>That may mean the wording is not in the glossary yet, or business language has invented another unnecessary synonym overnight.</p></div>}
      </section>

      <section className={styles.rule}>
        <p className={styles.eyebrow}>PRODUCT RULE</p>
        <h2>If a screen needs jargon to feel intelligent, the screen needs work.</h2>
        <p>Founder Dynasty OS should keep sophisticated logic underneath while explaining the actual decision in normal language. The glossary is the backup, not an excuse to make the interface unreadable.</p>
        <div className={styles.links}><a href="/">Command Center</a><a href="/intelligence">Intelligence Layer</a><a href="/workbench">Build & Run</a><a href="/strategy">Strategy & Dynasty</a></div>
      </section>
    </main>
  );
}
