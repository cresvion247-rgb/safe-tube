import { useEffect, useState } from "react";
import { systemCategoryTree } from "@/data/categoryTree";
import { idToLegacyCategory } from "@/domain/categories";
import CategoryBrowse, { videosInCategory } from "@/components/CategoryBrowse";
import { loadCategoryVideos } from "@/app/categoryLoad";

export default function WatchFolderBar({ videos, ageGroup, languages = ["en"], onFilter, t }) {
  const [tree] = useState(() => systemCategoryTree().filter((node) => !node.hidden));
  const [selectedId, setSelectedId] = useState(null);
  const [extra, setExtra] = useState([]);
  const [notice, setNotice] = useState("Videos for this category will load over time in each selected language.");
  const group = ageGroup || videos[0]?.ageGroup;

  useEffect(() => {
    const filtered = videosInCategory([...videos, ...extra], tree, selectedId);
    if (selectedId && !filtered.length) return;
    if (filtered.length) onFilter(filtered);
  }, [selectedId, videos, tree, extra]);

  const select = async (id) => {
    setSelectedId(id);
    if (!id || !group) return;
    const node = tree.find((item) => item.id === id);
    const legacy = idToLegacyCategory(id);
    setNotice("Videos for this category will load over time in each selected language.");
    try {
      const loaded = await loadCategoryVideos(group, legacy || node?.slug || "Learning", id, languages);
      if (loaded.length) {
        setExtra((current) => [...current, ...loaded]);
        setNotice("A few videos are ready. More can load later.");
      }
    } catch {
      setNotice("Videos for this category will load over time in each selected language.");
    }
  };

  return (
    <div className="space-y-2">
      <CategoryBrowse tree={tree} selectedId={selectedId} onSelect={select} t={t} />
      <p className="text-sm text-muted-foreground">{notice}</p>
    </div>
  );
}
