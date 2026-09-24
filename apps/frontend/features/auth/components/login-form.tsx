'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Form, Input, Label, TextField } from '@heroui/react';

import { login } from '@/features/auth/api/login';
import { getMe } from '@/features/auth/api/me';
import { useAuthStore } from '@/stores/auth.store';

export function LoginForm() {
  const router = useRouter();

  const setAccessToken = useAuthStore(
    (state) => state.setAccessToken,
  );

  const setUser = useAuthStore(
    (state) => state.setUser,
  );

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    try {
      const tokens = await login({
        email,
        password,
      });

      setAccessToken(tokens.accessToken);

      const user = await getMe();

      setUser(user);

      router.replace('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back
        </h1>

        <p className="mt-2 text-muted">
          Sign in to continue to Crossroad.
        </p>
      </div>

      <Form
        className="flex flex-col gap-5"
        onSubmit={handleSubmit}
      >
        <TextField
          name="email"
          type="email"
          isRequired
        >
          <Label>Email</Label>
          <Input placeholder="you@example.com" />
        </TextField>

        <TextField
          name="password"
          type="password"
          isRequired
        >
          <Label>Password</Label>
          <Input placeholder="Enter your password" />
        </TextField>

        {error && (
          <p className="text-sm text-danger">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isDisabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </Form>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{' '}

        <Link href="/register">
          <Button
            variant="ghost"
            size="sm"
          >
            Create one
          </Button>
        </Link>
      </p>
    </section>
  );
}
