// Age-appropriate words and concepts from the current video, shown as cards
// below the player on every screen size.
import { BookOpen } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function VocabularyPanel({ items }) {
  const { t } = useI18n();
  if (!items || items.length === 0) return null;

  return (
    <section className="mt-4" aria-label={t("watch.vocabulary")}>
      <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <BookOpen className="h-4 w-4" /> {t("watch.vocabulary")}
      </p>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.term} className="rounded-xl bg-accent p-3">
            <p className="font-heading font-bold text-primary">{item.term}</p>
            <p className="text-sm text-muted-foreground">{item.meaning}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}