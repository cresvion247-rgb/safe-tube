import { useEffect, useState } from "react";
import { systemCategoryTree } from "@/data/categoryTree";
import { idToLegacyCategory } from "@/domain/categories";
import CategoryBrowse, { videosInCategory } from "@/components/CategoryBrowse";
import { loadCategoryVideos } from "@/app/categoryLoad";
import { startSlowInflow } from "@/app/inflow";
import { IQRA_LEVELS, iqraQuery } from "@/content/packs/iqra";

const IQRA = "cat_iqra";
const memoryKey = (ageGroup) => `safe-tube-choice:${ageGroup || "all"}`;
const seenKey = (ageGroup) => `safe-tube-seen:${ageGroup || "all"}`;

function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}
function shuffleFresh(videos, seen) {
  const fresh = videos.filter((video) => !seen.includes(video.id));
  const repeated = videos.filter((video) => seen.includes(video.id));
  const mix = (list) => [...list].sort(() => Math.random() - 0.5);
  return [...mix(fresh), ...mix(repeated)];
}
function unique(videos) {
  return videos.filter((video, index, list) => list.findIndex((item) => item.id === video.id) === index);
}

export default function WatchFolderBar({ videos, ageGroup, languages = ["en"], readingLevel = "letters", onFilter, t }) {
  const [tree] = useState(() => systemCategoryTree().filter((node) => !node.hidden));
  const [selectedId, setSelectedId] = useState(() => readJson(memoryKey(ageGroup), {}).categoryId || null);
  const [extra, setExtra] = useState([]);
  const [notice, setNotice] = useState("Videos for this category will load over time.");
  const [instruction, setInstruction] = useState(() => readJson(memoryKey(ageGroup), {}).language || languages[0] || "en");
  const [suggestions, setSuggestions] = useState([]);
  const group = ageGroup || videos[0]?.ageGroup;
  const iqraOpen = selectedId === IQRA || selectedId?.startsWith("cat_iqra_");
  const choices = [...new Set((languages.length ? languages : ["en"]).map((code) => String(code).slice(0, 2).toLowerCase()))];

  const remember = (categoryId, language, list) => {
    localStorage.setItem(memoryKey(group), JSON.stringify({ categoryId, language }));
    setSuggestions(list.slice(0, 8));
    if (list.length) onFilter(list);
  };

  useEffect(() => {
    if (!group) return undefined;
    return startSlowInflow({
      ageGroup: group,
      language: instruction,
      onVideos: (rows) => {
        setExtra((current) => unique([...current, ...rows]));
        setSuggestions((current) => unique([...rows, ...current]).slice(0, 8));
        setNotice("New videos are arriving slowly.");
      },
    });
  }, [group, instruction]);

  useEffect(() => {
    const filtered = videosInCategory([...videos, ...extra], tree, selectedId);
    if (!filtered.length) return;
    setSuggestions(shuffleFresh(filtered, readJson(seenKey(group), [])).slice(0, 8));
  }, [selectedId, videos, tree, extra, group]);

  const select = async (id, level = readingLevel, language = instruction) => {
    setSelectedId(id);
    if (!group) return;
    const node = tree.find((item) => item.id === id);
    const legacy = idToLegacyCategory(id);
    const iqra = id === IQRA || id?.startsWith("cat_iqra_");
    const step = id?.replace("cat_iqra_", "") || level;
    localStorage.setItem(memoryKey(group), JSON.stringify({ categoryId: id, language }));
    setNotice(`${language.toUpperCase()} videos will load over time.`);
    const existing = shuffleFresh(videosInCategory([...videos, ...extra], tree, id), readJson(seenKey(group), []));
    if (existing.length) remember(id, language, existing);
    try {
      const targets = id ? [node].filter(Boolean) : tree.filter((item) => !item.parentId && !item.hidden).slice(0, 4);
      let loaded = [];
      for (const target of targets) {
        const targetId = target.id;
        const targetIqra = targetId === IQRA || targetId.startsWith("cat_iqra_");
        const batch = await loadCategoryVideos(group, idToLegacyCategory(targetId) || target.slug || "Learning", targetId, [language], targetIqra ? iqraQuery(step, group, language) : undefined);
        loaded = unique([...loaded, ...batch]);
      }
      if (!targets.length && id) loaded = await loadCategoryVideos(group, legacy || "Learning", id, [language], iqra ? iqraQuery(step, group, language) : undefined);
      const merged = shuffleFresh(unique([...existing, ...loaded]), readJson(seenKey(group), []));
      if (loaded.length) setExtra((current) => unique([...current, ...loaded]));
      if (merged.length) {
        remember(id, language, merged);
        setNotice(`${merged.length} ${language.toUpperCase()} videos are ready. More will arrive over time.`);
      }
    } catch {
      setNotice(`${language.toUpperCase()} videos will load over time.`);
    }
  };

  const chooseSuggestion = (video) => {
    const seen = readJson(seenKey(group), []).filter((id) => id !== video.id);
    localStorage.setItem(seenKey(group), JSON.stringify([video.id, ...seen].slice(0, 40)));
    remember(selectedId, instruction, [video, ...suggestions.filter((item) => item.id !== video.id)]);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="space-y-2">
        <CategoryBrowse tree={tree} selectedId={selectedId} onSelect={select} t={t} />
        {iqraOpen && (
          <label className="flex items-center text-sm text-muted-foreground">
            Instruction
            <select value={instruction} onChange={(event) => { const code = event.target.value; setInstruction(code); select(selectedId || IQRA, readingLevel, code); }} className="ml-2 h-10 rounded-full border border-border bg-card px-3">
              {choices.map((code) => <option key={code} value={code}>{code.toUpperCase()}</option>)}
            </select>
          </label>
        )}
        <p className="text-sm text-muted-foreground">{notice}</p>
      </div>
      <aside className="rounded-3xl border border-border bg-card p-4">
        <p className="mb-2 text-sm font-semibold text-muted-foreground">Suggested</p>
        {suggestions.length === 0 ? <p className="text-sm text-muted-foreground">Suggestions appear as videos load.</p> : (
          <ul className="space-y-2">
            {suggestions.map((video) => (
              <li key={video.id}>
                <button type="button" onClick={() => chooseSuggestion(video)} className="w-full rounded-xl bg-accent p-3 text-left text-sm hover:bg-accent/80">
                  <p className="line-clamp-2 font-medium">{video.title}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
