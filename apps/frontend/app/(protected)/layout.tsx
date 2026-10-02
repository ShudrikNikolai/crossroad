'use client';

import { redirect } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { ProtectedHeader } from '@/components/layout/protected-header';

export default function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-sm text-muted">Загрузка...</span>
      </div>
    );
  }

  if (!isAuthenticated) redirect('/login');

  return (
    <div className="min-h-dvh">
      <ProtectedHeader />
      {children}
    </div>
  );
}
