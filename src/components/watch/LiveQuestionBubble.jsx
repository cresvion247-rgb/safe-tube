// Non-blocking pop-up question over the player: appears at a set moment during
// the video, never pauses it, and fades away if the child ignores it.
import { useEffect, useState } from "react";
import { Sparkles, Check, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const AUTO_HIDE_MS = 12000;

export default function LiveQuestionBubble({ question, onAnswer, onDismiss }) {
  const { t } = useI18n();
  const [picked, setPicked] = useState(null);

  // Ignored bubbles fade away on their own; a new question resets the picker.
  useEffect(() => {
    setPicked(null);
    const timer = setTimeout(onDismiss, AUTO_HIDE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  const pick = (index) => {
    if (picked !== null) return;
    setPicked(index);
    onAnswer?.(index === question.correctIndex);
    setTimeout(onDismiss, 2200);
  };

  const isCorrect = picked === question.correctIndex;

  return (
    <div className="absolute right-3 top-3 z-20 w-[min(15rem,65%)] rounded-2xl bg-card/95 p-3 text-start shadow-2xl backdrop-blur-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-1.5 font-heading text-xs font-bold text-primary">
          <Sparkles className="h-4 w-4 shrink-0" /> {t("watch.quickQuestion")}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t("common.cancel")}
          className="-mt-0.5 -mr-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-accent"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-1 text-xs font-medium leading-snug">{question.text}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {question.options.map((option, index) => (
          <button
            key={option}
            type="button"
            disabled={picked !== null}
            onClick={() => pick(index)}
            className={`h-9 min-w-16 rounded-lg border-2 px-2.5 text-[11px] font-bold transition active:scale-95 ${
              picked !== null && index === question.correctIndex
                ? "border-primary bg-primary/10 text-primary"
                : picked === index
                  ? "border-destructive/50 bg-destructive/10"
                  : "border-border bg-background hover:border-primary"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {picked !== null && (
        <p
          className={`mt-2 flex items-center gap-1 text-xs font-semibold ${
            isCorrect ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {isCorrect ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
          {isCorrect ? t("inter.correct") : t("inter.tryAgain")}
        </p>
      )}
    </div>
  );
}