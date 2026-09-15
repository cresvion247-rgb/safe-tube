// Localized search-seed matrix: high-performing educational search terms per language and age tier.
// Terms are ordered simple → richer within each tier so the adaptive level can bias the choice.
// Each term carries the category its results are filed under for feed sequencing.
import { AGE_GROUPS, CATEGORIES as C } from "@/domain/constants";

const T = AGE_GROUPS.TODDLER;
const E = AGE_GROUPS.EARLY_LEARNER;
const W = AGE_GROUPS.TWEEN;

export const SEARCH_SEEDS = {
  en: {
    [T]: [
      { term: "counting songs for toddlers", category: C.STEM },
      { term: "nursery rhymes for babies", category: C.ARTS },
      { term: "feelings songs for toddlers", category: C.EMOTIONAL_INTELLIGENCE },
    ],
    [E]: [
      { term: "fun science for kids", category: C.STEM },
      { term: "learn to read phonics", category: C.STEM },
      { term: "how to draw for kids", category: C.ARTS },
    ],
    [W]: [
      { term: "science experiments for tweens", category: C.STEM },
      { term: "world history for kids", category: C.STEM },
      { term: "art projects for kids", category: C.ARTS },
    ],
  },
  es: {
    [T]: [
      { term: "canciones de contar para niños", category: C.STEM },
      { term: "canciones infantiles", category: C.ARTS },
      { term: "emociones para niños pequeños", category: C.EMOTIONAL_INTELLIGENCE },
    ],
    [E]: [
      { term: "ciencia divertida para niños", category: C.STEM },
      { term: "aprender a leer en español", category: C.STEM },
      { term: "dibujos fáciles para niños", category: C.ARTS },
    ],
    [W]: [
      { term: "experimentos de ciencia para niños", category: C.STEM },
      { term: "historia del mundo para niños", category: C.STEM },
      { term: "proyectos de arte para niños", category: C.ARTS },
    ],
  },
  fr: {
    [T]: [
      { term: "comptines pour bébés", category: C.STEM },
      { term: "chansons enfantines", category: C.ARTS },
      { term: "émotions pour petits", category: C.EMOTIONAL_INTELLIGENCE },
    ],
    [E]: [
      { term: "sciences amusantes pour enfants", category: C.STEM },
      { term: "apprendre à lire", category: C.STEM },
      { term: "dessins faciles pour enfants", category: C.ARTS },
    ],
    [W]: [
      { term: "expériences scientifiques pour enfants", category: C.STEM },
      { term: "l'histoire du monde pour enfants", category: C.STEM },
      { term: "projets d'art pour enfants", category: C.ARTS },
    ],
  },
  de: {
    [T]: [
      { term: "zählreime für kleinkinder", category: C.STEM },
      { term: "kinderlieder", category: C.ARTS },
      { term: "gefühle für kleinkinder", category: C.EMOTIONAL_INTELLIGENCE },
    ],
    [E]: [
      { term: "wissenschaft für kinder", category: C.STEM },
      { term: "lesen lernen für kinder", category: C.STEM },
      { term: "malen für kinder", category: C.ARTS },
    ],
    [W]: [
      { term: "experimente für kinder", category: C.STEM },
      { term: "weltgeschichte für kinder", category: C.STEM },
      { term: "kunstprojekte für kinder", category: C.ARTS },
    ],
  },
  zh: {
    [T]: [
      { term: "幼儿数数儿歌", category: C.STEM },
      { term: "经典儿歌", category: C.ARTS },
      { term: "幼儿情绪认知", category: C.EMOTIONAL_INTELLIGENCE },
    ],
    [E]: [
      { term: "儿童科学实验", category: C.STEM },
      { term: "学拼音 认字", category: C.STEM },
      { term: "儿童简笔画", category: C.ARTS },
    ],
    [W]: [
      { term: "趣味科学实验", category: C.STEM },
      { term: "儿童历史故事", category: C.STEM },
      { term: "儿童手工艺术", category: C.ARTS },
    ],
  },
  ar: {
    [T]: [
      { term: "أناشيد الأرقام للأطفال", category: C.STEM },
      { term: "أناشيد أطفال", category: C.ARTS },
      { term: "المشاعر للأطفال الصغار", category: C.EMOTIONAL_INTELLIGENCE },
    ],
    [E]: [
      { term: "علوم ممتعة للأطفال", category: C.STEM },
      { term: "تعلم القراءة للأطفال", category: C.STEM },
      { term: "رسم للأطفال", category: C.ARTS },
    ],
    [W]: [
      { term: "تجارب علمية للأطفال", category: C.STEM },
      { term: "التاريخ للأطفال", category: C.STEM },
      { term: "أشغال فنية للأطفال", category: C.ARTS },
    ],
  },
  hi: {
    [T]: [
      { term: "बच्चों के लिए गिनती के गाने", category: C.STEM },
      { term: "नर्सरी कविता बच्चों के लिए", category: C.ARTS },
      { term: "बच्चों के लिए भावना गीत", category: C.EMOTIONAL_INTELLIGENCE },
    ],
    [E]: [
      { term: "बच्चों के लिए मज़ेदार विज्ञान", category: C.STEM },
      { term: "बच्चों के लिए पढ़ना सीखें", category: C.STEM },
      { term: "बच्चों के लिए आसान ड्रॉइंग", category: C.ARTS },
    ],
    [W]: [
      { term: "बच्चों के लिए विज्ञान प्रयोग", category: C.STEM },
      { term: "बच्चों के लिए इतिहास", category: C.STEM },
      { term: "बच्चों के लिए कला प्रोजेक्ट", category: C.ARTS },
    ],
  },
  pt: {
    [T]: [
      { term: "músicas de contar para bebês", category: C.STEM },
      { term: "canções infantis", category: C.ARTS },
      { term: "emoções para crianças pequenas", category: C.EMOTIONAL_INTELLIGENCE },
    ],
    [E]: [
      { term: "ciência divertida para crianças", category: C.STEM },
      { term: "aprender a ler brincando", category: C.STEM },
      { term: "desenhos fáceis para crianças", category: C.ARTS },
    ],
    [W]: [
      { term: "experimentos científicos para crianças", category: C.STEM },
      { term: "história do mundo para crianças", category: C.STEM },
      { term: "projetos de arte para crianças", category: C.ARTS },
    ],
  },
  ja: {
    [T]: [
      { term: "幼児 数のうた", category: C.STEM },
      { term: "童謡 こどものうた", category: C.ARTS },
      { term: "幼児 気持ち あそびうた", category: C.EMOTIONAL_INTELLIGENCE },
    ],
    [E]: [
      { term: "子供向け 科学 実験", category: C.STEM },
      { term: "ひらがな 学習 こども", category: C.STEM },
      { term: "お絵かき きょうしつ", category: C.ARTS },
    ],
    [W]: [
      { term: "中学生 理科 実験", category: C.STEM },
      { term: "子供向け 歴史", category: C.STEM },
      { term: "工作 子供 工作", category: C.ARTS },
    ],
  },
  ru: {
    [T]: [
      { term: "считалочки для малышей", category: C.STEM },
      { term: "детские песни", category: C.ARTS },
      { term: "эмоции для малышей", category: C.EMOTIONAL_INTELLIGENCE },
    ],
    [E]: [
      { term: "наука для детей", category: C.STEM },
      { term: "учимся читать", category: C.STEM },
      { term: "рисование для детей", category: C.ARTS },
    ],
    [W]: [
      { term: "опыты для детей", category: C.STEM },
      { term: "история для детей", category: C.STEM },
      { term: "поделки для детей", category: C.ARTS },
    ],
  },
  it: {
    [T]: [
      { term: "filastrocche per bambini", category: C.STEM },
      { term: "canzoni per bambini", category: C.ARTS },
      { term: "emozioni per bambini piccoli", category: C.EMOTIONAL_INTELLIGENCE },
    ],
    [E]: [
      { term: "scienza per bambini", category: C.STEM },
      { term: "imparare a leggere per bambini", category: C.STEM },
      { term: "disegni facili per bambini", category: C.ARTS },
    ],
    [W]: [
      { term: "esperimenti scientifici per bambini", category: C.STEM },
      { term: "storia per bambini", category: C.STEM },
      { term: "progetti d'arte per bambini", category: C.ARTS },
    ],
  },
  ko: {
    [T]: [
      { term: "유아 숫자 동요", category: C.STEM },
      { term: "어린이 동요", category: C.ARTS },
      { term: "유아 감정 놀이", category: C.EMOTIONAL_INTELLIGENCE },
    ],
    [E]: [
      { term: "어린이 과학 실험", category: C.STEM },
      { term: "한글 깨치기 유아", category: C.STEM },
      { term: "어린이 그리기", category: C.ARTS },
    ],
    [W]: [
      { term: "과학 실험 초등", category: C.STEM },
      { term: "세계 역사 어린이", category: C.STEM },
      { term: "어린이 미술", category: C.ARTS },
    ],
  },
  tr: {
    [T]: [
      { term: "bebekler için sayı şarkıları", category: C.STEM },
      { term: "çocuk şarkıları", category: C.ARTS },
      { term: "küçük çocuklar için duygular", category: C.EMOTIONAL_INTELLIGENCE },
    ],
    [E]: [
      { term: "çocuklar için eğlenceli bilim", category: C.STEM },
      { term: "çocuklar için okuma öğrenme", category: C.STEM },
      { term: "çocuklar için kolay çizim", category: C.ARTS },
    ],
    [W]: [
      { term: "çocuklar için bilim deneyleri", category: C.STEM },
      { term: "çocuklar için dünya tarihi", category: C.STEM },
      { term: "çocuklar için sanat projeleri", category: C.ARTS },
    ],
  },
  eu: {
    [T]: [
      { term: "haurrentzat kontatzeko kantuak", category: C.STEM },
      { term: "haur kantuak", category: C.ARTS },
      { term: "sentimenduak txikientzat", category: C.EMOTIONAL_INTELLIGENCE },
    ],
    [E]: [
      { term: "zientzia dibertigarria haurrentzat", category: C.STEM },
      { term: "irakurtzen ikasi haurrentzat", category: C.STEM },
      { term: "marrazten ikasi haurrentzat", category: C.ARTS },
    ],
    [W]: [
      { term: "zientzia esperimentuak haurrentzat", category: C.STEM },
      { term: "munduko historia haurrentzat", category: C.STEM },
      { term: "artea haurrentzat", category: C.ARTS },
    ],
  },
};

// Terms for a language+age, biased by the adaptive level (simpler → early terms, richer → later terms).
export function seedsFor(languageCode, ageGroup, level = "standard") {
  const tiers = SEARCH_SEEDS[languageCode]?.[ageGroup] ?? SEARCH_SEEDS.en[ageGroup];
  if (level === "simpler") return tiers.slice(0, 2);
  if (level === "richer") return [...tiers].reverse();
  return tiers;
}