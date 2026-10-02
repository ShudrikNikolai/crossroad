'use client';

import { useState } from 'react';
import { Button, Input, TextArea } from '@heroui/react';
import type { Story } from '@/features/stories/types/story.types';
import type {
  StoryNotice,
  StorySettingsValues,
} from '@/features/stories/types/story-details.types';

type Props = {
  story: Story;
  published: boolean;
  saving: boolean;
  notice: StoryNotice | null;
  onSave: (values: StorySettingsValues) => void;
};

/** Черновик полей живёт здесь; родитель пересоздаёт форму (key) после сохранения. */
export function StorySettingsForm({ story, published, saving, notice, onSave }: Props) {
  const [title, setTitle] = useState(story.title);
  const [description, setDescription] = useState(story.description ?? '');

  const dirty = title.trim() !== story.title || description.trim() !== (story.description ?? '');
  const canSave = dirty && title.trim().length > 0 && !saving;
  const locked = published || saving;

  return (
    <section className="mt-8 rounded-3xl border bg-white p-7">
      <h2 className="text-lg font-semibold">Настройки истории</h2>
      <div className="mt-6 grid gap-5">
        <label className="grid gap-2 text-sm font-medium">
          <span>Название</span>
          <Input
            aria-label="Название"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={locked}
            maxLength={200}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          <span>Описание</span>
          <TextArea
            aria-label="Описание"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={locked}
            maxLength={1000}
          />
        </label>
      </div>

      {!published && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            isDisabled={!canSave}
            onPress={() => onSave({ title, description })}
          >
            {saving ? 'Сохранение…' : 'Сохранить'}
          </Button>
          {dirty && !saving && (
            <span className="text-xs text-black/45">
              {title.trim() ? 'Есть несохранённые изменения' : 'Название не может быть пустым'}
            </span>
          )}
        </div>
      )}

      {notice && (
        <p
          className={`mt-4 text-sm ${notice.kind === 'error' ? 'text-red-600' : 'text-emerald-700'}`}
        >
          {notice.text}
        </p>
      )}
    </section>
  );
}
