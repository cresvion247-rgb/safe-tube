import { AGE_GROUPS } from "@/domain/constants";

const toddler = AGE_GROUPS.TODDLER;
const early = AGE_GROUPS.EARLY_LEARNER;
const tween = AGE_GROUPS.TWEEN;
const teen = AGE_GROUPS.TEEN;

export const READING_LEVELS = ["letters", "qaida", "reading", "tajweed"];

export const readingLevelForAge = (ageGroup) => {
  if (ageGroup === toddler) return "letters";
  if (ageGroup === early) return "qaida";
  if (ageGroup === tween) return "reading";
  return "tajweed";
};

export const muslimKidsPack = {
  id: "islam",
  categoryId: "cat_islam",
  channels: [
    { name: "Arabic letters", query: "Arabic alphabet for beginners Qaida", ages: [toddler, early, tween, teen], level: "letters" },
    { name: "Qaida sounds", query: "Noorani Qaida letter sounds for beginners", ages: [toddler, early, tween, teen], level: "letters" },
    { name: "Noorani Qaida start", query: "Noorani Qaida lesson 1", ages: [early, tween, teen], level: "qaida" },
    { name: "Joining letters", query: "Qaida joining letters", ages: [early, tween, teen], level: "qaida" },
    { name: "Read short words", query: "learn to read Quran words", ages: [early, tween, teen], level: "reading" },
    { name: "Read short surahs", query: "read short surahs with tajweed", ages: [tween, teen], level: "reading" },
    { name: "Basic tajweed", query: "basic tajweed rules", ages: [tween, teen], level: "tajweed" },
    { name: "Quran fluency", query: "Quran reading practice tajweed", ages: [teen], level: "tajweed" },
    { name: "Omar & Hana", query: "Omar & Hana", ages: [toddler, early] },
    { name: "Nasheeds for kids", query: "Islamic nasheed for kids", ages: [toddler, early] },
    { name: "Stories of the Prophets", query: "Stories of the Prophets for kids", ages: [early, tween] },
    { name: "Seerah for teens", query: "Seerah for teenagers", ages: [teen] },
  ],
};

export function suggestionsFor(profile, addedNames, limit = 5) {
  const ageGroup = profile?.ageGroup;
  const level = profile?.readingLevel || readingLevelForAge(ageGroup);
  const levelIndex = READING_LEVELS.indexOf(level);
  const taken = new Set((addedNames || []).map((name) => String(name).toLowerCase()));
  const open = muslimKidsPack.channels.filter((channel) => !taken.has(channel.name.toLowerCase()));
  const reading = open.filter((channel) => channel.level && READING_LEVELS.indexOf(channel.level) <= levelIndex && channel.ages.includes(ageGroup));
  const other = open.filter((channel) => !channel.level && channel.ages.includes(ageGroup));
  return [...reading, ...other].slice(0, limit);
}

export const contentPacks = [muslimKidsPack];
