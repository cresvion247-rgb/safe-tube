import { suggestionsForLanguage, suggestionsForCategory } from "@/data/languagePacks";
import { getDescendantIds } from "@/domain/categories";
import { getCached, putCached, uid } from "@/adapters/localDb";
import { loadCategoryTree, setChannelCategories } from "@/app/categories";
import { saveCustomChannel } from "@/adapters/localDb";

const OVERLAY_KEY = "profileChannelOverlays";

export async function loadOverlays() {
  return (await getCached(OVERLAY_KEY)) ?? [];
}

async function saveOverlays(rows) {
  await putCached(OVERLAY_KEY, rows);
  return rows;
}

export async function hideDefaultChannel(profileId, channelKey, language = "en") {
  const rows = await loadOverlays();
  const next = rows.filter((r) => !(r.profileId === profileId && r.channelKey === channelKey && r.language === language));
  next.push({ profileId, channelKey, language, hidden: true, addedByParent: false });
  return saveOverlays(next);
}

export async function restoreDefaultChannel(profileId, channelKey, language = "en") {
  const rows = await loadOverlays();
  return saveOverlays(rows.filter((r) => !(r.profileId === profileId && r.channelKey === channelKey && r.language === language && r.hidden)));
}

export function isChannelHidden(overlays, profileId, channelKey, language = "en") {
  return overlays.some((r) => r.profileId === profileId && r.channelKey === channelKey && r.language === language && r.hidden);
}

export async function listSuggestionsFor(profile, categoryId) {
  const languages = uniqueLanguages(profile);
  const tree = await loadCategoryTree();
  const descendants = categoryId ? getDescendantIds(tree, categoryId) : null;
  const accepted = new Set(
    (await loadOverlays())
      .filter((r) => r.profileId === profile.id && r.addedByParent)
      .map((r) => `${r.language}:${r.channelKey}`)
  );
  return languages
    .filter((lang) => lang !== "en")
    .flatMap((lang) => {
      const rows = categoryId
        ? suggestionsForCategory(lang, categoryId, descendants)
        : suggestionsForLanguage(lang);
      return rows
        .filter((row) => !accepted.has(`${lang}:${row.channelId || row.name}`))
        .map((row) => ({ ...row, language: lang }));
    });
}

export async function acceptSuggestion(profile, suggestion) {
  const channel = {
    id: uid(),
    name: suggestion.name,
    channelId: suggestion.channelId || null,
    ageGroup: profile.ageGroup,
    nativeLanguage: suggestion.language,
    status: "approved",
    primaryCategoryId: suggestion.primaryCategoryId,
    categoryIds: suggestion.categoryIds,
    categories: [],
    createdAt: new Date().toISOString(),
    reviewedAt: new Date().toISOString(),
  };
  await saveCustomChannel(channel);
  const key = suggestion.channelId || suggestion.name;
  await setChannelCategories(key, suggestion.categoryIds, suggestion.primaryCategoryId, "language_pack");
  const overlays = await loadOverlays();
  overlays.push({
    profileId: profile.id,
    channelKey: key,
    language: suggestion.language,
    hidden: false,
    addedByParent: true,
  });
  await saveOverlays(overlays);
  return channel;
}

export async function addParentChannel(profile, payload) {
  const channel = {
    id: uid(),
    name: payload.name,
    channelId: payload.channelId || null,
    ageGroup: payload.ageGroup || profile.ageGroup,
    nativeLanguage: payload.language || profile.nativeLanguage || "en",
    status: payload.status || "approved",
    primaryCategoryId: payload.primaryCategoryId,
    categoryIds: payload.categoryIds?.length ? payload.categoryIds : [payload.primaryCategoryId],
    categories: payload.categories || [],
    createdAt: new Date().toISOString(),
    reviewedAt: new Date().toISOString(),
  };
  await saveCustomChannel(channel);
  const key = channel.channelId || channel.name;
  await setChannelCategories(key, channel.categoryIds, channel.primaryCategoryId, "parent");
  return channel;
}

function uniqueLanguages(profile) {
  const list = [profile.nativeLanguage, ...(profile.targetLanguages || [])].filter(Boolean);
  return [...new Set(list.map((code) => String(code).slice(0, 2).toLowerCase()))];
}
