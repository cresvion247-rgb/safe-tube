# SafeTube safety limits

Child data stays on the device. Supabase stores the parent account only. YouTube is called from the server with `YOUTUBE_API_KEY`, never from the browser bundle.

## Enforced in code

- Video and channel ids are allowlisted shapes before they are stored or requested.
- Search text is plain text, length-capped, and rejects weapon or explosive terms.
- Thumbnails must come from YouTube image hosts.
- Skip and finish stay on this device. A category score cannot move past -3 or +3. Updates are capped at 30 per hour.
- A skipped category is reduced, not deleted. One video from it remains.
- Quran reading lessons stay ahead of engagement signals.
- No child chat, comments, or public profile.

## Parent actions outside this repo

- Turn on MFA for the GitHub, Vercel, and Supabase accounts.
- Keep `YOUTUBE_API_KEY` and `OPENAI_API_KEY` only in Vercel env. Rotate them if they leak.
- Do not paste child names into analytics tools.

## If a channel is wrong

Remove it in Curator. That stops new imports. Reset preferences on the child edit screen if the feed has drifted.
