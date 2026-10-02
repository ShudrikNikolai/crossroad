'use client';

import { memo } from 'react';
import { Button } from '@heroui/react';
import type {
  ConditionOperator,
  StoryCondition,
  StoryEdge,
  StoryVariable,
  VariableType,
} from '@/features/stories/types/story.types';
import type { EdgePatch } from '@/features/stories/types/editor.types';
import { DraftInput } from './DraftFields';
import { EditorSelect } from './EditorSelect';

function coerceValue(value: string, type: VariableType): string | number | boolean {
  if (type === 'number') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (type === 'boolean') return value === 'true';
  return value;
}

export const EdgeInspector = memo(function EdgeInspector({
  edge,
  variables,
  busy,
  onPatch,
  onSave,
  onDelete,
}: {
  edge: StoryEdge;
  variables: StoryVariable[];
  busy: boolean;
  onPatch: (id: string, patch: EdgePatch) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const id = edge.id;
  const conditions = edge.conditions ?? [];
  const variableByKey = (key: string) => variables.find((variable) => variable.key === key);

  function changeCondition(index: number, patch: Partial<StoryCondition>) {
    onPatch(id, {
      conditions: conditions.map((condition, i) =>
        i === index ? { ...condition, ...patch } : condition,
      ),
    });
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-black/35">Связь</p>
      <h2 className="mt-1 font-semibold">Переход</h2>
      <div className="mt-6 grid gap-4">
        <DraftInput
          aria-label="Название выбора"
          placeholder="Название выбора"
          value={edge.label ?? ''}
          onValueChange={(value) => onPatch(id, { label: value })}
          maxLength={200}
        />
        <div>
          <div className="mb-2 text-sm font-medium">Условия</div>
          <div className="grid gap-3">
            {conditions.map((condition, index) => {
              const variable = variableByKey(condition.variableKey);
              const valueType: VariableType =
                variable?.type ??
                (typeof condition.value === 'number'
                  ? 'number'
                  : typeof condition.value === 'boolean'
                    ? 'boolean'
                    : 'string');
              const operators =
                valueType === 'number' ? ['eq', 'neq', 'gt', 'gte', 'lt', 'lte'] : ['eq', 'neq'];
              return (
                <div key={index} className="rounded-xl border p-3">
                  <EditorSelect
                    label="Переменная"
                    value={variable?.key}
                    onChange={(key) => {
                      const next = variableByKey(key);
                      changeCondition(index, {
                        variableKey: key,
                        operator:
                          next?.type === 'number' ||
                          condition.operator === 'eq' ||
                          condition.operator === 'neq'
                            ? condition.operator
                            : 'eq',
                        value: next ? next.defaultValue : condition.value,
                      });
                    }}
                    options={variables.map((item) => ({ id: item.key, label: item.key }))}
                  />
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <EditorSelect
                      label="Оператор"
                      value={operators.includes(condition.operator) ? condition.operator : 'eq'}
                      onChange={(value) =>
                        changeCondition(index, { operator: value as ConditionOperator })
                      }
                      options={operators.map((op) => ({ id: op, label: op }))}
                    />
                    {valueType === 'boolean' ? (
                      <EditorSelect
                        label="Значение"
                        value={String(condition.value)}
                        onChange={(value) => changeCondition(index, { value: value === 'true' })}
                        options={[
                          { id: 'true', label: 'true' },
                          { id: 'false', label: 'false' },
                        ]}
                      />
                    ) : (
                      <DraftInput
                        type={valueType === 'number' ? 'number' : 'text'}
                        aria-label="Значение"
                        value={String(condition.value)}
                        onValueChange={(value) =>
                          changeCondition(index, { value: coerceValue(value, valueType) })
                        }
                      />
                    )}
                  </div>
                  <button
                    className="mt-2 text-xs text-red-600"
                    onClick={() =>
                      onPatch(id, { conditions: conditions.filter((_, i) => i !== index) })
                    }
                  >
                    Удалить условие
                  </button>
                </div>
              );
            })}
          </div>
          <Button
            size="sm"
            className="mt-3"
            onPress={() =>
              onPatch(id, {
                conditions: [
                  ...conditions,
                  {
                    variableKey: variables[0]?.key ?? '',
                    operator: 'eq',
                    value: variables[0]?.defaultValue ?? '',
                  },
                ],
              })
            }
            isDisabled={!variables.length}
          >
            + Условие
          </Button>
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-amber-50 p-3 text-[11px] leading-5 text-amber-900/70">
        Несколько условий на одной ветке выполняются как AND. Если ни одна условная ветка не
        подошла, runtime использует первую безусловную ветку как ELSE.
      </div>
      <div className="mt-6 grid gap-2">
        <Button variant="primary" onPress={onSave} isDisabled={busy}>
          Сохранить
        </Button>
        <Button variant="danger" onPress={onDelete} isDisabled={busy}>
          Удалить связь
        </Button>
      </div>
    </div>
  );
});
