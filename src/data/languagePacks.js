import { ALL_AGE_GROUPS } from "@/domain/constants";

const ages = [...ALL_AGE_GROUPS];

const suggestion = (name, language, primaryCategoryId, extra = {}) => ({
  name,
  channelId: extra.channelId ?? null,
  language,
  ageGroups: extra.ageGroups ?? ages,
  primaryCategoryId,
  categoryIds: extra.categoryIds ?? [primaryCategoryId],
  source: "language_pack",
  suggestionOnly: true,
  notes: extra.notes ?? "",
});

// English defaults live in whitelist.js + verifiedChannels.js.
// Non-English packs start empty except a few placeholder slots so the UI can render
// "no suggestion yet — add one" per category. Add only curator-reviewed channels.
export const LANGUAGE_PACKS = {
  es: [],
  fr: [],
  de: [],
  zh: [],
  ar: [],
  hi: [],
  pt: [],
  ja: [],
  ru: [],
  it: [],
  ko: [],
  tr: [],
  eu: [],
  id: [],
  pl: [],
  ur: [],
};

export function suggestionsForLanguage(language) {
  if (!language || language === "en") return [];
  return LANGUAGE_PACKS[language] ?? [];
}

export function suggestionsForCategory(language, categoryId, descendantIds) {
  const ids = new Set(descendantIds?.length ? descendantIds : [categoryId]);
  return suggestionsForLanguage(language).filter(
    (row) => ids.has(row.primaryCategoryId) || row.categoryIds.some((id) => ids.has(id))
  );
}

export { suggestion };
