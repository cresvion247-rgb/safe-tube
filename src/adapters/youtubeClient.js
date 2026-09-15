// YouTube client adapter — the single seam between the app and the server-side function
// that holds the API key. Never imports or stores the key itself.
import { base44 } from "@/api/base44Client";

export class YoutubeApiError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

async function invoke(payload) {
  const response = await base44.functions.invoke("youtubeSearch", payload);
  const data = response?.data;
  if (!data || typeof data !== "object") throw new YoutubeApiError("Unexpected response from the server.", "BAD_RESPONSE");
  if (!data.ok) throw new YoutubeApiError(data.error || "The YouTube service failed.", data.code || "UNKNOWN");
  return data;
}

// Channel-name → channel-id resolution (results cached by the caller).
export async function resolveChannels(queries) {
  const data = await invoke({ action: "resolveChannels", queries });
  return data.channels;
}

// Recent uploads of a known channel, with duration/view metadata.
export async function fetchChannelUploads(channelId, maxResults = 12) {
  const data = await invoke({ action: "channelUploads", channelId, maxResults });
  return data.videos;
}

// Localized popular discovery search.
export async function searchVideos({ term, languageCode, maxResults = 12 }) {
  const data = await invoke({ action: "searchVideos", term, languageCode, maxResults });
  return data.videos;
}

// Public stats for a channel (subscribers, upload count) — used by runtime vetting.
export async function channelStats(channelId) {
  const data = await invoke({ action: "channelStats", channelId });
  return data.stats;
}