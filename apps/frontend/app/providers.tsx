'use client';

import { useEffect } from 'react';
import { useAuthInit } from '@/features/auth/hooks/use-auth-init';
import { setupAuthInterceptor } from '@/shared/api';

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  useEffect(() => {
    setupAuthInterceptor();
  }, []);

  useAuthInit();

  return children;
}
