import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRepository } from '@/data/repository/useRepository';
import { Button, ConfirmDialog } from '@/shared/ui';
import { useAchievementsStore } from '@/stores/achievementsStore';
import { useActivityStore } from '@/stores/activityStore';
import { useCollectionsStore } from '@/stores/collectionsStore';
import { useLibraryStore } from '@/stores/libraryStore';
import { useProfileStore } from '@/stores/profileStore';
import { useSearchHistoryStore } from '@/stores/searchHistoryStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTagsStore } from '@/stores/tagsStore';

/** Destructive "clear everything" with a strong confirmation, then re-hydrates stores. */
export function ResetDataControl() {
  const repository = useRepository();
  const [open, setOpen] = useState(false);

  const reset = async () => {
    await repository.clearAll();
    await Promise.all([
      useLibraryStore.getState().hydrate(),
      useCollectionsStore.getState().hydrate(),
      useTagsStore.getState().hydrate(),
      useProfileStore.getState().hydrate(),
      useSettingsStore.getState().hydrate(),
      useActivityStore.getState().hydrate(),
      useAchievementsStore.getState().hydrate(),
      useSearchHistoryStore.getState().hydrate(),
    ]);
    toast.success('All local data cleared');
  };

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" aria-hidden="true" /> Clear all data…
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Clear all WatchVerse data?"
        description="This permanently deletes your library, collections, tags, reviews, ratings, achievements, activity, and settings from this device. Export a backup first if you might want it later. This cannot be undone."
        confirmLabel="Clear everything"
        destructive
        onConfirm={() => void reset()}
      />
    </>
  );
}
