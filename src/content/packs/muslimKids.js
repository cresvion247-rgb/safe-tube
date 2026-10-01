import { AGE_GROUPS } from "@/domain/constants";

const toddler = AGE_GROUPS.TODDLER;
const early = AGE_GROUPS.EARLY_LEARNER;
const tween = AGE_GROUPS.TWEEN;
const teen = AGE_GROUPS.TEEN;

export const muslimKidsPack = {
  id: "islam",
  categoryId: "cat_islam",
  channels: [
    { name: "Arabic letters", query: "Arabic alphabet for toddlers Qaida", ages: [toddler], level: "letters" },
    { name: "Qaida sounds", query: "Noorani Qaida letter sounds for kids", ages: [toddler], level: "sounds" },
    { name: "First Quran letters", query: "Quran letters for little kids", ages: [toddler], level: "letters" },
    { name: "Noorani Qaida start", query: "Noorani Qaida lesson 1 for kids", ages: [early], level: "qaida" },
    { name: "Joining letters", query: "Qaida joining letters for children", ages: [early], level: "qaida" },
    { name: "Read short words", query: "learn to read Quran words for kids", ages: [early], level: "reading" },
    { name: "Qaida complete", query: "Noorani Qaida full course for kids", ages: [tween], level: "qaida" },
    { name: "Read short surahs", query: "read short surahs for children tajweed", ages: [tween], level: "reading" },
    { name: "Basic tajweed", query: "basic tajweed rules for kids", ages: [tween], level: "tajweed" },
    { name: "Qaida revision", query: "Qaida revision before Quran reading", ages: [teen], level: "qaida" },
    { name: "Quran fluency", query: "Quran reading practice for teenagers", ages: [teen], level: "reading" },
    { name: "Tajweed rules", query: "tajweed rules for youth", ages: [teen], level: "tajweed" },
    { name: "Omar & Hana", query: "Omar & Hana", ages: [toddler, early] },
    { name: "One4Kids", query: "One4Kids Zaky", ages: [toddler, early] },
    { name: "Ali and Sumaya", query: "Ali and Sumaya Islamic cartoon", ages: [toddler, early] },
    { name: "Nasheeds for kids", query: "Islamic nasheed for kids", ages: [toddler, early] },
    { name: "Stories of the Prophets", query: "Stories of the Prophets for kids", ages: [early, tween] },
    { name: "Seerah for kids", query: "Seerah for kids", ages: [tween] },
    { name: "Islamic history for kids", query: "Islamic history for children", ages: [tween] },
    { name: "Seerah for teens", query: "Seerah for teenagers", ages: [teen] },
    { name: "Understand Quran", query: "Understand Quran for youth", ages: [teen] },
    { name: "Fiqh for youth", query: "fiqh for young Muslims", ages: [teen] },
  ],
};

export function suggestionsForAge(ageGroup, addedNames, limit = 5) {
  const taken = new Set((addedNames || []).map((name) => String(name).toLowerCase()));
  return muslimKidsPack.channels
    .filter((channel) => channel.ages.includes(ageGroup) && !taken.has(channel.name.toLowerCase()))
    .slice(0, limit);
}

export const contentPacks = [muslimKidsPack];
