'use client';

import { useEffect, useState } from 'react';
import { Button, Input, TextArea } from '@heroui/react';
import { errorText } from '@/features/stories/lib/error-text';
import type { NewStoryValues } from '@/features/stories/types/story-list.types';

type Props = {
  onClose: () => void;
  /** Должен бросить ошибку, если создание не удалось; при успехе родитель закрывает диалог. */
  onCreate: (values: NewStoryValues) => Promise<void>;
};

/** Монтируется только пока открыт — поэтому форма каждый раз чистая. */
export function CreateStoryDialog({ onClose, onCreate }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Escape закрывает (но не во время создания), фон страницы не скроллится
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, saving]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  async function submit() {
    if (saving) return;
    if (!title.trim()) {
      setError('Укажи название истории.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onCreate({ title, description });
    } catch (e) {
      setError(errorText(e, 'Не удалось создать историю.'));
      setSaving(false);
    }
    // при успехе родитель размонтирует диалог — состояние сбрасывать не нужно
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-story-title"
        className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl"
      >
        <h2 id="create-story-title" className="text-2xl font-semibold">
          Новая история
        </h2>
        <p className="mt-1 text-sm text-black/50">Название и описание можно изменить позже.</p>
        <div className="mt-6 grid gap-4">
          <Input
            autoFocus
            aria-label="Название"
            placeholder="Название"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void submit();
              }
            }}
            disabled={saving}
            maxLength={200}
          />
          <TextArea
            aria-label="Описание"
            placeholder="Описание (необязательно)"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={saving}
            maxLength={1000}
          />
        </div>
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}
        <div className="mt-7 flex justify-end gap-3">
          <Button variant="ghost" isDisabled={saving} onPress={onClose}>
            Отмена
          </Button>
          <Button variant="primary" isDisabled={saving} onPress={() => void submit()}>
            {saving ? 'Создание…' : 'Создать'}
          </Button>
        </div>
      </div>
    </div>
  );
}
