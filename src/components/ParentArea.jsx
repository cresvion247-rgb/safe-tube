// Kid-friendly parent sign-in screen — replaces the old math gate. Parents sign in
// (or create an account) with their email; kids just see a calm "grown-ups only" page.
import { Link } from "react-router-dom";
import { ShieldCheck, LogIn, UserPlus } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function ParentArea() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ShieldCheck className="h-8 w-8" />
      </div>
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-bold">{t("gate.title")}</h1>
        <p className="max-w-md text-muted-foreground">{t("gate.text")}</p>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Link
          to="/login?returnTo=/dashboard"
          className="flex h-14 items-center gap-2 rounded-2xl bg-primary px-8 font-heading text-lg font-bold text-primary-foreground shadow-lg transition active:scale-95"
        >
          <LogIn className="h-5 w-5" /> {t("gate.signIn")}
        </Link>
        <Link
          to="/register?returnTo=/dashboard"
          className="flex h-12 items-center gap-2 rounded-full px-4 text-sm font-medium text-muted-foreground hover:bg-accent"
        >
          <UserPlus className="h-4 w-4" /> {t("gate.createAccount")}
        </Link>
      </div>
    </div>
  );
}