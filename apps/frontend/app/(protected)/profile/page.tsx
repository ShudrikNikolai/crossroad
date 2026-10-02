import { ProfileSettings } from '@/features/user/components/profile-settings';

export default function ProfilePage() {
  return (
    <main className="min-h-dvh bg-zinc-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-black/45">Настройки аккаунта</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Личный кабинет</h1>
          <p className="mt-2 max-w-2xl text-black/55">
            Управляйте профилем, контактными данными и безопасностью аккаунта Crossroad.
          </p>
        </div>
        <ProfileSettings />
      </div>
    </main>
  );
}
