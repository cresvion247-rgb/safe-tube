import { resolveChannels, fetchChannelUploads, fetchVideo } from "@/adapters/youtubeClient";

/** Content source used by curator and library. Swap this to add a non-YouTube source. */
export const youtubeSource = {
  async resolveChannel(query) {
    const [resolved] = await resolveChannels([query]);
    return resolved ?? null;
  },
  listUploads(channelId, maxResults = 5) {
    return fetchChannelUploads(channelId, maxResults);
  },
  getVideo(videoId) {
    return fetchVideo(videoId);
  },
};
