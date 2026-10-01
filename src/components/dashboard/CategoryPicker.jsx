import { getAncestors } from "@/domain/categories";

export function categoryLabel(node, t) {
  if (!node) return "";
  if (node.customName) return node.customName;
  if (node.nameKey) return t(node.nameKey);
  return node.slug || node.id;
}

export function categoryPathLabel(tree, id, t) {
  return getAncestors(tree, id)
    .map((node) => categoryLabel(node, t))
    .join(" → ");
}

export default function CategoryPicker({ tree, value, onChange, t, allowEmpty = false }) {
  const rootsFirst = [...tree].sort((a, b) => {
    if (!!a.parentId !== !!b.parentId) return a.parentId ? 1 : -1;
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="h-12 rounded-xl border border-input bg-background px-3 text-sm"
    >
      {allowEmpty && <option value="">{t("curator.pickCategory")}</option>}
      {rootsFirst.map((node) => (
        <option key={node.id} value={node.id}>
          {categoryPathLabel(tree, node.id, t)}
        </option>
      ))}
    </select>
  );
}
