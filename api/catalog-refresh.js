const API_BASE = "https://www.googleapis.com/youtube/v3";
const BLOCKED = ["weapon", "gun", "prank", "scary", "horror", "music video", "dance"];
const JOBS = [
  { ageGroup: "toddler", language: "en", term: "calm learning for toddlers", categoryId: "cat_learning" },
  { ageGroup: "preschool", language: "en", term: "preschool science for kids", categoryId: "cat_stem" },
  { ageGroup: "tween", language: "en", term: "health and movement for kids", categoryId: "cat_health" },
  { ageGroup: "teen", language: "en", term: "coding for teens", categoryId: "cat_coding" },
  { ageGroup: "tween", language: "ur", term: "قاعدہ اردو بچوں", categoryId: "cat_iqra" },
  { ageGroup: "tween", language: "ar", term: "تعليم القرآن للأطفال", categoryId: "cat_iqra" },
];

function plain(value, max) {
  return String(value || "").replace(/<[^>]*>/g, "").trim().slice(0, max);
}

function allowed(title) {
  const text = title.toLowerCase();
  return !BLOCKED.some((word) => text.includes(word));
}

async function yt(path, params, apiKey) {
  const url = new URL(API_BASE + path);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  url.searchParams.set("key", apiKey);
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`YouTube ${response.status}`);
  return response.json();
}

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ ok: false, error: "Unauthorized." });
  }
  const apiKey = process.env.YOUTUBE_API_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!apiKey || !supabaseUrl || !serviceKey) {
    return res.status(503).json({ ok: false, error: "Missing YouTube key or Supabase service role." });
  }
  const day = new Date().getUTCDate();
  const job = JOBS[day % JOBS.length];
  const search = await yt("/search", { part: "snippet", q: job.term, type: "video", maxResults: 5, relevanceLanguage: job.language, safeSearch: "strict", videoEmbeddable: true }, apiKey);
  const rows = (search.items || []).filter((item) => allowed(item.snippet?.title || "")).map((item) => ({
    id: item.id?.videoId,
    title: plain(item.snippet?.title, 140),
    channel_title: plain(item.snippet?.channelTitle, 80),
    category_id: job.categoryId,
    age_group: job.ageGroup,
    language: job.language,
    thumbnail: item.snippet?.thumbnails?.medium?.url || "",
    approved: true,
  })).filter((row) => row.id);
  if (!rows.length) return res.status(200).json({ ok: true, added: 0, job });
  const saved = await fetch(`${supabaseUrl}/rest/v1/catalog_videos`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(rows),
  });
  if (!saved.ok) return res.status(500).json({ ok: false, error: "Catalog save failed." });
  return res.status(200).json({ ok: true, added: rows.length, job });
}
