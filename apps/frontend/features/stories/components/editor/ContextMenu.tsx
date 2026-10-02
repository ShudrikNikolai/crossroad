'use client';

import type { XYPosition } from '@xyflow/react';
import type { NodeType } from '@/features/stories/types/story.types';
import { nodeMeta } from '@/features/stories/lib/editor/constants';
import type { ContextMenuState } from '@/features/stories/types/editor.types';

type Props = {
  menu: ContextMenuState;
  canPaste: boolean;
  onOpenNode: (nodeId: string) => void;
  onCopyNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onOpenEdge: (edgeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onCreate: (type: NodeType, position: XYPosition) => void;
  onPaste: (position: XYPosition) => void;
};

const item = 'block w-full rounded-lg px-3 py-2 text-left hover:bg-zinc-100';
const danger = 'block w-full rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50';

export function ContextMenu({
  menu,
  canPaste,
  onOpenNode,
  onCopyNode,
  onDeleteNode,
  onOpenEdge,
  onDeleteEdge,
  onCreate,
  onPaste,
}: Props) {
  return (
    <div
      className="fixed z-50 min-w-52 rounded-xl border bg-white p-1.5 text-sm shadow-xl"
      style={{ left: menu.x, top: menu.y }}
      onClick={(event) => event.stopPropagation()}
    >
      {menu.nodeId ? (
        <>
          <button className={item} onClick={() => onOpenNode(menu.nodeId!)}>
            Открыть инспектор
          </button>
          <button className={item} onClick={() => onCopyNode(menu.nodeId!)}>
            Копировать узел
          </button>
          <button className={danger} onClick={() => onDeleteNode(menu.nodeId!)}>
            Удалить узел
          </button>
        </>
      ) : menu.edgeId ? (
        <>
          <button className={item} onClick={() => onOpenEdge(menu.edgeId!)}>
            Редактировать связь
          </button>
          <button className={danger} onClick={() => onDeleteEdge(menu.edgeId!)}>
            Удалить связь
          </button>
        </>
      ) : (
        <>
          <div className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-black/35">
            Создать здесь
          </div>
          {(Object.keys(nodeMeta) as NodeType[]).map((type) => (
            <button key={type} className={item} onClick={() => onCreate(type, menu.flowPosition)}>
              {nodeMeta[type].label}
            </button>
          ))}
          <div className="my-1 h-px bg-black/10" />
          <button
            disabled={!canPaste}
            className={`${item} disabled:cursor-not-allowed disabled:opacity-40`}
            onClick={() => onPaste(menu.flowPosition)}
          >
            Вставить узел
          </button>
        </>
      )}
    </div>
  );
}
