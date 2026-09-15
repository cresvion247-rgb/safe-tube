// Cognitive intermission: age-tailored break between videos. Toddlers get movement
// prompts; early learners and tweens get micro-quizzes whose answers feed the adaptive loop.
import { useMemo, useState } from "react";
import { Heart, Star, Check, X, Sparkles } from "lucide-react";
import { AGE_GROUPS } from "@/domain/constants";
import { MOVEMENT_PROMPTS, QUIZZES, pickRandom } from "@/data/intermissions";
import { useI18n } from "@/lib/i18n";

export default function IntermissionScreen({ ageGroup, endQuestion, onEndQuestion, onComplete }) {
  const { t } = useI18n();
  const isToddler = ageGroup === AGE_GROUPS.TODDLER;
  const prompt = useMemo(() => pickRandom(MOVEMENT_PROMPTS), []);
  const quiz = useMemo(() => {
    const pool = QUIZZES[ageGroup] ?? QUIZZES[AGE_GROUPS.EARLY_LEARNER];
    return pickRandom(pool);
  }, [ageGroup]);
  const [answered, setAnswered] = useState(null);
  const [endAnswered, setEndAnswered] = useState(null);

  // Numeric quiz options stay literal; every other option is a dictionary key.
  const optionLabel = (option) => (option.startsWith("inter.") ? t(option) : option);
  const finish = (correct) => onComplete({ correct: isToddler ? true : correct });

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-primary">
        {isToddler ? <Heart className="h-8 w-8" /> : <Sparkles className="h-8 w-8" />}
      </div>

      {endQuestion && (
        <div className="w-full max-w-xl space-y-3 rounded-3xl border-2 border-primary/30 bg-card p-5 text-start">
          <p className="flex items-center gap-2 font-heading text-lg font-bold">
            <Sparkles className="h-5 w-5 text-primary" /> {t("watch.quickQuestion")}
          </p>
          <p className="text-base font-medium">{endQuestion.text}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {endQuestion.options.map((option, index) => (
              <button
                key={option}
                type="button"
                disabled={endAnswered !== null}
                onClick={() => {
                  setEndAnswered(index);
                  onEndQuestion?.(index === endQuestion.correctIndex);
                }}
                className={`h-12 min-w-24 rounded-xl border-2 px-4 text-sm font-bold transition active:scale-95 ${
                  endAnswered !== null && index === endQuestion.correctIndex
                    ? "border-primary bg-primary/10 text-primary"
                    : endAnswered === index
                      ? "border-destructive/50 bg-destructive/10"
                      : "border-border bg-card hover:border-primary"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {endAnswered !== null && (
            <p
              className={`flex items-center justify-center gap-2 text-sm font-semibold ${
                endAnswered === endQuestion.correctIndex ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {endAnswered === endQuestion.correctIndex ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              {endAnswered === endQuestion.correctIndex ? t("inter.correct") : t("inter.tryAgain")}
            </p>
          )}
        </div>
      )}

      {isToddler ? (
        <>
          <h2 className="font-heading text-3xl font-bold">{t(prompt.titleKey)}</h2>
          <p className="max-w-md text-lg text-muted-foreground">{t(prompt.textKey)}</p>
          <button
            type="button"
            onClick={() => finish(true)}
            className="h-16 rounded-2xl bg-primary px-10 font-heading text-xl font-bold text-primary-foreground shadow-lg transition active:scale-95"
          >
            {t("inter.allDone")}
          </button>
        </>
      ) : (
        <>
          <h2 className="font-heading text-2xl font-bold">{t("inter.warmup")}</h2>
          <p className="text-lg font-medium">{t(`${quiz.questionKey}.q`)}</p>
          <div className="flex flex-wrap justify-center gap-4">
            {quiz.options.map((option, index) => {
              const isPicked = answered !== null;
              const isCorrect = index === quiz.correctIndex;
              return (
                <button
                  key={option}
                  type="button"
                  disabled={isPicked}
                  onClick={() => setAnswered(index)}
                  className={`h-16 min-w-28 rounded-2xl border-2 px-6 font-heading text-lg font-bold transition active:scale-95 ${
                    isPicked && isCorrect
                      ? "border-primary bg-primary/10 text-primary"
                      : isPicked && index === answered
                        ? "border-destructive/50 bg-destructive/10"
                        : "border-border bg-card hover:border-primary"
                  }`}
                >
                  {optionLabel(option)}
                </button>
              );
            })}
          </div>
          {answered !== null && (
            <div className="flex flex-col items-center gap-3">
              <p className={`flex items-center gap-2 font-semibold ${answered === quiz.correctIndex ? "text-primary" : "text-muted-foreground"}`}>
                {answered === quiz.correctIndex ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                {answered === quiz.correctIndex ? t("inter.correct") : t("inter.tryAgain")}
              </p>
              <button
                type="button"
                onClick={() => finish(answered === quiz.correctIndex)}
                className="flex h-14 items-center gap-2 rounded-2xl bg-primary px-8 font-heading text-lg font-bold text-primary-foreground shadow-lg transition active:scale-95"
              >
                <Star className="h-5 w-5" /> {t("inter.continue")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}