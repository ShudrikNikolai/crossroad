import Link from 'next/link';
import { Button } from '@heroui/react';

export function PublicHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <Link href="/" className="text-xl font-semibold">Crossroad</Link>
      <nav className="flex items-center gap-2">
        <Link href="/login"><Button  variant="ghost">Sign in</Button></Link>
         <Link href="/register"><Button variant="primary">Sign up</Button></Link>
      </nav>
    </header>
  );
}
