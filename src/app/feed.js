// Feed orchestration — library-first. Child feeds are built only from videos
// already stored in the SafeTube Video Library; the only YouTube calls happen
// inside the admin/parent-controlled refresh process (see library.js).
import { entertainmentCostFor } from "@/domain/constants";
import { buildQueue } from "@/domain/sequencer";
import { levelFromScore } from "@/domain/adaptive";
import { YoutubeApiError } from "@/adapters/youtubeClient";
import {
  ensureLibraryVideos,
  getLibraryVideosForProfile,
  importApprovedDiscovery,
  maybeAutoRefresh,
} from "@/app/library";
import { applyPreferences, loadPreferences } from "@/app/preferences";

export async function loadFeed(profile) {
  await importApprovedDiscovery(profile.ageGroup);
  let videos = await getLibraryVideosForProfile(profile);
  if (!videos.length) {
    const firstRun = await ensureLibraryVideos(profile);
    if (!firstRun.ok) {
      throw new YoutubeApiError("The video library is not available yet.", firstRun.code || "UNKNOWN");
    }
    videos = await getLibraryVideosForProfile(profile);
  } else {
    maybeAutoRefresh();
  }
  const prefs = await loadPreferences(profile.id);
  return { videos: applyPreferences(videos, prefs), fromCache: false };
}

export function makeQueue(videos, tokenBalance, comprehensionScore, ageGroup) {
  return buildQueue(videos, tokenBalance, levelFromScore(comprehensionScore), entertainmentCostFor(ageGroup));
}

export { YoutubeApiError };
