# Deploy this Base44 export on Vercel + Supabase

## Code must already be true
- [ ] No @base44 packages
- [ ] No base44Client / base44.entities / base44.auth / media.base44
- [ ] One supabaseClient (`src/api/supabaseClient.js`)
- [ ] Parent User is `auth.users` + `public.profiles`
- [ ] Child profiles, library, watch history stay in Dexie (same as before)
- [ ] AuthContext shape unchanged from the UI’s point of view
- [ ] YouTube proxy is `/api/youtube-search` (env `YOUTUBE_API_KEY`)
- [ ] Learning generation is `/api/video-learning` (env `OPENAI_API_KEY`)
- [ ] No Base44 uploads; thumbnails are YouTube URLs
- [ ] supabase/schema.sql matches parent profiles
- [ ] vercel.json SPA rewrites
- [ ] .env.example only; no secrets in git
- [ ] Lockfile does not pin Base44
- [ ] `src/pages/OAuthConsent.jsx` is unused (Base44 MCP leftover)
- [ ] Language system is the existing built-in i18n. No GTranslate.

## GitHub
- [ ] This repo is the source of truth
- [ ] main has package.json, app entry, src/, supabase/schema.sql
- [ ] No node_modules committed

## Supabase
- [ ] Run supabase/schema.sql ONCE in SQL Editor
- [ ] Auth URL config: production Vercel URL + `http://localhost:5173`
- [ ] Enable Email + Google
- [ ] OAuth callback: `https://<project>.supabase.co/auth/v1/callback`
- [ ] Redirect URLs: `https://<vercel-domain>/**` and `http://localhost:5173/**`
- [ ] Copy Project URL + anon key to Vercel
- [ ] Service role key never in Vite

## Vercel
- [ ] Import THIS GitHub repo
- [ ] Framework preset: Vite. Build: `npm run build`. Output: `dist`
- [ ] Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `YOUTUBE_API_KEY`, `OPENAI_API_KEY`
- [ ] Redeploy after adding env

## Leftovers (not tables)
- Base44 MCP / OAuth consent page — stubbed, not routed
- Base44 hosted LLM — replaced by OpenAI in `/api/video-learning`
- Base44 email — replaced by Supabase Auth emails
