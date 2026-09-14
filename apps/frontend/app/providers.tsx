'use client';

import { useEffect } from 'react';

import { setupAuthInterceptor } from '@/shared/api';

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    setupAuthInterceptor();
  }, []);

  return children;
}
