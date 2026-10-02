'use client';

import type { ComponentProps, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { Input, TextArea } from '@heroui/react';
import { useDraft } from '@/features/stories/hooks/use-draft';

type HeroInputProps = Omit<ComponentProps<typeof Input>, 'value' | 'onChange'> & {
  value: string;
  onValueChange: (value: string) => void;
};

export function DraftInput({ value, onValueChange, onBlur, ...rest }: HeroInputProps) {
  const draft = useDraft(value, onValueChange);
  return (
    <Input
      {...rest}
      value={draft.value}
      onChange={(event: { target: { value: string } }) => draft.onChange(event.target.value)}
      onBlur={(event: never) => {
        draft.flush();
        (onBlur as ((e: never) => void) | undefined)?.(event);
      }}
    />
  );
}

type HeroTextAreaProps = Omit<ComponentProps<typeof TextArea>, 'value' | 'onChange'> & {
  value: string;
  onValueChange: (value: string) => void;
};

export function DraftTextArea({ value, onValueChange, onBlur, ...rest }: HeroTextAreaProps) {
  const draft = useDraft(value, onValueChange);
  return (
    <TextArea
      {...rest}
      value={draft.value}
      onChange={(event: { target: { value: string } }) => draft.onChange(event.target.value)}
      onBlur={(event: never) => {
        draft.flush();
        (onBlur as ((e: never) => void) | undefined)?.(event);
      }}
    />
  );
}

type NativeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'onBlur'
> & {
  value: string;
  onValueChange: (value: string) => void;
  // Вызывается после flush: на blur и по Enter.
  onCommit?: () => void;
};

export function DraftNativeInput({ value, onValueChange, onCommit, ...rest }: NativeInputProps) {
  const draft = useDraft(value, onValueChange);
  return (
    <input
      {...rest}
      value={draft.value}
      onChange={(event) => draft.onChange(event.target.value)}
      onBlur={() => {
        draft.flush();
        onCommit?.();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          event.currentTarget.blur(); // blur сделает flush + commit
        }
      }}
    />
  );
}

type NativeTextAreaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'onChange' | 'onBlur'
> & {
  value: string;
  onValueChange: (value: string) => void;
  onCommit?: () => void;
};

export function DraftNativeTextArea({
  value,
  onValueChange,
  onCommit,
  ...rest
}: NativeTextAreaProps) {
  const draft = useDraft(value, onValueChange);
  return (
    <textarea
      {...rest}
      value={draft.value}
      onChange={(event) => draft.onChange(event.target.value)}
      onBlur={() => {
        draft.flush();
        onCommit?.();
      }}
      onKeyDown={(event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
          event.preventDefault();
          draft.flush();
          onCommit?.();
        }
      }}
    />
  );
}
