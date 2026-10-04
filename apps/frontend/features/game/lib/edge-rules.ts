export function selectAvailableEdges<E extends { conditions?: unknown }>(
  nodeType: string | undefined,
  outgoing: E[],
  matches: (edge: E) => boolean,
): E[] {
  if (nodeType !== 'condition') return outgoing.filter(matches);

  const hasConditions = (edge: E) => Array.isArray(edge.conditions) && edge.conditions.length > 0;
  const matched = outgoing.filter((edge) => hasConditions(edge) && matches(edge));
  if (matched.length > 0) return matched;

  const fallback = outgoing.find((edge) => !hasConditions(edge));
  return fallback ? [fallback] : [];
}
