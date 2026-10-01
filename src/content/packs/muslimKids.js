import { AGE_GROUPS } from "@/domain/constants";

const toddler = AGE_GROUPS.TODDLER;
const early = AGE_GROUPS.EARLY_LEARNER;
const tween = AGE_GROUPS.TWEEN;

export const muslimKidsPack = {
  id: "islam",
  categoryId: "cat_islam",
  channels: [
    { name: "Omar & Hana", query: "Omar & Hana", ages: [toddler, early] },
    { name: "One4Kids", query: "One4Kids Zaky", ages: [toddler, early] },
    { name: "Ali and Sumaya", query: "Ali and Sumaya Islamic cartoon", ages: [toddler, early] },
    { name: "Quran stories for kids", query: "Quran stories for kids", ages: [toddler, early, tween] },
    { name: "Nasheeds for kids", query: "Islamic nasheed for kids", ages: [toddler, early] },
    { name: "Little Muslim", query: "Little Muslim kids", ages: [toddler] },
    { name: "Toddler Quran", query: "Quran for toddlers", ages: [toddler] },
    { name: "Arabic songs for kids", query: "Islamic Arabic songs for kids", ages: [toddler, early] },
    { name: "Adam's World", query: "Adam's World Islamic cartoon", ages: [early, tween] },
    { name: "Muslim Kids TV", query: "Muslim Kids TV", ages: [early, tween] },
    { name: "Zaky", query: "Zaky and friends One4Kids", ages: [early] },
    { name: "Islamic cartoons", query: "Islamic cartoons for children", ages: [early, tween] },
    { name: "Stories of the Prophets", query: "Stories of the Prophets for kids", ages: [early, tween] },
    { name: "Kids Quran learning", query: "Quran learning for kids", ages: [early, tween] },
    { name: "Noor Kids", query: "Noor Kids", ages: [early, tween] },
    { name: "Muslim kids stories", query: "Muslim kids stories", ages: [tween] },
  ],
};

export function suggestionsForAge(ageGroup, addedNames, limit = 5) {
  const taken = new Set((addedNames || []).map((name) => String(name).toLowerCase()));
  return muslimKidsPack.channels
    .filter((channel) => channel.ages.includes(ageGroup) && !taken.has(channel.name.toLowerCase()))
    .slice(0, limit);
}

export const contentPacks = [muslimKidsPack];
