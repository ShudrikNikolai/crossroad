'use client';

import type { StoryGraph } from '@/features/stories/types/story.types';

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border bg-white p-6">
      <p className="text-sm text-black/45">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

export function StoryStats({ graph }: { graph: StoryGraph }) {
  return (
    <section className="mt-5 grid gap-4 sm:grid-cols-3">
      <Stat label="Узлы" value={graph.nodes.length} />
      <Stat label="Переходы" value={graph.edges.length} />
      <Stat label="Переменные" value={graph.variables.length} />
    </section>
  );
}
