'use client';

import { redirect } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

export default function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) redirect('/login');

  return children;
}
