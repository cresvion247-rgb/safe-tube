// Soft-fade pause shown after a video ends: gentle recap instead of an abrupt cut.
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function SoftPauseScreen({ line, onNext }) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="max-w-md space-y-3">
        <h2 className="font-heading text-3xl font-bold">{t("soft.title")}</h2>
        <p className="text-lg text-muted-foreground">{t(line)}</p>
      </div>
      <button
        type="button"
        onClick={onNext}
        className="flex h-16 items-center gap-3 rounded-2xl bg-primary px-10 font-heading text-xl font-bold text-primary-foreground shadow-lg transition active:scale-95"
      >
        {t("soft.keepGoing")} <ArrowRight className="h-6 w-6" />
      </button>
    </div>
  );
}