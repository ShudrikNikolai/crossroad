'use client';

import { memo, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals, type NodeProps } from '@xyflow/react';
import type { StoryCondition } from '@/features/stories/types/story.types';
import { nodeMeta } from '@/features/stories/lib/editor/constants';
import { branchHandleId, nodeTitle } from '@/features/stories/lib/editor/helpers';
import { useEditorActions } from '@/features/stories/lib/editor/editor-actions';
import type { FlowNode } from '@/features/stories/types/editor.types';
import { DraftNativeInput, DraftNativeTextArea } from './DraftFields';

const conditionLabel = (condition: StoryCondition) =>
  `${condition.variableKey || 'переменная'} ${condition.operator} ${String(condition.value)}`;

export const StoryNodeView = memo(function StoryNodeView({ id, data }: NodeProps<FlowNode>) {
  const actions = useEditorActions();
  const updateNodeInternals = useUpdateNodeInternals();

  const { storyNode, outgoingEdges: branches, variables } = data;
  const meta = nodeMeta[storyNode.type];
  const text = storyNode.content.text;
  const isChoice = storyNode.type === 'choice';
  const isCondition = storyNode.type === 'condition';
  const hasBranches = isChoice || isCondition;

  // Handle-ы у ветвящихся узлов динамические — просим React Flow перечитать их.
  const branchKey = branches.map((edge) => edge.id).join('|');
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, storyNode.type, branchKey, updateNodeInternals]);

  return (
    <div
      className={`relative min-w-[270px] max-w-[350px] overflow-visible rounded-2xl border bg-white shadow-sm ${meta.className}`}
      onDoubleClick={(event) => {
        event.stopPropagation();
        actions.startEditNode(id);
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        className="!size-3 !border-2 !border-white !bg-zinc-500"
      />

      <div className="flex items-center justify-between gap-2 rounded-t-2xl border-b bg-white/70 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`size-2 shrink-0 rounded-full ${meta.accent}`} />
          <span className="truncate text-sm font-semibold text-zinc-900">
            {nodeTitle(storyNode)}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
            {meta.label}
          </span>
          {data.isStart && (
            <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-white">
              START
            </span>
          )}
        </div>
      </div>

      <div className="px-4 py-3">
        {data.isEditing ? (
          <DraftNativeTextArea
            autoFocus
            value={text}
            rows={4}
            className="nodrag nowheel w-full resize-none rounded-lg border border-zinc-200 bg-white p-2 text-sm leading-5 outline-none focus:border-zinc-400"
            placeholder={storyNode.type === 'end' ? 'Конец истории' : 'Текст узла…'}
            onValueChange={(value) => actions.patchNode(id, { content: { text: value } })}
            onCommit={() => actions.commitNode(id)}
          />
        ) : (
          <div className="line-clamp-3 text-sm leading-5 text-zinc-800">
            {text ||
              (isChoice
                ? 'Выбери действие игрока'
                : isCondition
                  ? 'Проверка переменных'
                  : 'Двойной клик — редактировать')}
          </div>
        )}
        {storyNode.content.speaker && (
          <div className="mt-1.5 text-xs text-zinc-500">{storyNode.content.speaker}</div>
        )}
      </div>

      {hasBranches ? (
        <div
          className={`${isChoice ? 'bg-violet-50/70' : 'bg-amber-50/80'} rounded-b-2xl border-t px-3 py-2.5`}
        >
          <div
            className={`mb-1.5 text-[10px] font-semibold uppercase tracking-wider ${isChoice ? 'text-violet-700' : 'text-amber-700'}`}
          >
            {isChoice ? 'Варианты — отдельные выходы' : 'Условия — отдельные выходы'}
          </div>

          {branches.length ? (
            <div className="grid gap-1.5">
              {branches.map((edge, index) => (
                <div
                  key={edge.id}
                  className="relative mr-2 rounded-md bg-white/85 px-2.5 py-2 text-xs text-zinc-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                >
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={branchHandleId(edge.id)}
                    className={`!right-[-18px] !top-1/2 !size-3 !-translate-y-1/2 !border-2 !border-white ${isChoice ? '!bg-violet-500' : '!bg-amber-500'}`}
                  />
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={`grid size-5 shrink-0 place-items-center rounded-full text-[9px] font-bold ${isChoice ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'}`}
                    >
                      {isChoice ? index + 1 : String.fromCharCode(65 + index)}
                    </span>
                    <DraftNativeInput
                      className="nodrag nowheel min-w-0 flex-1 truncate border-0 bg-transparent p-0 text-xs font-medium outline-none focus:ring-0"
                      value={edge.label ?? ''}
                      placeholder={isChoice ? `Вариант ${index + 1}` : `Ветка ${index + 1}`}
                      onValueChange={(value) => actions.patchEdge(edge.id, { label: value })}
                      onCommit={() => actions.commitEdge(edge.id)}
                    />
                    <button
                      type="button"
                      className="nodrag shrink-0 rounded px-1 text-[10px] text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                      onClick={(event) => {
                        event.stopPropagation();
                        actions.selectEdge(edge.id);
                      }}
                    >
                      ⚙
                    </button>
                    <button
                      type="button"
                      className="nodrag shrink-0 rounded px-1 text-[10px] text-zinc-400 hover:bg-red-50 hover:text-red-600"
                      onClick={(event) => {
                        event.stopPropagation();
                        actions.deleteEdge(edge.id);
                      }}
                    >
                      ×
                    </button>
                  </div>
                  {isCondition &&
                    (edge.conditions?.length ? (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1 pl-7">
                        {edge.conditions.map((condition, conditionIndex) => (
                          <button
                            key={conditionIndex}
                            type="button"
                            className="nodrag rounded bg-amber-100 px-1.5 py-0.5 text-left text-[9px] text-amber-800 hover:bg-amber-200"
                            onClick={(event) => {
                              event.stopPropagation();
                              actions.selectEdge(edge.id);
                            }}
                          >
                            {conditionLabel(condition)}
                          </button>
                        ))}
                        {variables.length > 0 && (
                          <button
                            type="button"
                            className="nodrag rounded px-1 text-[9px] text-amber-700 hover:bg-amber-100"
                            onClick={(event) => {
                              event.stopPropagation();
                              actions.addCondition(edge.id);
                            }}
                          >
                            + условие
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center gap-2 pl-7 text-[10px] text-zinc-400">
                        <span>Без условия</span>
                        {variables.length > 0 && (
                          <button
                            type="button"
                            className="nodrag rounded px-1 text-amber-700 hover:bg-amber-100"
                            onClick={(event) => {
                              event.stopPropagation();
                              actions.addCondition(edge.id);
                            }}
                          >
                            + добавить
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-zinc-400">Пока нет веток</div>
          )}

          <div className="relative mt-2 mr-2 rounded-md border border-dashed bg-white/45 px-2.5 py-1.5 text-[10px] text-zinc-400">
            <Handle
              type="source"
              position={Position.Right}
              id="out-new"
              className={`!right-[-18px] !top-1/2 !size-3 !-translate-y-1/2 !border-2 !border-white ${isChoice ? '!bg-violet-300' : '!bg-amber-300'}`}
            />
            Перетащи отсюда, чтобы добавить новую ветку
          </div>
        </div>
      ) : (
        <Handle
          type="source"
          position={Position.Right}
          id="out"
          className="!size-3 !border-2 !border-white !bg-zinc-500"
        />
      )}
    </div>
  );
});
