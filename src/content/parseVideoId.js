/** Pull a YouTube video id out of a watch, short, embed, or youtu.be link. */
export function parseVideoId(input) {
  const value = String(input || "").trim();
  const patterns = [
    /youtu\.be\/([\w-]{11})/,
    /[?&]v=([\w-]{11})/,
    /\/shorts\/([\w-]{11})/,
    /\/embed\/([\w-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[1];
  }
  return /^[\w-]{11}$/.test(value) ? value : null;
}

export function youtubeErrorKey(error) {
  if (error?.code === "MISSING_API_KEY") return "curator.noKey";
  if (error?.code === "YOUTUBE_QUOTA_OR_KEY") return "curator.errorGeneric";
  return "curator.errorGeneric";
}
