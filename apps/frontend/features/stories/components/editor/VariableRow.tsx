'use client';

import { memo, useState } from 'react';
import { Button, Input } from '@heroui/react';
import { deleteVariable, updateVariable } from '@/features/stories/api/graph';
import type { StoryVariable } from '@/features/stories/types/story.types';
import { errorText } from '@/features/stories/lib/editor/helpers';

export const VariableRow = memo(function VariableRow({
  variable,
  storyId,
  onUpdate,
  onDelete,
  onError,
}: {
  variable: StoryVariable;
  storyId: string;
  onUpdate: (variable: StoryVariable) => void;
  onDelete: (key: string) => void;
  onError: (message: string) => void;
}) {
  const [value, setValue] = useState(String(variable.defaultValue));
  return (
    <div className="rounded-xl border bg-zinc-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <code className="truncate text-xs font-medium">{variable.key}</code>
        <span className="text-[10px] text-black/35">{variable.type}</span>
      </div>
      <div className="mt-2 flex gap-2">
        <Input
          aria-label={`Значение ${variable.key}`}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <Button
          size="sm"
          onPress={async () => {
            try {
              const nextValue =
                variable.type === 'number'
                  ? Number(value)
                  : variable.type === 'boolean'
                    ? value === 'true'
                    : value;
              const next = await updateVariable(storyId, variable.key, {
                type: variable.type,
                defaultValue: nextValue,
              });
              onUpdate(next);
            } catch (error) {
              onError(errorText(error, 'Не удалось обновить переменную.'));
            }
          }}
        >
          OK
        </Button>
      </div>
      <button
        className="mt-2 text-[11px] text-red-600"
        onClick={async () => {
          try {
            await deleteVariable(storyId, variable.key);
            onDelete(variable.key);
          } catch (error) {
            onError(errorText(error, 'Не удалось удалить переменную.'));
          }
        }}
      >
        Удалить
      </button>
    </div>
  );
});
