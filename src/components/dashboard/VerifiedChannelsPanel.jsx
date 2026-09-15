// Verified learning channels: the hand-curated registry feeding every learning
// category automatically, plus channels that passed runtime vetting (badged
// "New"). Category buttons navigate to that category's list for the selected
// age group; removal is scoped to that age group.
import { useEffect, useState } from "react";
import { RotateCcw, ShieldCheck, Trash2 } from "lucide-react";
import { EDUCATIONAL_CATEGORIES } from "@/domain/constants";
import { useI18n } from "@/lib/i18n";
import { verifiedRegistryForAge } from "@/data/verifiedChannels";
import {
  listConfirmedChannels,
  listRemovedVerified,
  removeVerifiedChannel,
  restoreVerifiedChannel,
  dismissConfirmedChannel,
} from "@/app/vetting";

export default function VerifiedChannelsPanel({ ageGroup }) {
  const { t } = useI18n();
  const [registry, setRegistry] = useState([]);
  const [vetted, setVetted] = useState([]);
  const [removed, setRemoved] = useState([]);
  const [category, setCategory] = useState(EDUCATIONAL_CATEGORIES[0]);

  const refresh = async () => {
    setRegistry(await verifiedRegistryForAge(ageGroup));
    setVetted(await listConfirmedChannels(ageGroup));
    setRemoved(await listRemovedVerified(ageGroup));
  };

  useEffect(() => {
    refresh();
  }, [ageGroup]);

  const removedSet = new Set(removed);
  const rows = [
    ...registry
      .filter((channel) => channel.categories.includes(category))
      .map((channel) => ({
        key: channel.name,
        name: channel.name,
        vettedId: null,
        removed: removedSet.has(channel.name),
      })),
    ...vetted
      .filter((channel) => channel.category === category)
      .map((channel) => ({ key: channel.id, name: channel.name, vettedId: channel.id, removed: false })),
  ];

  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h2 className="font-heading text-xl font-bold">{t("curator.verifiedTitle")}</h2>
      </div>
      <p className="text-sm text-muted-foreground">{t("curator.verifiedText")}</p>

      <div className="flex flex-wrap gap-2">
        {EDUCATIONAL_CATEGORIES.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setCategory(option)}
            className={`h-11 rounded-full border-2 px-4 text-sm font-semibold ${
              category === option ? "border-primary bg-primary/10 text-primary" : "border-border"
            }`}
          >
            {t(`category.${option}`)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-muted-foreground">{t(`category.${category}`)}</p>
        <ul className="space-y-1">
          {rows.map((row) => (
            <li key={row.key} className="flex items-center justify-between gap-3 py-1">
              <div className="flex min-w-0 items-center gap-2">
                <p className={`text-sm font-medium ${row.removed ? "text-muted-foreground line-through" : ""}`}>
                  {row.name}
                </p>
                {row.vettedId && (
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                    {t("curator.newBadge")}
                  </span>
                )}
              </div>
              {row.removed ? (
                <button
                  type="button"
                  onClick={() => restoreVerifiedChannel(row.name, ageGroup).then(refresh)}
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> {t("curator.restore")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    row.vettedId
                      ? dismissConfirmedChannel(row.vettedId, ageGroup).then(refresh)
                      : removeVerifiedChannel(row.name, ageGroup).then(refresh)
                  }
                  aria-label={t("curator.removeChannel", { name: row.name })}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}