'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@heroui/react';
import { logout } from '@/features/auth/api/logout';
import { useAuthStore } from '@/stores/auth.store';

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      clearAuth();
      router.replace('/login');
    }
  }

  return (
    <main className="min-h-dvh px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="mt-2 text-muted">Welcome back, {user?.username}.</p>
          </div>
          <Button variant="ghost" onPress={handleLogout}>Sign out</Button>
        </div>
      </div>
    </main>
  );
}
