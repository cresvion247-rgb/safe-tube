import { LEGACY_CATEGORY_TO_ID, ID_TO_LEGACY_CATEGORY } from "@/data/categoryTree";

export const MAX_CATEGORY_DEPTH = 4;

export function legacyCategoryToId(legacy) {
  if (!legacy) return null;
  if (LEGACY_CATEGORY_TO_ID[legacy]) return LEGACY_CATEGORY_TO_ID[legacy];
  const lower = String(legacy).toLowerCase();
  const hit = Object.entries(LEGACY_CATEGORY_TO_ID).find(([key]) => key.toLowerCase() === lower);
  return hit ? hit[1] : null;
}

export function idToLegacyCategory(id) {
  return ID_TO_LEGACY_CATEGORY[id] ?? null;
}

export function getChildren(tree, parentId) {
  return tree
    .filter((n) => n.parentId === parentId && !n.hidden)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function getNode(tree, id) {
  return tree.find((n) => n.id === id) ?? null;
}

export function getAncestors(tree, id) {
  const byId = new Map(tree.map((n) => [n.id, n]));
  const out = [];
  let current = byId.get(id);
  const seen = new Set();
  while (current) {
    if (seen.has(current.id)) break;
    seen.add(current.id);
    out.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : null;
  }
  return out;
}

export function getDescendantIds(tree, id) {
  const ids = new Set([id]);
  let added = true;
  while (added) {
    added = false;
    for (const node of tree) {
      if (node.parentId && ids.has(node.parentId) && !ids.has(node.id)) {
        ids.add(node.id);
        added = true;
      }
    }
  }
  return [...ids];
}

export function depthOf(tree, id) {
  return getAncestors(tree, id).length;
}

export function resolveTokenBucket(tree, id) {
  const ancestors = getAncestors(tree, id).reverse();
  for (const node of ancestors) {
    if (node.tokenBucket) return node.tokenBucket;
  }
  return "educational";
}

export function wouldCreateCycle(tree, nodeId, newParentId) {
  if (!newParentId) return false;
  if (nodeId === newParentId) return true;
  return getDescendantIds(tree, nodeId).includes(newParentId);
}

export function visibleTreeForProfile(tree, links, allowedChannelKeys) {
  const allowed = new Set(allowedChannelKeys);
  const linkedIds = new Set(links.filter((l) => allowed.has(l.channelKey)).map((l) => l.categoryId));
  const keep = new Set();
  for (const id of linkedIds) {
    getAncestors(tree, id).forEach((n) => keep.add(n.id));
  }
  return tree.filter((n) => keep.has(n.id) && !n.hidden);
}
