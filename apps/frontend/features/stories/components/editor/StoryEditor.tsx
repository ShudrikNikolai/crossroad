'use client';

import Link from 'next/link';
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
  type Connection,
  type EdgeChange,
  type EdgeTypes,
  type NodeChange,
  type NodeTypes,
  type OnNodeDrag,
  type XYPosition,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@heroui/react';
import { getStoryGraph, updateStory } from '@/features/stories/api/stories';
import {
  createEdge,
  createNode,
  createVariable,
  deleteEdge,
  deleteNode,
  updateEdge,
  updateNode,
  updateNodePosition,
} from '@/features/stories/api/graph';
import type {
  NodeType,
  StoryEdge,
  StoryGraph,
  StoryNode,
  StoryVariable,
} from '@/features/stories/types/story.types';

import { AUTOSAVE_MS, isBranching, nodeMeta } from '@/features/stories/lib/editor/constants';
import { errorText, makeId, nextTitle, nodeTitle } from '@/features/stories/lib/editor/helpers';
import { useStableCallback } from '@/features/stories/hooks/use-stable-callback';
import { syncFlowEdges, syncFlowNodes } from '@/features/stories/lib/editor/graph-sync';
import { EMPTY_VALIDATION, findOrphanEdges, validateGraph } from '@/features/stories/lib/editor/validation';
import { EditorActionsContext } from '@/features/stories/lib/editor/editor-actions';
import type {
  ContextMenuState,
  EdgePatch,
  EditorActions,
  FlowEdge,
  FlowNode,
  HistoryAction,
  NodePatch,
  SaveState,
  VariableDraft,
} from '@/features/stories/types/editor.types';
import { StoryNodeView } from './StoryNodeView';
import { StoryEdgeView } from './StoryEdgeView';
import { Sidebar } from './Sidebar';
import { NodeInspector } from './NodeInspector';
import { EdgeInspector } from './EdgeInspector';
import { ContextMenu } from './ContextMenu';

const nodeTypes: NodeTypes = { story: StoryNodeView };
const edgeTypes: EdgeTypes = { story: StoryEdgeView };

const SAVE_BADGE: Record<SaveState, { text: string; className: string }> = {
  saved: { text: 'Сохранено', className: 'bg-emerald-50 text-emerald-700' },
  saving: { text: 'Сохраняю…', className: 'bg-amber-50 text-amber-700' },
  dirty: { text: 'Есть несохранённые изменения', className: 'bg-zinc-100 text-zinc-600' },
  error: { text: 'Ошибка сохранения', className: 'bg-red-50 text-red-700' },
};

export function StoryEditor({ storyId }: { storyId: string }) {
  const router = useRouter();
  const reactFlow = useReactFlow<FlowNode, FlowEdge>();

  const [graph, setGraph] = useState<StoryGraph | null>(null);
  const [orphanEdges, setOrphanEdges] = useState<StoryEdge[]>([]);
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [clipboardNode, setClipboardNode] = useState<StoryNode | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [nodeSearch, setNodeSearch] = useState('');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const historyRef = useRef<HistoryAction[]>([]);
  const redoRef = useRef<HistoryAction[]>([]);
  const dragStartPositionsRef = useRef<Record<string, XYPosition>>({});
  const graphRef = useRef<StoryGraph | null>(null);
  const busyRef = useRef(false);
  const savingRef = useRef(false);
  const inflightRef = useRef<Set<string>>(new Set());
  const fittedRef = useRef(false);
  const nodeBeforeEditRef = useRef<Record<string, StoryNode>>({});
  const edgeBeforeEditRef = useRef<Record<string, StoryEdge>>({});
  const dirtyNodeIdsRef = useRef<Set<string>>(new Set());
  const dirtyEdgeIdsRef = useRef<Set<string>>(new Set());

  const setBusyBoth = (value: boolean) => {
    busyRef.current = value;
    setBusy(value);
  };

  /* ---------- единый источник правды: graph (ref обновляется синхронно) ---------- */

  const updateGraph = useCallback((fn: (g: StoryGraph) => StoryGraph) => {
    const current = graphRef.current;
    if (!current) return;
    const next = fn(current);
    if (next === current) return;
    graphRef.current = next;
    setGraph(next);
  }, []);

  const selectedNode = useMemo(
    () => graph?.nodes.find((node) => node.id === selectedNodeId) ?? null,
    [graph, selectedNodeId],
  );
  const selectedEdge = useMemo(
    () => graph?.edges.find((edge) => edge.id === selectedEdgeId) ?? null,
    [graph, selectedEdgeId],
  );

  // проверка графа не должна тормозить ввод — считаем её с низким приоритетом
  const deferredGraph = useDeferredValue(graph);
  const validation = useMemo(
    () => (deferredGraph ? validateGraph(deferredGraph) : EMPTY_VALIDATION),
    [deferredGraph],
  );

  /** Поиск скрывает узлы через `hidden` — рёбра и handle-ы остаются согласованными. */
  const visibleNodes = useMemo(() => {
    const q = nodeSearch.trim().toLowerCase();
    if (!q) return nodes;
    return nodes.map((node) => {
      const s = node.data.storyNode;
      const haystack =
        `${s.id} ${nodeTitle(s)} ${s.content.text} ${s.content.speaker ?? ''}`.toLowerCase();
      return haystack.includes(q) ? node : { ...node, hidden: true };
    });
  }, [nodes, nodeSearch]);

  /* ---------- история ---------- */

  const pushHistory = useCallback((action: HistoryAction) => {
    historyRef.current = [...historyRef.current.slice(-49), action];
    redoRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  /* ---------- локальные изменения: меняют только graph ---------- */

  const removeNodeLocal = (nodeId: string) =>
    updateGraph((g) => ({
      ...g,
      nodes: g.nodes.filter((node) => node.id !== nodeId),
      edges: g.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
    }));

  const addNodeLocal = (node: StoryNode) =>
    updateGraph((g) =>
      g.nodes.some((item) => item.id === node.id) ? g : { ...g, nodes: [...g.nodes, node] },
    );

  const patchNodeLocal = (node: StoryNode) =>
    updateGraph((g) => ({
      ...g,
      nodes: g.nodes.map((item) => (item.id === node.id ? node : item)),
    }));

  const removeEdgeLocal = (edgeId: string) =>
    updateGraph((g) => ({ ...g, edges: g.edges.filter((edge) => edge.id !== edgeId) }));

  const addEdgeLocal = (edge: StoryEdge) =>
    updateGraph((g) =>
      g.edges.some((item) => item.id === edge.id) ? g : { ...g, edges: [...g.edges, edge] },
    );

  const replaceEdgeLocal = (edge: StoryEdge) =>
    updateGraph((g) => ({
      ...g,
      edges: g.edges.map((item) => (item.id === edge.id ? edge : item)),
    }));

  function updateNodePositionLocal(nodeId: string, position: XYPosition) {
    updateGraph((g) => ({
      ...g,
      nodes: g.nodes.map((item) => (item.id === nodeId ? { ...item, position } : item)),
    }));
    // позиция живёт и в RF-состоянии, поэтому обновляем её явно
    setNodes((current) =>
      current.map((item) => (item.id === nodeId ? { ...item, position } : item)),
    );
  }

  /* ---------- dirty-трекинг и сохранение ---------- */

  const refreshSaveState = () =>
    setSaveState(dirtyNodeIdsRef.current.size || dirtyEdgeIdsRef.current.size ? 'dirty' : 'saved');

  // ВАЖНО: снимок «до правки» берём ДО patch*Local, иначе before === current.
  function markNodeDirty(node: StoryNode) {
    if (!nodeBeforeEditRef.current[node.id])
      nodeBeforeEditRef.current[node.id] = structuredClone(node);
    dirtyNodeIdsRef.current.add(node.id);
    setSaveState('dirty');
  }

  function markEdgeDirty(edge: StoryEdge) {
    if (!edgeBeforeEditRef.current[edge.id])
      edgeBeforeEditRef.current[edge.id] = structuredClone(edge);
    dirtyEdgeIdsRef.current.add(edge.id);
    setSaveState('dirty');
  }

  /** Мёржим патч с актуальным узлом из graph, а не с копией из props: поля не затирают друг друга. */
  function patchNode(id: string, patch: NodePatch) {
    const current = graphRef.current?.nodes.find((node) => node.id === id);
    if (!current) return;
    markNodeDirty(current);
    patchNodeLocal({
      ...current,
      ...(patch.type ? { type: patch.type } : {}),
      content: patch.content ? { ...current.content, ...patch.content } : current.content,
    });
  }

  function patchEdge(id: string, patch: EdgePatch) {
    const current = graphRef.current?.edges.find((edge) => edge.id === id);
    if (!current) return;
    markEdgeDirty(current);
    replaceEdgeLocal({ ...current, ...patch });
  }

  function addCondition(edgeId: string) {
    const g = graphRef.current;
    const edge = g?.edges.find((item) => item.id === edgeId);
    const variable = g?.variables[0];
    if (!edge || !variable) return;
    patchEdge(edgeId, {
      conditions: [
        ...(edge.conditions ?? []),
        { variableKey: variable.key, operator: 'eq', value: variable.defaultValue },
      ],
    });
    void commitEdgeEdit(edgeId, false);
  }

  async function commitNodeEdit(nodeId: string, closeEditor = true): Promise<boolean> {
    if (closeEditor) setEditingNodeId((cur) => (cur === nodeId ? null : cur));

    const key = `n:${nodeId}`;
    if (inflightRef.current.has(key)) return false;

    const current = graphRef.current?.nodes.find((node) => node.id === nodeId);
    const before = nodeBeforeEditRef.current[nodeId];
    if (!current || !before) {
      dirtyNodeIdsRef.current.delete(nodeId);
      delete nodeBeforeEditRef.current[nodeId];
      refreshSaveState();
      return false;
    }
    if (
      before.type === current.type &&
      JSON.stringify(before.content) === JSON.stringify(current.content)
    ) {
      dirtyNodeIdsRef.current.delete(nodeId);
      delete nodeBeforeEditRef.current[nodeId];
      refreshSaveState();
      return true;
    }

    inflightRef.current.add(key);
    try {
      setSaveState('saving');
      const saved = await updateNode(storyId, nodeId, {
        type: current.type,
        content: current.content,
      });

      // Пока шёл запрос, пользователь мог продолжить печатать — тогда не затираем его ввод.
      const latest = graphRef.current?.nodes.find((node) => node.id === nodeId);
      const unchanged =
        !!latest && latest.content === current.content && latest.type === current.type;

      if (latest && unchanged) {
        patchNodeLocal({ ...saved, position: latest.position });
        delete nodeBeforeEditRef.current[nodeId];
        dirtyNodeIdsRef.current.delete(nodeId);
      } else {
        nodeBeforeEditRef.current[nodeId] = structuredClone(saved);
      }

      pushHistory({
        label: 'Изменение узла',
        undo: async () => {
          const restored = await updateNode(storyId, before.id, {
            type: before.type,
            content: before.content,
          });
          patchNodeLocal(restored);
        },
        redo: async () => {
          const restored = await updateNode(storyId, saved.id, {
            type: saved.type,
            content: saved.content,
          });
          patchNodeLocal(restored);
        },
      });
      refreshSaveState();
      return true;
    } catch (error) {
      setMessage(errorText(error, 'Не удалось сохранить узел.'));
      setSaveState('error');
      return false;
    } finally {
      inflightRef.current.delete(key);
    }
  }

  async function commitEdgeEdit(edgeId: string, closeEditor = true): Promise<boolean> {
    if (closeEditor) setEditingEdgeId((cur) => (cur === edgeId ? null : cur));

    const key = `e:${edgeId}`;
    if (inflightRef.current.has(key)) return false;

    const current = graphRef.current?.edges.find((edge) => edge.id === edgeId);
    const before = edgeBeforeEditRef.current[edgeId];
    if (!current || !before) {
      dirtyEdgeIdsRef.current.delete(edgeId);
      delete edgeBeforeEditRef.current[edgeId];
      refreshSaveState();
      return false;
    }
    if (JSON.stringify(before) === JSON.stringify(current)) {
      dirtyEdgeIdsRef.current.delete(edgeId);
      delete edgeBeforeEditRef.current[edgeId];
      refreshSaveState();
      return true;
    }

    inflightRef.current.add(key);
    try {
      setSaveState('saving');
      const saved = await updateEdge(storyId, edgeId, {
        label: current.label,
        conditions: current.conditions,
      });

      const latest = graphRef.current?.edges.find((edge) => edge.id === edgeId);
      if (latest && latest === current) {
        replaceEdgeLocal(saved);
        delete edgeBeforeEditRef.current[edgeId];
        dirtyEdgeIdsRef.current.delete(edgeId);
      } else {
        edgeBeforeEditRef.current[edgeId] = structuredClone(saved);
      }

      pushHistory({
        label: 'Изменение связи',
        undo: async () => {
          const restored = await updateEdge(storyId, before.id, {
            label: before.label,
            conditions: before.conditions,
          });
          replaceEdgeLocal(restored);
        },
        redo: async () => {
          const restored = await updateEdge(storyId, saved.id, {
            label: saved.label,
            conditions: saved.conditions,
          });
          replaceEdgeLocal(restored);
        },
      });
      refreshSaveState();
      return true;
    } catch (error) {
      setMessage(errorText(error, 'Не удалось сохранить связь.'));
      setSaveState('error');
      return false;
    } finally {
      inflightRef.current.delete(key);
    }
  }

  async function commitAll() {
    if (busyRef.current || savingRef.current) return;
    if (!dirtyNodeIdsRef.current.size && !dirtyEdgeIdsRef.current.size) return;
    savingRef.current = true;
    try {
      for (const id of [...dirtyNodeIdsRef.current]) await commitNodeEdit(id, false);
      for (const id of [...dirtyEdgeIdsRef.current]) await commitEdgeEdit(id, false);
    } finally {
      savingRef.current = false;
    }
  }

  /* ---------- стабильные действия для нод/рёбер (контекст) ---------- */

  const latest = useRef<EditorActions>(null!);
  latest.current = {
    startEditNode: (id) => setEditingNodeId(id),
    patchNode,
    commitNode: (id) => void commitNodeEdit(id),
    startEditEdge: (id) => setEditingEdgeId(id),
    patchEdge,
    commitEdge: (id) => void commitEdgeEdit(id),
    addCondition,
    selectEdge: (id) => {
      setSelectedEdgeId(id);
      setSelectedNodeId(null);
    },
    deleteEdge: (id) => {
      const edge = graphRef.current?.edges.find((item) => item.id === id);
      if (edge) void removeEdge(edge);
    },
  };
  const actions = useMemo<EditorActions>(
    () => ({
      startEditNode: (id) => latest.current.startEditNode(id),
      patchNode: (id, patch) => latest.current.patchNode(id, patch),
      commitNode: (id) => latest.current.commitNode(id),
      startEditEdge: (id) => latest.current.startEditEdge(id),
      patchEdge: (id, patch) => latest.current.patchEdge(id, patch),
      commitEdge: (id) => latest.current.commitEdge(id),
      addCondition: (id) => latest.current.addCondition(id),
      selectEdge: (id) => latest.current.selectEdge(id),
      deleteEdge: (id) => latest.current.deleteEdge(id),
    }),
    [],
  );

  /* ---------- загрузка ---------- */

  useEffect(() => {
    let cancelled = false;
    getStoryGraph(storyId)
      .then((loaded) => {
        if (cancelled) return;
        // связи без существующего source/target прячем из графа и предлагаем удалить из базы
        const orphans = findOrphanEdges(loaded);
        const clean = orphans.length
          ? { ...loaded, edges: loaded.edges.filter((edge) => !orphans.includes(edge)) }
          : loaded;
        graphRef.current = clean;
        setOrphanEdges(orphans);
        setGraph(clean);
      })
      .catch((error) => !cancelled && setMessage(errorText(error, 'Не удалось загрузить граф истории.')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [storyId]);

  /* ---------- автосохранение: страховка раз в 30 секунд ---------- */

  const commitAllRef = useRef(commitAll);
  commitAllRef.current = commitAll;
  useEffect(() => {
    const interval = window.setInterval(() => void commitAllRef.current(), AUTOSAVE_MS);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (dirtyNodeIdsRef.current.size || dirtyEdgeIdsRef.current.size) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(''), 5000);
    return () => window.clearTimeout(timer);
  }, [message]);

  /* ---------- graph -> RF nodes/edges ---------- */

  useEffect(() => {
    if (!graph) return;
    setNodes((prev) => syncFlowNodes(prev, graph, editingNodeId));
    setEdges((prev) => syncFlowEdges(prev, graph, editingEdgeId));
  }, [graph, editingNodeId, editingEdgeId]);

  // fitView при первой загрузке (узлы появляются уже после монтирования RF)
  useEffect(() => {
    if (fittedRef.current || !nodes.length) return;
    fittedRef.current = true;
    const timer = window.setTimeout(() => void reactFlow.fitView({ padding: 0.2 }), 80);
    return () => window.clearTimeout(timer);
  }, [nodes.length, reactFlow]);

  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  /* ---------- RF-обработчики ---------- */

  // Позицию в graph не пишем на каждый кадр — только на dragStop.
  const onNodesChange = useCallback((changes: NodeChange<FlowNode>[]) => {
    setNodes((current) => applyNodeChanges(changes, current));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange<FlowEdge>[]) => {
    setEdges((current) => applyEdgeChanges(changes, current));
  }, []);

  const onNodeDragStart: OnNodeDrag<FlowNode> = useCallback((_event, node, dragged) => {
    for (const item of dragged.length ? dragged : [node]) {
      dragStartPositionsRef.current[item.id] = { ...item.position };
    }
  }, []);

  const onNodeDragStop: OnNodeDrag<FlowNode> = useCallback(
    async (_event, node, dragged) => {
      const items = dragged.length ? dragged : [node];
      const moved = items
        .map((item) => ({
          id: item.id,
          from: dragStartPositionsRef.current[item.id],
          to: { ...item.position },
        }))
        .filter((m) => m.from && (m.from.x !== m.to.x || m.from.y !== m.to.y));
      if (!moved.length) return;

      try {
        await Promise.all(moved.map((m) => updateNodePosition(storyId, m.id, m.to)));
        updateGraph((g) => ({
          ...g,
          nodes: g.nodes.map((n) => {
            const m = moved.find((item) => item.id === n.id);
            return m ? { ...n, position: m.to } : n;
          }),
        }));
        pushHistory({
          label: 'Перемещение узлов',
          undo: async () => {
            await Promise.all(moved.map((m) => updateNodePosition(storyId, m.id, m.from)));
            moved.forEach((m) => updateNodePositionLocal(m.id, m.from));
          },
          redo: async () => {
            await Promise.all(moved.map((m) => updateNodePosition(storyId, m.id, m.to)));
            moved.forEach((m) => updateNodePositionLocal(m.id, m.to));
          },
        });
      } catch (error) {
        setMessage(errorText(error, 'Не удалось сохранить позицию узла.'));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storyId, pushHistory, updateGraph],
  );

  async function onConnect(connection: Connection) {
    const g = graphRef.current;
    if (!g || !connection.source || !connection.target || connection.source === connection.target)
      return;

    const sourceNode = g.nodes.find((node) => node.id === connection.source);
    const targetNode = g.nodes.find((node) => node.id === connection.target);
    if (!sourceNode || !targetNode) {
      setMessage('Узел связи не найден в графе.');
      return;
    }

    if (isBranching(sourceNode.type)) {
      const handleTaken =
        connection.sourceHandle &&
        connection.sourceHandle !== 'out-new' &&
        g.edges.some(
          (edge) =>
            edge.source === connection.source &&
            `out-${edge.id}` === connection.sourceHandle,
        );
      if (handleTaken) {
        setMessage('Этот выход уже подключён. Используй нижний выход «новая ветка».');
        return;
      }
    } else if (g.edges.some((edge) => edge.source === connection.source)) {
      setMessage('У этого узла уже есть исходящая связь.');
      return;
    }

    setBusyBoth(true);
    setMessage('');
    try {
      const created = await createEdge(storyId, {
        id: makeId('edge'),
        source: connection.source,
        target: connection.target,
        label: '',
      });
      addEdgeLocal(created);
      setSelectedEdgeId(created.id);
      setSelectedNodeId(null);
      pushHistory({
        label: 'Создание связи',
        undo: async () => {
          await deleteEdge(storyId, created.id);
          removeEdgeLocal(created.id);
          setSelectedEdgeId(null);
        },
        redo: async () => {
          const recreated = await createEdge(storyId, created);
          addEdgeLocal(recreated);
          setSelectedEdgeId(recreated.id);
        },
      });
    } catch (error) {
      setMessage(errorText(error, 'Не удалось создать связь.'));
    } finally {
      setBusyBoth(false);
    }
  }

  async function onReconnect(oldEdge: FlowEdge, connection: Connection) {
    const g = graphRef.current;
    const edge = g?.edges.find((item) => item.id === oldEdge.id);
    if (!g || !edge || !connection.target) return;

    const nextSource = connection.source ?? edge.source;
    if (nextSource === connection.target) return;
    if (
      !g.nodes.some((node) => node.id === nextSource) ||
      !g.nodes.some((node) => node.id === connection.target)
    ) {
      setMessage('Узел для переподключения не найден в графе.');
      return;
    }
    if (nextSource === edge.source && connection.target === edge.target) return;

    try {
      const saved = await updateEdge(storyId, edge.id, {
        source: nextSource,
        target: connection.target,
      });
      replaceEdgeLocal(saved);
      pushHistory({
        label: 'Переподключение связи',
        undo: async () => {
          const restored = await updateEdge(storyId, edge.id, {
            source: edge.source,
            target: edge.target,
          });
          replaceEdgeLocal(restored);
        },
        redo: async () => {
          const restored = await updateEdge(storyId, edge.id, {
            source: saved.source,
            target: saved.target,
          });
          replaceEdgeLocal(restored);
        },
      });
    } catch (error) {
      setMessage(errorText(error, 'Не удалось переподключить связь.'));
    }
  }

  /* ---------- операции с узлами и связями ---------- */

  async function createNodeAt(type: NodeType, position?: XYPosition) {
    const g = graphRef.current;
    if (!g) return;
    setBusyBoth(true);
    try {
      const count = g.nodes.length;
      const nodePosition = position ?? {
        x: 100 + (count % 3) * 360,
        y: 100 + Math.floor(count / 3) * 230,
      };
      const node = await createNode(storyId, {
        storyId,
        id: makeId('node'),
        type,
        position: nodePosition,
        content: {
          title: nextTitle(type, g.nodes),
          text: type === 'end' ? 'Конец истории' : 'init',
        },
      });
      addNodeLocal(node);
      setSelectedNodeId(node.id);
      setSelectedEdgeId(null);
      setContextMenu(null);
      pushHistory({
        label: `Создание: ${nodeMeta[type].label}`,
        undo: async () => {
          await deleteNode(storyId, node.id);
          removeNodeLocal(node.id);
          setSelectedNodeId(null);
        },
        redo: async () => {
          const recreated = await createNode(storyId, node);
          addNodeLocal(recreated);
          setSelectedNodeId(recreated.id);
        },
      });
    } catch (error) {
      setMessage(errorText(error, 'Не удалось создать узел.'));
    } finally {
      setBusyBoth(false);
    }
  }

  async function removeNode(nodeOverride?: StoryNode) {
    const node = nodeOverride ?? selectedNode;
    const g = graphRef.current;
    if (!node || !g || !confirm(`Удалить узел «${nodeTitle(node)}»?`)) return;
    const connectedEdges = g.edges.filter(
      (edge) => edge.source === node.id || edge.target === node.id,
    );
    setBusyBoth(true);
    try {
      // Не полагаемся на каскад в бэкенде: иначе в базе остаются связи-сироты.
      await Promise.allSettled(connectedEdges.map((edge) => deleteEdge(storyId, edge.id)));
      await deleteNode(storyId, node.id);
      removeNodeLocal(node.id);
      dirtyNodeIdsRef.current.delete(node.id);
      delete nodeBeforeEditRef.current[node.id];
      connectedEdges.forEach((edge) => {
        dirtyEdgeIdsRef.current.delete(edge.id);
        delete edgeBeforeEditRef.current[edge.id];
      });
      refreshSaveState();
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      pushHistory({
        label: 'Удаление узла',
        undo: async () => {
          await createNode(storyId, node);
          for (const edge of connectedEdges) await createEdge(storyId, edge);
          addNodeLocal(node);
          for (const edge of connectedEdges) addEdgeLocal(edge);
        },
        redo: async () => {
          await Promise.allSettled(connectedEdges.map((edge) => deleteEdge(storyId, edge.id)));
          await deleteNode(storyId, node.id);
          removeNodeLocal(node.id);
        },
      });
    } catch (error) {
      setMessage(errorText(error, 'Не удалось удалить узел.'));
    } finally {
      setBusyBoth(false);
    }
  }

  // Подтверждение не нужно: удаление связи отменяется через Ctrl/Cmd+Z.
  async function removeEdge(edgeOverride?: StoryEdge) {
    const edge = edgeOverride ?? selectedEdge;
    if (!edge || !graphRef.current) return;
    setBusyBoth(true);
    try {
      await deleteEdge(storyId, edge.id);
      removeEdgeLocal(edge.id);
      dirtyEdgeIdsRef.current.delete(edge.id);
      delete edgeBeforeEditRef.current[edge.id];
      refreshSaveState();
      setSelectedEdgeId((cur) => (cur === edge.id ? null : cur));
      pushHistory({
        label: 'Удаление связи',
        undo: async () => {
          await createEdge(storyId, edge);
          addEdgeLocal(edge);
        },
        redo: async () => {
          await deleteEdge(storyId, edge.id);
          removeEdgeLocal(edge.id);
        },
      });
    } catch (error) {
      setMessage(errorText(error, 'Не удалось удалить связь.'));
    } finally {
      setBusyBoth(false);
    }
  }

  async function cleanOrphans() {
    const list = orphanEdges;
    if (!list.length) return;
    setBusyBoth(true);
    const results = await Promise.allSettled(list.map((edge) => deleteEdge(storyId, edge.id)));
    const failed = list.filter((_, index) => results[index].status === 'rejected');
    setOrphanEdges(failed);
    setMessage(
      failed.length
        ? `Не удалось удалить из базы связей: ${failed.length}.`
        : 'Битые связи удалены из базы.',
    );
    setBusyBoth(false);
  }

  async function makeStart(nodeId: string) {
    const g = graphRef.current;
    if (!g || g.story.startNodeId === nodeId) return;
    const previous = g.story.startNodeId;
    setBusyBoth(true);
    try {
      const saved = await updateStory(storyId, { startNodeId: nodeId });
      updateGraph((cur) => ({ ...cur, story: saved }));
      pushHistory({
        label: 'Изменение стартового узла',
        undo: async () => {
          const restored = await updateStory(storyId, { startNodeId: previous });
          updateGraph((cur) => ({ ...cur, story: restored }));
        },
        redo: async () => {
          const restored = await updateStory(storyId, { startNodeId: nodeId });
          updateGraph((cur) => ({ ...cur, story: restored }));
        },
      });
    } catch (error) {
      setMessage(errorText(error, 'Не удалось изменить стартовый узел.'));
    } finally {
      setBusyBoth(false);
    }
  }

  async function addVariable(draft: VariableDraft): Promise<boolean> {
    if (!graphRef.current || !draft.key.trim()) return false;
    setBusyBoth(true);
    try {
      const defaultValue =
        draft.type === 'number'
          ? Number(draft.value || 0)
          : draft.type === 'boolean'
            ? draft.value === 'true'
            : draft.value;
      const created = await createVariable(storyId, {
        key: draft.key.trim(),
        type: draft.type,
        defaultValue,
      });
      updateGraph((g) => ({ ...g, variables: [...g.variables, created] }));
      return true;
    } catch (error) {
      setMessage(errorText(error, 'Не удалось создать переменную.'));
      return false;
    } finally {
      setBusyBoth(false);
    }
  }

  /* ---------- undo / redo / copy / paste ---------- */

  async function undo() {
    const action = historyRef.current.at(-1);
    if (!action || busyRef.current) return;
    setBusyBoth(true);
    setMessage('');
    try {
      await action.undo();
      historyRef.current = historyRef.current.slice(0, -1);
      redoRef.current = [...redoRef.current, action];
      setCanUndo(historyRef.current.length > 0);
      setCanRedo(redoRef.current.length > 0);
    } catch (error) {
      setMessage(errorText(error, `Не удалось отменить: ${action.label}.`));
    } finally {
      setBusyBoth(false);
    }
  }

  async function redo() {
    const action = redoRef.current.at(-1);
    if (!action || busyRef.current) return;
    setBusyBoth(true);
    setMessage('');
    try {
      await action.redo();
      redoRef.current = redoRef.current.slice(0, -1);
      historyRef.current = [...historyRef.current, action];
      setCanUndo(historyRef.current.length > 0);
      setCanRedo(redoRef.current.length > 0);
    } catch (error) {
      setMessage(errorText(error, `Не удалось повторить: ${action.label}.`));
    } finally {
      setBusyBoth(false);
    }
  }

  async function copyNode(nodeOverride?: StoryNode) {
    const node = nodeOverride ?? selectedNode;
    if (!node) return;
    setClipboardNode(structuredClone(node));
    try {
      await navigator.clipboard.writeText(JSON.stringify({ type: 'crossroad-node', node }));
    } catch {
      /* локальный буфер всё равно работает */
    }
    setMessage('Узел скопирован. Ctrl/Cmd+V — вставить.');
  }

  async function pasteNode(position?: XYPosition) {
    const g = graphRef.current;
    if (!clipboardNode || !g) return;
    setBusyBoth(true);
    try {
      const offset = position ?? {
        x: clipboardNode.position.x + 60,
        y: clipboardNode.position.y + 60,
      };
      const node = await createNode(storyId, {
        storyId,
        id: makeId('node'),
        type: clipboardNode.type,
        position: offset,
        content: {
          ...structuredClone(clipboardNode.content),
          title: nextTitle(clipboardNode.type, g.nodes),
        },
      });
      addNodeLocal(node);
      setSelectedNodeId(node.id);
      setSelectedEdgeId(null);
      setMessage('Копия узла создана.');
      pushHistory({
        label: 'Вставка узла',
        undo: async () => {
          await deleteNode(storyId, node.id);
          removeNodeLocal(node.id);
        },
        redo: async () => {
          const recreated = await createNode(storyId, node);
          addNodeLocal(recreated);
        },
      });
    } catch (error) {
      setMessage(errorText(error, 'Не удалось вставить узел.'));
    } finally {
      setBusyBoth(false);
    }
  }

  function openContextMenu(
    event: React.MouseEvent | MouseEvent,
    flowPosition: XYPosition,
    nodeId?: string,
    edgeId?: string,
  ) {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ x: event.clientX, y: event.clientY, flowPosition, nodeId, edgeId });
  }

  /* ---------- горячие клавиши: слушатель ставится один раз ---------- */

  const keysRef = useRef({ undo, redo, copyNode, pasteNode, removeNode, removeEdge, selectedNode, selectedEdge });
  keysRef.current = { undo, redo, copyNode, pasteNode, removeNode, removeEdge, selectedNode, selectedEdge };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      // в полях ввода работают нативные undo/copy/paste/delete
      if (target?.closest('input, textarea, select, [contenteditable="true"], [role="listbox"]'))
        return;

      const k = keysRef.current;
      const modifier = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (event.key === 'Escape') {
        setContextMenu(null);
        return;
      }
      if (modifier && key === 'z') {
        event.preventDefault();
        void (event.shiftKey ? k.redo() : k.undo());
        return;
      }
      if (modifier && key === 'y') {
        event.preventDefault();
        void k.redo();
        return;
      }
      if (modifier && key === 'c' && k.selectedNode && !window.getSelection()?.toString()) {
        event.preventDefault();
        void k.copyNode();
        return;
      }
      if (modifier && key === 'v') {
        event.preventDefault();
        void k.pasteNode();
        return;
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        if (k.selectedNode) void k.removeNode(k.selectedNode);
        else if (k.selectedEdge) void k.removeEdge(k.selectedEdge);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  /* ---------- стабильные колбэки для memo-панелей ---------- */

  const onAddNode = useStableCallback((type: NodeType) => void createNodeAt(type));
  const onAddVariable = useStableCallback(addVariable);
  const onUpdateVariable = useStableCallback((next: StoryVariable) =>
    updateGraph((g) => ({
      ...g,
      variables: g.variables.map((item) => (item.key === next.key ? next : item)),
    })),
  );
  const onDeleteVariable = useStableCallback((key: string) =>
    updateGraph((g) => ({ ...g, variables: g.variables.filter((item) => item.key !== key) })),
  );
  const onCleanOrphans = useStableCallback(() => void cleanOrphans());
  const onPatchNode = useStableCallback(patchNode);
  const onPatchEdge = useStableCallback(patchEdge);
  const onSaveNode = useStableCallback(() => {
    if (selectedNodeId) void commitNodeEdit(selectedNodeId);
  });
  const onSaveEdge = useStableCallback(() => {
    if (selectedEdgeId) void commitEdgeEdit(selectedEdgeId);
  });
  const onDeleteSelectedNode = useStableCallback(() => void removeNode());
  const onDeleteSelectedEdge = useStableCallback(() => void removeEdge());
  const onMakeStartSelected = useStableCallback(() => {
    if (selectedNodeId) void makeStart(selectedNodeId);
  });

  /* ---------- рендер ---------- */

  if (loading || !graph)
    return (
      <main className="min-h-screen bg-zinc-50 p-8">
        <div className="mx-auto max-w-7xl rounded-2xl border bg-white p-8 text-sm text-black/50">
          {loading ? 'Загрузка редактора…' : message || 'Не удалось загрузить редактор.'}
        </div>
      </main>
    );

  const badge = SAVE_BADGE[saveState];

  return (
    <EditorActionsContext.Provider value={actions}>
      <main className="min-h-screen bg-zinc-50">
        <div className="border-b bg-white">
          <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4 px-5 py-3">
            <div className="flex items-center gap-4">
              <Link href={`/stories/${storyId}`} className="text-sm text-black/50 hover:text-black">
                ← История
              </Link>
              <div>
                <div className="font-semibold">{graph.story.title}</div>
                <div className="text-xs text-black/40">Визуальный редактор</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="tertiary"
                onPress={() => void undo()}
                isDisabled={busy || !canUndo}
              >
                ↶ Отменить
              </Button>
              <Button
                size="sm"
                variant="tertiary"
                onPress={() => void redo()}
                isDisabled={busy || !canRedo}
              >
                ↷ Повторить
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onPress={() => router.push(`/stories/${storyId}/playtest`)}
              >
                ▶ Playtest
              </Button>
              <span className="hidden text-xs text-black/35 sm:inline">
                Ctrl/Cmd+Z · Ctrl/Cmd+Shift+Z · Delete · C/V
              </span>
              <span className={`rounded-full px-2.5 py-1 text-[11px] ${badge.className}`}>
                {badge.text}
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1800px] px-5 py-5">
          <div className="grid h-[calc(100vh-105px)] min-h-[720px] grid-cols-[280px_minmax(0,1fr)_320px] overflow-hidden rounded-2xl border bg-white shadow-sm">
            <Sidebar
              storyId={storyId}
              busy={busy}
              nodeSearch={nodeSearch}
              variables={graph.variables}
              errors={validation.errors}
              warnings={validation.warnings}
              orphanCount={orphanEdges.length}
              onSearchChange={setNodeSearch}
              onAddNode={onAddNode}
              onAddVariable={onAddVariable}
              onUpdateVariable={onUpdateVariable}
              onDeleteVariable={onDeleteVariable}
              onCleanOrphans={onCleanOrphans}
              onError={setMessage}
            />

            <section className="relative min-w-0">
              <ReactFlow
                nodes={visibleNodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={(connection) => void onConnect(connection)}
                onReconnect={(oldEdge, connection) => void onReconnect(oldEdge, connection)}
                onNodeDragStart={onNodeDragStart}
                onNodeDragStop={onNodeDragStop}
                onNodeClick={(_, node) => {
                  setSelectedNodeId(node.id);
                  setSelectedEdgeId(null);
                  setContextMenu(null);
                }}
                onEdgeClick={(_, edge) => {
                  setSelectedEdgeId(edge.id);
                  setSelectedNodeId(null);
                  setContextMenu(null);
                }}
                onPaneClick={() => {
                  setSelectedNodeId(null);
                  setSelectedEdgeId(null);
                  setContextMenu(null);
                }}
                onPaneContextMenu={(event) =>
                  openContextMenu(
                    event,
                    reactFlow.screenToFlowPosition({ x: event.clientX, y: event.clientY }),
                  )
                }
                onNodeDoubleClick={(_, node) => {
                  setSelectedNodeId(node.id);
                  setSelectedEdgeId(null);
                  setEditingNodeId(node.id);
                }}
                onEdgeDoubleClick={(_, edge) => {
                  setSelectedEdgeId(edge.id);
                  setSelectedNodeId(null);
                  setEditingEdgeId(edge.id);
                }}
                onNodeContextMenu={(event, node) => openContextMenu(event, node.position, node.id)}
                onEdgeContextMenu={(event, edge) =>
                  openContextMenu(event, { x: 0, y: 0 }, undefined, edge.id)
                }
                onlyRenderVisibleElements
                snapToGrid
                snapGrid={[20, 20]}
                deleteKeyCode={null}
                defaultEdgeOptions={{ type: 'story', animated: false }}
                connectionLineStyle={{ strokeWidth: 2 }}
                className="bg-zinc-50"
              >
                <Background gap={20} size={1} />
                <Controls />
                <MiniMap pannable zoomable nodeStrokeWidth={3} />
                <Panel
                  position="top-left"
                  className="rounded-xl border bg-white/90 p-2 text-xs text-black/50 shadow-sm backdrop-blur"
                >
                  Потяни от <b>●</b> справа узла к <b>●</b> слева другого. ПКМ — контекстное меню.
                </Panel>
                <Panel
                  position="bottom-left"
                  className="rounded-xl border bg-white/90 px-3 py-2 text-[11px] text-black/45 shadow-sm backdrop-blur"
                >
                  Колёсико — масштаб · Space + drag — панорамирование · Ctrl/Cmd+Z — отмена
                </Panel>
              </ReactFlow>

              {contextMenu && (
                <ContextMenu
                  menu={contextMenu}
                  canPaste={!!clipboardNode}
                  onOpenNode={(id) => {
                    setSelectedNodeId(id);
                    setSelectedEdgeId(null);
                    setContextMenu(null);
                  }}
                  onCopyNode={(id) => {
                    setSelectedNodeId(id);
                    setSelectedEdgeId(null);
                    setContextMenu(null);
                    void copyNode(graphRef.current?.nodes.find((n) => n.id === id));
                  }}
                  onDeleteNode={(id) => {
                    const node = graphRef.current?.nodes.find((n) => n.id === id);
                    setContextMenu(null);
                    if (node) void removeNode(node);
                  }}
                  onOpenEdge={(id) => {
                    setSelectedEdgeId(id);
                    setSelectedNodeId(null);
                    setContextMenu(null);
                  }}
                  onDeleteEdge={(id) => {
                    const edge = graphRef.current?.edges.find((e) => e.id === id);
                    setContextMenu(null);
                    if (edge) void removeEdge(edge);
                  }}
                  onCreate={(type, position) => void createNodeAt(type, position)}
                  onPaste={(position) => {
                    setContextMenu(null);
                    void pasteNode(position);
                  }}
                />
              )}
            </section>

            <aside className="w-80 shrink-0 overflow-y-auto border-l bg-white p-5">
              {selectedNode && (
                <NodeInspector
                  key={selectedNode.id}
                  node={selectedNode}
                  busy={busy}
                  isStart={graph.story.startNodeId === selectedNode.id}
                  onPatch={onPatchNode}
                  onSave={onSaveNode}
                  onDelete={onDeleteSelectedNode}
                  onMakeStart={onMakeStartSelected}
                />
              )}
              {selectedEdge && (
                <EdgeInspector
                  key={selectedEdge.id}
                  edge={selectedEdge}
                  variables={graph.variables}
                  busy={busy}
                  onPatch={onPatchEdge}
                  onSave={onSaveEdge}
                  onDelete={onDeleteSelectedEdge}
                />
              )}
              {!selectedNode && !selectedEdge && (
                <div className="pt-8">
                  <div className="text-center">
                    <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-zinc-100 text-xl">
                      ⌁
                    </div>
                    <h2 className="mt-4 font-semibold">Редактор истории</h2>
                    <p className="mt-2 text-sm leading-6 text-black/45">
                      Выбери узел или связь. ПКМ по холсту создаёт узел в выбранной точке.
                    </p>
                  </div>
                  <div className="mt-8 rounded-xl border p-3">
                    <div className="text-xs font-semibold">Диагностика</div>
                    {validation.errors.length === 0 && validation.warnings.length === 0 ? (
                      <div className="mt-2 text-xs text-emerald-700">
                        Граф выглядит согласованным.
                      </div>
                    ) : (
                      <div className="mt-2 grid gap-2 text-xs text-black/55">
                        {[
                          ...validation.errors.map((x) => `Ошибка: ${x}`),
                          ...validation.warnings.map((x) => `Предупреждение: ${x}`),
                        ].map((item, index) => (
                          <div key={index}>• {item}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {message && (
                <p className="mt-6 rounded-xl bg-zinc-100 p-3 text-xs leading-5 text-black/60">
                  {message}
                </p>
              )}
            </aside>
          </div>
        </div>
      </main>
    </EditorActionsContext.Provider>
  );
}
