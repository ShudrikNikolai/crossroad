'use client';

import { createContext, useContext } from 'react';
import type { EditorActions } from '@/features/stories/types/editor.types';

export const EditorActionsContext = createContext<EditorActions | null>(null);

export function useEditorActions() {
  const ctx = useContext(EditorActionsContext);
  if (!ctx) throw new Error('EditorActionsContext is missing');
  return ctx;
}
