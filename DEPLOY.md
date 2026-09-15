# Deploy this Base44 export on Vercel + Supabase

## Code must already be true
- [x] No @base44 packages in package.json
- [x] No base44Client / base44.entities / base44.auth / media.base44
- [x] One supabaseClient (`src/api/supabaseClient.js`)
- [x] Parent User is `auth.users` + `public.profiles`
- [x] Child profiles, library, watch history stay in Dexie (same as before)
- [x] AuthContext shape unchanged from the UI’s point of view
- [x] YouTube proxy is `/api/youtube-search` (env `YOUTUBE_API_KEY`)
- [x] Learning generation is `/api/video-learning` (env `OPENAI_API_KEY`)
- [x] No Base44 uploads; thumbnails are YouTube URLs
- [x] supabase/schema.sql matches parent profiles
- [x] vercel.json SPA rewrites
- [x] .env.example only; no secrets in git
- [x] Stale lockfile that pinned Base44 was deleted from main — run `npm install` and commit the new lockfile
- [x] `src/pages/OAuthConsent.jsx` is unused (Base44 MCP leftover)
- [x] Language system is the existing built-in i18n. No GTranslate.

## GitHub
- [x] This repo is the source of truth
- [x] main has package.json, app entry, src/, supabase/schema.sql
- [x] No node_modules committed
- [ ] Optional: commit a fresh `package-lock.json` after `npm install`

## Supabase (you do this)
- [ ] Run supabase/schema.sql ONCE in SQL Editor
- [ ] Auth URL config: production Vercel URL + `http://localhost:5173`
- [ ] Enable Email + Google
- [ ] OAuth callback: `https://<project>.supabase.co/auth/v1/callback`
- [ ] Redirect URLs: `https://<vercel-domain>/**` and `http://localhost:5173/**`
- [ ] Copy Project URL + anon key to Vercel
- [ ] Service role key never in Vite

## Vercel (you do this)
- [ ] Import THIS GitHub repo
- [ ] Framework preset: Vite. Build: `npm run build`. Output: `dist`
- [ ] Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `YOUTUBE_API_KEY`, `OPENAI_API_KEY`
- [ ] Redeploy after adding env

## Leftovers (not tables)
- Base44 MCP / OAuth consent page — stubbed, not routed
- Base44 hosted LLM — replaced by OpenAI in `/api/video-learning`
- Base44 email — replaced by Supabase Auth emails
