import { applyWhitelistGates, passesKeywordBlocker } from "@/domain/gates";
import { searchVideos } from "@/adapters/youtubeClient";
import { putLibraryVideos } from "@/adapters/localDb";
import { safeQuery } from "@/domain/safety";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const HINT = { es: "en español", fr: "en français", de: "auf Deutsch", zh: "中文", ar: "بالعربية", hi: "हिंئी", pt: "em português", ja: "日本語", ru: "на русском", it: "in italiano", ko: "한국어", tr: "Türkçe", eu: "euskara", id: "bahasa Indonesia", pl: "po polsku", ur: "in Urdu اردو" };
const KEEP = 8;

function keepLessons(found, ageGroup) {
  const gated = applyWhitelistGates(found, ageGroup);
  const pool = gated.length ? gated : found.filter((video) => passesKeywordBlocker(video) && video.durationSeconds > 0 && video.durationSeconds <= 1800);
  return pool.slice(0, KEEP);
}

function toRows(found, ageGroup, language, categoryId, faith) {
  const now = new Date().toISOString();
  return keepLessons(found, ageGroup).map((video) => ({
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
}

export async function loadCategoryVideos(ageGroup, label, categoryId, languages = ["en"], query) {
  const faith = /faith|islam|quran|iqra|qaida|tajweed/i.test(`${label} ${query || ""}`);
  const base = query || (faith ? "Quran lessons for kids" : `${label} for kids`);
  const codes = [...new Set((languages.length ? languages : ["en"]).map((code) => String(code).slice(0, 2).toLowerCase()))].slice(0, 1);
  const saved = [];
  const seen = new Set();
  for (const language of codes) {
    const hint = language === "en" ? "" : ` ${HINT[language] || language}`;
    const terms = [safeQuery(`${base}${hint}`), safeQuery(`${base} lesson${hint}`)].filter(Boolean);
    for (const term of terms) {
      if (saved.length >= KEEP) break;
      await sleep(800);
      const found = await searchVideos({ term, languageCode: language, maxResults: 12 });
      const rows = toRows(found, ageGroup, language, categoryId, faith).filter((video) => !seen.has(video.id));
      rows.forEach((video) => seen.add(video.id));
      if (rows.length) await putLibraryVideos(rows);
      saved.push(...rows);
    }
  }
  return saved.slice(0, KEEP);
}
