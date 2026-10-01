import { CATEGORIES } from "@/domain/constants";

export const FAITH_ROOT_ID = "cat_faith";
export const CATEGORY_SCHEMA_VERSION = 1;

const node = (id, parentId, slug, nameKey, extra = {}) => ({
  id,
  parentId,
  slug,
  nameKey,
  customName: null,
  kind: "system",
  facet: extra.facet ?? (parentId === FAITH_ROOT_ID || extra.faith ? "faith" : "subject"),
  tokenBucket: extra.tokenBucket ?? null,
  sortOrder: extra.sortOrder ?? 0,
  icon: extra.icon ?? null,
  ownerProfileId: null,
  hidden: false,
});

const subject = (legacy, nameKey, sortOrder, tokenBucket = "educational") =>
  node(`cat_${legacy.toLowerCase()}`, null, legacy, nameKey, { sortOrder, tokenBucket, facet: "subject" });

export const LEGACY_CATEGORY_TO_ID = {
  [CATEGORIES.STEM]: "cat_stem",
  [CATEGORIES.ARTS]: "cat_arts",
  [CATEGORIES.EMOTIONAL_INTELLIGENCE]: "cat_emotional_intelligence",
  [CATEGORIES.LITERACY_LANGUAGE]: "cat_literacy_language",
  [CATEGORIES.NATURE_ANIMALS]: "cat_nature_animals",
  [CATEGORIES.LIFE_SKILLS]: "cat_life_skills",
  [CATEGORIES.HEALTH_MOVEMENT]: "cat_health_movement",
  [CATEGORIES.MUSIC_DANCE]: "cat_music_dance",
  [CATEGORIES.WORLD_CULTURES]: "cat_world_cultures",
  [CATEGORIES.HISTORY]: "cat_history",
  [CATEGORIES.GEOGRAPHY]: "cat_geography",
  [CATEGORIES.CODING_TECHNOLOGY]: "cat_coding_technology",
  [CATEGORIES.COOKING_FOOD]: "cat_cooking_food",
  [CATEGORIES.SPORTS_GAMES]: "cat_sports_games",
  [CATEGORIES.ENVIRONMENTAL_AWARENESS]: "cat_environmental_awareness",
  [CATEGORIES.WHOLESOME_ENTERTAINMENT]: "cat_wholesome_entertainment",
};

export const ID_TO_LEGACY_CATEGORY = Object.fromEntries(
  Object.entries(LEGACY_CATEGORY_TO_ID).map(([legacy, id]) => [id, legacy])
);

export function systemCategoryTree() {
  const subjects = [
    subject(CATEGORIES.STEM, "category.STEM", 10),
    subject(CATEGORIES.ARTS, "category.Arts", 20),
    subject(CATEGORIES.EMOTIONAL_INTELLIGENCE, "category.Emotional_Intelligence", 30),
    subject(CATEGORIES.LITERACY_LANGUAGE, "category.Literacy_Language", 40),
    subject(CATEGORIES.NATURE_ANIMALS, "category.Nature_Animals", 50),
    subject(CATEGORIES.LIFE_SKILLS, "category.Life_Skills", 60),
    subject(CATEGORIES.HEALTH_MOVEMENT, "category.Health_Movement", 70),
    subject(CATEGORIES.MUSIC_DANCE, "category.Music_Dance", 80),
    subject(CATEGORIES.HISTORY, "category.History", 90),
    subject(CATEGORIES.GEOGRAPHY, "category.Geography", 100),
    subject(CATEGORIES.CODING_TECHNOLOGY, "category.Coding_Technology", 110),
    subject(CATEGORIES.COOKING_FOOD, "category.Cooking_Food", 120),
    subject(CATEGORIES.SPORTS_GAMES, "category.Sports_Games", 130),
    subject(CATEGORIES.ENVIRONMENTAL_AWARENESS, "category.Environmental_Awareness", 140),
    subject(CATEGORIES.WORLD_CULTURES, "category.World_Cultures", 150),
    subject(CATEGORIES.WHOLESOME_ENTERTAINMENT, "category.Wholesome_Entertainment", 160, "entertainment"),
  ];

  const faith = [
    node(FAITH_ROOT_ID, null, "Faith_Values", "category.faith", {
      facet: "faith",
      tokenBucket: "educational",
      sortOrder: 5,
    }),
    node("cat_islam", FAITH_ROOT_ID, "Islam", "category.faith.islam", { faith: true, sortOrder: 10 }),
    node("cat_islam_sunni", "cat_islam", "Sunni", "category.faith.islam.sunni", { faith: true, sortOrder: 10 }),
    node("cat_islam_sunni_hanafi", "cat_islam_sunni", "Hanafi", "category.faith.islam.sunni.hanafi", { faith: true, sortOrder: 10 }),
    node("cat_islam_sunni_maliki", "cat_islam_sunni", "Maliki", "category.faith.islam.sunni.maliki", { faith: true, sortOrder: 20 }),
    node("cat_islam_sunni_shafii", "cat_islam_sunni", "Shafii", "category.faith.islam.sunni.shafii", { faith: true, sortOrder: 30 }),
    node("cat_islam_sunni_hanbali", "cat_islam_sunni", "Hanbali", "category.faith.islam.sunni.hanbali", { faith: true, sortOrder: 40 }),
    node("cat_islam_sunni_other", "cat_islam_sunni", "Other_Sunni", "category.faith.islam.sunni.other", { faith: true, sortOrder: 50 }),
    node("cat_islam_shia", "cat_islam", "Shia", "category.faith.islam.shia", { faith: true, sortOrder: 20 }),
    node("cat_islam_shia_twelver", "cat_islam_shia", "Twelver", "category.faith.islam.shia.twelver", { faith: true, sortOrder: 10 }),
    node("cat_islam_shia_ismaili", "cat_islam_shia", "Ismaili", "category.faith.islam.shia.ismaili", { faith: true, sortOrder: 20 }),
    node("cat_islam_shia_zaydi", "cat_islam_shia", "Zaydi", "category.faith.islam.shia.zaydi", { faith: true, sortOrder: 30 }),
    node("cat_islam_shia_other", "cat_islam_shia", "Other_Shia", "category.faith.islam.shia.other", { faith: true, sortOrder: 40 }),
    node("cat_islam_other", "cat_islam", "Other_Islam", "category.faith.islam.other", { faith: true, sortOrder: 30 }),
    node("cat_christianity", FAITH_ROOT_ID, "Christianity", "category.faith.christianity", { faith: true, sortOrder: 20 }),
    node("cat_christianity_catholic", "cat_christianity", "Catholic", "category.faith.christianity.catholic", { faith: true, sortOrder: 10 }),
    node("cat_christianity_orthodox", "cat_christianity", "Orthodox", "category.faith.christianity.orthodox", { faith: true, sortOrder: 20 }),
    node("cat_christianity_protestant", "cat_christianity", "Protestant", "category.faith.christianity.protestant", { faith: true, sortOrder: 30 }),
    node("cat_christianity_other", "cat_christianity", "Other_Christian", "category.faith.christianity.other", { faith: true, sortOrder: 40 }),
    node("cat_judaism", FAITH_ROOT_ID, "Judaism", "category.faith.judaism", { faith: true, sortOrder: 30 }),
    node("cat_judaism_orthodox", "cat_judaism", "Orthodox", "category.faith.judaism.orthodox", { faith: true, sortOrder: 10 }),
    node("cat_judaism_conservative", "cat_judaism", "Conservative", "category.faith.judaism.conservative", { faith: true, sortOrder: 20 }),
    node("cat_judaism_reform", "cat_judaism", "Reform", "category.faith.judaism.reform", { faith: true, sortOrder: 30 }),
    node("cat_judaism_other", "cat_judaism", "Other_Jewish", "category.faith.judaism.other", { faith: true, sortOrder: 40 }),
    node("cat_hinduism", FAITH_ROOT_ID, "Hinduism", "category.faith.hinduism", { faith: true, sortOrder: 40 }),
    node("cat_buddhism", FAITH_ROOT_ID, "Buddhism", "category.faith.buddhism", { faith: true, sortOrder: 50 }),
    node("cat_sikhism", FAITH_ROOT_ID, "Sikhism", "category.faith.sikhism", { faith: true, sortOrder: 60 }),
    node("cat_other_faiths", FAITH_ROOT_ID, "Other_Faiths", "category.faith.other", { faith: true, sortOrder: 70 }),
    node("cat_values_character", FAITH_ROOT_ID, "Values_Character", "category.faith.values", { faith: true, sortOrder: 80 }),
  ];

  return [...subjects, ...faith];
}
