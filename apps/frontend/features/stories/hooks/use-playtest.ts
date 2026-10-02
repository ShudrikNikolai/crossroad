'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  advanceLocalGame,
  autoResolveConditions,
  getAvailableEdges,
  stepFromNode,
} from '@/features/game/lib/local-runtime';
import { getStoryGraph } from '@/features/stories/api/stories';
import { validateStory } from '@/features/stories/lib/validate-story';
import {
  HISTORY_LIMIT,
  createSession,
} from '@/features/stories/lib/playtest/session';
import {
  clearStoredPlaytest,
  loadStoredPlaytest,
  saveStoredPlaytest,
} from '@/features/stories/lib/playtest/storage';
import type { PlaytestSession } from '@/features/stories/types/playtest.types';
import type { StoryEdge, StoryGraph } from '@/features/stories/types/story.types';

const NO_EDGES: StoryEdge[] = [];

export function usePlaytest(storyId: string) {
  const playthroughId = `playtest-${storyId}`;
  const [graph, setGraph] = useState<StoryGraph | null>(null);
  const [session, setSession] = useState<PlaytestSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getStoryGraph(storyId)
      .then((loaded) => {
        if (!active) return;
        setGraph(loaded);
        setSession(createSession(loaded, playthroughId, loadStoredPlaytest(storyId)));
      })
      .catch(() => active && setError('Не удалось загрузить граф истории.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [storyId, playthroughId]);

  useEffect(() => {
    if (!graph || !session) return;
    saveStoredPlaytest(storyId, {
      nodeId: session.step.node.id,
      variables: session.variables,
      history: session.history,
    });
  }, [graph, session, storyId]);

  const issues = useMemo(() => (graph ? validateStory(graph) : []), [graph]);
  const blockingIssues = useMemo(
    () => issues.filter((issue) => issue.severity === 'error'),
    [issues],
  );

  const available = useMemo(
    () =>
      graph && session
        ? getAvailableEdges(graph, session.step.node.id, session.variables)
        : NO_EDGES,
    [graph, session],
  );

  const completed = session?.step.status === 'completed' || session?.step.node.type === 'end';

  const choose = useCallback(
    (edgeId: string) => {
      if (!graph) return;
      setSession((current) => {
        if (!current) return current;
        const next = advanceLocalGame(graph, current.step, edgeId, current.variables);
        if (!next) return current;
        return {
          ...current,
          step: autoResolveConditions(graph, next, current.variables),
          history: [...current.history, current.step.node.id].slice(-HISTORY_LIMIT),
        };
      });
    },
    [graph],
  );

  const back = useCallback(() => {
    if (!graph) return;
    setSession((current) => {
      const previousId = current?.history.at(-1);
      if (!current || !previousId) return current;
      const step = stepFromNode(graph, previousId, current.variables, current.step.playthroughId);
      if (!step) return current;
      return { ...current, step, history: current.history.slice(0, -1) };
    });
  }, [graph]);

  const reset = useCallback(() => {
    if (!graph) return;
    clearStoredPlaytest(storyId);
    setSession(createSession(graph, playthroughId, null));
  }, [graph, storyId, playthroughId]);

  const setVariable = useCallback((key: string, value: string | number | boolean) => {
    setSession((current) =>
      current ? { ...current, variables: { ...current.variables, [key]: value } } : current,
    );
  }, []);

  return {
    graph,
    session,
    loading,
    error,
    issues,
    blockingIssues,
    available,
    completed,
    choose,
    back,
    reset,
    setVariable,
  };
}
