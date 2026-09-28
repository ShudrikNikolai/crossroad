import { create } from 'zustand';
import type { AuthUser } from '@/features/auth/types/auth.types';
import { ACCESS_TOKEN_KEY } from '@/shared/config';

function readPersistedAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

function persistAccessToken(accessToken: string | null): void {
  if (typeof window === 'undefined') return;

  try {
    if (accessToken) {
      window.sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    } else {
      window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  } catch (e) {
    console.log(e);
  }
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  setAccessToken: (accessToken: string) => void;
  setUser: (user: AuthUser) => void;
  getUser: () => AuthUser;
  clearAuth: () => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitialized: false,

  setAccessToken: (accessToken) => {
    persistAccessToken(accessToken);
    set({
      accessToken,
      isAuthenticated: true,
    });
  },

  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
    }),

  getUser: (): AuthUser => {
    const user = get().user;

    if (!user) {
      throw new Error('User is not authenticated');
    }

    return user;
  },

  clearAuth: () => {
    console.log('clear User')
    persistAccessToken(null);
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },

  setInitialized: () =>
    set({
      isInitialized: true,
    }),
}));

export function getPersistedAccessToken(): string | null {
  return readPersistedAccessToken();
}
