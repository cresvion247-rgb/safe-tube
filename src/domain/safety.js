const VIDEO_ID = /^[\w-]{11}$/;
const CHANNEL_ID = /^UC[\w-]{22}$/;
const DANGER = ["weapon", "knife", "gun", "firearm", "choke", "strangle", "bomb", "explosive"];

export function plainText(value, max = 120) {
  return String(value || "")
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "")
    .replace(/[\u0000-\u001f]/g, "")
    .trim()
    .slice(0, max);
}

export function safeVideoId(value) {
  const id = String(value || "").trim();
  return VIDEO_ID.test(id) ? id : null;
}

export function safeChannelId(value) {
  const id = String(value || "").trim();
  return CHANNEL_ID.test(id) ? id : null;
}

export function safeQuery(value) {
  const query = plainText(value, 80);
  if (!query || DANGER.some((word) => query.toLowerCase().includes(word))) return null;
  return query;
}

export function youtubeThumbnail(url) {
  const value = String(url || "");
  return value.startsWith("https://i.ytimg.com/") || value.startsWith("https://yt3.ggpht.com/") ? value : "";
}
