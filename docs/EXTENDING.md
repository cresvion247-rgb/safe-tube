# How to extend SafeTube

Child data stays in Dexie. Supabase is parent auth only. YouTube stays in `api/youtube-search.js`.

## Add a faith pack

1. Add `src/content/packs/<faith>.js` with `{ id, categoryId, channels: [{ name, query, ages }] }`.
2. Register it next to `muslimKidsPack`.
3. Point `categoryId` at a node in `src/data/categoryTree.js`.

## Add a content source

Implement `resolveChannel`, `listUploads`, and `getVideo` like `src/content/sources/youtubeSource.js`.

## Checks

`node --test scripts/domain.test.mjs` checks the video id parser and the age duration gate.
