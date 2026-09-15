// Single source of truth for age groups, limits, categories, token rules, and language catalog.
// No platform imports — pure domain constants.

export const AGE_GROUPS = {
  TODDLER: "toddler_2_4",
  EARLY_LEARNER: "early_learner_5_7",
  TWEEN: "tween_8_12",
};

export const ALL_AGE_GROUPS = [AGE_GROUPS.TODDLER, AGE_GROUPS.EARLY_LEARNER, AGE_GROUPS.TWEEN];

export const AGE_GROUP_LABELS = {
  [AGE_GROUPS.TODDLER]: "Toddler (2–4)",
  [AGE_GROUPS.EARLY_LEARNER]: "Early Learner (5–7)",
  [AGE_GROUPS.TWEEN]: "Tween (8–12)",
};

// Attention-span duration ceilings per age group, in seconds.
export const MAX_DURATION_SECONDS = {
  [AGE_GROUPS.TODDLER]: 600, // 10 minutes
  [AGE_GROUPS.EARLY_LEARNER]: 900, // 15 minutes
  [AGE_GROUPS.TWEEN]: 1500, // 25 minutes
};

export const CATEGORIES = {
  STEM: "STEM",
  ARTS: "Arts",
  EMOTIONAL_INTELLIGENCE: "Emotional_Intelligence",
  LITERACY_LANGUAGE: "Literacy_Language",
  NATURE_ANIMALS: "Nature_Animals",
  LIFE_SKILLS: "Life_Skills",
  HEALTH_MOVEMENT: "Health_Movement",
  MUSIC_DANCE: "Music_Dance",
  WORLD_CULTURES: "World_Cultures",
  HISTORY: "History",
  GEOGRAPHY: "Geography",
  CODING_TECHNOLOGY: "Coding_Technology",
  COOKING_FOOD: "Cooking_Food",
  SPORTS_GAMES: "Sports_Games",
  ENVIRONMENTAL_AWARENESS: "Environmental_Awareness",
  WHOLESOME_ENTERTAINMENT: "Wholesome_Entertainment",
};

export const EDUCATIONAL_CATEGORIES = [
  CATEGORIES.STEM,
  CATEGORIES.ARTS,
  CATEGORIES.EMOTIONAL_INTELLIGENCE,
  CATEGORIES.LITERACY_LANGUAGE,
  CATEGORIES.NATURE_ANIMALS,
  CATEGORIES.LIFE_SKILLS,
  CATEGORIES.HEALTH_MOVEMENT,
  CATEGORIES.MUSIC_DANCE,
  CATEGORIES.WORLD_CULTURES,
  CATEGORIES.HISTORY,
  CATEGORIES.GEOGRAPHY,
  CATEGORIES.CODING_TECHNOLOGY,
  CATEGORIES.COOKING_FOOD,
  CATEGORIES.SPORTS_GAMES,
  CATEGORIES.ENVIRONMENTAL_AWARENESS,
];
export const ENTERTAINMENT_CATEGORY = CATEGORIES.WHOLESOME_ENTERTAINMENT;

// Popular discovery gate: a viral video must have at least this many views.
export const MIN_VIEWS_FOR_DISCOVERY = 1000000;

export const TOKEN_RULES = {
  PER_EDUCATIONAL_VIDEO: 1,
  PER_INTERMISSION: 1,
  ENTERTAINMENT_COST: 1,
};

// Fun unlocks cost more for the youngest group: 2 learning videos per fun video.
export const entertainmentCostFor = (ageGroup) =>
  ageGroup === AGE_GROUPS.TODDLER ? 2 : TOKEN_RULES.ENTERTAINMENT_COST;

export const DEFAULT_DAILY_LIMIT_MINUTES = 60;
export const MIN_DAILY_LIMIT_MINUTES = 15;
export const MAX_DAILY_LIMIT_MINUTES = 240;

// Supported content languages for feed discovery (kept separate from the UI language catalog).
export const LANGUAGES = [
  { code: "en", nativeName: "English" },
  { code: "es", nativeName: "Español" },
  { code: "fr", nativeName: "Français" },
  { code: "de", nativeName: "Deutsch" },
  { code: "zh", nativeName: "中文" },
  { code: "ar", nativeName: "العربية" },
  { code: "hi", nativeName: "हिन्दी" },
  { code: "pt", nativeName: "Português" },
  { code: "ja", nativeName: "日本語" },
  { code: "ru", nativeName: "Русский" },
  { code: "it", nativeName: "Italiano" },
  { code: "ko", nativeName: "한국어" },
  { code: "tr", nativeName: "Türkçe" },
  { code: "eu", nativeName: "Euskara" },
  { code: "id", nativeName: "Bahasa Indonesia" },
  { code: "pl", nativeName: "Polski" },
  { code: "ur", nativeName: "اردو" },
];

export const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];