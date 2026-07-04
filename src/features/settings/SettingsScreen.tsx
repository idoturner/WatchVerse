import { useId, type ReactNode } from 'react';
import { APP_VERSION } from '@/config/constants';
import { ImportExportControls } from '@/features/library';
import { Card, Select, Toggle } from '@/shared/ui';
import { useSettingsStore } from '@/stores/settingsStore';
import { AutomationTest } from './components/AutomationTest';
import { ResetDataControl } from './components/ResetDataControl';

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="mb-1 font-display text-lg font-semibold text-text-primary">
        {title}
      </h2>
      {description ? <p className="mb-3 text-sm text-text-secondary">{description}</p> : null}
      <Card className="space-y-4 p-4">{children}</Card>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label htmlFor={htmlFor} className="text-sm font-medium text-text-primary">
        {label}
      </label>
      {children}
    </div>
  );
}

export function SettingsScreen() {
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);
  const themeId = useId();
  const motionId = useId();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Your preferences and data — stored only on this device.
        </p>
      </header>

      <Section title="Appearance">
        <Field label="Theme" htmlFor={themeId}>
          <Select id={themeId} value={settings.theme} disabled aria-describedby={`${themeId}-hint`}>
            <option value="cinema-dark">Cinema Dark</option>
          </Select>
        </Field>
        <p id={`${themeId}-hint`} className="text-xs text-text-tertiary">
          More themes are planned. Cinema Dark is the current default.
        </p>
        <Field label="Motion" htmlFor={motionId}>
          <Select
            id={motionId}
            value={settings.reducedMotion}
            onChange={(e) =>
              void update({ reducedMotion: e.target.value as typeof settings.reducedMotion })
            }
          >
            <option value="system">Match system</option>
            <option value="on">Reduce motion</option>
            <option value="off">Allow motion</option>
          </Select>
        </Field>
      </Section>

      <Section title="Reading">
        <Toggle
          label="Spoiler protection"
          description="Hide unwatched season overviews behind a reveal on title pages."
          checked={settings.spoilerProtection}
          onChange={(v) => void update({ spoilerProtection: v })}
        />
      </Section>

      <Section title="Data safety">
        <Toggle
          label="Confirm before deleting"
          description="Ask for confirmation before removing a title from your library."
          checked={settings.confirmBeforeDelete}
          onChange={(v) => void update({ confirmBeforeDelete: v })}
        />
      </Section>

      <Section
        title="Your data"
        description="WatchVerse is local-first: your library lives in this browser. Back it up or move it between devices with export and import."
      >
        <div className="flex flex-wrap items-center gap-2">
          <ImportExportControls />
        </div>
        <div className="border-t border-border-subtle pt-4">
          <p className="mb-2 text-sm text-text-secondary">
            Start fresh on this device. Export a backup first if you might want your history back.
          </p>
          <ResetDataControl />
        </div>
      </Section>

      <Section
        title="Automations"
        description="Optional: WatchVerse can send movie activity to a Weekly Recap webhook (n8n → Google Sheets → a weekly email). Off unless you configure it; the app works normally without it."
      >
        <AutomationTest />
      </Section>

      <Section title="About">
        <p className="text-sm text-text-secondary">
          WatchVerse is a private, local-first movie &amp; TV journal. There are no accounts, no
          cloud sync, and no tracking — nothing leaves your device except the searches sent to TMDB
          to find titles.
        </p>
        <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-text-tertiary">Version</dt>
          <dd className="text-text-primary">v{APP_VERSION}</dd>
          <dt className="text-text-tertiary">Data source</dt>
          <dd className="text-text-primary">TMDB (not endorsed or certified by TMDB)</dd>
        </dl>
      </Section>
    </div>
  );
}
