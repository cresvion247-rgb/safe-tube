// Create / edit a child profile. All validation happens here at the input edge.
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import {
  ALL_AGE_GROUPS,
  LANGUAGES,
  DEFAULT_DAILY_LIMIT_MINUTES,
  MIN_DAILY_LIMIT_MINUTES,
  MAX_DAILY_LIMIT_MINUTES,
} from "@/domain/constants";
import { useI18n } from "@/lib/i18n";
import { saveProfile, uid } from "@/adapters/localDb";

export default function ProfileEditor({ profile, onSaved, onCancel }) {
  const { t } = useI18n();
  const [form, setForm] = useState(() => ({
    childName: profile?.childName ?? "",
    ageGroup: profile?.ageGroup ?? ALL_AGE_GROUPS[0],
    targetLanguages: profile?.targetLanguages ?? ["en"],
    dailyTimeLimitMinutes: profile?.dailyTimeLimitMinutes ?? DEFAULT_DAILY_LIMIT_MINUTES,
  }));
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      childName: profile?.childName ?? "",
      ageGroup: profile?.ageGroup ?? ALL_AGE_GROUPS[0],
      targetLanguages: profile?.targetLanguages ?? ["en"],
      dailyTimeLimitMinutes: profile?.dailyTimeLimitMinutes ?? DEFAULT_DAILY_LIMIT_MINUTES,
      parentPin: profile?.parentPin ?? "",
    });
  }, [profile]);

  const toggleLanguage = (code) => {
    setForm((f) => ({
      ...f,
      targetLanguages: f.targetLanguages.includes(code)
        ? f.targetLanguages.filter((c) => c !== code)
        : [...f.targetLanguages, code].slice(0, 3),
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = [];
    if (!form.childName.trim()) nextErrors.push(t("editor.errorName"));
    if (form.targetLanguages.length === 0) nextErrors.push(t("editor.errorLanguages"));
    setErrors(nextErrors);
    if (nextErrors.length > 0) return;

    setSaving(true);
    try {
      await saveProfile({
        id: profile?.id ?? uid(),
        childName: form.childName.trim(),
        ageGroup: form.ageGroup,
        targetLanguages: form.targetLanguages,
        dailyTimeLimitMinutes: form.dailyTimeLimitMinutes,
        currentTimeSpent: profile?.currentTimeSpent ?? 0,
        lastActiveDate: profile?.lastActiveDate ?? new Date().toISOString().slice(0, 10),
        educationalTokens: profile?.educationalTokens ?? 0,
        comprehensionScore: profile?.comprehensionScore ?? 50,
      });
      onSaved();
    } catch (error) {
      console.error("Failed to save profile", error);
      setErrors([t("editor.errorSave")]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {errors.length > 0 && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm font-medium text-destructive">
          <ul className="list-disc space-y-1 pl-4">
            {errors.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </div>
      )}

      <label className="block space-y-2">
        <span className="font-heading font-semibold">{t("editor.name")}</span>
        <input
          value={form.childName}
          onChange={(e) => setForm({ ...form, childName: e.target.value })}
          className="h-12 w-full rounded-xl border border-input bg-card px-4 text-base"
          placeholder={t("editor.namePlaceholder")}
        />
      </label>

      <div className="space-y-2">
        <span className="font-heading font-semibold">{t("editor.ageGroup")}</span>
        <div className="grid gap-3 sm:grid-cols-3">
          {ALL_AGE_GROUPS.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => setForm({ ...form, ageGroup: group })}
              className={`h-14 rounded-xl border-2 text-sm font-bold ${
                form.ageGroup === group ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"
              }`}
            >
              {t(`ageGroup.${group}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className="font-heading font-semibold">
          {t("editor.contentLanguages", { count: form.targetLanguages.length })}
        </span>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              type="button"
              onClick={() => toggleLanguage(language.code)}
              className={`h-12 rounded-full border-2 px-4 text-sm font-semibold ${
                form.targetLanguages.includes(language.code)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card"
              }`}
            >
              {language.nativeName}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{t("editor.feedLanguageHint")}</p>
      </div>

      <label className="block space-y-2">
        <span className="font-heading font-semibold">
          {t("editor.dailyLimit", { minutes: form.dailyTimeLimitMinutes })}
        </span>
        <input
          type="range"
          min={MIN_DAILY_LIMIT_MINUTES}
          max={MAX_DAILY_LIMIT_MINUTES}
          step={15}
          value={form.dailyTimeLimitMinutes}
          onChange={(e) => setForm({ ...form, dailyTimeLimitMinutes: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex h-14 items-center gap-2 rounded-2xl bg-primary px-8 font-heading text-lg font-bold text-primary-foreground disabled:opacity-50"
        >
          <Check className="h-5 w-5" /> {profile ? t("editor.saveChanges") : t("editor.createProfile")}
        </button>
        <button type="button" onClick={onCancel} className="h-14 rounded-2xl border-2 border-border px-6 font-medium">
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}