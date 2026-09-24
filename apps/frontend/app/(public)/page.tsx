import Link from 'next/link';
import { Button } from '@heroui/react';

export default function HomePage() {
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-6">
      <section className="flex w-full max-w-3xl flex-col items-center text-center">
        <h1 className="text-5xl font-semibold tracking-tight">Crossroad</h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          Create interactive stories where every choice changes the path.
        </p>
        {/*<div className="mt-8 flex gap-3">
          <Button as={Link} href="/register" variant="primary">Start creating</Button>
          <Button as={Link} href="/login" variant="outline">Sign in</Button>
        </div>*/}
      </section>
    </main>
  );
}
