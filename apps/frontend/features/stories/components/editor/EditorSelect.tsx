'use client';

import { Label, ListBox, Select } from '@heroui/react';

export function EditorSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <Select
      value={value}
      onChange={(nextValue) => {
        if (typeof nextValue === 'string') onChange(nextValue);
      }}
    >
      <Label>{label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {options.map((option) => (
            <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
              {option.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
