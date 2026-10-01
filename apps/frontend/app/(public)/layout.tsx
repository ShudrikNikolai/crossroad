'use client';

import { ProtectedHeader } from '@/components/layout/protected-header';
import { PublicHeader } from '@/components/layout/public-header';
import { Footer } from '@/components/layout/footer';
import { useAuthStore } from '@/stores/auth.store';

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  const isAuthenticated = isInitialized && !!user;

  return (
    <div className="flex min-h-screen flex-col">
      {isAuthenticated ? <ProtectedHeader /> : <PublicHeader />}
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
