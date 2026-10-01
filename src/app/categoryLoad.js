import { applyWhitelistGates } from "@/domain/gates";
import { searchVideos } from "@/adapters/youtubeClient";
import { putLibraryVideos } from "@/adapters/localDb";
import { safeQuery } from "@/domain/safety";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const HINT = { es: "en español", fr: "en français", de: "auf Deutsch", zh: "中文", ar: "بالعربية", hi: "हिंदी", pt: "em português", ja: "日本語", ru: "на русском", it: "in italiano", ko: "한국어", tr: "Türkçe", eu: "euskara", id: "bahasa Indonesia", pl: "po polsku", ur: "اردو" };

export async function loadCategoryVideos(ageGroup, label, categoryId, languages = ["en"], query) {
  const faith = /faith|islam|quran|iqra|qaida|tajweed/i.test(`${label} ${query || ""}`);
  const base = query || (faith ? "Quran lessons for kids" : `${label} for kids`);
  const codes = [...new Set((languages.length ? languages : ["en"]).map((code) => String(code).slice(0, 2).toLowerCase()))].slice(0, 1);
  const saved = [];
  for (const language of codes) {
    const hinted = language === "en" ? base : `${base} ${HINT[language] || language}`;
    const term = safeQuery(hinted);
    if (!term) continue;
    await sleep(1500);
    const found = await searchVideos({ term, languageCode: language, maxResults: 4 });
    const gated = applyWhitelistGates(found, ageGroup).slice(0, 2);
    const now = new Date().toISOString();
    const videos = gated.map((video) => ({
      id: video.id,
      title: video.title,
      description: video.description,
      channelId: video.channelId,
      channelTitle: video.channelTitle,
      category: faith ? "Literacy_Language" : "Emotional_Intelligence",
      categoryId,
      ageGroup,
      language,
      durationSeconds: video.durationSeconds,
      viewCount: video.viewCount,
      thumbnail: video.thumbnail,
      approved: true,
      addedAt: now,
      sourceChannelId: video.channelId,
    }));
    if (videos.length) await putLibraryVideos(videos);
    saved.push(...videos);
  }
  return saved;
}
