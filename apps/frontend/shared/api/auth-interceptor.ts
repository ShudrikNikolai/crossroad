import type {
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

import { api } from './axios';
import { refreshSession } from '@/features/auth/api/refresh';
import { useAuthStore } from '@/stores/auth.store';

interface AuthRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string> | null = null;
let isInterceptorInitialized = false;

async function refreshAccessToken(): Promise<string> {
  const result = await refreshSession();

  useAuthStore.getState().setAccessToken(result.accessToken);

  return result.accessToken;
}

export function setupAuthInterceptor(): void {
  if (isInterceptorInitialized) {
    return;
  }

  isInterceptorInitialized = true;

  api.interceptors.request.use((config) => {
    const accessToken = useAuthStore.getState().accessToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  });

  api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
      const originalRequest =
        error.config as AuthRequestConfig | undefined;

      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest._retry
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }

        const accessToken = await refreshPromise;

        originalRequest.headers.Authorization =
          `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();

        return Promise.reject(refreshError);
      }
    },
  );
}
