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
  const instruction = instructionLanguage || languages[0] || "en";
  const group = ageGroup || videos[0]?.ageGroup;

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
        setNotice(`No ${language.toUpperCase()} lesson is ready yet. The player stays here until one loads.`);
      }
    } catch {
      setNotice(`${language.toUpperCase()} lessons will load over time.`);
    }
  };

  return (
    <div className="space-y-2">
      <CategoryBrowse tree={tree} selectedId={selectedId} onSelect={select} t={t} />
      <p className="text-sm text-muted-foreground">{notice}</p>
    </div>
  );
}
