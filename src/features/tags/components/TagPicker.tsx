import { useState } from 'react';
import type { LibraryEntry } from '@/domain/types';
import { Button, Input } from '@/shared/ui';
import { useLibraryStore } from '@/stores/libraryStore';
import { useTagsStore } from '@/stores/tagsStore';

/** Apply/remove tags on a tracked title, with inline tag creation. */
export function TagPicker({ entry }: { entry: LibraryEntry }) {
  const tags = useTagsStore((s) => Object.values(s.items));
  const createTag = useTagsStore((s) => s.create);
  const toggleEntryTag = useLibraryStore((s) => s.toggleEntryTag);
  const [newName, setNewName] = useState('');

  const createAndApply = async () => {
    const name = newName.trim();
    if (!name) return;
    const tag = await createTag(name);
    if (tag) await toggleEntryTag(entry.id, tag.id);
    setNewName('');
  };

  return (
    <div>
      {tags.length === 0 ? (
        <p className="text-sm text-text-tertiary">No tags yet — create one below.</p>
      ) : (
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {tags.map((tag) => (
            <li key={tag.id}>
              <label className="flex items-center gap-2 text-sm text-text-primary">
                <input
                  type="checkbox"
                  checked={entry.tagIds.includes(tag.id)}
                  onChange={() => void toggleEntryTag(entry.id, tag.id)}
                />
                {tag.name}
              </label>
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
              void createAndApply();
            }
          }}
        />
        <Button size="sm" variant="secondary" onClick={() => void createAndApply()}>
          Add
        </Button>
      </div>
    </div>
  );
}
