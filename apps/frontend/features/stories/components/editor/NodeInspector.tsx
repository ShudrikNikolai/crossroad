'use client';

import { memo } from 'react';
import { Button } from '@heroui/react';
import type { NodeType, StoryNode } from '@/features/stories/types/story.types';
import { NODE_TYPE_OPTIONS, nodeMeta } from '@/features/stories/lib/editor/constants';
import { nodeTitle } from '@/features/stories/lib/editor/helpers';
import type { NodePatch } from '@/features/stories/types/editor.types';
import { DraftInput, DraftTextArea } from './DraftFields';
import { EditorSelect } from './EditorSelect';

export const NodeInspector = memo(function NodeInspector({
  node,
  busy,
  isStart,
  onPatch,
  onSave,
  onDelete,
  onMakeStart,
}: {
  node: StoryNode;
  busy: boolean;
  isStart: boolean;
  onPatch: (id: string, patch: NodePatch) => void;
  onSave: () => void;
  onDelete: () => void;
  onMakeStart: () => void;
}) {
  const id = node.id;
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-black/35">Узел</p>
          <h2 className="mt-1 font-semibold">{nodeTitle(node)}</h2>
        </div>
        <code className="max-w-28 truncate text-[10px] text-black/35">{node.id}</code>
      </div>
      <div className="mt-6 grid gap-4">
        <DraftInput
          aria-label="Название"
          placeholder={nodeMeta[node.type].label}
          value={node.content.title ?? ''}
          onValueChange={(value) => onPatch(id, { content: { title: value } })}
          maxLength={100}
        />
        <EditorSelect
          label="Тип"
          value={node.type}
          onChange={(value) => onPatch(id, { type: value as NodeType })}
          options={NODE_TYPE_OPTIONS}
        />
        <DraftInput
          aria-label="Говорящий"
          placeholder="Говорящий"
          value={node.content.speaker ?? ''}
          onValueChange={(value) => onPatch(id, { content: { speaker: value } })}
          maxLength={100}
        />
        <DraftTextArea
          aria-label="Текст"
          placeholder="Текст"
          value={node.content.text}
          onValueChange={(value) => onPatch(id, { content: { text: value } })}
          maxLength={5000}
          rows={7}
        />
        <DraftInput
          aria-label="Media key"
          placeholder="Media key"
          value={node.content.mediaKey ?? ''}
          onValueChange={(value) => onPatch(id, { content: { mediaKey: value } })}
        />
      </div>
      <div className="mt-6 grid gap-2">
        <Button variant="primary" onPress={onSave} isDisabled={busy}>
          Сохранить
        </Button>
        <Button onPress={onMakeStart} isDisabled={busy}>
          {isStart ? 'Стартовый узел' : 'Сделать стартовым'}
        </Button>
        <Button variant="danger" onPress={onDelete} isDisabled={busy}>
          Удалить узел
        </Button>
      </div>
    </div>
  );
});
