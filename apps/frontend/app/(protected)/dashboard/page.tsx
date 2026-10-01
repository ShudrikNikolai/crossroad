'use client';

import Link from 'next/link';
import { Button } from '@heroui/react';
import { useAuthStore } from '@/stores/auth.store';

export default function DashboardPage() {
  const user = useAuthStore.getState().getUser();

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-3xl bg-black px-8 py-12 text-white md:px-12">
          <p className="text-sm font-medium text-white/55">Добро пожаловать</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
            {user?.username || 'Автор'}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
            Здесь будет рабочее пространство Crossroad: создание интерактивных историй, настройка их
            графа и запуск готовых сценариев.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/stories">
              <Button variant="primary">Открыть истории</Button>
            </Link>
            <Link href="/profile">
              <Button variant="secondary">Личный кабинет</Button>
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6">
            <p className="text-sm font-medium text-black/45">Истории</p>
            <h2 className="mt-2 text-xl font-semibold">Интерактивные сценарии</h2>
            <p className="mt-2 text-sm leading-6 text-black/55">
              Создавай истории, открывай редактор графа и публикуй готовые сценарии.
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-6">
            <p className="text-sm font-medium text-black/45">Редактор</p>
            <h2 className="mt-2 text-xl font-semibold">Граф сюжета</h2>
            <p className="mt-2 text-sm leading-6 text-black/55">
              История собирается из сцен, вариантов выбора, условий и конечных узлов.
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-6">
            <p className="text-sm font-medium text-black/45">Игровой режим</p>
            <h2 className="mt-2 text-xl font-semibold">Пройди историю</h2>
            <p className="mt-2 text-sm leading-6 text-black/55">
              Опубликованные истории можно запускать и проходить, принимая решения по ходу сюжета.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
