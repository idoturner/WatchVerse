import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { routes } from '@/config/routes';
import { LibraryCard } from '@/features/library';
import { Button, ConfirmDialog, EmptyState } from '@/shared/ui';
import { useCollectionsStore } from '@/stores/collectionsStore';
import { useLibraryStore } from '@/stores/libraryStore';
import { CollectionFormDialog } from './components/CollectionFormDialog';

export function CollectionDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const collection = useCollectionsStore((s) => (id ? s.items[id] : undefined));
  const rename = useCollectionsStore((s) => s.rename);
  const remove = useCollectionsStore((s) => s.remove);
  const entries = useLibraryStore((s) => Object.values(s.entries));
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const backLink = (
    <Link to={routes.collections} className="mb-4 inline-block">
      <Button variant="ghost" size="sm">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Collections
      </Button>
    </Link>
  );

  if (!collection) {
    return (
      <div className="py-6">
        {backLink}
        <EmptyState
          title="Collection not found"
          description="This collection may have been deleted."
          action={
            <Button asChild>
              <Link to={routes.collections}>Back to collections</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const titles = entries.filter((e) => e.collectionIds.includes(collection.id));

  return (
    <div>
      {backLink}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-text-primary">{collection.name}</h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setRenameOpen(true)}>
            <Pencil className="h-4 w-4" aria-hidden="true" /> Rename
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
          </Button>
        </div>
      </div>

      {titles.length === 0 ? (
        <EmptyState
          title="This collection is empty"
          description="Open a title you're tracking and add it to this collection."
          action={
            <Button asChild variant="secondary">
              <Link to={routes.library}>Go to Your Library</Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
          {titles.map((entry) => (
            <li key={entry.id}>
              <LibraryCard entry={entry} />
            </li>
          ))}
        </ul>
      )}

      <CollectionFormDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        title="Rename collection"
        initialName={collection.name}
        submitLabel="Save"
        onSubmit={(name) => void rename(collection.id, name)}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete “${collection.name}”?`}
        description="This deletes the collection. The titles themselves stay in your library."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          void remove(collection.id);
          navigate(routes.collections);
        }}
      />
    </div>
  );
}
