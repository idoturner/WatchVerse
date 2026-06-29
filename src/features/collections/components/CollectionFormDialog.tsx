import { useEffect, useState } from 'react';
import { Button, Input, Modal } from '@/shared/ui';

export interface CollectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialName?: string;
  submitLabel?: string;
  onSubmit: (name: string) => void;
}

/** Create/rename a collection via an accessible modal with a name field. */
export function CollectionFormDialog({
  open,
  onOpenChange,
  title,
  initialName = '',
  submitLabel = 'Save',
  onSubmit,
}: CollectionFormDialogProps) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (open) setName(initialName);
  }, [open, initialName]);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title}>
      <Input
        aria-label="Collection name"
        placeholder="e.g. Date Night"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            submit();
          }
        }}
      />
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={name.trim() === ''}>
          {submitLabel}
        </Button>
      </div>
    </Modal>
  );
}
