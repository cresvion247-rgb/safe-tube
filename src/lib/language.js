// Single language controller (built-in i18n). The ONLY module that reads/writes
// the UI language preference, validates it against supported locales, and
// applies it to the document. No page or component writes the preference itself.
import { DICTIONARIES, UI_LANGUAGES, RTL_UI_LANGUAGES, DEFAULT_UI_LANGUAGE } from "@/i18n";

const STORAGE_KEY = "safetube_kids_language";
const LEGACY_STORAGE_KEY = "safetube_lang_pref";

const EXTRA = {
  "curator.muslimTitle": "Muslim kids channels",
  "curator.muslimText": "Tap Add to allow a trusted kids channel for this age. It is filed under Islam and stays on this device.",
  "curator.muslimAdded": "{name} is on the feed for this age.",
  "curator.muslimAlready": "{name} is already added.",
  "curator.videoTitle": "Add one video",
  "curator.videoText": "Paste a YouTube video link. It is saved for this age under Islam. Optionally allow the whole channel too.",
  "curator.videoPlaceholder": "youtube.com/watch?v=… or youtu.be/…",
  "curator.videoAlsoChannel": "Also allow this channel",
  "curator.videoAdded": "Saved “{title}” for this age.",
  "curator.videoBad": "Paste a YouTube video link.",
  "ageGroup.teen_13_16": "Teen (13–16)",
  "watch.allCategories": "All",
  "category.faith": "Faith & Values",
  "category.faith.islam": "Islam",
  "category.faith.islam.sunni": "Sunni",
  "category.faith.islam.shia": "Shia",
  "category.faith.islam.other": "Other",
  "category.faith.islam.sunni.hanafi": "Hanafi",
  "category.faith.islam.sunni.maliki": "Maliki",
  "category.faith.islam.sunni.shafii": "Shafii",
  "category.faith.islam.sunni.hanbali": "Hanbali",
  "category.faith.islam.sunni.other": "Other Sunni",
  "category.faith.islam.shia.twelver": "Twelver",
  "category.faith.islam.shia.ismaili": "Ismaili",
  "category.faith.islam.shia.zaydi": "Zaydi",
  "category.faith.islam.shia.other": "Other Shia",
  "category.Coding_Technology": "Coding",
  "category.AI": "AI",
  "category.Film_Making": "Film making",
  "category.Digital_Skills": "Digital skills",
};

const isSupported = (code) => UI_LANGUAGES.some((language) => language.code === code);

const readStored = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY) || null;
  } catch {
    return null;
  }
};

const persist = (code) => {
  try {
    localStorage.setItem(STORAGE_KEY, code);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
};

const detectDeviceLanguage = () => {
  const candidates = typeof navigator !== "undefined" ? navigator.languages ?? [navigator.language] : [];
  for (const tag of candidates) {
    const base = String(tag).toLowerCase().split("-")[0];
    if (isSupported(base)) return base;
  }
  return null;
};

const resolveInitialLanguage = () => {
  const stored = readStored();
  if (stored && isSupported(stored)) return { code: stored, persisted: true };
  return { code: detectDeviceLanguage() ?? DEFAULT_UI_LANGUAGE, persisted: false };
};

const applyToDocument = (code) => {
  document.documentElement.lang = code;
  document.documentElement.dir = RTL_UI_LANGUAGES.includes(code) ? "rtl" : "ltr";
};

const listeners = new Set();
const initial = resolveInitialLanguage();
let current = initial.code;
applyToDocument(current);
if (!initial.persisted) persist(current);

export const getUiLanguage = () => current;

export const subscribeUiLanguage = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function applyAppLanguage(code) {
  const next = isSupported(code) ? code : DEFAULT_UI_LANGUAGE;
  if (next === current) {
    applyToDocument(current);
    return;
  }
  current = next;
  persist(next);
  applyToDocument(next);
  listeners.forEach((listener) => listener());
}

export const getStoredLanguage = () => current;

export function translate(code, key, params) {
  const text = DICTIONARIES[code]?.[key] ?? DICTIONARIES.en[key] ?? EXTRA[key] ?? key;
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name) => (params[name] == null ? "" : String(params[name])));
}
