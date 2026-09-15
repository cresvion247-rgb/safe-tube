const API_BASE = "https://www.googleapis.com/youtube/v3";
const fail = (res, error, code, status = 400) => res.status(status).json({ ok: false, error, code });
const ok = (res, data) => res.status(200).json({ ok: true, ...data });

async function ytFetch(path, params, apiKey) {
  const url = new URL(API_BASE + path);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  url.searchParams.set("key", apiKey);
  const response = await fetch(url.toString());
  if (!response.ok) {
    const error = new Error(`YouTube API returned ${response.status}`);
    error.code = response.status === 403 ? "YOUTUBE_QUOTA_OR_KEY" : "YOUTUBE_API_ERROR";
    throw error;
  }
  return response.json();
}

function parseIsoDuration(iso) {
  const match = /^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso || "");
  if (!match) return 0;
  return Number(match[1] || 0) * 86400 + Number(match[2] || 0) * 3600 + Number(match[3] || 0) * 60 + Number(match[4] || 0);
}

function toVideo(item) {
  return {
    id: item.id,
    title: item.snippet?.title ?? "",
    description: item.snippet?.description ?? "",
    channelId: item.snippet?.channelId ?? "",
    channelTitle: item.snippet?.channelTitle ?? "",
    language: item.snippet?.defaultAudioLanguage ?? "",
    publishedAt: item.snippet?.publishedAt ?? "",
    durationSeconds: parseIsoDuration(item.contentDetails?.duration),
    viewCount: Number(item.statistics?.viewCount ?? 0),
    thumbnail: item.snippet?.thumbnails?.medium?.url ?? "",
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return fail(res, "Method not allowed.", "INVALID_ACTION", 405);
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return fail(res, "Add YOUTUBE_API_KEY in Vercel env.", "MISSING_API_KEY", 503);
    const payload = req.body && typeof req.body === "object" ? req.body : {};
    if (payload.action === "resolveChannels") {
      const queries = Array.isArray(payload.queries) ? payload.queries.filter((q) => typeof q === "string" && q.trim()).slice(0, 10) : [];
      if (!queries.length) return fail(res, "queries must be a non-empty array.", "INVALID_INPUT");
      const channels = [];
      for (const query of queries) {
        const data = await ytFetch("/search", { part: "snippet", q: query, type: "channel", maxResults: 1 }, apiKey);
        const item = data.items?.[0];
        channels.push(item ? { query, channelId: item.snippet?.channelId ?? item.id?.channelId ?? null, title: item.snippet?.title ?? "" } : { query, channelId: null, title: "" });
      }
      return ok(res, { channels });
    }
    if (payload.action === "channelUploads") {
      const channelId = typeof payload.channelId === "string" ? payload.channelId.trim() : "";
      if (!channelId.startsWith("UC")) return fail(res, "channelId must be a YouTube channel id.", "INVALID_INPUT");
      const maxResults = Math.min(Math.max(Number(payload.maxResults) || 12, 1), 25);
      const channel = await ytFetch("/channels", { part: "contentDetails", id: channelId }, apiKey);
      const uploadsPlaylist = channel.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
      if (!uploadsPlaylist) return fail(res, "Channel not found.", "NOT_FOUND", 404);
      const playlist = await ytFetch("/playlistItems", { part: "contentDetails", playlistId: uploadsPlaylist, maxResults }, apiKey);
      const ids = (playlist.items || []).map((i) => i.contentDetails?.videoId).filter(Boolean);
      if (!ids.length) return ok(res, { videos: [] });
      const details = await ytFetch("/videos", { part: "snippet,contentDetails,statistics", id: ids.join(",") }, apiKey);
      return ok(res, { videos: (details.items || []).map(toVideo) });
    }
    if (payload.action === "searchVideos") {
      const term = typeof payload.term === "string" ? payload.term.trim() : "";
      if (!term) return fail(res, "term is required.", "INVALID_INPUT");
      const languageCode = /^[a-z]{2}$/.test(payload.languageCode || "") ? payload.languageCode : "en";
      const maxResults = Math.min(Math.max(Number(payload.maxResults) || 12, 1), 25);
      const search = await ytFetch("/search", { part: "snippet", q: term, type: "video", maxResults, relevanceLanguage: languageCode, safeSearch: "strict", videoEmbeddable: true }, apiKey);
      const ids = (search.items || []).map((i) => i.id?.videoId).filter(Boolean);
      if (!ids.length) return ok(res, { videos: [] });
      const details = await ytFetch("/videos", { part: "snippet,contentDetails,statistics", id: ids.join(",") }, apiKey);
      return ok(res, { videos: (details.items || []).map(toVideo) });
    }
    if (payload.action === "channelStats") {
      const channelId = typeof payload.channelId === "string" ? payload.channelId.trim() : "";
      const data = await ytFetch("/channels", { part: "statistics", id: channelId }, apiKey);
      const stats = data.items?.[0]?.statistics;
      if (!stats) return fail(res, "Channel not found.", "NOT_FOUND", 404);
      return ok(res, { stats: { subscriberCount: Number(stats.subscriberCount ?? 0), videoCount: Number(stats.videoCount ?? 0) } });
    }
    return fail(res, "Unknown action.", "INVALID_ACTION");
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "Unexpected server error.", code: error.code || "YOUTUBE_API_ERROR" });
  }
}
