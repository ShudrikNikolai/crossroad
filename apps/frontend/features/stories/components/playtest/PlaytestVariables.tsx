'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { Input } from '@heroui/react';
import type { GameVariables } from '@/features/game/lib/local-runtime';
import type { StoryVariable } from '@/features/stories/types/story.types';

const parseNumber = (text: string) => {
  const value = Number(text);
  return text.trim() !== '' && Number.isFinite(value) ? value : null;
};

const VariableField = memo(function VariableField({
  variable,
  value,
  onChange,
}: {
  variable: StoryVariable;
  value: string | number | boolean;
  onChange: (key: string, value: string | number | boolean) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    const current = variable.type === 'number' ? parseNumber(draftRef.current) : draftRef.current;
    if (current !== value) setDraft(String(value));
  }, [value, variable.type]);

  return (
    <div>
      <div className="mb-1 flex justify-between gap-2 text-xs">
        <code>{variable.key}</code>
        <span className="text-white/30">{variable.type}</span>
      </div>
      {variable.type === 'boolean' ? (
        <select
          aria-label={variable.key}
          value={String(value)}
          onChange={(event) => onChange(variable.key, event.target.value === 'true')}
          className="w-full rounded-lg border border-white/10 bg-zinc-900 px-2 py-2 text-xs text-white"
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      ) : (
        <Input
          aria-label={variable.key}
          inputMode={variable.type === 'number' ? 'decimal' : undefined}
          value={draft}
          onChange={(event) => {
            const text = event.target.value;
            setDraft(text);
            if (variable.type === 'number') {
              const parsed = parseNumber(text);
              if (parsed !== null) onChange(variable.key, parsed);
            } else {
              onChange(variable.key, text);
            }
          }}
        />
      )}
    </div>
  );
});

export function PlaytestVariables({
  variables,
  values,
  onChange,
}: {
  variables: StoryVariable[];
  values: GameVariables;
  onChange: (key: string, value: string | number | boolean) => void;
}) {
  return (
    <aside className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/35">
        Локальные переменные
      </div>
      <div className="mt-4 grid gap-3">
        {variables.map((variable) => (
          <VariableField
            key={variable.key}
            variable={variable}
            value={values[variable.key] ?? variable.defaultValue}
            onChange={onChange}
          />
        ))}
      </div>
      <p className="mt-5 text-[11px] leading-5 text-white/35">
        Переменные playtest локальные и не меняют данные Story на сервере.
      </p>
    </aside>
  );
}
