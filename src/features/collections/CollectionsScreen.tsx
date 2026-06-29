import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderPlus, Library as LibraryIcon } from 'lucide-react';
import { routes } from '@/config/routes';
import { Button, Card, EmptyState } from '@/shared/ui';
import { useCollectionsStore } from '@/stores/collectionsStore';
import { useLibraryStore } from '@/stores/libraryStore';
import { CollectionFormDialog } from './components/CollectionFormDialog';

export function CollectionsScreen() {
  const collections = useCollectionsStore((s) => Object.values(s.items));
  const createCollection = useCollectionsStore((s) => s.create);
  const entries = useLibraryStore((s) => Object.values(s.entries));
  const [createOpen, setCreateOpen] = useState(false);

  const countFor = (collectionId: string) =>
    entries.filter((e) => e.collectionIds.includes(collectionId)).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-text-primary">Collections</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <FolderPlus className="h-4 w-4" aria-hidden="true" /> New collection
        </Button>
      </div>

      {collections.length === 0 ? (
        <EmptyState
          icon={<LibraryIcon className="h-10 w-10" aria-hidden="true" />}
          title="No collections yet"
          description="Create collections like “Date Night” or “Best Horror” to group titles your way."
          action={<Button onClick={() => setCreateOpen(true)}>Create your first collection</Button>}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collections
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((collection) => (
              <li key={collection.id}>
                <Link to={routes.collection(collection.id)} className="block rounded-lg">
                  <Card variant="elevated" className="p-4 hover:border-border-strong">
                    <p className="truncate font-display text-lg font-semibold text-text-primary">
                      {collection.name}
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">
                      {countFor(collection.id)} {countFor(collection.id) === 1 ? 'title' : 'titles'}
                    </p>
                  </Card>
                </Link>
              </li>
            ))}
        </ul>
      )}

      <CollectionFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New collection"
        submitLabel="Create"
        onSubmit={(name) => void createCollection(name)}
      />
    </div>
  );
}
