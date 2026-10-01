// A child's card on the home profile picker.
import { Pencil, Tv } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function ProfileCard({ profile, onOpen, onEdit }) {
  const { t } = useI18n();
  return (
    <div className="relative flex min-h-12 w-full flex-col items-center gap-3 rounded-3xl border-2 border-border bg-card p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-lg">
      {onEdit && (
        <button
          type="button"
          onClick={() => onEdit(profile)}
          aria-label={t("dash.editProfile", { name: profile.childName })}
          className="absolute right-3 top-3 flex h-11 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-sm font-semibold text-foreground hover:bg-accent"
        >
          <Pencil className="h-4 w-4" />
          {t("dash.editProfile", { name: "" }).replace(/\s+$/, "") || "Edit"}
        </button>
      )}
      <button
        type="button"
        onClick={() => onOpen(profile)}
        className="flex w-full flex-col items-center gap-3 active:scale-95"
      >
        <div className="grid h-20 w-20 place-items-center rounded-full bg-accent font-display text-3xl font-bold text-primary">
          {profile.childName?.trim()?.[0]?.toUpperCase() ?? <Tv className="h-8 w-8" />}
        </div>
        <div className="space-y-1">
          <h2 className="break-words font-heading text-xl font-bold">{profile.childName}</h2>
          <p className="text-sm text-muted-foreground">{t(`ageGroup.${profile.ageGroup}`)}</p>
          <p className="text-xs font-medium text-primary">
            {t("profile.tokens", { count: profile.educationalTokens })}
          </p>
        </div>
      </button>
    </div>
  );
}
