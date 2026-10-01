import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { CATEGORIES } from "@/domain/constants";
import { applyWhitelistGates } from "@/domain/gates";
import { listCustomChannels, putLibraryChannel, putLibraryVideos } from "@/adapters/localDb";
import { YoutubeApiError } from "@/adapters/youtubeClient";
import { youtubeSource } from "@/content/sources/youtubeSource";
import { muslimKidsPack } from "@/content/packs/muslimKids";
import { addParentChannel } from "@/app/channelPacks";

const ISLAM_CATEGORY = muslimKidsPack.categoryId;

const parseVideoId = (input) => {
  const value = input.trim();
  const patterns = [/youtu\.be\/([\w-]{11})/, /[?&]v=([\w-]{11})/, /\/shorts\/([\w-]{11})/, /\/embed\/([\w-]{11})/];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[1];
  }
  return /^[\w-]{11}$/.test(value) ? value : null;
};

async function storeUploads(channel, channelId, ageGroup) {
  const uploads = await youtubeSource.listUploads(channelId, 5);
  const gated = applyWhitelistGates(uploads, ageGroup);
  const now = new Date().toISOString();
  if (gated.length) {
    await putLibraryVideos(gated.map((video) => ({
      id: video.id,
      title: video.title,
      description: video.description,
      channelId: video.channelId,
      channelTitle: video.channelTitle || channel.name,
      category: CATEGORIES.EMOTIONAL_INTELLIGENCE,
      ageGroup,
      language: (video.language || "en").slice(0, 2).toLowerCase(),
      durationSeconds: video.durationSeconds,
      viewCount: video.viewCount,
      thumbnail: video.thumbnail,
      approved: true,
      addedAt: now,
      sourceChannelId: channelId,
    })));
  }
  await putLibraryChannel({
    channelId,
    name: channel.name,
    ageGroup,
    categories: [CATEGORIES.EMOTIONAL_INTELLIGENCE],
    language: "en",
    isDefaultTrusted: false,
    active: true,
    reviewedAt: now,
    source: "parent",
  });
}

export default function MuslimKidsPanel({ t, ageGroup, onChanged }) {
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState(null);
  const [videoInput, setVideoInput] = useState("");
  const [alsoChannel, setAlsoChannel] = useState(true);
  const visible = muslimKidsPack.channels.filter((channel) => channel.ages.includes(ageGroup));

  const addPackChannel = async (channel) => {
    setBusy(channel.name);
    setNotice(null);
    try {
      const existing = await listCustomChannels();
      if (existing.some((row) => row.name === channel.name && row.ageGroup === ageGroup && row.status === "approved")) {
        setNotice({ type: "ok", key: "curator.muslimAlready", params: { name: channel.name } });
        return;
      }
      const resolved = await youtubeSource.resolveChannel(channel.query);
      const channelId = resolved?.channelId;
      if (!channelId) {
        setNotice({ type: "error", key: "curator.errorNotFound" });
        return;
      }
      await addParentChannel({ ageGroup, nativeLanguage: "en" }, {
        name: resolved.title || channel.name,
        channelId,
        ageGroup,
        language: "en",
        primaryCategoryId: ISLAM_CATEGORY,
        categoryIds: [ISLAM_CATEGORY],
        categories: [CATEGORIES.EMOTIONAL_INTELLIGENCE],
        status: "approved",
      });
      await storeUploads(channel, channelId, ageGroup);
      setNotice({ type: "ok", key: "curator.muslimAdded", params: { name: resolved.title || channel.name } });
      onChanged?.();
    } catch (error) {
      setNotice({ type: "error", key: error instanceof YoutubeApiError && error.code === "MISSING_API_KEY" ? "curator.noKey" : "curator.errorGeneric" });
    } finally {
      setBusy(null);
    }
  };

  const addVideo = async (event) => {
    event.preventDefault();
    setNotice(null);
    const videoId = parseVideoId(videoInput);
    if (!videoId) {
      setNotice({ type: "error", key: "curator.videoBad" });
      return;
    }
    setBusy("video");
    try {
      const video = await youtubeSource.getVideo(videoId);
      const now = new Date().toISOString();
      await putLibraryVideos([{
        id: video.id,
        title: video.title,
        description: video.description,
        channelId: video.channelId,
        channelTitle: video.channelTitle,
        category: CATEGORIES.EMOTIONAL_INTELLIGENCE,
        ageGroup,
        language: (video.language || "en").slice(0, 2).toLowerCase(),
        durationSeconds: video.durationSeconds,
        viewCount: video.viewCount,
        thumbnail: video.thumbnail,
        approved: true,
        addedAt: now,
        sourceChannelId: video.channelId,
      }]);
      if (alsoChannel && video.channelId) {
        const existing = await listCustomChannels();
        if (!existing.some((row) => row.channelId === video.channelId && row.ageGroup === ageGroup)) {
          await addParentChannel({ ageGroup, nativeLanguage: "en" }, {
            name: video.channelTitle || "Parent channel",
            channelId: video.channelId,
            ageGroup,
            language: "en",
            primaryCategoryId: ISLAM_CATEGORY,
            categoryIds: [ISLAM_CATEGORY],
            categories: [CATEGORIES.EMOTIONAL_INTELLIGENCE],
            status: "approved",
          });
        }
      }
      setVideoInput("");
      setNotice({ type: "ok", key: "curator.videoAdded", params: { title: video.title } });
      onChanged?.();
    } catch (error) {
      setNotice({ type: "error", key: error instanceof YoutubeApiError && error.code === "MISSING_API_KEY" ? "curator.noKey" : "curator.errorGeneric" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="space-y-6 rounded-3xl border border-border bg-card p-6">
      <div>
        <h2 className="font-heading text-xl font-bold">{t("curator.muslimTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("curator.muslimText")}</p>
      </div>
      <ul className="divide-y divide-border">
        {visible.map((channel) => (
          <li key={channel.name} className="flex items-center justify-between gap-3 py-3">
            <p className="font-semibold">{channel.name}</p>
            <button type="button" disabled={busy === channel.name} onClick={() => addPackChannel(channel)} className="flex h-11 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {busy === channel.name ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {t("curator.add")}
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={addVideo} className="space-y-3 border-t border-border pt-4">
        <h3 className="font-heading text-lg font-bold">{t("curator.videoTitle")}</h3>
        <p className="text-sm text-muted-foreground">{t("curator.videoText")}</p>
        <input value={videoInput} onChange={(e) => setVideoInput(e.target.value)} placeholder={t("curator.videoPlaceholder")} className="h-12 w-full rounded-xl border border-input bg-background px-4" />
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={alsoChannel} onChange={(e) => setAlsoChannel(e.target.checked)} />
          {t("curator.videoAlsoChannel")}
        </label>
        <button type="submit" disabled={busy === "video"} className="flex h-12 items-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-50">
          {busy === "video" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
          {t("curator.add")}
        </button>
      </form>
      {notice && <p className={`text-sm font-medium ${notice.type === "error" ? "text-destructive" : "text-primary"}`}>{t(notice.key, notice.params)}</p>}
    </section>
  );
}
