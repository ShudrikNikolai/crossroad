'use client';

import { useEffect } from 'react';
import { getMe } from '@/features/auth/api/me';
import { refreshSession } from '@/features/auth/api/refresh';
import { useAuthStore } from '@/stores/auth.store';

export function useAuthInit() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        const tokens = await refreshSession();
        if (cancelled) return;

        setAccessToken(tokens.accessToken);
        const user = await getMe();

        if (!cancelled) setUser(user);
      } catch {
        if (!cancelled) clearAuth();
      } finally {
        if (!cancelled) setInitialized();
      }
    }

    initialize();
    return () => { cancelled = true; };
  }, [setAccessToken, setUser, clearAuth, setInitialized]);
}
