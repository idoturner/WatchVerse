# Weekly WatchVerse Recap Automation

An optional, self-contained integration that turns WatchVerse movie activity into a **weekly HTML
email**, without adding a backend to the app.

WatchVerse stays **frontend-only**. It just POSTs small "movie activity" events to an [n8n](https://n8n.io)
webhook. Everything else — storage, scheduling, stats, and email — happens in n8n.

```
WatchVerse frontend
  → n8n webhook            (Collect Activity workflow)
  → Google Sheets "Activity" tab
  → n8n Schedule (every Sunday 09:00)   (Send Weekly Email workflow)
  → Gmail sends the weekly HTML recap
```

- The **React app does not send emails** and does not compute the weekly stats.
- The **recipient email is configured only in n8n**, never in the frontend.
- If the env vars below are missing, **WatchVerse works normally** with the automation simply off.

---

## 1. Environment variables

Add these to your local `.env` (see `.env.example`) and to your Vercel project settings:

```bash
VITE_WEEKLY_RECAP_WEBHOOK_URL=   # the n8n Production webhook URL
VITE_WEEKLY_RECAP_AUTOMATION_KEY=  # any string you choose; must match n8n's check
```

> **Not a real secret.** `VITE_*` values are inlined into the browser bundle and are visible to
> anyone who inspects the site. The automation key is a light guard for a demo, not security.
> n8n must still validate the request (below).

**Vercel:** Project → Settings → Environment Variables → add both (Production/Preview/Development)
→ then **redeploy** (Vite env vars are baked in at build time, so a redeploy is required after
changing them).

---

## 2. What the app sends (and when)

WatchVerse sends **one background event per meaningful action, for movies only** (TV is excluded so
the "movies watched" stats stay clean). Local state and `localStorage` are updated **first**; the
webhook fires afterward in the background and **never blocks or breaks the app** if it fails.

| User action | `activityType` |
| --- | --- |
| Movie marked **Completed** (watched) | `watched` |
| Movie **rating** saved/updated | `rating_updated` |
| Movie **review** saved/updated | `review_updated` |
| **Test automation connection** button | `test_event` |

> `test_event` is **only for testing** the webhook → Google Sheets connection. It is **excluded from
> the weekly recap stats** — to test the actual weekly email, use a real watched/rated/reviewed
> movie event.

Payload (`Content-Type: application/json`, `POST`):

```json
{
  "eventId": "unique id (nanoid)",
  "eventType": "movie_activity",
  "automationKey": "value from VITE_WEEKLY_RECAP_AUTOMATION_KEY",
  "source": "watchverse",
  "activityType": "watched | rating_updated | review_updated | test_event",
  "movieId": "TMDB id (string) or empty",
  "title": "movie title (fallback: Unknown title)",
  "posterUrl": "poster URL or empty",
  "rating": 9,
  "review": "review text or null",
  "watchedAt": "ISO date if stored, else now for watched events",
  "updatedAt": "ISO timestamp",
  "createdAt": "ISO timestamp"
}
```

**n8n must validate** each request before storing it:

- `source` equals `"watchverse"`
- `eventType` equals `"movie_activity"`
- `automationKey` equals your configured key

---

## 3. Google Sheet (manual, one-time)

The app can't create the sheet, so make it yourself:

1. Create a Google Sheet named **`WatchVerse Weekly Stats`**.
2. Add a tab named **`Activity`**.
3. Put this **header row** in row 1 (one column each, exact names):

```
eventId	eventType	automationKey	source	activityType	movieId	title	posterUrl	rating	review	watchedAt	updatedAt	createdAt
```

---

## 4. n8n — Workflow 1: Collect Activity

**Webhook → Code (validate + flatten) → Google Sheets (Append Row, automatic mapping) → Respond to Webhook.**

A **Code** node does validation and flattening (this proved more reliable than an IF node).

1. **Webhook** node
   - HTTP Method: `POST`
   - Path: `watchverse-weekly-recap`
   - Copy its **Production URL** into `VITE_WEEKLY_RECAP_WEBHOOK_URL`.
2. **Code** node — validate + flatten (paste):

```js
// n8n Code node — validate one WatchVerse event and flatten it to sheet columns
const payload = $json.body || $json;

if (
  payload.eventType !== 'movie_activity' ||
  payload.source !== 'watchverse' ||
  payload.automationKey !== 'wv_recap_7day_demo_2026'
) {
  throw new Error('Invalid WatchVerse webhook request');
}

return [
  {
    json: {
      eventId: payload.eventId,
      eventType: payload.eventType,
      automationKey: payload.automationKey,
      source: payload.source,
      activityType: payload.activityType,
      movieId: payload.movieId,
      title: payload.title,
      posterUrl: payload.posterUrl,
      rating: payload.rating,
      review: payload.review,
      watchedAt: payload.watchedAt,
      updatedAt: payload.updatedAt,
      createdAt: payload.createdAt,
    },
  },
];
```

   - `const payload = $json.body || $json` handles either webhook body shape.
   - Throwing on an invalid `eventType` / `source` / `automationKey` stops the workflow, so bad or
     unauthorized requests never reach the sheet.
3. **Google Sheets** node
   - Operation: **Append Row**
   - Document: `WatchVerse Weekly Stats`; Sheet: `Activity`
   - Mapping: **Automatic** — the Code node's output field names match the sheet's header row
     exactly, so no manual column mapping is needed.
4. **Respond to Webhook** node
   - Respond With: JSON → `{ "ok": true }`

Set the Webhook node's "Respond" to **"Using Respond to Webhook node"** so the app gets the 200.

---

## 5. n8n — Workflow 2: Send Weekly Email

1. **Schedule Trigger**
   - Every week, **Sunday at 09:00**, Timezone **Asia/Jerusalem** (set in the node or workflow settings).
2. **Google Sheets** node
   - Operation: **Read/Get Rows** from `WatchVerse Weekly Stats` → `Activity`.
3. **Code** node — compute the last-7-days recap and build the HTML (paste this):

```js
// n8n Code node — Weekly WatchVerse Recap
const rows = $input.all().map((i) => i.json);
const now = Date.now();
const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

const ts = (r) => Date.parse(r.updatedAt || r.createdAt || '') || 0;
const toNum = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};
const esc = (s) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Real activity from the last 7 days. `test_event` rows are excluded so Test-button events
// never count toward the weekly stats.
const recent = rows.filter(
  (r) => r && r.movieId && r.activityType !== 'test_event' && ts(r) >= weekAgo,
);

// Deduplicate by movieId, keeping the latest row per movie.
const latest = new Map();
for (const r of recent) {
  const prev = latest.get(r.movieId);
  if (!prev || ts(r) >= ts(prev)) latest.set(r.movieId, r);
}
const movies = [...latest.values()].sort((a, b) => ts(b) - ts(a));

const rated = movies.map((m) => ({ ...m, r: toNum(m.rating) })).filter((m) => m.r !== null);
const totalWatched = movies.length;
const reviewsWritten = movies.filter((m) => String(m.review ?? '').trim().length > 0).length;
const avg = rated.length ? rated.reduce((s, m) => s + m.r, 0) / rated.length : null;
const top = rated.slice().sort((a, b) => b.r - a.r)[0] || null;
const fmt = (n) => (n == null ? '—' : Number(n).toFixed(1));

const shell = (inner) => `
  <div style="margin:0;padding:24px;background:#0e0e11;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#e7e7ea;">
    <div style="max-width:560px;margin:0 auto;">
      <h1 style="margin:0 0 4px;font-size:22px;">Your Weekly WatchVerse Recap 🎬</h1>
      <p style="margin:0 0 20px;color:#9a9aa2;font-size:13px;">Last 7 days</p>
      ${inner}
      <p style="margin:28px 0 0;color:#6f6f77;font-size:12px;">Sent by WatchVerse</p>
    </div>
  </div>`;

let html;
if (totalWatched === 0) {
  html = shell(`
    <p style="font-size:15px;">No movies were watched this week.</p>
    <p style="color:#9a9aa2;font-size:14px;">Add a movie, rating, or review in WatchVerse and next week's recap will be ready.</p>
  `);
} else {
  const card = (label, value) => `
    <td style="padding:12px 14px;background:#17171b;border-radius:10px;">
      <div style="color:#9a9aa2;font-size:12px;">${label}</div>
      <div style="font-size:20px;font-weight:600;">${value}</div>
    </td>`;
  const list = movies
    .map((m) => {
      const r = toNum(m.rating);
      const review = String(m.review ?? '').trim();
      return `
        <div style="padding:12px 0;border-top:1px solid #26262c;">
          <div style="font-weight:600;">${esc(m.title || 'Unknown title')}${r != null ? ` <span style="color:#e6b450;">★ ${fmt(r)}</span>` : ''}</div>
          ${review ? `<div style="color:#9a9aa2;font-size:13px;margin-top:2px;">${esc(review.slice(0, 160))}${review.length > 160 ? '…' : ''}</div>` : ''}
        </div>`;
    })
    .join('');

  html = shell(`
    <table style="width:100%;border-collapse:separate;border-spacing:8px;margin:0 -8px 8px;"><tr>
      ${card('Movies watched', totalWatched)}
      ${card('Average rating', fmt(avg))}
      ${card('Reviews written', reviewsWritten)}
    </tr></table>
    <p style="margin:16px 0 4px;font-size:14px;">Highest rated: <strong>${top ? esc(top.title) : '—'}</strong>${top ? ` (${fmt(top.r)})` : ''}</p>
    <h2 style="font-size:15px;margin:20px 0 0;">This week's movies</h2>
    ${list}
  `);
}

return [{ json: { subject: 'Your Weekly WatchVerse Recap 🎬', html, totalWatched } }];
```

4. **Gmail** node — Send Email
   - To: **your fixed recipient** (configured here in n8n, not in the app)
   - Subject: `{{$json.subject}}` (or literally `Your Weekly WatchVerse Recap 🎬`)
   - Message / HTML: `{{$json.html}}` (enable HTML)

> Tip: to test Workflow 2 without waiting for Sunday, press **Test workflow** in n8n. Because the
> recap **excludes `test_event` rows**, first create a **real** event (mark a movie watched, or save
> a rating/review) — otherwise you'll (correctly) get the empty-week email.

---

## 6. Email contents

- **Header:** Your Weekly WatchVerse Recap 🎬 · date range "Last 7 days"
- **Summary:** Movies watched · Average rating · Reviews written · Highest-rated movie
- **Movie list:** title · rating · short review preview
- **Footer:** Sent by WatchVerse
- **Empty week:** "No movies were watched this week." + "Add a movie, rating, or review in
  WatchVerse and next week's recap will be ready."

---

## 7. Testing the full flow

1. In WatchVerse → **Settings → Automations → "Test automation connection"** (with the env vars set)
   → a `test_event` row (Inception) appears in the Google Sheet. This verifies the **webhook → Sheets
   connection only** (it won't appear in the weekly stats).
2. Mark a **movie** Completed, or save a rating/review → real rows appear. **Use these to test the
   weekly email.**
3. Run **Workflow 2** manually in n8n → confirm the email arrives with the right stats.
4. With **no env vars**, confirm WatchVerse still works and the Test button explains setup is
   incomplete.

Weekly logic recap (all in n8n): last 7 days · dedupe by `movieId` (latest wins) · average uses
valid numeric ratings only · highest-rated uses rated movies only · reviews count non-empty text ·
empty week still emails.
