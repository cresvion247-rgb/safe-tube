// The single visible language switcher. Calls the one language controller
// (applyAppLanguage); no other component may write the language preference.
import { useEffect, useRef, useState } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { applyAppLanguage } from "@/lib/language";
import { useI18n } from "@/lib/i18n";

export default function LanguageSwitcher({ compact = false }) {
  const { t, uiLanguage, languages } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const active = languages.find((l) => l.code === uiLanguage) ?? languages[0];

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("common.changeLanguage")}
        aria-expanded={open}
        className="flex h-12 min-w-12 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-sm transition hover:bg-accent"
      >
        <Globe className="h-5 w-5" />
        {!compact && <span>{active.nativeName}</span>}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul className="absolute right-0 z-50 mt-2 max-h-72 w-52 overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-xl">
          {languages.map((language) => (
            <li key={language.code}>
              <button
                type="button"
                onClick={() => {
                  applyAppLanguage(language.code);
                  setOpen(false);
                }}
                className="flex h-12 w-full items-center justify-between rounded-xl px-3 text-sm font-medium hover:bg-accent"
              >
                <span>{language.nativeName}</span>
                {language.code === uiLanguage && <Check className="h-4 w-4 text-primary" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}