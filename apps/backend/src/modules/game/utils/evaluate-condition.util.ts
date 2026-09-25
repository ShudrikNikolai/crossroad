import type { TEdgeCondition } from '@crossroad/schemas';

export function evaluateCondition(
  condition: TEdgeCondition,
  variables: Record<string, string | number | boolean>,
): boolean {
  const actual = variables[condition.variableKey];
  const expected = condition.value;

  switch (condition.operator) {
    case 'eq':
      return actual === expected;
    case 'neq':
      return actual !== expected;
    case 'gt':
      return (
        typeof actual === 'number' &&
        typeof expected === 'number' &&
        actual > expected
      );
    case 'gte':
      return (
        typeof actual === 'number' &&
        typeof expected === 'number' &&
        actual >= expected
      );
    case 'lt':
      return (
        typeof actual === 'number' &&
        typeof expected === 'number' &&
        actual < expected
      );
    case 'lte':
      return (
        typeof actual === 'number' &&
        typeof expected === 'number' &&
        actual <= expected
      );
  }
}

export function evaluateConditions(
  conditions: TEdgeCondition[] | undefined,
  variables: Record<string, string | number | boolean>,
): boolean {
  if (!conditions || conditions.length === 0) return true;
  return conditions.every((condition) =>
    evaluateCondition(condition, variables),
  );
}
