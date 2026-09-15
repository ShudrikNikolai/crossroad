import Link from 'next/link';
import { Button } from '@heroui/react';

export function PublicHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <Link href="/" className="text-xl font-semibold">Crossroad</Link>
      <nav className="flex items-center gap-2">
        <Button as={Link} href="/login" variant="ghost">Sign in</Button>
        <Button as={Link} href="/register" variant="primary">Sign up</Button>
      </nav>
    </header>
  );
}
