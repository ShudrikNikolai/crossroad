import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { api } from './axios';
import { useAuthStore } from '@/stores/auth.store';

interface AuthRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isInterceptorInitialized = false;

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
      const originalRequest = error.config as AuthRequestConfig | undefined;

      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        useAuthStore.getState().clearAuth();
      }

      return Promise.reject(error);
    },
  );
}
