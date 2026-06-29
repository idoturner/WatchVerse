import { useState } from 'react';
import type { LibraryEntry } from '@/domain/types';
import { Button, Input } from '@/shared/ui';
import { useCollectionsStore } from '@/stores/collectionsStore';
import { useLibraryStore } from '@/stores/libraryStore';

/** Manage which collections a tracked title belongs to (with inline create). */
export function CollectionPicker({ entry }: { entry: LibraryEntry }) {
  const collections = useCollectionsStore((s) => Object.values(s.items));
  const createCollection = useCollectionsStore((s) => s.create);
  const toggleEntryCollection = useLibraryStore((s) => s.toggleEntryCollection);
  const [newName, setNewName] = useState('');

  const createAndAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    const collection = await createCollection(name);
    if (collection) await toggleEntryCollection(entry.id, collection.id);
    setNewName('');
  };

  return (
    <div>
      {collections.length === 0 ? (
        <p className="text-sm text-text-tertiary">No collections yet — create one below.</p>
      ) : (
        <ul className="space-y-1">
          {collections.map((collection) => (
            <li key={collection.id}>
              <label className="flex items-center gap-2 text-sm text-text-primary">
                <input
                  type="checkbox"
                  checked={entry.collectionIds.includes(collection.id)}
                  onChange={() => void toggleEntryCollection(entry.id, collection.id)}
                />
                {collection.name}
              </label>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex gap-2">
        <Input
          className="h-9"
          aria-label="New collection name"
          placeholder="New collection…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void createAndAdd();
            }
          }}
        />
        <Button size="sm" variant="secondary" onClick={() => void createAndAdd()}>
          Add
        </Button>
      </div>
    </div>
  );
}
