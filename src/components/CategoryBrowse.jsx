import { getChildren, getAncestors, getDescendantIds } from "@/domain/categories";
import { categoryLabel } from "@/components/dashboard/CategoryPicker";

export function videosInCategory(videos, tree, categoryId) {
  if (!categoryId) return videos;
  const ids = new Set(getDescendantIds(tree, categoryId));
  return videos.filter((video) => ids.has(video.categoryId) || (video.categoryIds || []).some((id) => ids.has(id)));
}

export default function CategoryBrowse({ tree, selectedId, onSelect, t }) {
  const crumbs = selectedId ? getAncestors(tree, selectedId) : [];
  const children = getChildren(tree, selectedId ?? null);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`h-10 rounded-full border-2 px-3 text-sm font-semibold ${
            !selectedId ? "border-primary bg-primary/10 text-primary" : "border-border"
          }`}
        >
          {t("watch.allCategories")}
        </button>
        {crumbs.map((node) => (
          <button
            key={node.id}
            type="button"
            onClick={() => onSelect(node.id)}
            className={`h-10 rounded-full border-2 px-3 text-sm font-semibold ${
              selectedId === node.id ? "border-primary bg-primary/10 text-primary" : "border-border"
            }`}
          >
            {categoryLabel(node, t)}
          </button>
        ))}
      </div>
      {children.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {children.map((node) => (
            <button
              key={node.id}
              type="button"
              onClick={() => onSelect(node.id)}
              className="h-11 rounded-full border border-border bg-card px-4 text-sm font-semibold"
            >
              {categoryLabel(node, t)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
