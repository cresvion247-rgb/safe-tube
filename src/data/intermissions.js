// Gentle pause line keys shown after a video ends (soft-fade cutoff, no hard stop).
export const SOFT_PAUSE_LINES = {
  [AGE_GROUPS.TODDLER]: ["inter.pause.toddler.1", "inter.pause.toddler.2"],
  [AGE_GROUPS.EARLY_LEARNER]: ["inter.pause.early.1", "inter.pause.early.2"],
  [AGE_GROUPS.TWEEN]: ["inter.pause.tween.1", "inter.pause.tween.2"],
  [AGE_GROUPS.TEEN]: ["inter.pause.tween.1", "inter.pause.tween.2"],
};

export const pickRandom = (list) => {
  const items = list?.length ? list : SOFT_PAUSE_LINES[AGE_GROUPS.TWEEN];
  return items[Math.floor(Math.random() * items.length)];
};
