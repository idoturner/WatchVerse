import { useState } from 'react';
import { Tag as TagIcon, Trash2 } from 'lucide-react';
import type { Tag } from '@/domain/types';
import { Button, ConfirmDialog, Input, Modal } from '@/shared/ui';
import { useTagsStore } from '@/stores/tagsStore';

/** "Manage tags" button + modal: create, rename (on blur), and delete tags. */
export function TagManagerDialog() {
  const tags = useTagsStore((s) => Object.values(s.items));
  const createTag = useTagsStore((s) => s.create);
  const rename = useTagsStore((s) => s.rename);
  const remove = useTagsStore((s) => s.remove);
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Tag | null>(null);

  const addTag = () => {
    const name = newName.trim();
    if (!name) return;
    void createTag(name);
    setNewName('');
  };

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <TagIcon className="h-4 w-4" aria-hidden="true" /> Manage tags
      </Button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Manage tags"
        description="Tags are lightweight labels for filtering your library."
      >
        {tags.length === 0 ? (
          <p className="text-sm text-text-tertiary">No tags yet.</p>
        ) : (
          <ul className="space-y-2">
            {tags
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((tag) => (
                <li key={tag.id} className="flex items-center gap-2">
                  <Input
                    className="h-9"
                    aria-label={`Rename tag ${tag.name}`}
                    defaultValue={tag.name}
                    onBlur={(e) => void rename(tag.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.currentTarget.blur();
                      }
                    }}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    aria-label={`Delete tag ${tag.name}`}
                    onClick={() => setPendingDelete(tag)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </li>
              ))}
          </ul>
        )}

        <div className="mt-3 flex gap-2">
          <Input
            className="h-9"
            aria-label="New tag name"
            placeholder="New tag…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button size="sm" onClick={addTag}>
            Add
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => {
          if (!o) setPendingDelete(null);
        }}
        title={`Delete tag “${pendingDelete?.name ?? ''}”?`}
        description="This removes the tag from all titles. The titles stay in your library."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (pendingDelete) void remove(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </>
  );
}
