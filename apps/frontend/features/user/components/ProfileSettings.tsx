'use client';

import { useEffect, useState } from 'react';
import { Button, Form } from '@heroui/react';
import { getProfile, updateProfile } from '@/features/user/api/profile';
import { updateEmail, updatePassword, updatePhone } from '@/features/user/api/security';
import type { UserProfile, UpdateProfileRequest } from '@/features/user/types/user.types';
import { AvatarPlaceholder } from './AavatarPlaceholder';
import { useAuthStore } from '@/stores/auth.store';
import { Field } from '@/components/ui/re/field';

interface ProfileFormState {
  username: string;
  displayName: string;
  bio: string;
  languages: string;
  isPublic: boolean;
  twitter: string;
  github: string;
  linkedin: string;
  telegram: string;
  avatarUrl?: string;
}

function profileToFormState(profile: UserProfile): ProfileFormState {
  return {
    username: profile.username ?? '',
    displayName: profile.displayName ?? '',
    bio: profile.bio ?? '',
    languages: profile.languages?.join(', ') ?? '',
    isPublic: profile.isPublic ?? true,
    twitter: profile.socialLinks?.twitter ?? '',
    github: profile.socialLinks?.github ?? '',
    linkedin: profile.socialLinks?.linkedin ?? '',
    telegram: profile.socialLinks?.telegram ?? '',
    avatarUrl: profile.avatarUrl,
  };
}

function normalizeLanguages(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildProfilePatch(
  initial: ProfileFormState,
  current: ProfileFormState,
): UpdateProfileRequest {
  const patch: UpdateProfileRequest = {};

  if (initial.username !== current.username) {
    patch.username = current.username;
  }

  if (initial.displayName !== current.displayName) {
    patch.displayName = current.displayName;
  }

  if (initial.bio !== current.bio) {
    patch.bio = current.bio;
  }

  if (initial.isPublic !== current.isPublic) {
    patch.isPublic = current.isPublic;
  }

  const initialLanguages = normalizeLanguages(initial.languages);
  const currentLanguages = normalizeLanguages(current.languages);

  if (JSON.stringify(initialLanguages) !== JSON.stringify(currentLanguages)) {
    patch.languages = currentLanguages;
  }

  const initialSocialLinks = {
    twitter: initial.twitter,
    github: initial.github,
    linkedin: initial.linkedin,
    telegram: initial.telegram,
  };

  const currentSocialLinks = {
    twitter: current.twitter,
    github: current.github,
    linkedin: current.linkedin,
    telegram: current.telegram,
  };

  if (JSON.stringify(initialSocialLinks) !== JSON.stringify(currentSocialLinks)) {
    patch.socialLinks = currentSocialLinks;
  }

  if (initial.avatarUrl !== current.avatarUrl) {
    patch.avatarUrl = current.avatarUrl;
  }

  return patch;
}

export function ProfileSettings() {
  const setUser = useAuthStore((state) => state.setUser);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initialForm, setInitialForm] = useState<ProfileFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [languages, setLanguages] = useState('ru');
  const [isPublic, setIsPublic] = useState(true);
  const [twitter, setTwitter] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [telegram, setTelegram] = useState('');

  const [newEmail, setNewEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingSection, setSavingSection] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void getProfile()
      .then((data) => {
        if (cancelled || !data) return;

        const form = profileToFormState(data);

        setProfile(data);
        setInitialForm(form);
        setUsername(form.username);
        setDisplayName(form.displayName);
        setBio(form.bio);
        setLanguages(form.languages);
        setIsPublic(form.isPublic);
        setTwitter(form.twitter);
        setGithub(form.github);
        setLinkedin(form.linkedin);
        setTelegram(form.telegram);
      })
      .catch(() => {
        if (!cancelled) setError('Не удалось загрузить профиль.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function clearStatus() {
    setMessage(null);
    setError(null);
  }

  function getCurrentFormState(): ProfileFormState {
    return {
      username,
      displayName,
      bio,
      languages,
      isPublic,
      twitter,
      github,
      linkedin,
      telegram,
      avatarUrl: profile?.avatarUrl,
    };
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearStatus();

    if (!initialForm) return;

    const currentForm = getCurrentFormState();
    const patch = buildProfilePatch(initialForm, currentForm);

    if (Object.keys(patch).length === 0) {
      setMessage('Изменений нет.');
      return;
    }

    setSavingSection('profile');

    try {
      const data = await updateProfile(patch);

      if (!data) {
        throw new Error();
      }

      const form = profileToFormState(data);

      setProfile(data);
      setInitialForm(form);
      setUser(data);
      setMessage('Изменения профиля сохранены.');
    } catch {
      setError('Не удалось сохранить изменения профиля. Проверьте значения полей.');
    } finally {
      setSavingSection(null);
    }
  }

  async function handleAvatarUploaded(avatarUrl: string) {
    clearStatus();
    setSavingSection('avatar');

    try {
      const data = await updateProfile({ avatarUrl });

      if (!data) {
        throw new Error();
      }

      const form = profileToFormState(data);

      setProfile(data);
      setInitialForm(form);
      setUser(data);
      setMessage('Аватар обновлён.');
    } catch {
      setError('Изображение загружено, но не удалось обновить профиль.');
    } finally {
      setSavingSection(null);
    }
  }

  async function saveEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearStatus();
    setSavingSection('email');
    try {
      await updateEmail({ email: newEmail });
      setNewEmail('');
      setMessage('Email обновлён.');
    } catch {
      setError('Не удалось обновить email.');
    } finally {
      setSavingSection(null);
    }
  }

  async function savePhone(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearStatus();
    setSavingSection('phone');
    try {
      await updatePhone({ phoneNumber });
      setPhoneNumber('');
      setMessage('Номер телефона обновлён.');
    } catch {
      setError('Не удалось обновить номер телефона.');
    } finally {
      setSavingSection(null);
    }
  }

  async function savePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearStatus();
    if (newPassword !== confirmPassword) {
      setError('Новый пароль и подтверждение не совпадают.');
      return;
    }
    setSavingSection('password');
    try {
      await updatePassword({ oldPassword, newPassword });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('Пароль успешно изменён.');
    } catch {
      setError('Не удалось изменить пароль. Проверьте текущий пароль и требования к новому.');
    } finally {
      setSavingSection(null);
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-black/50">Загрузка профиля…</div>;
  }

  return (
    <div className="space-y-6">
      {profile && (
        <AvatarPlaceholder
          user={profile}
          onAvatarUploaded={handleAvatarUploaded}
        />
      )}

      {(message || error) && (
        <div
          className={`rounded-xl border p-4 text-sm ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}
        >
          {error ?? message}
        </div>
      )}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Профиль</h2>
          <p className="mt-1 text-sm text-black/55">
            Данные, которые используются в вашем публичном профиле.
          </p>
        </div>
        <Form className="grid gap-5 md:grid-cols-2" onSubmit={saveProfile}>
          <Field
            name="username"
            label="Username"
            value={username}
            onChange={setUsername}
            placeholder="username"
          />
          <Field
            name="displayName"
            label="Отображаемое имя"
            value={displayName}
            onChange={setDisplayName}
            placeholder="Ваше имя"
          />
          <div className="md:col-span-2">
            <label className="flex flex-col gap-2 text-sm font-medium">
              Биография
              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                maxLength={500}
                rows={4}
                className="rounded-xl border px-3 py-2 outline-none focus:ring-2"
                placeholder="Расскажите немного о себе"
              />
            </label>
          </div>
          <Field
            name="languages"
            label="Языки"
            value={languages}
            onChange={setLanguages}
            placeholder="ru, en"
          />
          <label className="flex items-center gap-3 self-end pb-2 text-sm">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(event) => setIsPublic(event.target.checked)}
              className="h-4 w-4"
            />
            Публичный профиль
          </label>
          <Field
            name="twitter"
            label="Twitter / X"
            value={twitter}
            onChange={setTwitter}
            placeholder="https://…"
          />
          <Field
            name="github"
            label="GitHub"
            value={github}
            onChange={setGithub}
            placeholder="https://github.com/…"
          />
          <Field
            name="linkedin"
            label="LinkedIn"
            value={linkedin}
            onChange={setLinkedin}
            placeholder="https://linkedin.com/in/…"
          />
          <Field
            name="telegram"
            label="Telegram"
            value={telegram}
            onChange={setTelegram}
            placeholder="@username"
          />
          <div className="md:col-span-2">
            <Button type="submit" variant="primary" isDisabled={savingSection === 'profile'}>
              {savingSection === 'profile' ? 'Сохранение…' : 'Сохранить профиль'}
            </Button>
          </div>
        </Form>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Контакты</h2>
        <p className="mt-1 text-sm text-black/55">
          Email и номер телефона изменяются отдельными запросами API.
        </p>
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <Form className="space-y-4" onSubmit={saveEmail}>
            <Field
              name="email"
              label="Новый email"
              type="email"
              value={newEmail}
              onChange={setNewEmail}
              placeholder="you@example.com"
            />
            <Button
              type="submit"
              variant="secondary"
              isDisabled={!newEmail || savingSection === 'email'}
            >
              {savingSection === 'email' ? 'Обновление…' : 'Изменить email'}
            </Button>
          </Form>
          <Form className="space-y-4" onSubmit={savePhone}>
            <Field
              name="phone"
              label="Новый телефон"
              value={phoneNumber}
              onChange={setPhoneNumber}
              placeholder="+79991234567"
            />
            <Button
              type="submit"
              variant="secondary"
              isDisabled={!phoneNumber || savingSection === 'phone'}
            >
              {savingSection === 'phone' ? 'Обновление…' : 'Изменить телефон'}
            </Button>
          </Form>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Безопасность</h2>
        <p className="mt-1 text-sm text-black/55">
          Новый пароль должен содержать 8–64 символа, заглавную и строчную буквы, цифру и
          спецсимвол.
        </p>
        <Form className="mt-6 max-w-xl space-y-4" onSubmit={savePassword}>
          <Field
            name="oldPassword"
            label="Текущий пароль"
            type="password"
            value={oldPassword}
            onChange={setOldPassword}
          />
          <Field
            name="newPassword"
            label="Новый пароль"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
          />
          <Field
            name="confirmPassword"
            label="Повторите новый пароль"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
          <Button type="submit" variant="primary" isDisabled={savingSection === 'password'}>
            {savingSection === 'password' ? 'Изменение…' : 'Изменить пароль'}
          </Button>
        </Form>
      </section>
    </div>
  );
}
