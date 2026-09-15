// SafeTube Kids — server-side YouTube Data API v3 proxy.
// This is the ONLY piece that holds the API key. Bounded, validated actions only:
//   resolveChannels, channelUploads, searchVideos, channelStats. Responses are domain-shaped with
//   structured errors: { ok, error, code }.
import { secrets } from "base44:runtime";

const API_BASE = "https://www.googleapis.com/youtube/v3";
const ABSOLUTE_MAX_RESULTS = 25;

const fail = (error, code, status = 400) => Response.json({ ok: false, error, code }, { status });
const ok = (data) => Response.json({ ok: true, ...data });

async function ytFetch(path, params, apiKey) {
  const url = new URL(API_BASE + path);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  url.searchParams.set("key", apiKey);
  const response = await fetch(url.toString());
  if (!response.ok) {
    let reason = `YouTube API returned ${response.status}`;
    try {
      const body = await response.json();
      if (body?.error?.message) reason = body.error.message;
    } catch {
      /* non-JSON error body — keep the status-based reason */
    }
    const error = new Error(reason);
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

const boundedMaxResults = (requested, fallback) => {
  const value = Number(requested);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(Math.max(Math.trunc(value), 1), ABSOLUTE_MAX_RESULTS);
};

export default async function (req) {
  try {
    const apiKey = secrets.get("YOUTUBE_API_KEY");
    if (!apiKey) {
      return fail("The YouTube connection is not configured yet. Parents can add the API key in the app secrets.", "MISSING_API_KEY", 503);
    }

    const payload = await req.json().catch(() => null);
    if (!payload || typeof payload !== "object") return fail("Invalid request body.", "INVALID_INPUT");

    if (payload.action === "resolveChannels") {
      const queries = Array.isArray(payload.queries)
        ? payload.queries.filter((q) => typeof q === "string" && q.trim().length > 0).slice(0, 10)
        : [];
      if (queries.length === 0) return fail("queries must be a non-empty array of channel names (max 10).", "INVALID_INPUT");
      const channels = [];
      for (const query of queries) {
        const data = await ytFetch("/search", { part: "snippet", q: query, type: "channel", maxResults: 1 }, apiKey);
        const item = data.items?.[0];
        channels.push(
          item
            ? { query, channelId: item.snippet?.channelId ?? item.id?.channelId ?? null, title: item.snippet?.title ?? "" }
            : { query, channelId: null, title: "" }
        );
      }
      return ok({ channels });
    }

    if (payload.action === "channelUploads") {
      const channelId = typeof payload.channelId === "string" ? payload.channelId.trim() : "";
      if (!channelId.startsWith("UC") || channelId.length < 20) return fail("channelId must be a YouTube channel id (UC...).", "INVALID_INPUT");
      const maxResults = boundedMaxResults(payload.maxResults, 12);
      const channel = await ytFetch("/channels", { part: "contentDetails", id: channelId }, apiKey);
      const uploadsPlaylist = channel.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
      if (!uploadsPlaylist) return fail("Channel not found or it has no public uploads.", "NOT_FOUND", 404);
      const playlist = await ytFetch("/playlistItems", { part: "contentDetails", playlistId: uploadsPlaylist, maxResults }, apiKey);
      const ids = (playlist.items || []).map((i) => i.contentDetails?.videoId).filter(Boolean);
      if (ids.length === 0) return ok({ videos: [] });
      const details = await ytFetch("/videos", { part: "snippet,contentDetails,statistics", id: ids.join(",") }, apiKey);
      return ok({ videos: (details.items || []).map(toVideo) });
    }

    if (payload.action === "searchVideos") {
      const term = typeof payload.term === "string" ? payload.term.trim() : "";
      if (!term || term.length > 120) return fail("term must be a string of 1-120 characters.", "INVALID_INPUT");
      const languageCode = typeof payload.languageCode === "string" && /^[a-z]{2}$/.test(payload.languageCode)
        ? payload.languageCode
        : "en";
      const maxResults = boundedMaxResults(payload.maxResults, 12);
      const search = await ytFetch(
        "/search",
        { part: "snippet", q: term, type: "video", maxResults, relevanceLanguage: languageCode, safeSearch: "strict", videoEmbeddable: true },
        apiKey
      );
      const ids = (search.items || []).map((i) => i.id?.videoId).filter(Boolean);
      if (ids.length === 0) return ok({ videos: [] });
      const details = await ytFetch("/videos", { part: "snippet,contentDetails,statistics", id: ids.join(",") }, apiKey);
      return ok({ videos: (details.items || []).map(toVideo) });
    }

    if (payload.action === "channelStats") {
      const channelId = typeof payload.channelId === "string" ? payload.channelId.trim() : "";
      if (!channelId.startsWith("UC") || channelId.length < 20) return fail("channelId must be a YouTube channel id (UC...).", "INVALID_INPUT");
      const data = await ytFetch("/channels", { part: "statistics", id: channelId }, apiKey);
      const stats = data.items?.[0]?.statistics;
      if (!stats) return fail("Channel not found.", "NOT_FOUND", 404);
      return ok({ stats: { subscriberCount: Number(stats.subscriberCount ?? 0), videoCount: Number(stats.videoCount ?? 0) } });
    }

    return fail("Unknown action. Use resolveChannels, channelUploads, searchVideos, or channelStats.", "INVALID_ACTION");
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || "Unexpected server error.", code: error.code || "YOUTUBE_API_ERROR" },
      { status: 500 }
    );
  }
}