import { AGE_GROUPS } from "@/domain/constants";

export const muslimKidsPack = {
  id: "islam",
  categoryId: "cat_islam",
  channels: [
    { name: "Omar & Hana", query: "Omar & Hana", ages: [AGE_GROUPS.TODDLER, AGE_GROUPS.EARLY_LEARNER] },
    { name: "One4Kids", query: "One4Kids Zaky", ages: [AGE_GROUPS.TODDLER, AGE_GROUPS.EARLY_LEARNER] },
    { name: "Ali and Sumaya", query: "Ali and Sumaya Islamic cartoon", ages: [AGE_GROUPS.TODDLER, AGE_GROUPS.EARLY_LEARNER] },
    { name: "Adam's World", query: "Adam's World Islamic cartoon", ages: [AGE_GROUPS.EARLY_LEARNER, AGE_GROUPS.TWEEN] },
    { name: "Muslim Kids TV", query: "Muslim Kids TV", ages: [AGE_GROUPS.EARLY_LEARNER, AGE_GROUPS.TWEEN] },
    { name: "Quran stories for kids", query: "Quran stories for kids", ages: [AGE_GROUPS.TODDLER, AGE_GROUPS.EARLY_LEARNER, AGE_GROUPS.TWEEN] },
  ],
};

export const contentPacks = [muslimKidsPack];
