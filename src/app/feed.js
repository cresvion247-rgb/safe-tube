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

export async function loadFeed(profile) {
  // Parent-approved videos sync into the library first (local-only, no API calls).
  await importApprovedDiscovery(profile.ageGroup);
  let videos = await getLibraryVideosForProfile(profile);
  if (!videos.length) {
    // Fresh device: bounded first-run import, showing whatever is ready.
    const firstRun = await ensureLibraryVideos(profile);
    if (!firstRun.ok) {
      throw new YoutubeApiError("The video library is not available yet.", firstRun.code || "UNKNOWN");
    }
    videos = await getLibraryVideosForProfile(profile);
  } else {
    // Stored library present: children never wait on YouTube. The library
    // refreshes itself in the background at most once a day.
    maybeAutoRefresh();
  }
  return { videos, fromCache: false };
}

export function makeQueue(videos, tokenBalance, comprehensionScore, ageGroup) {
  return buildQueue(videos, tokenBalance, levelFromScore(comprehensionScore), entertainmentCostFor(ageGroup));
}

export { YoutubeApiError };