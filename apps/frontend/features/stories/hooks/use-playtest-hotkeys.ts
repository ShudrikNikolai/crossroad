'use client';

import { useEffect, useRef } from 'react';
import type { StoryEdge } from '@/features/stories/types/story.types';

type Options = {
  enabled: boolean;
  available: StoryEdge[];
  onChoose: (edgeId: string) => void;
};

/** 1–9 — выбрать вариант, Enter/Space — продолжить, если вариант единственный. */
export function usePlaytestHotkeys(options: Options) {
  const ref = useRef(options);
  ref.current = options;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const { enabled, available, onChoose } = ref.current;
      if (!enabled || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;

      if (/^[1-9]$/.test(event.key)) {
        const edge = available[Number(event.key) - 1];
        if (edge) {
          event.preventDefault();
          onChoose(edge.id);
        }
        return;
      }

      if ((event.key === 'Enter' || event.key === ' ') && available.length === 1) {
        // на кнопке или ссылке Enter/Space уже вызывают нативный клик
        if (target?.closest('button, a')) return;
        event.preventDefault();
        onChoose(available[0].id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
