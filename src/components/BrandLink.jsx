import { Link } from "react-router-dom";
import { Tv } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function BrandLink() {
  const { t } = useI18n();
  return (
    <Link to="/" className="flex min-w-0 items-center gap-3" aria-label={t("nav.home")}>
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
        <Tv className="h-6 w-6" />
      </span>
      <span className="truncate font-display text-xl font-bold min-[400px]:text-2xl">{t("brand.name")}</span>
    </Link>
  );
}
