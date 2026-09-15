// Central dictionary registry — the only place locale files are wired together.
// English (./locales/en) is the canonical key set and the universal fallback.
import ar from "./locales/ar";
import bn from "./locales/bn";
import de from "./locales/de";
import en from "./locales/en";
import es from "./locales/es";
import eu from "./locales/eu";
import fr from "./locales/fr";
import hi from "./locales/hi";
import id from "./locales/id";
import it from "./locales/it";
import ja from "./locales/ja";
import ko from "./locales/ko";
import nl from "./locales/nl";
import pl from "./locales/pl";
import pt from "./locales/pt";
import ru from "./locales/ru";
import tr from "./locales/tr";
import uk from "./locales/uk";
import ur from "./locales/ur";
import zh from "./locales/zh";

export const DICTIONARIES = { ar, bn, de, en, es, eu, fr, hi, id, it, ja, ko, nl, pl, pt, ru, tr, uk, ur, zh };

export const DEFAULT_UI_LANGUAGE = "en";

// The UI language catalog (kept separate from the domain content-language list).
export const UI_LANGUAGES = [
  { code: "en", nativeName: "English" },
  { code: "es", nativeName: "Español" },
  { code: "eu", nativeName: "Euskara" },
  { code: "fr", nativeName: "Français" },
  { code: "de", nativeName: "Deutsch" },
  { code: "pt", nativeName: "Português" },
  { code: "it", nativeName: "Italiano" },
  { code: "nl", nativeName: "Nederlands" },
  { code: "tr", nativeName: "Türkçe" },
  { code: "ru", nativeName: "Русский" },
  { code: "uk", nativeName: "Українська" },
  { code: "pl", nativeName: "Polski" },
  { code: "id", nativeName: "Bahasa Indonesia" },
  { code: "ar", nativeName: "العربية" },
  { code: "ur", nativeName: "اردو" },
  { code: "hi", nativeName: "हिन्दी" },
  { code: "bn", nativeName: "বাংলা" },
  { code: "zh", nativeName: "中文" },
  { code: "ja", nativeName: "日本語" },
  { code: "ko", nativeName: "한국어" },
];

export const RTL_UI_LANGUAGES = ["ar", "ur"];