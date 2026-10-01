'use client';

import { useEffect } from 'react';

import { useAuthStore, getPersistedAccessToken } from '@/stores/auth.store';
import { getMe } from '../api/profile';

export function useAuthInit(): void {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        const accessToken = useAuthStore.getState().accessToken ?? getPersistedAccessToken();

        if (!accessToken) {
          if (!cancelled) {
            clearAuth();
          }
          return;
        }

        if (!useAuthStore.getState().accessToken) {
          setAccessToken(accessToken);
        }

        const user = await getMe();
        if (!user) {
          throw new Error('user is failed');
        }

        if (!cancelled) {
          setUser(user);
        }
      } catch {
        if (!cancelled) {
          clearAuth();
        }
      } finally {
        if (!cancelled) {
          setInitialized();
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [setAccessToken, setUser, clearAuth, setInitialized]);
}
