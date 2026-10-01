import { systemCategoryTree, CATEGORY_SCHEMA_VERSION } from "@/data/categoryTree";
import { wouldCreateCycle, depthOf, MAX_CATEGORY_DEPTH, legacyCategoryToId } from "@/domain/categories";
import {
  getCached,
  putCached,
  listCustomChannels,
  listLibraryChannels,
  uid,
} from "@/adapters/localDb";

const TREE_KEY = "categoryTree";
const LINKS_KEY = "channelCategoryLinks";
const SCHEMA_KEY = "categorySchemaVersion";

export async function loadCategoryTree() {
  await ensureCategoryMigration();
  return (await getCached(TREE_KEY)) ?? systemCategoryTree();
}

export async function saveCategoryTree(tree) {
  await putCached(TREE_KEY, tree);
  return tree;
}

export async function loadCategoryLinks() {
  await ensureCategoryMigration();
  return (await getCached(LINKS_KEY)) ?? [];
}

export async function saveCategoryLinks(links) {
  await putCached(LINKS_KEY, links);
  return links;
}

export async function addCustomCategory({ parentId, customName, ownerProfileId = null, tokenBucket = null }) {
  const tree = await loadCategoryTree();
  if (parentId && depthOf(tree, parentId) >= MAX_CATEGORY_DEPTH) {
    throw new Error("Categories can only nest four levels deep.");
  }
  const siblings = tree.filter((n) => n.parentId === parentId);
  if (siblings.some((n) => (n.customName || n.slug || "").toLowerCase() === customName.toLowerCase())) {
    throw new Error("A category with that name already exists here.");
  }
  const id = `cat_custom_${uid()}`;
  const node = {
    id,
    parentId,
    slug: customName.replace(/\s+/g, "_"),
    nameKey: null,
    customName,
    kind: "custom",
    facet: "other",
    tokenBucket,
    sortOrder: (siblings[siblings.length - 1]?.sortOrder ?? 0) + 10,
    icon: null,
    ownerProfileId,
    hidden: false,
  };
  tree.push(node);
  await saveCategoryTree(tree);
  return node;
}

export async function hideCategory(id, hidden) {
  const tree = await loadCategoryTree();
  const next = tree.map((n) => (n.id === id ? { ...n, hidden } : n));
  await saveCategoryTree(next);
  return next;
}

export async function renameCustomCategory(id, customName) {
  const tree = await loadCategoryTree();
  const node = tree.find((n) => n.id === id);
  if (!node || node.kind !== "custom") throw new Error("Only parent-created categories can be renamed.");
  const next = tree.map((n) => (n.id === id ? { ...n, customName } : n));
  await saveCategoryTree(next);
  return next;
}

export async function moveCustomCategory(id, newParentId) {
  const tree = await loadCategoryTree();
  const node = tree.find((n) => n.id === id);
  if (!node || node.kind !== "custom") throw new Error("Only parent-created categories can be moved.");
  if (wouldCreateCycle(tree, id, newParentId)) throw new Error("That move would create a loop.");
  if (newParentId && depthOf(tree, newParentId) >= MAX_CATEGORY_DEPTH) {
    throw new Error("Categories can only nest four levels deep.");
  }
  const next = tree.map((n) => (n.id === id ? { ...n, parentId: newParentId } : n));
  await saveCategoryTree(next);
  return next;
}

export async function deleteCustomCategory(id) {
  const tree = await loadCategoryTree();
  const node = tree.find((n) => n.id === id);
  if (!node || node.kind !== "custom") throw new Error("Only parent-created categories can be deleted.");
  const parentId = node.parentId;
  const nextTree = tree
    .filter((n) => n.id !== id)
    .map((n) => (n.parentId === id ? { ...n, parentId } : n));
  const links = await loadCategoryLinks();
  const nextLinks = links.map((l) => (l.categoryId === id ? { ...l, categoryId: parentId } : l));
  await saveCategoryTree(nextTree);
  await saveCategoryLinks(nextLinks.filter((l) => l.categoryId));
  return nextTree;
}

export async function setChannelCategories(channelKey, categoryIds, primaryCategoryId, addedBy = "parent") {
  const links = await loadCategoryLinks();
  const others = links.filter((l) => l.channelKey !== channelKey);
  const next = [
    ...others,
    ...categoryIds.map((categoryId) => ({
      channelKey,
      categoryId,
      isPrimary: categoryId === primaryCategoryId,
      addedBy,
    })),
  ];
  await saveCategoryLinks(next);
  return next;
}

export async function ensureCategoryMigration() {
  const version = (await getCached(SCHEMA_KEY)) ?? 0;
  if (version >= CATEGORY_SCHEMA_VERSION) return;

  const existingTree = await getCached(TREE_KEY);
  const tree = existingTree?.length ? existingTree : systemCategoryTree();
  const links = (await getCached(LINKS_KEY)) ?? [];
  const known = new Set(links.map((l) => `${l.channelKey}:${l.categoryId}`));

  const attach = (channelKey, categories, addedBy) => {
    const ids = (categories || []).map(legacyCategoryToId).filter(Boolean);
    ids.forEach((categoryId, index) => {
      const key = `${channelKey}:${categoryId}`;
      if (known.has(key)) return;
      known.add(key);
      links.push({ channelKey, categoryId, isPrimary: index === 0, addedBy });
    });
  };

  const library = await listLibraryChannels();
  library.forEach((c) => attach(c.channelId || c.name, c.categories, c.source || "registry"));

  const custom = await listCustomChannels();
  custom.forEach((c) => attach(c.channelId || c.name, c.categories, "parent"));

  await putCached(TREE_KEY, tree);
  await putCached(LINKS_KEY, links);
  await putCached(SCHEMA_KEY, CATEGORY_SCHEMA_VERSION);
}
