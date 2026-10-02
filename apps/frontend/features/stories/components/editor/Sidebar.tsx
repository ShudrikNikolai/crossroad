'use client';

import { memo, useState } from 'react';
import { Button, Input } from '@heroui/react';
import type { NodeType, StoryVariable, VariableType } from '@/features/stories/types/story.types';
import { nodeMeta } from '@/features/stories/lib/editor/constants';
import type { VariableDraft } from '@/features/stories/types/editor.types';
import { DraftInput } from './DraftFields';
import { EditorSelect } from './EditorSelect';
import { VariableRow } from './VariableRow';

type Props = {
  storyId: string;
  busy: boolean;
  nodeSearch: string;
  variables: StoryVariable[];
  errors: string[];
  warnings: string[];
  orphanCount: number;
  onSearchChange: (value: string) => void;
  onAddNode: (type: NodeType) => void;
  onAddVariable: (draft: VariableDraft) => Promise<boolean>;
  onUpdateVariable: (variable: StoryVariable) => void;
  onDeleteVariable: (key: string) => void;
  onCleanOrphans: () => void;
  onError: (message: string) => void;
};

export const Sidebar = memo(function Sidebar({
  storyId,
  busy,
  nodeSearch,
  variables,
  errors,
  warnings,
  orphanCount,
  onSearchChange,
  onAddNode,
  onAddVariable,
  onUpdateVariable,
  onDeleteVariable,
  onCleanOrphans,
  onError,
}: Props) {
  const [draft, setDraft] = useState<VariableDraft>({ key: '', type: 'string', value: '' });

  return (
    <aside className="overflow-y-auto border-r bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-black/35">Добавить узел</p>
      <div className="mt-3 grid gap-2">
        {(Object.keys(nodeMeta) as NodeType[]).map((type) => (
          <button
            key={type}
            disabled={busy}
            onClick={() => onAddNode(type)}
            className={`rounded-xl border p-3 text-left transition hover:-translate-y-px disabled:opacity-50 ${nodeMeta[type].className}`}
          >
            <div className="text-sm font-semibold">{nodeMeta[type].label}</div>
            <div className="mt-1 text-xs text-black/50">{nodeMeta[type].description}</div>
          </button>
        ))}
      </div>
      <div className="mt-5 rounded-xl bg-zinc-50 p-3 text-xs leading-5 text-black/50">
        ПКМ по пустому месту — создать узел прямо там. ПКМ по узлу — действия с узлом.
      </div>
      <div className="mt-3">
        <DraftInput
          aria-label="Поиск узла"
          placeholder="название, текст, ID, говорящий…"
          value={nodeSearch}
          onValueChange={onSearchChange}
        />
      </div>

      {orphanCount > 0 && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
          <div className="text-xs font-semibold text-red-800">Битые связи: {orphanCount}</div>
          <div className="mt-1 text-[11px] leading-5 text-red-900/70">
            Эти связи ссылаются на несуществующие узлы. Они скрыты в редакторе, но остаются в
            базе и могут ломать обновление других связей.
          </div>
          <Button size="sm" variant="danger" className="mt-2" onPress={onCleanOrphans} isDisabled={busy}>
            Удалить из базы
          </Button>
        </div>
      )}

      <div className="mt-3 rounded-xl border bg-zinc-50 p-3">
        <div className="text-xs font-semibold">Проверка графа</div>
        <div className="mt-2 text-[11px] leading-5 text-black/55">
          Ошибок: {errors.length} · Предупреждений: {warnings.length}
        </div>
        {[...errors, ...warnings].slice(0, 4).map((item, index) => (
          <div key={index} className="mt-1 text-[11px] text-black/50">
            • {item}
          </div>
        ))}
      </div>

      <div className="my-6 h-px bg-black/10" />
      <p className="text-xs font-semibold uppercase tracking-wider text-black/35">Переменные</p>
      <div className="mt-3 grid gap-2">
        <Input
          aria-label="Ключ"
          placeholder="player_name"
          value={draft.key}
          onChange={(event) => setDraft({ ...draft, key: event.target.value })}
        />
        <EditorSelect
          label="Тип"
          value={draft.type}
          onChange={(value) => setDraft({ ...draft, type: value as VariableType })}
          options={[
            { id: 'string', label: 'string' },
            { id: 'number', label: 'number' },
            { id: 'boolean', label: 'boolean' },
          ]}
        />
        <Input
          aria-label="Значение"
          value={draft.value}
          onChange={(event) => setDraft({ ...draft, value: event.target.value })}
        />
        <Button
          size="sm"
          onPress={async () => {
            if (await onAddVariable(draft)) setDraft({ key: '', type: 'string', value: '' });
          }}
          isDisabled={busy || !draft.key.trim()}
        >
          Добавить
        </Button>
      </div>
      <div className="mt-4 grid gap-2">
        {variables.map((variable) => (
          <VariableRow
            key={variable.key}
            variable={variable}
            storyId={storyId}
            onUpdate={onUpdateVariable}
            onDelete={onDeleteVariable}
            onError={onError}
          />
        ))}
      </div>
    </aside>
  );
});
