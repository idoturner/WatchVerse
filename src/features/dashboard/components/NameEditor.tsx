import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import { Input } from '@/shared/ui';

/** Inline editor for the local profile display name. */
export function NameEditor({ name, onSave }: { name: string; onSave: (name: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);

  useEffect(() => setValue(name), [name]);

  if (editing) {
    return (
      <Input
        autoFocus
        aria-label="Your name"
        className="h-9 w-48"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          onSave(value);
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            e.currentTarget.blur();
          } else if (e.key === 'Escape') {
            setValue(name);
            setEditing(false);
          }
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      aria-label="Edit your name"
      className="inline-flex items-center gap-1 font-medium text-text-primary hover:text-accent"
    >
      {name}
      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}
