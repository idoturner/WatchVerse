/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TMDB_API_BASE?: string;
  readonly VITE_TMDB_IMAGE_BASE?: string;
  readonly VITE_TMDB_ACCESS_TOKEN?: string;
  // Weekly WatchVerse Recap automation (optional). See docs/weekly-watchverse-recap.md.
  readonly VITE_WEEKLY_RECAP_WEBHOOK_URL?: string;
  readonly VITE_WEEKLY_RECAP_AUTOMATION_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Injected at build time from package.json (see vite.config.ts `define`). */
declare const __APP_VERSION__: string;
