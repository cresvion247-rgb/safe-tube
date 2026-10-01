import { useEffect, useState } from "react";
import { FolderPlus, Eye, EyeOff, Trash2 } from "lucide-react";
import { getChildren } from "@/domain/categories";
import {
  loadCategoryTree,
  addCustomCategory,
  hideCategory,
  deleteCustomCategory,
} from "@/app/categories";
import { categoryLabel } from "@/components/dashboard/CategoryPicker";

function Branch({ tree, parentId, t, onChange, depth = 0 }) {
  const children = getChildren(
    tree.map((n) => ({ ...n, hidden: false })),
    parentId
  );
  if (!children.length) return null;
  return (
    <ul className={depth ? "ml-4 border-l border-border pl-3" : "space-y-1"}>
      {children.map((node) => (
        <li key={node.id} className="py-1">
          <div className="flex items-center justify-between gap-2">
            <p className={`text-sm font-medium ${node.hidden ? "text-muted-foreground line-through" : ""}`}>
              {categoryLabel(node, t)}
              {node.kind === "custom" && (
                <span className="ml-2 text-[11px] font-bold uppercase text-primary">custom</span>
              )}
            </p>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => hideCategory(node.id, !node.hidden).then(onChange)}
                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-accent"
                aria-label={node.hidden ? t("curator.restore") : t("curator.hideCategory")}
              >
                {node.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              {node.kind === "custom" && (
                <button
                  type="button"
                  onClick={() => deleteCustomCategory(node.id).then(onChange)}
                  className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label={t("curator.deleteCategory")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={async () => {
                  const name = window.prompt(t("curator.newSubcategory"));
                  if (!name?.trim()) return;
                  await addCustomCategory({ parentId: node.id, customName: name.trim() });
                  onChange();
                }}
                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-accent"
                aria-label={t("curator.newSubcategory")}
              >
                <FolderPlus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <Branch tree={tree} parentId={node.id} t={t} onChange={onChange} depth={depth + 1} />
        </li>
      ))}
    </ul>
  );
}

export default function CategoryTreeManager({ t }) {
  const [tree, setTree] = useState([]);

  const refresh = () => loadCategoryTree().then(setTree);

  useEffect(() => {
    refresh();
  }, []);

  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-6">
      <h2 className="font-heading text-xl font-bold">{t("curator.foldersTitle")}</h2>
      <p className="text-sm text-muted-foreground">{t("curator.foldersText")}</p>
      <button
        type="button"
        onClick={async () => {
          const name = window.prompt(t("curator.newRootCategory"));
          if (!name?.trim()) return;
          await addCustomCategory({ parentId: null, customName: name.trim() });
          refresh();
        }}
        className="flex h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold"
      >
        <FolderPlus className="h-4 w-4" /> {t("curator.newRootCategory")}
      </button>
      <Branch tree={tree} parentId={null} t={t} onChange={refresh} />
    </section>
  );
}
