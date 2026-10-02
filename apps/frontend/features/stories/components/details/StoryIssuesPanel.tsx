'use client';

import type { StoryIssue } from '@/features/stories/lib/validate-story';

export function StoryIssuesPanel({
  issues,
  errorCount,
  warningCount,
}: {
  issues: StoryIssue[];
  errorCount: number;
  warningCount: number;
}) {
  const badge = errorCount
    ? { text: `${errorCount} ошибок`, className: 'bg-red-100 text-red-700' }
    : warningCount
      ? { text: `${warningCount} предупреждений`, className: 'bg-amber-100 text-amber-700' }
      : { text: 'Готово к публикации', className: 'bg-emerald-100 text-emerald-700' };

  return (
    <section className="mt-5 rounded-3xl border bg-white p-7">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Проверка публикации</h2>
          <p className="mt-1 text-sm text-black/50">
            Перед публикацией Crossroad проверяет граф и условия.
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}>
          {badge.text}
        </span>
      </div>
      <div className="mt-5 space-y-2">
        {issues.length === 0 && <p className="text-sm text-emerald-700">Граф корректен.</p>}
        {issues.map((issue, index) => (
          <div
            key={`${issue.message}-${index}`}
            className={`rounded-2xl px-4 py-3 text-sm ${issue.severity === 'error' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}
          >
            <b>{issue.severity === 'error' ? 'Ошибка' : 'Предупреждение'}:</b> {issue.message}
          </div>
        ))}
      </div>
    </section>
  );
}
