# SafeTube privacy controls

Child profiles, channels, and watch history stay in IndexedDB on the device.

This branch adds, without changing default playback:

- Optional API guard (`REQUIRE_PARENT_AUTH=true`, `ALLOWED_ORIGIN`). Off by default so the current library refresh still works.
- Optional encrypted backup. Leave the passphrase empty and export stays plain JSON.
- Wipe this device (IndexedDB + parent session key). Does not delete the Supabase account.
- Baseline response headers. No analytics script.

Leave `OPENAI_API_KEY` unset if video titles must not be sent to a model. The learning route already returns an error in that case and the player continues.
