// Runtime channel vetting + verified-registry state. Registry channels feed the
// feed automatically (parents opt out per age group); brand-new channels found
// through viral discovery must prove themselves — an established channel with a
// zero-tolerance upload scan — then join automatically, flagged "new" for parents.
import { EDUCATIONAL_CATEGORIES } from "@/domain/constants";
import { passesKeywordBlocker } from "@/domain/gates";
import { verifiedRegistryForAge } from "@/data/verifiedChannels";
import { getCached, putCached, uid, vettingKeys } from "@/adapters/localDb";
import { channelStats, fetchChannelUploads } from "@/adapters/youtubeClient";

// A channel must be this established to even be considered: 10k+ subscribers and
// 50+ uploads mean a real, accountable creator — not a fresh anonymous account.
const VET_MIN_SUBSCRIBERS = 10000;
const VET_MIN_UPLOADS = 50;
const VET_SCAN_UPLOADS = 15; // recent uploads scanned; ONE flagged video disqualifies
const MAX_CANDIDATES_PER_RUN = 3; // bounds API cost per feed build

// --- Verified registry (hand-curated; parent opt-out is scoped per age group) ---
export async function listRemovedVerified(ageGroup) {
  return (await getCached(vettingKeys.removed(ageGroup))) ?? [];
}

export async function activeRegistryForAge(ageGroup) {
  const removed = new Set(await listRemovedVerified(ageGroup));
  return verifiedRegistryForAge(ageGroup).filter((channel) => !removed.has(channel.name));
}

export async function removeVerifiedChannel(name, ageGroup) {
  const removed = await listRemovedVerified(ageGroup);
  if (!removed.includes(name)) {
    removed.push(name);
    await putCached(vettingKeys.removed(ageGroup), removed);
  }
}

export async function restoreVerifiedChannel(name, ageGroup) {
  const removed = await listRemovedVerified(ageGroup);
  await putCached(vettingKeys.removed(ageGroup), removed.filter((n) => n !== name));
}

// --- Runtime-vetted channels (auto-added by the vetting criteria, flagged "new") ---
export async function listConfirmedChannels(ageGroup) {
  return (await getCached(vettingKeys.confirmed(ageGroup))) ?? [];
}

export async function confirmedChannelsForAge(ageGroup) {
  const list = await listConfirmedChannels(ageGroup);
  return list.map((c) => ({ name: c.name, channelId: c.channelId, categories: [c.category], nativeLanguage: "en" }));
}

// Removing a vetted channel opts it out for this age group — it is never re-added.
export async function dismissConfirmedChannel(id, ageGroup) {
  const confirmed = await listConfirmedChannels(ageGroup);
  const entry = confirmed.find((c) => c.id === id);
  await putCached(vettingKeys.confirmed(ageGroup), confirmed.filter((c) => c.id !== id));
  if (entry) {
    const dismissed = (await getCached(vettingKeys.dismissed(ageGroup))) ?? [];
    if (!dismissed.includes(entry.channelId)) {
      dismissed.push(entry.channelId);
      await putCached(vettingKeys.dismissed(ageGroup), dismissed);
    }
  }
}

// Vets one channel: established (subscribers + upload history) with a
// zero-tolerance scan of its most recent uploads.
async function vetChannel(channelId) {
  const stats = await channelStats(channelId);
  if (!stats || stats.subscriberCount < VET_MIN_SUBSCRIBERS || stats.videoCount < VET_MIN_UPLOADS) {
    return { pass: false };
  }
  const uploads = await fetchChannelUploads(channelId, VET_SCAN_UPLOADS).catch(() => null);
  if (!uploads) return { pass: false };
  return { pass: uploads.every(passesKeywordBlocker) };
}

// Called (fire-and-forget) during feed builds: candidate channels behind viral
// educational videos get vetted; passes land in the parent's quick-tap list.
export async function vetCandidates(ageGroup, videos) {
  const idMap = (await getCached("channelIds")) ?? {};
  const knownIds = new Set(Object.values(idMap)); // whitelist / registry / custom channels
  const dismissed = new Set((await getCached(vettingKeys.dismissed(ageGroup))) ?? []);
  const queued = new Set((await listConfirmedChannels(ageGroup)).map((c) => c.channelId));

  const candidates = [];
  videos.forEach((video) => {
    if (!video.channelId || !EDUCATIONAL_CATEGORIES.includes(video.category)) return;
    if (candidates.some((c) => c.channelId === video.channelId)) return;
    if (knownIds.has(video.channelId) || dismissed.has(video.channelId) || queued.has(video.channelId)) return;
    candidates.push({ channelId: video.channelId, name: video.channelTitle || "", category: video.category });
  });

  let added = 0;
  for (const candidate of candidates.slice(0, MAX_CANDIDATES_PER_RUN)) {
    const resultKey = `vetResult:${candidate.channelId}`;
    let result = await getCached(resultKey);
    if (!result) {
      result = await vetChannel(candidate.channelId).catch(() => null);
      if (result) await putCached(resultKey, result);
    }
    if (!result || !result.pass) continue;
    const confirmed = await listConfirmedChannels(ageGroup);
    if (confirmed.some((c) => c.channelId === candidate.channelId)) continue;
    confirmed.push({ id: uid(), addedAt: new Date().toISOString(), ...candidate });
    await putCached(vettingKeys.confirmed(ageGroup), confirmed);
    added += 1;
  }
  return added;
}