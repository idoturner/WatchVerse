import { useRef, useState, type ChangeEvent } from 'react';
import { Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useRepository } from '@/data/repository/useRepository';
import type { WatchVerseExport } from '@/domain/types';
import { downloadJson } from '@/shared/lib/download';
import { Button, ConfirmDialog, Modal } from '@/shared/ui';
import { useLibraryStore } from '@/stores/libraryStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { backupFilename, parseImportFile } from '../importExport';

/** Read a file as text via FileReader (broadly supported, incl. jsdom). */
function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'));
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.readAsText(file);
  });
}

/** Export the library to JSON and import a backup (Merge default, Replace secondary). */
export function ImportExportControls() {
  const repository = useRepository();
  const hydrateLibrary = useLibraryStore((s) => s.hydrate);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<WatchVerseExport | null>(null);
  const [replaceConfirm, setReplaceConfirm] = useState(false);

  const onExport = async () => {
    const data = await repository.exportAll();
    downloadJson(data, backupFilename());
    toast.success('Library exported');
  };

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const data = parseImportFile(await readFileText(file));
    if (!data) {
      toast.error("That file isn't a valid WatchVerse backup.");
      return;
    }
    setPending(data);
  };

  const runImport = async (mode: 'merge' | 'replace') => {
    if (!pending) return;
    await repository.importAll(pending, mode);
    await hydrateLibrary();
    await hydrateSettings();
    setPending(null);
    setReplaceConfirm(false);
    toast.success(mode === 'merge' ? 'Library merged' : 'Library replaced');
  };

  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" onClick={() => void onExport()}>
        <Download className="h-4 w-4" aria-hidden="true" /> Export
      </Button>
      <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
        <Upload className="h-4 w-4" aria-hidden="true" /> Import
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => void onFile(e)}
      />

      <Modal
        open={pending !== null && !replaceConfirm}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title="Import library"
        description="Choose how to bring in this backup. Merge keeps your current data; Replace overwrites everything."
      >
        <div className="mt-2 flex flex-col gap-2">
          <Button onClick={() => void runImport('merge')}>Merge (recommended)</Button>
          <Button variant="secondary" onClick={() => setReplaceConfirm(true)}>
            Replace existing library…
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={replaceConfirm}
        onOpenChange={setReplaceConfirm}
        title="Replace your entire library?"
        description="This permanently overwrites all your current tracked titles, ratings, reviews, and settings with the imported file. This cannot be undone."
        confirmLabel="Replace everything"
        destructive
        onConfirm={() => void runImport('replace')}
      />
    </div>
  );
}
