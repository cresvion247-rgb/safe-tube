// Full-screen daily-limit lock. Gentle copy for the child; a signed-in parent can
// lift it, otherwise the parent is sent to email sign-in first. Respects safe areas.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MoonStar, LogIn, UserPlus, Loader2, LockOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";

export default function ScreenTimeLock({ returnTo, onParentUnlock }) {
  const { t } = useI18n();
  // checking | signedIn | signedOut
  const [authState, setAuthState] = useState("checking");

  useEffect(() => {
    let alive = true;
    base44.auth
      .isAuthenticated()
      .then((authed) => {
        if (alive) setAuthState(authed ? "signedIn" : "signedOut");
      })
      .catch(() => {
        if (alive) setAuthState("signedOut");
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background p-4 pb-safe pt-safe sm:p-6">
      <div className="mx-auto flex min-h-full w-full max-w-xs flex-col items-center justify-center gap-6 py-4 text-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
          <MoonStar className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="font-heading text-4xl font-bold">{t("lock.title")}</h1>
          <p className="text-lg text-muted-foreground">{t("lock.text")}</p>
        </div>

        <div className="w-full space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{t("lock.parentPrompt")}</p>

          {authState === "checking" && (
            <div className="flex justify-center py-3" role="status" aria-label={t("common.loading")}>
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {authState === "signedIn" && (
            <button
              type="button"
              onClick={onParentUnlock}
              className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-heading text-lg font-bold text-primary-foreground shadow-lg transition active:scale-95"
            >
              <LockOpen className="h-6 w-6" /> {t("lock.open")}
            </button>
          )}

          {authState === "signedOut" && (
            <div className="space-y-2">
              <Link
                to={`/login?returnTo=${encodeURIComponent(returnTo)}`}
                className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-heading text-lg font-bold text-primary-foreground shadow-lg transition active:scale-95"
              >
                <LogIn className="h-6 w-6" /> {t("gate.signIn")}
              </Link>
              <Link
                to={`/register?returnTo=${encodeURIComponent(returnTo)}`}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-muted-foreground hover:bg-accent"
              >
                <UserPlus className="h-4 w-4" /> {t("gate.createAccount")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}