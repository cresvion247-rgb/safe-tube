import { AGE_GROUPS } from "@/domain/constants";

const toddler = AGE_GROUPS.TODDLER;
const early = AGE_GROUPS.EARLY_LEARNER;
const tween = AGE_GROUPS.TWEEN;
const teen = AGE_GROUPS.TEEN;

export const muslimKidsPack = {
  id: "islam",
  categoryId: "cat_islam",
  channels: [
    { name: "Omar & Hana", query: "Omar & Hana", ages: [toddler, early] },
    { name: "One4Kids", query: "One4Kids Zaky", ages: [toddler, early] },
    { name: "Ali and Sumaya", query: "Ali and Sumaya Islamic cartoon", ages: [toddler, early] },
    { name: "Little Muslim", query: "Little Muslim kids", ages: [toddler] },
    { name: "Toddler Quran", query: "Quran for toddlers", ages: [toddler] },
    { name: "Arabic songs for kids", query: "Islamic Arabic songs for kids", ages: [toddler, early] },
    { name: "Nasheeds for kids", query: "Islamic nasheed for kids", ages: [toddler, early] },
    { name: "Quran stories for kids", query: "Quran stories for kids", ages: [early] },
    { name: "Zaky", query: "Zaky and friends One4Kids", ages: [early] },
    { name: "Adam's World", query: "Adam's World Islamic cartoon", ages: [early] },
    { name: "Stories of the Prophets", query: "Stories of the Prophets for kids", ages: [early, tween] },
    { name: "Noor Kids", query: "Noor Kids", ages: [early, tween] },
    { name: "Seerah for kids", query: "Seerah for kids", ages: [tween] },
    { name: "Kids Quran learning", query: "Quran learning for kids", ages: [tween] },
    { name: "Muslim kids stories", query: "Muslim kids stories", ages: [tween] },
    { name: "Islamic history for kids", query: "Islamic history for children", ages: [tween] },
    { name: "Understand Quran", query: "Understand Quran for youth", ages: [tween, teen] },
    { name: "Seerah for teens", query: "Seerah for teenagers", ages: [teen] },
    { name: "Youth Quran tafsir", query: "Quran tafsir for youth", ages: [teen] },
    { name: "Muslim teen talks", query: "Islamic talks for teenagers", ages: [teen] },
    { name: "Fiqh for youth", query: "fiqh for young Muslims", ages: [teen] },
    { name: "Islamic history lectures", query: "Islamic history lectures", ages: [teen] },
  ],
};

export function suggestionsForAge(ageGroup, addedNames, limit = 5) {
  const taken = new Set((addedNames || []).map((name) => String(name).toLowerCase()));
  return muslimKidsPack.channels
    .filter((channel) => channel.ages.includes(ageGroup) && !taken.has(channel.name.toLowerCase()))
    .slice(0, limit);
}

export const contentPacks = [muslimKidsPack];
