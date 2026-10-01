import { useEffect, useState } from "react";
import { systemCategoryTree } from "@/data/categoryTree";
import { idToLegacyCategory } from "@/domain/categories";
import CategoryBrowse, { videosInCategory } from "@/components/CategoryBrowse";
import { loadCategoryVideos } from "@/app/categoryLoad";

export default function WatchFolderBar({ videos, onFilter, t }) {
  const [tree] = useState(() => systemCategoryTree().filter((node) => !node.hidden));
  const [selectedId, setSelectedId] = useState(null);
  const [extra, setExtra] = useState([]);
  const [notice, setNotice] = useState("");
  const ageGroup = videos[0]?.ageGroup;

  useEffect(() => {
    onFilter(videosInCategory([...videos, ...extra], tree, selectedId));
  }, [selectedId, videos, tree, extra]);

  const select = async (id) => {
    setSelectedId(id);
    if (!id || !ageGroup) {
      setNotice("");
      return;
    }
    const node = tree.find((item) => item.id === id);
    const legacy = idToLegacyCategory(id);
    const already = videosInCategory([...videos, ...extra], tree, id);
    if (already.length >= 2) {
      setNotice("");
      return;
    }
    setNotice("Videos for this category will load in time.");
    try {
      const loaded = await loadCategoryVideos(ageGroup, legacy || node?.slug || "Learning");
      if (loaded.length) setExtra((current) => [...current, ...loaded]);
      setNotice(loaded.length ? "A few videos are ready. More can load later." : "Videos for this category will load in time.");
    } catch {
      setNotice("Videos for this category will load in time.");
    }
  };

  return (
    <div className="space-y-2">
      <CategoryBrowse tree={tree} selectedId={selectedId} onSelect={select} t={t} />
      {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
    </div>
  );
}
