export const IQRA_LEVELS = [
  { id: "letters", label: "Letters", next: "qaida" },
  { id: "qaida", label: "Qaida", next: "reading" },
  { id: "reading", label: "Reading", next: "tajweed" },
  { id: "tajweed", label: "Tajweed", next: null },
];

const HINT = { es: "in Spanish", fr: "in French", de: "auf Deutsch", zh: "in Chinese", ar: "in Arabic", hi: "in Hindi", pt: "em português", ja: "in Japanese", ru: "на русском", it: "in italiano", ko: "in Korean", tr: "Türkçe", eu: "euskara", id: "bahasa Indonesia", pl: "po polsku", ur: "in Urdu" };

export function iqraQuery(level, ageGroup, language) {
  const young = ageGroup === "toddler_2_4" || ageGroup === "early_learner_5_7";
  const base = {
    letters: young ? "arabic letters lesson" : "arabic alphabet lesson",
    qaida: "noorani qaida lesson",
    reading: "quran reading lesson",
    tajweed: "tajweed rules lesson",
  }[level] || "qaida lesson";
  const code = String(language || "en").slice(0, 2).toLowerCase();
  return code === "en" ? `${base} in English` : `${base} ${HINT[code] || `in ${code}`}`;
}
