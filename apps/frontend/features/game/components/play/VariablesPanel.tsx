'use client';

import { memo, useEffect, useRef, useState } from 'react';
import type { GameVariables } from '@/features/game/lib/local-runtime';
import { parseNumberInput } from '@/features/game/lib/variables';

type Value = string | number | boolean;

const inputClass =
  'mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/30';

const VariableField = memo(function VariableField({
  name,
  value,
  onChange,
}: {
  name: string;
  value: Value;
  onChange: (key: string, value: Value) => void;
}) {
  const kind = typeof value;
  const [draft, setDraft] = useState(String(value));
  const draftRef = useRef(draft);
  draftRef.current = draft;

  // внешнее изменение (загрузка слота) подтягиваем, только если оно не совпадает с введённым
  useEffect(() => {
    const current = kind === 'number' ? parseNumberInput(draftRef.current) : draftRef.current;
    if (current !== value) setDraft(String(value));
  }, [value, kind]);

  return (
    <label className="block rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <span className="text-xs text-white/40">{name}</span>
      {kind === 'boolean' ? (
        <select
          value={String(value)}
          onChange={(event) => onChange(name, event.target.value === 'true')}
          className={inputClass}
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      ) : (
        <input
          value={draft}
          inputMode={kind === 'number' ? 'decimal' : undefined}
          onChange={(event) => {
            const text = event.target.value;
            setDraft(text);
            if (kind === 'number') {
              const parsed = parseNumberInput(text);
              if (parsed !== null) onChange(name, parsed);
            } else {
              onChange(name, text);
            }
          }}
          className={inputClass}
        />
      )}
    </label>
  );
});

export function VariablesPanel({
  variables,
  onChange,
}: {
  variables: GameVariables;
  onChange: (key: string, value: Value) => void;
}) {
  const entries = Object.entries(variables);
  return (
    <div className="mt-6 space-y-3">
      {entries.map(([key, value]) => (
        <VariableField key={key} name={key} value={value} onChange={onChange} />
      ))}
      {entries.length === 0 && (
        <p className="text-sm text-white/35">В этой истории нет переменных.</p>
      )}
      <p className="pt-2 text-xs leading-5 text-white/30">
        Это локальные переменные MVP. Изменение сразу пересчитывает Condition-ветки.
      </p>
    </div>
  );
}
