import { getCached, putCached } from "@/adapters/localDb";

const keyFor = (profileId) => `prefs:${profileId}`;

export async function loadPreferences(profileId) {
  return (await getCached(keyFor(profileId))) ?? { categories: {}, channels: {} };
}

export async function recordPreference(profileId, video, choice) {
  const prefs = await loadPreferences(profileId);
  const delta = choice === "play" ? 1 : -1;
  if (video?.category) prefs.categories[video.category] = (prefs.categories[video.category] || 0) + delta;
  const channel = video?.channelTitle || video?.channelId;
  if (channel) prefs.channels[channel] = (prefs.channels[channel] || 0) + delta;
  await putCached(keyFor(profileId), prefs);
  return prefs;
}

export function preferenceScore(video, prefs) {
  if (!prefs) return 0;
  const channel = video?.channelTitle || video?.channelId;
  return (prefs.categories?.[video.category] || 0) + (prefs.channels?.[channel] || 0);
}

export function applyPreferences(videos, prefs) {
  const kept = [];
  const skippedCount = {};
  const ranked = [...videos].sort((a, b) => preferenceScore(b, prefs) - preferenceScore(a, prefs));
  for (const video of ranked) {
    const score = prefs?.categories?.[video.category] || 0;
    if (score <= -2) {
      skippedCount[video.category] = (skippedCount[video.category] || 0) + 1;
      if (skippedCount[video.category] > 1) continue;
    }
    kept.push(video);
  }
  return kept;
}
