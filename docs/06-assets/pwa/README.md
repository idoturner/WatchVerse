# PWA icons

**Placeholder icons (v1.0).** WatchVerse currently ships simple, on-brand **SVG** install
icons rather than commissioned artwork:

- `icon.svg` — standard icon: a rounded Cinema-Dark tile with an accent-red ring and a
  gold play mark (tokens `--color-accent` `#E5484D`, `--color-highlight` `#E6B450`,
  background `#0E0E11`).
- `icon-maskable.svg` — maskable variant: full-bleed background with the mark inside the
  safe zone so platform masking never clips it.

The **served copies** live in [`/public`](../../../public) (`public/icon.svg`,
`public/icon-maskable.svg`) and are referenced by the web app manifest in
[`vite.config.ts`](../../../vite.config.ts) (`purpose: any` + `purpose: maskable`,
`sizes: "any"`) and as the favicon/apple-touch-icon in `index.html`. SVG is used per the
asset conventions (scalable, lean) and satisfies installability.

**Future work:** replace with finalized brand artwork and add rasterized PNG fallbacks
(`icon-192.png`, `icon-512.png`, maskable equivalents) if analytics show platforms that
don't honor SVG manifest icons.
