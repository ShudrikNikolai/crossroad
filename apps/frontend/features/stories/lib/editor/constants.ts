import { MarkerType } from '@xyflow/react';
import type { NodeType, StoryEdge } from '@/features/stories/types/story.types';

export const AUTOSAVE_MS = 30 * 1000;
/** Задержка, с которой набираемый текст попадает в graph (до этого он живёт локально в поле). */
export const DRAFT_DELAY_MS = 250;

export const nodeMeta: Record<
  NodeType,
  { label: string; description: string; className: string; accent: string }
> = {
  scene: {
    label: 'Сцена',
    description: 'Фрагмент повествования',
    className: 'bg-sky-50 border-sky-200',
    accent: 'bg-sky-500',
  },
  choice: {
    label: 'Выбор',
    description: 'Решение игрока',
    className: 'bg-violet-50 border-violet-200',
    accent: 'bg-violet-500',
  },
  condition: {
    label: 'Условие',
    description: 'Проверка переменных',
    className: 'bg-amber-50 border-amber-200',
    accent: 'bg-amber-500',
  },
  end: {
    label: 'Конец',
    description: 'Завершение ветки',
    className: 'bg-rose-50 border-rose-200',
    accent: 'bg-rose-500',
  },
};

export const NODE_TYPE_OPTIONS = [
  { id: 'scene', label: 'Сцена' },
  { id: 'choice', label: 'Выбор' },
  { id: 'condition', label: 'Условие' },
  { id: 'end', label: 'Конец' },
];

export const BRANCH_TYPES: NodeType[] = ['choice', 'condition'];
export const isBranching = (type: NodeType | undefined) => !!type && BRANCH_TYPES.includes(type);

export const EMPTY_EDGES: StoryEdge[] = [];
export const MARKER = { type: MarkerType.ArrowClosed } as const;
