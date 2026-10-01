import { getCached, putCached } from "@/adapters/localDb";

const keyFor = (profileId) => `prefs:${profileId}`;

export async function loadPreferences(profileId) {
  return (await getCached(keyFor(profileId))) ?? { categories: {}, kinds: {} };
}

export async function recordPreference(profileId, video, choice) {
  const prefs = await loadPreferences(profileId);
  const delta = choice === "play" ? 1 : -1;
  if (video?.category) prefs.categories[video.category] = (prefs.categories[video.category] || 0) + delta;
  const kind = video?.kind || (String(video?.title || "").toLowerCase().includes("defense") ? "defense" : video?.category === "Health_Movement" ? "exercise" : null);
  if (kind) prefs.kinds[kind] = (prefs.kinds[kind] || 0) + delta;
  await putCached(keyFor(profileId), prefs);
  return prefs;
}

export function preferenceScore(video, prefs) {
  if (!prefs) return 0;
  return (prefs.categories?.[video.category] || 0) + (prefs.kinds?.[video.kind] || 0);
}
