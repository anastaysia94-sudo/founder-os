'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  ensureBusiness,
  getActiveBusinessId,
  listBusinesses,
  setActiveBusinessId,
  type BusinessSummary,
} from '@/lib/business-store';
import { supabase } from '@/lib/supabase';
import styles from './business-switcher.module.css';

export default function BusinessSwitcher() {
  const [user, setUser] = useState<User | null>(null);
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [activeId, setActiveId] = useState('');
  const [busy, setBusy] = useState(false);

  async function hydrate(nextUser: User) {
    setBusy(true);
    try {
      const ensuredId = await ensureBusiness(nextUser);
      const rows = await listBusinesses(nextUser);
      setBusinesses(rows);
      setActiveId(getActiveBusinessId(nextUser.id) || ensuredId);
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
      else {
        setBusinesses([]);
        setActiveId('');
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (disposed) return;
      const nextUser = session?.user || null;
      setUser(nextUser);
      if (nextUser) void hydrate(nextUser);
      else {
        setBusinesses([]);
        setActiveId('');
      }
    });

    return () => {
      disposed = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  function switchBusiness(nextId: string) {
    if (!user || !nextId || nextId === activeId) return;
    setActiveBusinessId(user.id, nextId);
    setActiveId(nextId);
    window.location.reload();
  }

  if (!user) return null;

  return (
    <div className={styles.shell} aria-label="Active Founder Dynasty OS business">
      <span className={styles.label}>ACTIVE BUSINESS</span>
      <select
        aria-label="Choose active business"
        value={activeId}
        disabled={busy || !businesses.length}
        onChange={(event) => switchBusiness(event.target.value)}
      >
        {businesses.map((business) => (
          <option key={business.id} value={business.id}>
            {business.name} · {business.stage}
          </option>
        ))}
      </select>
      <a href="/portfolio">Portfolio / businesses</a>
    </div>
  );
}
