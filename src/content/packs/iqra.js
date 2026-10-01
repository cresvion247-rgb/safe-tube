export const IQRA_LEVELS = [
  { id: "letters", label: "Letters", next: "qaida" },
  { id: "qaida", label: "Qaida", next: "reading" },
  { id: "reading", label: "Reading", next: "tajweed" },
  { id: "tajweed", label: "Tajweed", next: null },
];

const HINT = { es: "en español", fr: "en français", de: "auf Deutsch", zh: "中文", ar: "بالعربية", hi: "हिंئी", pt: "em português", ja: "日本語", ru: "на русском", it: "in italiano", ko: "한국어", tr: "Türkçe", eu: "euskara", id: "bahasa Indonesia", pl: "po polsku", ur: "اردو" };

export function iqraQuery(level, ageGroup, language) {
  const young = ageGroup === "toddler_2_4" || ageGroup === "early_learner_5_7";
  const base = {
    letters: young ? "arabic letters for young children lesson" : "arabic alphabet for beginners lesson",
    qaida: young ? "qaida lesson for children step by step" : "noorani qaida lesson for beginners",
    reading: young ? "quran reading for children with teacher" : "quran reading practice lesson",
    tajweed: "tajweed rules lesson for learners",
  }[level] || "qaida lesson for children";
  const code = String(language || "en").slice(0, 2).toLowerCase();
  return code === "en" ? base : `${base} ${HINT[code] || code}`;
}
