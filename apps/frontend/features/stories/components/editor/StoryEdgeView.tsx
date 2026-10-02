'use client';

import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import { useEditorActions } from '@/features/stories/lib/editor/editor-actions';
import type { FlowEdge } from '@/features/stories/types/editor.types';
import { DraftNativeInput } from './DraftFields';

export const StoryEdgeView = memo(function StoryEdgeView({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps<FlowEdge>) {
  const actions = useEditorActions();
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  if (!data) return null;
  const edge = data.storyEdge;

  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-auto absolute"
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
          onDoubleClick={(event) => {
            event.stopPropagation();
            actions.startEditEdge(id);
          }}
        >
          {data.isEditing ? (
            <DraftNativeInput
              autoFocus
              value={edge.label ?? ''}
              className="w-40 rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs shadow-md outline-none"
              placeholder="Название перехода"
              onValueChange={(value) => actions.patchEdge(id, { label: value })}
              onCommit={() => actions.commitEdge(id)}
            />
          ) : (
            <button
              type="button"
              className={`rounded-md border bg-white/95 px-2 py-1 text-xs shadow-sm hover:bg-zinc-50 ${edge.label ? 'text-zinc-600' : 'text-zinc-400'}`}
              onClick={(event) => {
                event.stopPropagation();
                actions.startEditEdge(id);
              }}
            >
              {edge.label || 'Без названия'}
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
