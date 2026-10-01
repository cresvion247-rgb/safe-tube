import { applyWhitelistGates, passesKeywordBlocker } from "@/domain/gates";
import { searchVideos } from "@/adapters/youtubeClient";
import { putLibraryVideos } from "@/adapters/localDb";
import { safeQuery } from "@/domain/safety";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const HINT = { es: "en español", fr: "en français", de: "auf Deutsch", zh: "中文", ar: "بالعربية", hi: "हिंदी", pt: "em português", ja: "日本語", ru: "на русском", it: "in italiano", ko: "한국어", tr: "Türkçe", eu: "euskara", id: "bahasa Indonesia", pl: "po polsku", ur: "in Urdu اردو" };

function keepLessons(found, ageGroup) {
  const gated = applyWhitelistGates(found, ageGroup);
  if (gated.length) return gated.slice(0, 2);
  return found.filter((video) => passesKeywordBlocker(video) && video.durationSeconds > 0 && video.durationSeconds <= 1800).slice(0, 2);
}

export async function loadCategoryVideos(ageGroup, label, categoryId, languages = ["en"], query) {
  const faith = /faith|islam|quran|iqra|qaida|tajweed/i.test(`${label} ${query || ""}`);
  const base = query || (faith ? "Quran lessons for kids" : `${label} for kids`);
  const codes = [...new Set((languages.length ? languages : ["en"]).map((code) => String(code).slice(0, 2).toLowerCase()))].slice(0, 1);
  const saved = [];
  for (const language of codes) {
    const term = safeQuery(language === "en" ? base : `${base} ${HINT[language] || language}`);
    if (!term) continue;
    await sleep(1200);
    const found = await searchVideos({ term, languageCode: language, maxResults: 8 });
    const gated = keepLessons(found, ageGroup);
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
