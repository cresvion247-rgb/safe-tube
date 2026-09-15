# SafeTube Kids

Parent-managed, age-adapted video player. Child library and profiles stay on the device (IndexedDB). Parent sign-in uses Supabase. YouTube search and learning extras run as Vercel serverless functions.

## Local development

```bash
npm install
cp .env.example .env.local
# fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

Serverless routes under `/api` need `vercel dev` or the production deploy. `npm run dev` only serves the Vite SPA.

## Deploy

See [DEPLOY.md](DEPLOY.md).
