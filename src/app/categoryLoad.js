import { applyWhitelistGates } from "@/domain/gates";
import { searchVideos } from "@/adapters/youtubeClient";
import { putLibraryVideos } from "@/adapters/localDb";
import { safeQuery } from "@/domain/safety";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function loadCategoryVideos(ageGroup, label, categoryId) {
  const term = safeQuery(label.includes("Faith") || label.includes("Islam") ? "Quran stories for kids" : `${label} for kids`);
  if (!term) return [];
  await sleep(1500);
  const found = await searchVideos({ term, languageCode: "en", maxResults: 4 });
  const gated = applyWhitelistGates(found, ageGroup).slice(0, 2);
  const now = new Date().toISOString();
  const videos = gated.map((video) => ({
    id: video.id,
    title: video.title,
    description: video.description,
    channelId: video.channelId,
    channelTitle: video.channelTitle,
    category: "Emotional_Intelligence",
    categoryId,
    ageGroup,
    language: "en",
    durationSeconds: video.durationSeconds,
    viewCount: video.viewCount,
    thumbnail: video.thumbnail,
    approved: true,
    addedAt: now,
    sourceChannelId: video.channelId,
  }));
  if (videos.length) await putLibraryVideos(videos);
  return videos;
}
