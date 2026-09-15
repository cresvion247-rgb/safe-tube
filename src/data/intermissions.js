// Cognitive intermission content and soft-fade pause lines, per age group.
// All child-facing text lives in the central dictionaries under inter.* keys;
// this module only carries keys and structure. Numeric quiz options stay
// literal so digits render identically in every language.
import { AGE_GROUPS } from "@/domain/constants";

// Toddlers: kinetic movement prompts (animal stretches).
export const MOVEMENT_PROMPTS = [
  { titleKey: "inter.move.1.title", textKey: "inter.move.1.text" },
  { titleKey: "inter.move.2.title", textKey: "inter.move.2.text" },
  { titleKey: "inter.move.3.title", textKey: "inter.move.3.text" },
  { titleKey: "inter.move.4.title", textKey: "inter.move.4.text" },
  { titleKey: "inter.move.5.title", textKey: "inter.move.5.text" },
  { titleKey: "inter.move.6.title", textKey: "inter.move.6.text" },
  { titleKey: "inter.move.7.title", textKey: "inter.move.7.text" },
  { titleKey: "inter.move.8.title", textKey: "inter.move.8.text" },
];

// Micro-quizzes for early learners and tweens.
export const QUIZZES = {
  [AGE_GROUPS.EARLY_LEARNER]: [
    { questionKey: "inter.quiz.early.1", options: ["6", "8", "10"], correctIndex: 1 },
    {
      questionKey: "inter.quiz.early.2",
      options: ["inter.quiz.early.2.o1", "inter.quiz.early.2.o2", "inter.quiz.early.2.o3"],
      correctIndex: 0,
    },
    {
      questionKey: "inter.quiz.early.3",
      options: ["inter.quiz.early.3.o1", "inter.quiz.early.3.o2", "inter.quiz.early.3.o3"],
      correctIndex: 1,
    },
    {
      questionKey: "inter.quiz.early.4",
      options: ["inter.quiz.early.4.o1", "inter.quiz.early.4.o2", "inter.quiz.early.4.o3"],
      correctIndex: 2,
    },
    {
      questionKey: "inter.quiz.early.5",
      options: ["inter.quiz.early.5.o1", "inter.quiz.early.5.o2", "inter.quiz.early.5.o3"],
      correctIndex: 0,
    },
    { questionKey: "inter.quiz.early.6", options: ["5", "7", "12"], correctIndex: 1 },
    {
      questionKey: "inter.quiz.early.7",
      options: ["inter.quiz.early.7.o1", "inter.quiz.early.7.o2", "inter.quiz.early.7.o3"],
      correctIndex: 1,
    },
    {
      questionKey: "inter.quiz.early.8",
      options: ["inter.quiz.early.8.o1", "inter.quiz.early.8.o2", "inter.quiz.early.8.o3"],
      correctIndex: 1,
    },
  ],
  [AGE_GROUPS.TWEEN]: [
    {
      questionKey: "inter.quiz.tween.1",
      options: ["inter.quiz.tween.1.o1", "inter.quiz.tween.1.o2", "inter.quiz.tween.1.o3"],
      correctIndex: 1,
    },
    {
      questionKey: "inter.quiz.tween.2",
      options: ["inter.quiz.tween.2.o1", "inter.quiz.tween.2.o2", "inter.quiz.tween.2.o3"],
      correctIndex: 0,
    },
    {
      questionKey: "inter.quiz.tween.3",
      options: ["inter.quiz.tween.3.o1", "inter.quiz.tween.3.o2", "inter.quiz.tween.3.o3"],
      correctIndex: 2,
    },
    {
      questionKey: "inter.quiz.tween.4",
      options: ["inter.quiz.tween.4.o1", "inter.quiz.tween.4.o2", "inter.quiz.tween.4.o3"],
      correctIndex: 1,
    },
    { questionKey: "inter.quiz.tween.5", options: ["54", "56", "64"], correctIndex: 1 },
    {
      questionKey: "inter.quiz.tween.6",
      options: ["inter.quiz.tween.6.o1", "inter.quiz.tween.6.o2", "inter.quiz.tween.6.o3"],
      correctIndex: 2,
    },
    {
      questionKey: "inter.quiz.tween.7",
      options: ["inter.quiz.tween.7.o1", "inter.quiz.tween.7.o2", "inter.quiz.tween.7.o3"],
      correctIndex: 1,
    },
    { questionKey: "inter.quiz.tween.8", options: ["5", "6", "7"], correctIndex: 2 },
  ],
};

// Gentle pause line keys shown after a video ends (soft-fade cutoff, no hard stop).
export const SOFT_PAUSE_LINES = {
  [AGE_GROUPS.TODDLER]: ["inter.pause.toddler.1", "inter.pause.toddler.2"],
  [AGE_GROUPS.EARLY_LEARNER]: ["inter.pause.early.1", "inter.pause.early.2"],
  [AGE_GROUPS.TWEEN]: ["inter.pause.tween.1", "inter.pause.tween.2"],
};

export const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];