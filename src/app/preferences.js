import { getCached, putCached } from "@/adapters/localDb";

const keyFor = (profileId) => `prefs:${profileId}`;
const CAP = 3;
const HOUR = 60 * 60 * 1000;
const MAX_UPDATES = 30;

export async function loadPreferences(profileId) {
  return (await getCached(keyFor(profileId))) ?? { categories: {}, channels: {}, stamps: [] };
}

export async function resetPreferences(profileId) {
  await putCached(keyFor(profileId), { categories: {}, channels: {}, stamps: [] });
}

export async function recordPreference(profileId, video, choice) {
  if (choice !== "play" && choice !== "skip") return loadPreferences(profileId);
  const prefs = await loadPreferences(profileId);
  const now = Date.now();
  prefs.stamps = (prefs.stamps || []).filter((stamp) => now - stamp < HOUR);
  if (prefs.stamps.length >= MAX_UPDATES) return prefs;
  prefs.stamps.push(now);
  const delta = choice === "play" ? 1 : -1;
  if (video?.category) prefs.categories[video.category] = clamp((prefs.categories[video.category] || 0) + delta);
  const channel = video?.channelTitle || video?.channelId;
  if (channel) prefs.channels[channel] = clamp((prefs.channels[channel] || 0) + delta);
  await putCached(keyFor(profileId), prefs);
  return prefs;
}

const clamp = (value) => Math.max(-CAP, Math.min(CAP, value));

export function preferenceScore(video, prefs) {
  if (!prefs) return 0;
  const channel = video?.channelTitle || video?.channelId;
  return (prefs.categories?.[video.category] || 0) + (prefs.channels?.[channel] || 0);
}

export function applyPreferences(videos, prefs) {
  const reading = [];
  const rest = [];
  for (const video of videos) {
    const title = `${video.title || ""} ${video.channelTitle || ""}`.toLowerCase();
    if (title.includes("qaida") || title.includes("quran") || title.includes("tajweed")) reading.push(video);
    else rest.push(video);
  }
  const ranked = [...rest].sort((a, b) => preferenceScore(b, prefs) - preferenceScore(a, prefs));
  const kept = [];
  const seen = {};
  for (const video of ranked) {
    const score = prefs?.categories?.[video.category] || 0;
    seen[video.category] = (seen[video.category] || 0) + 1;
    if (score <= -2 && seen[video.category] > 1) continue;
    if (seen[video.category] > 3) continue;
    kept.push(video);
  }
  return [...reading, ...kept];
}
