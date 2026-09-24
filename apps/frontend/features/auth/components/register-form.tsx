'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button, Form, Input, Label, TextField } from '@heroui/react';
import { register } from '@/features/auth/api/register';
import { getMe } from '@/features/auth/api/me';
import { useAuthStore } from '@/stores/auth.store';
import router from 'next/router';

export function RegisterForm() {
  const setAccessToken = useAuthStore(
    (state) => state.setAccessToken,
  );

  const setUser = useAuthStore(
    (state) => state.setUser,
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get('username') ?? '');
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');
    const confirmPassword = String(formData.get('confirmPassword') ?? '');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const tokens = await register({ username, email, password, confirmPassword: password });
      setAccessToken(tokens.accessToken);

      const user = await getMe();
      setUser(user);

      router.replace('/dashboard');
    } catch {
      setError('Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-2 text-muted">Start creating interactive stories with Crossroad.</p>
      </div>

      <Form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <TextField name="username" type="text" isRequired>
          <Label>Username</Label>
          <Input placeholder="Your username" />
        </TextField>

        <TextField name="email" type="email" isRequired>
          <Label>Email</Label>
          <Input placeholder="you@example.com" />
        </TextField>

        <TextField name="password" type="password" isRequired>
          <Label>Password</Label>
          <Input placeholder="Create a password" />
        </TextField>

        <TextField name="confirmPassword" type="password" isRequired>
          <Label>Confirm password</Label>
          <Input placeholder="Repeat your password" />
        </TextField>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" variant="primary" className="w-full" isDisabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </Form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
            >
              Sign in
            </Button>
          </Link>
      </p>
    </section>
  );
}
