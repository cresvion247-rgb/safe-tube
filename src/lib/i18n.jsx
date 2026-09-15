// Built-in i18n hook: the single translation engine for the whole app. All
// visible text goes through t(); English is the source and fallback language.
// Subscribes to the central controller, so every mounted component re-renders
// in place when the language changes — no reload, no mixed-language screens.
import { useCallback, useSyncExternalStore } from "react";
import { UI_LANGUAGES } from "@/i18n";
import { getUiLanguage, subscribeUiLanguage, translate } from "@/lib/language";

export function useI18n() {
  const uiLanguage = useSyncExternalStore(subscribeUiLanguage, getUiLanguage);
  const t = useCallback((key, params) => translate(uiLanguage, key, params), [uiLanguage]);

  return {
    t,
    uiLanguage,
    languages: UI_LANGUAGES,
  };
}