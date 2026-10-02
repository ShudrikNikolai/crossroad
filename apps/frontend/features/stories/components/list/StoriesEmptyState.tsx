'use client';

import { Button } from '@heroui/react';

export function StoriesEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="mt-10 rounded-3xl border border-dashed bg-white px-6 py-16 text-center">
      <div className="mx-auto max-w-md">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-black text-xl text-white">
          ↗
        </div>
        <h2 className="mt-5 text-xl font-semibold">Историй пока нет</h2>
        <p className="mt-2 text-sm leading-6 text-black/50">
          Создай первую историю, а затем открой редактор и добавь сцены, выборы и условия.
        </p>
        <Button className="mt-6" onPress={onCreate} variant="primary">
          Создать историю
        </Button>
      </div>
    </section>
  );
}
