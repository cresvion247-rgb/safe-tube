// Multilingual clickbait / overstimulation keyword blocker.
// Script-agnostic: matched as lowercase substrings over title + description.
// Coverage spans all major writing systems used by the supported languages.
export const BLOCKED_KEYWORDS = [
  // English
  "gone wrong", "prank", "challenge", "shock", "shocking", "scary", "jump scare", "fight",
  "you won't believe", "must watch", "insane", "crazy", "epic fail", "backfired", "destroyed",
  "killed", "killing", "blood", "gun", "weapon", "cursed", "haunted", "nightmare",
  // Spanish
  "broma pesada", "susto", "terror", "pelea", "miedo", "no lo creerás",
  // French
  "farce", "peur", "frayeur", "combat", "tu ne croiras",
  // German
  "schock", "schockierend", "kampf", "streich", "angst",
  // Portuguese
  "pega", "susto macabro", "briga", "medo",
  // Italian
  "paura", "scherzo", "rissa",
  // Mandarin
  "恐怖", "打架", "恶作剧", "吓人", "鬼",
  // Arabic
  "مخيف", "مقالب", "عنيف",
  // Hindi
  "डरावना", "प्रैंक", "मारपीट",
  // Japanese
  "ドッキリ", "怖い", "衝撃",
  // Korean
  "장난", "무서운", "충격",
  // Russian
  "страшн", "розыгрыш", "драка", "шок",
  // Turkish
  "korku", "şaka", "kavga", "dehşet",
  // Basque
  "beldur", "borroka",
];