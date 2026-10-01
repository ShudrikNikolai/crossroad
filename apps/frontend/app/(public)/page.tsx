'use client';

import Link from 'next/link';
import { Button } from '@heroui/react';
import { useAuthStore } from '@/stores/auth.store';

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  const isAuthenticated = isInitialized && !!user;

  return (
    <div className="mx-auto max-w-6xl">
      <section className="grid items-center gap-12 py-12 md:grid-cols-[1.15fr_.85fr] md:py-20">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/45">
            Платформа для создания интерактивных историй
          </p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight md:text-7xl">Crossroad</h1>
          <p className="mt-6 max-w-2xl text-xl leading-9 text-black/60">
            Создавайте интерактивные истории, где сюжет развивается через выбор читателя. Собирайте
            сценарий как граф, задавайте условия и публикуйте готовые истории для прохождения.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            {isAuthenticated ? (
              <div></div>
            ) : (
              <Link href="/register">
                <Button variant="primary" size="lg">
                  Начать создавать
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
          <div className="rounded-2xl bg-zinc-950 p-6 text-white">
            <div className="flex items-center justify-between text-xs text-white/45">
              <span>STORY GRAPH</span>
              <span>draft</span>
            </div>
            <div className="mt-8 space-y-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                Сцена: Незнакомец у двери
              </div>
              <div className="ml-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  Открыть дверь
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  Остаться внутри
                </div>
              </div>
              <div className="ml-16 rounded-xl border border-white/10 bg-white/5 p-4">
                Следующая сцена
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 border-t py-12 md:grid-cols-3">
        <article>
          <h2 className="text-lg font-semibold">Ветвящийся сюжет</h2>
          <p className="mt-2 text-sm leading-6 text-black/55">
            Сцены соединяются переходами, а читатель выбирает дальнейший путь.
          </p>
        </article>
        <article>
          <h2 className="text-lg font-semibold">Условия и переменные</h2>
          <p className="mt-2 text-sm leading-6 text-black/55">
            Ветки могут зависеть от состояния прохождения: строк, чисел и логических значений.
          </p>
        </article>
        <article>
          <h2 className="text-lg font-semibold">Публикация и прохождение</h2>
          <p className="mt-2 text-sm leading-6 text-black/55">
            Готовый граф можно опубликовать и использовать как основу для отдельных прохождений.
          </p>
        </article>
      </section>
    </div>
  );
}
