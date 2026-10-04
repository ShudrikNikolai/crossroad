'use client';

import { useMemo } from 'react';
import { nodeLabel } from '@/features/game/lib/format';
import type { StoryGraph } from '@/features/stories/types/story.types';

export function HistoryPanel({ history, graph }: { history: string[]; graph: StoryGraph }) {
  const nodesById = useMemo(() => new Map(graph.nodes.map((node) => [node.id, node])), [graph]);

  if (!history.length) return <p className="mt-6 text-sm text-white/35">История пока пуста.</p>;

  return (
    <div className="mt-6 space-y-2">
      {[...history].reverse().map((nodeId, index) => {
        const node = nodesById.get(nodeId);
        return (
          <div
            key={`${nodeId}-${index}`}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3"
          >
            <div className="text-[10px] uppercase tracking-widest text-white/25">
              #{history.length - index} · {node ? nodeLabel(node.type) : 'узел'}
            </div>
            <div className="mt-1 text-sm text-white/75">
              {node?.content.speaker ? `${node.content.speaker}: ` : ''}
              {node?.content.text || nodeId}
            </div>
          </div>
        );
      })}
    </div>
  );
}
