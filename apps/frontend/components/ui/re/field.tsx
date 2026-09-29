import { TextField, Label, Input } from "@heroui/react";

export function Field({
  name,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <TextField name={name} type={type} value={value} onChange={onChange}>
      <Label>{label}</Label>
      <Input placeholder={placeholder} />
    </TextField>
  );
}
