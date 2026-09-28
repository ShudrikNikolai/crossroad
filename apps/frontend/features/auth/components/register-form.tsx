'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button, Form, Input, Label, TextField } from '@heroui/react';
import { useAuthStore } from '@/stores/auth.store';
import router from 'next/router';
import { getMe } from '../api/profile';
import { register } from '../api/auth';

export function RegisterForm() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const setUser = useAuthStore((state) => state.setUser);
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
      if (!tokens) {
        throw new Error('invalid tokens')
      }
      setAccessToken(tokens.accessToken);

      const user = await getMe();
      if (!user) {
        throw new Error('user is failed')
      }
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
        <h1 className="text-3xl font-semibold tracking-tight">Создайте свою учетную запись</h1>
        <p className="mt-2 text-muted">Начните создавать интерактивные истории с Crossroad.</p>
      </div>

      <Form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <TextField name="username" type="text" isRequired>
          <Label>Имя пользователя</Label>
          <Input placeholder="Ваше имя пользователя" />
        </TextField>

        <TextField name="email" type="email" isRequired>
          <Label>Email</Label>
          <Input placeholder="you@example.com" />
        </TextField>

        <TextField name="password" type="password" isRequired>
          <Label>Пароль</Label>
          <Input placeholder="Создать пароль" />
        </TextField>

        <TextField name="confirmPassword" type="password" isRequired>
          <Label>Подтвердите пароль</Label>
          <Input placeholder="Повторите пароль" />
        </TextField>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" variant="primary" className="w-full" isDisabled={isLoading}>
          {isLoading ? 'Создание учетной записи...' : 'Учетная запись создана'}
        </Button>
      </Form>

      <p className="mt-6 text-center text-sm text-muted">
        У вас уже есть аккаунт?{' '}
        <Link href="/login">
          <Button variant="ghost" size="sm">
            Войти
          </Button>
        </Link>
      </p>
    </section>
  );
}
