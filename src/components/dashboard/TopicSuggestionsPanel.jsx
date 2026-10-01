import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { listProfiles, listCustomChannels } from "@/adapters/localDb";
import { YoutubeApiError } from "@/adapters/youtubeClient";
import { youtubeSource } from "@/content/sources/youtubeSource";
import { topicSuggestions, exerciseSuggestions } from "@/content/packs/topicSuggestions";
import { addParentChannel } from "@/app/channelPacks";
import { CATEGORIES } from "@/domain/constants";

export default function TopicSuggestionsPanel({ t, onChanged }) {
  const [profiles, setProfiles] = useState([]);
  const [profileId, setProfileId] = useState(null);
  const [added, setAdded] = useState([]);
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState(null);

  const profile = profiles.find((item) => item.id === profileId) ?? profiles[0] ?? null;
  const taken = new Set(added.map((name) => name.toLowerCase()));
  const rows = profile
    ? [...exerciseSuggestions(profile.ageGroup), ...topicSuggestions(profile.targetLanguages, profile.ageGroup)].filter((row) => !taken.has(row.name.toLowerCase())).slice(0, 8)
    : [];

  const refresh = async () => {
    const [nextProfiles, channels] = await Promise.all([listProfiles(), listCustomChannels()]);
    setProfiles(nextProfiles);
    setAdded(channels.map((row) => row.name));
  };

  useEffect(() => {
    refresh();
  }, []);

  const add = async (row) => {
    setBusy(row.name);
    setNotice(null);
    try {
      const resolved = await youtubeSource.resolveChannel(row.query);
      if (!resolved?.channelId) {
        setNotice("That suggestion could not be found. Paste the channel below.");
        return;
      }
      await addParentChannel({ ageGroup: profile.ageGroup, nativeLanguage: row.language }, {
        name: row.name,
        channelId: resolved.channelId,
        ageGroup: profile.ageGroup,
        language: row.language,
        primaryCategoryId: "cat_faith",
        categoryIds: ["cat_faith"],
        categories: [row.category || CATEGORIES.HEALTH_MOVEMENT],
        status: "approved",
      });
      setNotice(`${row.name} was added.`);
      await refresh();
      onChanged?.();
    } catch (error) {
      setNotice(error instanceof YoutubeApiError ? error.message : "Could not add that channel.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-6">
      <h2 className="font-heading text-xl font-bold">Language, exercise, and self-defense</h2>
      <p className="text-sm text-muted-foreground">Each extra language gets an age-matched suggestion for the English topics. Exercise and self-defense follow the child's age. Kids can skip those videos and the app will offer fewer like them.</p>
      <div className="flex flex-wrap gap-2">
        {profiles.map((item) => (
          <button key={item.id} type="button" onClick={() => setProfileId(item.id)} className={`h-11 rounded-full border-2 px-4 text-sm font-semibold ${profile?.id === item.id ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
            {item.childName}
          </button>
        ))}
      </div>
      <ul className="divide-y divide-border">
        {rows.map((row) => (
          <li key={row.name} className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className="font-semibold">{row.name}</p>
              <p className="text-xs text-muted-foreground">{row.kind === "defense" ? "Self-defense" : row.kind === "exercise" ? "Exercise" : row.language.toUpperCase()}</p>
            </div>
            <button type="button" disabled={busy === row.name} onClick={() => add(row)} className="flex h-11 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {busy === row.name ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {t("curator.add")}
            </button>
          </li>
        ))}
      </ul>
      {notice && <p className="text-sm font-medium text-primary">{notice}</p>}
    </section>
  );
}
