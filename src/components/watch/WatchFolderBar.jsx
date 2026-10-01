import { useEffect, useState } from "react";
import { systemCategoryTree } from "@/data/categoryTree";
import { idToLegacyCategory } from "@/domain/categories";
import CategoryBrowse, { videosInCategory } from "@/components/CategoryBrowse";
import { loadCategoryVideos } from "@/app/categoryLoad";
import { IQRA_LEVELS, iqraQuery } from "@/content/packs/iqra";

const IQRA = "cat_iqra";

export default function WatchFolderBar({ videos, ageGroup, languages = ["en"], instructionLanguage, readingLevel = "letters", onFilter, t }) {
  const [tree] = useState(() => systemCategoryTree().filter((node) => !node.hidden));
  const [selectedId, setSelectedId] = useState(null);
  const [extra, setExtra] = useState([]);
  const [notice, setNotice] = useState("Videos for this category will load over time.");
  const [instruction, setInstruction] = useState(instructionLanguage || languages[0] || "en");
  const group = ageGroup || videos[0]?.ageGroup;
  const iqraOpen = selectedId === IQRA || selectedId?.startsWith("cat_iqra_");
  const choices = [...new Set(languages.map((code) => String(code).slice(0, 2).toLowerCase()))];

  useEffect(() => {
    if (instructionLanguage) setInstruction(instructionLanguage);
  }, [instructionLanguage]);

  useEffect(() => {
    const filtered = videosInCategory([...videos, ...extra], tree, selectedId);
    if (selectedId && !filtered.length) return;
    if (filtered.length) onFilter(filtered);
  }, [selectedId, videos, tree, extra]);

  const select = async (id, level = readingLevel, language = instruction) => {
    setSelectedId(id);
    if (!id || !group) return;
    const node = tree.find((item) => item.id === id);
    const legacy = idToLegacyCategory(id);
    const iqra = id === IQRA || id?.startsWith("cat_iqra_");
    const step = id?.replace("cat_iqra_", "") || level;
    setNotice(`${language.toUpperCase()} lessons will load over time. Another language will not play.`);
    try {
      const loaded = await loadCategoryVideos(
        group,
        legacy || node?.slug || "Learning",
        id,
        [language],
        iqra ? iqraQuery(IQRA_LEVELS.some((item) => item.id === step) ? step : level, group, language) : undefined,
      );
      if (loaded.length) {
        setExtra((current) => [...current, ...loaded]);
        setNotice(`A ${language.toUpperCase()} lesson is ready.`);
      } else {
        setNotice(`No ${language.toUpperCase()} lesson is ready yet. The player will stay here until one loads.`);
      }
    } catch {
      setNotice(`${language.toUpperCase()} lessons will load over time.`);
    }
  };

  return (
    <div className="space-y-2">
      <CategoryBrowse tree={tree} selectedId={selectedId} onSelect={select} t={t} />
      {iqraOpen && (
        <div className="flex flex-wrap items-center gap-2">
          {IQRA_LEVELS.map((level) => (
            <button key={level.id} type="button" onClick={() => select(`cat_iqra_${level.id}`, level.id)} className="h-10 rounded-full border border-border bg-card px-4 text-sm font-semibold">{level.label}</button>
          ))}
          <label className="text-sm text-muted-foreground">
            Instruction
            <select value={instruction} onChange={(event) => { setInstruction(event.target.value); select(selectedId || IQRA, readingLevel, event.target.value); }} className="ml-2 h-10 rounded-full border border-border bg-card px-3">
              {choices.map((code) => <option key={code} value={code}>{code.toUpperCase()}</option>)}
            </select>
          </label>
        </div>
      )}
      <p className="text-sm text-muted-foreground">{notice}</p>
    </div>
  );
}
