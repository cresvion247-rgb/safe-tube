// Single language controller (built-in i18n). The ONLY module that reads/writes
// the UI language preference, validates it against supported locales, and
// applies it to the document. No page or component writes the preference itself.
import { DICTIONARIES, UI_LANGUAGES, RTL_UI_LANGUAGES, DEFAULT_UI_LANGUAGE } from "@/i18n";

const STORAGE_KEY = "safetube_kids_language";
const LEGACY_STORAGE_KEY = "safetube_lang_pref"; // pre-i18n key — migrated on first read

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
    /* storage unavailable — the in-memory preference still applies */
  }
};

// First launch with no saved preference: follow the device language when it is
// supported, otherwise fall back to English.
const detectDeviceLanguage = () => {
  const candidates =
    typeof navigator !== "undefined" ? navigator.languages ?? [navigator.language] : [];
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
if (!initial.persisted) persist(current); // remember the detected choice across refreshes

export const getUiLanguage = () => current;

export const subscribeUiLanguage = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// The one entry point for switching language. Idempotent: picking the same
// language twice is a safe no-op, and switching never reloads the page.
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

// Current-preference snapshot, kept for the backup adapter.
export const getStoredLanguage = () => current;

// Translate a key with the active dictionary; English is the fallback, and a
// key missing everywhere renders the key itself (never undefined).
export function translate(code, key, params) {
  const text = DICTIONARIES[code]?.[key] ?? DICTIONARIES.en[key] ?? key;
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name) =>
    params[name] == null ? "" : String(params[name])
  );
}