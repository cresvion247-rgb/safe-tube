import { applyWhitelistGates } from "@/domain/gates";
import { searchVideos } from "@/adapters/youtubeClient";
import { putLibraryVideos } from "@/adapters/localDb";
import { safeQuery } from "@/domain/safety";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const HINT = { es: "en español", fr: "en français", de: "auf Deutsch", zh: "中文", ar: "بالعربية", hi: "हिंदी", pt: "em português", ja: "日本語", ru: "на русском", it: "in italiano", ko: "한국어", tr: "Türkçe", eu: "euskara", id: "bahasa Indonesia", pl: "po polsku", ur: "in Urdu اردو" };
const MARK = { ur: /اردو|urdu/i, ar: /العربية|arabic/i, hi: /हिंदी|hindi/i, es: /español|spanish/i, fr: /français|french/i };

export function matchesLanguage(video, language) {
  const code = String(language || "en").slice(0, 2).toLowerCase();
  const audio = String(video.language || "").slice(0, 2).toLowerCase();
  const text = `${video.title || ""} ${video.description || ""}`;
  if (code === "en") return !audio || audio === "en";
  if (audio === code) return true;
  return MARK[code] ? MARK[code].test(text) : text.toLowerCase().includes(code);
}

export async function loadCategoryVideos(ageGroup, label, categoryId, languages = ["en"], query) {
  const faith = /faith|islam|quran|iqra|qaida|tajweed/i.test(`${label} ${query || ""}`);
  const base = query || (faith ? "Quran lessons for kids" : `${label} for kids`);
  const language = String((languages[0] || "en")).slice(0, 2).toLowerCase();
  const term = safeQuery(language === "en" ? base : `${base} ${HINT[language] || language}`);
  if (!term) return [];
  await sleep(1500);
  const found = await searchVideos({ term, languageCode: language, maxResults: 8 });
  const gated = applyWhitelistGates(found, ageGroup).filter((video) => matchesLanguage(video, language)).slice(0, 2);
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
  return videos;
}
