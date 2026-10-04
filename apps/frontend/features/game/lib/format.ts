const NODE_LABELS: Record<string, string> = {
  scene: 'Сцена',
  choice: 'Выбор',
  condition: 'Условие',
  end: 'Финал',
};

export const nodeLabel = (type: string) => NODE_LABELS[type] ?? type;

export function formatSlotDate(value?: string) {
  if (!value) return 'Пусто';
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function initials(value?: string) {
  if (!value) return '?';
  return (
    value
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?'
  );
}
