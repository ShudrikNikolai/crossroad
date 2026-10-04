'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getStoryGraph } from '@/features/stories/api/stories';
import { errorText } from '@/features/stories/lib/error-text';
import type { StoryGraph } from '@/features/stories/types/story.types';
import {
  advanceLocalGame,
  autoResolveConditions,
  stepFromNode,
  type GameVariables,
} from '@/features/game/lib/local-runtime';
import { buildDefaultVariables } from '@/features/game/lib/local-storage';
import { gameSaves, type GameSave, type GameSnapshot } from '@/features/game/lib/saves';
import type { GameMeta, GameSession } from '@/features/game/types/game-session.types';

const HISTORY_LIMIT = 100;

type Options = {
  onAutosave?: () => void;
  onSaveError?: (message: string) => void;
};

function appendHistory(history: string[], ...ids: string[]) {
  const next = [...history];
  for (const id of ids) if (next[next.length - 1] !== id) next.push(id);
  return next.slice(-HISTORY_LIMIT);
}

/**
 * Состояние прохождения + автосохранение.
 */
export function useGameSession(playthroughId: string, options: Options = {}) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [graph, setGraph] = useState<StoryGraph | null>(null);
  const [session, setSession] = useState<GameSession | null>(null);
  const [meta, setMeta] = useState<GameMeta | null>(null);
  const [actionError, setActionError] = useState('');

  const graphRef = useRef<StoryGraph | null>(null);
  const sessionRef = useRef<GameSession | null>(null);
  const baseSaveRef = useRef<GameSave | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  /** Единственное место, где меняется состояние и пишется автосохранение. */
  const commit = useCallback((next: GameSession) => {
    sessionRef.current = next;
    setSession(next);

    const base = baseSaveRef.current;
    if (!base) return;
    const save: GameSave = {
      ...base,
      state: next.step,
      variables: next.variables,
      history: next.history,
      updatedAt: new Date().toISOString(),
    };
    baseSaveRef.current = save;
    gameSaves
      .upsert(save)
      .catch((e) => optionsRef.current.onSaveError?.(errorText(e, 'Не удалось сохранить прохождение.')));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');

    (async () => {
      try {
        const saved = await gameSaves.get(playthroughId);
        if (!saved) {
          if (active) setLoadError('Прохождение не найдено в этом браузере.');
          return;
        }
        const loadedGraph = await getStoryGraph(saved.storyId);
        if (!active) return;

        const variables: GameVariables = {
          ...buildDefaultVariables(loadedGraph.variables),
          ...(saved.variables ?? {}),
        };
        // шаг пересчитываем по графу и переменным: сохранённые choices могли устареть
        const fresh = stepFromNode(loadedGraph, saved.state.node.id, variables, playthroughId);
        if (!fresh) {
          setLoadError('Узел из сохранения не найден в истории — возможно, она изменилась.');
          return;
        }
        const step = autoResolveConditions(loadedGraph, fresh, variables);
        const loaded: GameSession = {
          step,
          variables,
          history: saved.history?.length ? saved.history : [step.node.id],
        };

        graphRef.current = loadedGraph;
        sessionRef.current = loaded;
        baseSaveRef.current = saved;
        setGraph(loadedGraph);
        setSession(loaded);
        setMeta({ name: saved.name, storyTitle: saved.storyTitle });

        // условия "доиграли" шаг при загрузке, фиксируем это в сохранении
        if (step.node.id !== saved.state.node.id) commit(loaded);
      } catch (e) {
        if (active) setLoadError(errorText(e, 'Не удалось загрузить прохождение.'));
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [playthroughId, commit]);

  const choose = useCallback(
    (edgeId: string) => {
      const g = graphRef.current;
      const current = sessionRef.current;
      if (!g || !current) return;

      const next = advanceLocalGame(g, current.step, edgeId, current.variables);
      if (!next) {
        setActionError('Этот переход недоступен при текущих значениях переменных.');
        return;
      }
      setActionError('');
      const resolved = autoResolveConditions(g, next, current.variables);
      commit({
        step: resolved,
        variables: current.variables,
        history: appendHistory(current.history, next.node.id, resolved.node.id),
      });
      optionsRef.current.onAutosave?.();
    },
    [commit],
  );

  const changeVariable = useCallback(
    (key: string, value: string | number | boolean) => {
      const g = graphRef.current;
      const current = sessionRef.current;
      if (!g || !current) return;

      const variables = { ...current.variables, [key]: value };
      // пересобираем шаг, иначе список вариантов остался бы посчитанным по старым значениям
      const fresh = stepFromNode(g, current.step.node.id, variables, playthroughId);
      if (!fresh) return;
      const resolved = autoResolveConditions(g, fresh, variables);
      commit({
        step: resolved,
        variables,
        history:
          resolved.node.id === current.step.node.id
            ? current.history
            : appendHistory(current.history, resolved.node.id),
      });
    },
    [commit, playthroughId],
  );

  /** Загрузка слота. Возвращает текст проблемы или null, если всё прошло. */
  const restore = useCallback(
    (snapshot: GameSnapshot): string | null => {
      const g = graphRef.current;
      if (!g || !sessionRef.current) return 'Игра ещё не загружена.';
      if (snapshot.state.playthroughId !== playthroughId)
        return 'Слот относится к другому прохождению.';

      const variables: GameVariables = {
        ...buildDefaultVariables(g.variables),
        ...snapshot.variables,
      };
      const fresh = stepFromNode(g, snapshot.state.node.id, variables, playthroughId);
      if (!fresh) return 'Узел из слота не найден в истории.';

      const step = autoResolveConditions(g, fresh, variables);
      setActionError('');
      commit({
        step,
        variables,
        history: snapshot.history?.length
          ? snapshot.history.slice(-HISTORY_LIMIT)
          : [step.node.id],
      });
      return null;
    },
    [commit, playthroughId],
  );

  return {
    loading,
    loadError,
    graph,
    session,
    meta,
    actionError,
    choose,
    changeVariable,
    restore,
  };
}
