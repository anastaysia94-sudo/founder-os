'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

const SESSION_USER_KEY = 'fdos.browser-session-user';

/**
 * Local React drafts should never survive a sign-out or direct account switch.
 * Individual workspaces also clear their own persisted/private state, but a
 * top-level reload is the final boundary that clears unsaved component state
 * across every current and future module.
 */
export default function AuthPrivacyGuard() {
  const currentUserId = useRef<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    let disposed = false;
    let authEpoch = 0;

    function storedUserId() {
      try {
        return window.sessionStorage.getItem(SESSION_USER_KEY);
      } catch {
        return null;
      }
    }

    function rememberUserId(userId: string | null) {
      try {
        if (userId) window.sessionStorage.setItem(SESSION_USER_KEY, userId);
        else window.sessionStorage.removeItem(SESSION_USER_KEY);
      } catch {
        // In-memory tracking below still protects direct identity changes.
      }
    }

    function apply(nextUserId: string | null) {
      if (disposed) return;

      const remembered = storedUserId();
      const previous = initialized.current ? currentUserId.current : remembered;
      initialized.current = true;
      currentUserId.current = nextUserId;
      rememberUserId(nextUserId);

      const signedOutFromAccount = previous !== null && nextUserId === null;
      const switchedAccounts = previous !== null && nextUserId !== null && previous !== nextUserId;

      if (signedOutFromAccount || switchedAccounts) {
        window.location.reload();
      }
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      authEpoch += 1;
      apply(session?.user?.id || null);
    });

    const initialEpoch = authEpoch;
    void supabase.auth.getUser().then(({ data }) => {
      if (!disposed && authEpoch === initialEpoch) apply(data.user?.id || null);
    });

    return () => {
      disposed = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  return null;
}
