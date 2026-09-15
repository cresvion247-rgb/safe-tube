// Learning Token balance badge shown during a watch session.
import { Coins } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function TokenBadge({ tokens }) {
  const { t } = useI18n();
  return (
    <div
      className="flex h-12 items-center gap-2 rounded-full bg-accent px-4 font-heading text-lg font-bold"
      aria-label={t("profile.tokensAria", { count: tokens })}
    >
      <Coins className="h-5 w-5 text-primary" />
      <span>{tokens}</span>
    </div>
  );
}