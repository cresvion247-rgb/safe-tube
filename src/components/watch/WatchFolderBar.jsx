import { useEffect, useState } from "react";
import { loadCategoryTree } from "@/app/categories";
import { visibleTreeForProfile, legacyCategoryToId } from "@/domain/categories";
import CategoryBrowse, { videosInCategory } from "@/components/CategoryBrowse";

export default function WatchFolderBar({ videos, onFilter, t }) {
  const [tree, setTree] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    loadCategoryTree().then((full) => {
      const keys = videos.map((v) => v.channelId || v.channelTitle || v.id);
      const links = videos.flatMap((v) => {
        const id = v.categoryId || legacyCategoryToId(v.category);
        if (!id) return [];
        return [{ channelKey: v.channelId || v.id, categoryId: id }];
      });
      setTree(visibleTreeForProfile(full, links, keys.length ? keys : links.map((l) => l.channelKey)));
    });
  }, [videos]);

  useEffect(() => {
    onFilter(videosInCategory(videos, tree, selectedId));
  }, [selectedId, videos, tree]);

  if (!tree.length) return null;
  return <CategoryBrowse tree={tree} selectedId={selectedId} onSelect={setSelectedId} t={t} />;
}
