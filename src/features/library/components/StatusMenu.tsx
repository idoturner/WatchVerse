import { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { snapshotFromTitle } from '@/domain/library';
import { STATUS_LABELS, STATUS_ORDER } from '@/domain/status';
import type { LibraryEntry, TmdbTitle, WatchStatus } from '@/domain/types';
import { cn } from '@/shared/lib/cn';
import { Button, ConfirmDialog } from '@/shared/ui';
import { useLibraryStore } from '@/stores/libraryStore';
import { useSettingsStore } from '@/stores/settingsStore';

type TrackableTitle = Pick<
  TmdbTitle,
  'tmdbId' | 'mediaType' | 'title' | 'posterPath' | 'releaseYear' | 'releaseDate'
>;

export interface StatusMenuProps {
  title: TrackableTitle;
  entry: LibraryEntry | undefined;
  variant?: 'compact' | 'full';
}

/**
 * Add a title to the library, change its watch status, or remove it. Removal
 * honors the confirm-before-delete setting and always offers Undo. Built on an
 * accessible Radix menu (keyboard nav, focus management, Esc).
 */
export function StatusMenu({ title, entry, variant = 'compact' }: StatusMenuProps) {
  const addTitle = useLibraryStore((s) => s.addTitle);
  const setStatus = useLibraryStore((s) => s.setStatus);
  const removeEntry = useLibraryStore((s) => s.removeEntry);
  const restoreEntry = useLibraryStore((s) => s.restoreEntry);
  const confirmBeforeDelete = useSettingsStore((s) => s.settings.confirmBeforeDelete);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const choose = async (status: WatchStatus) => {
    if (entry) {
      await setStatus(entry.id, status);
      toast.success(`“${title.title}” — ${STATUS_LABELS[status]}`);
    } else {
      await addTitle({
        tmdbId: title.tmdbId,
        mediaType: title.mediaType,
        snapshot: snapshotFromTitle(title),
        status,
      });
      toast.success(`Added “${title.title}” — ${STATUS_LABELS[status]}`);
    }
  };

  const performRemove = async () => {
    if (!entry) return;
    const removed = entry;
    await removeEntry(removed.id);
    toast(`Removed “${title.title}”`, {
      action: { label: 'Undo', onClick: () => void restoreEntry(removed) },
    });
  };

  const requestRemove = () => {
    if (confirmBeforeDelete) setConfirmOpen(true);
    else void performRemove();
  };

  const trigger =
    variant === 'full' ? (
      <Button variant={entry ? 'secondary' : 'primary'}>
        {entry ? STATUS_LABELS[entry.status] : 'Add to Library'}
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </Button>
    ) : (
      <button
        type="button"
        aria-label={
          entry ? `Change status for ${title.title}` : `Add ${title.title} to your library`
        }
        className="grid h-8 w-8 place-items-center rounded-full bg-bg-base/90 text-text-primary shadow hover:bg-bg-elevated focus-visible:outline-none"
      >
        {entry ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Plus className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    );

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="z-[200] min-w-[12rem] rounded-md border border-border-subtle bg-bg-elevated p-1 shadow-lg"
          >
            {STATUS_ORDER.map((status) => (
              <DropdownMenu.Item
                key={status}
                onSelect={() => void choose(status)}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-text-primary outline-none focus:bg-bg-surface"
              >
                <Check
                  className={cn(
                    'h-4 w-4 text-accent',
                    entry?.status === status ? 'visible' : 'invisible',
                  )}
                  aria-hidden="true"
                />
                {STATUS_LABELS[status]}
              </DropdownMenu.Item>
            ))}
            {entry ? (
              <>
                <DropdownMenu.Separator className="my-1 h-px bg-border-subtle" />
                <DropdownMenu.Item
                  onSelect={requestRemove}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-accent outline-none focus:bg-bg-surface"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove from library
                </DropdownMenu.Item>
              </>
            ) : null}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {entry ? (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={`Remove “${title.title}”?`}
          description="This removes it and your tracking (rating, review, dates) from your library. You can undo right after."
          confirmLabel="Remove"
          destructive
          onConfirm={() => void performRemove()}
        />
      ) : null}
    </>
  );
}
