/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TMDB_API_BASE?: string;
  readonly VITE_TMDB_IMAGE_BASE?: string;
  readonly VITE_TMDB_ACCESS_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Injected at build time from package.json (see vite.config.ts `define`). */
declare const __APP_VERSION__: string;
