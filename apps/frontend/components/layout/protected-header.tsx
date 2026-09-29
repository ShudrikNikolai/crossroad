import Link from 'next/link';
import { Button } from '@heroui/react';
import { useAuthStore } from '@/stores/auth.store';

export function ProtectedHeader() {
  const user = useAuthStore.getState().getUser();
  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <Link href="/" className="text-xl font-semibold">
        Crossroad
      </Link>
      <nav className="flex items-center gap-2">
        <Link href="/profile">
          <Button variant="ghost">{user.username}</Button>
        </Link>
        <Link href="/stories">
          <Button variant="primary">Истории</Button>
        </Link>
      </nav>
    </header>
  );
}
