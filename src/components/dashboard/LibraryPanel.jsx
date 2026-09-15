// Parent-only Library status area: visibility into the SafeTube Video Library.
// Trusted channel totals, video counts per category/age/language, last refresh,
// and the YouTube connection state — plus a manual refresh button.
import { useCallback, useEffect, useState } from "react";
import { BookCheck, Clock, Loader2, RefreshCw, ShieldCheck, AlertTriangle } from "lucide-react";
import { libraryStats, refreshLibrary } from "@/app/library";
import { useI18n } from "@/lib/i18n";

const StatCard = ({ icon: Icon, label, value, hint, small }) => (
  <div className="rounded-2xl border border-border bg-card p-4">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-4 w-4 shrink-0" />
      <p className="text-sm font-semibold">{label}</p>
    </div>
    {value !== undefined && (
      <p className={`mt-2 font-heading font-bold ${small ? "text-base leading-snug" : "text-2xl"}`}>{value}</p>
    )}
    {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const BreakdownCard = ({ title, entries, formatLabel }) => (
  <div className="rounded-2xl border border-border bg-card p-4">
    <p className="text-sm font-semibold text-muted-foreground">{title}</p>
    {entries.length === 0 ? (
      <p className="mt-2 font-heading text-xl font-bold text-muted-foreground">—</p>
    ) : (
      <ul className="mt-3 flex flex-wrap gap-2">
        {entries.map(([key, count]) => (
          <li key={key} className="rounded-full bg-accent px-3 py-1 text-sm font-semibold text-primary">
            {formatLabel(key)} · {count}
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default function LibraryPanel() {
  const { t, uiLanguage } = useI18n();
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState(null); // { warn: boolean, text: string }

  const load = useCallback(() => {
    libraryStats().then(setStats);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runRefresh = async () => {
    setRefreshing(true);
    setMessage(null);
    try {
      const result = await refreshLibrary({ manual: true });
      setMessage(
        result.quotaIssue
          ? { warn: true, text: t("library.refreshFailed") }
          : {
              warn: false,
              text: result.added > 0 ? t("library.refreshOk", { added: result.added }) : t("library.refreshNone"),
            }
      );
    } catch {
      setMessage({ warn: true, text: t("library.refreshFailed") });
    } finally {
      setRefreshing(false);
      load();
    }
  };

  if (!stats) {
    return (
      <div className="flex justify-center py-16" role="status" aria-label={t("common.loading")}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="flex items-center gap-2 font-heading text-xl font-bold">
              <BookCheck className="h-5 w-5 text-primary" /> {t("library.title")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("library.text")}</p>
            <p className="mt-2 text-xs text-muted-foreground">{t("library.autoNote")}</p>
          </div>
          <button
            type="button"
            onClick={runRefresh}
            disabled={refreshing}
            className="flex h-14 items-center gap-2 rounded-2xl bg-primary px-6 font-heading text-lg font-bold text-primary-foreground shadow-lg transition active:scale-95 disabled:opacity-60"
          >
            {refreshing ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
            {refreshing ? t("library.refreshing") : t("library.refresh")}
          </button>
        </div>
        {message && (
          <p className={`mt-4 text-sm font-semibold ${message.warn ? "text-destructive" : "text-primary"}`}>
            {message.text}
          </p>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={ShieldCheck}
          label={t("library.trustedChannels")}
          value={stats.trustedTotal}
          hint={t("library.resolved", { count: stats.trustedResolved })}
        />
        <StatCard icon={BookCheck} label={t("library.totalVideos")} value={stats.totalVideos} />
        <StatCard
          icon={Clock}
          label={t("library.lastRefresh")}
          value={stats.lastRefreshAt ? new Date(stats.lastRefreshAt).toLocaleString(uiLanguage) : t("library.never")}
          small
        />
        <StatCard
          icon={stats.quotaOk ? ShieldCheck : AlertTriangle}
          label={stats.quotaOk ? t("library.quotaOk") : t("library.quotaIssue")}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <BreakdownCard title={t("library.byCategory")} entries={stats.byCategory} formatLabel={(k) => t(`category.${k}`)} />
        <BreakdownCard title={t("library.byAge")} entries={stats.byAge} formatLabel={(k) => t(`ageGroup.${k}`)} />
        <BreakdownCard title={t("library.byLanguage")} entries={stats.byLanguage} formatLabel={(k) => k.toUpperCase()} />
      </div>
    </div>
  );
}