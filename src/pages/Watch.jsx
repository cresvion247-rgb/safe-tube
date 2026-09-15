// Watch: the child's session. Gated feed → safe player → soft pause → intermission → next,
// with the token economy, the daily screen-time lock, and the adaptive feedback loop.
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Coins, Tv, Loader2, ShieldCheck, SkipForward, ListMusic } from "lucide-react";
import {
  EDUCATIONAL_CATEGORIES,
  ENTERTAINMENT_CATEGORY,
  TOKEN_RULES,
  entertainmentCostFor,
} from "@/domain/constants";
import { updateComprehensionScore } from "@/domain/adaptive";
import { SOFT_PAUSE_LINES, pickRandom } from "@/data/intermissions";
import { useI18n } from "@/lib/i18n";
import {
  loadProfileForToday,
  getTodaySession,
  saveSession,
  saveProfile,
  getWatchedVideoIds,
  recordWatchedVideo,
  clearWatchedHistory,
} from "@/adapters/localDb";
import { loadFeed, makeQueue, YoutubeApiError } from "@/app/feed";
import SafePlayerView from "@/components/SafePlayerView";
import SoftPauseScreen from "@/components/SoftPauseScreen";
import IntermissionScreen from "@/components/IntermissionScreen";
import ScreenTimeLock from "@/components/ScreenTimeLock";
import TokenBadge from "@/components/TokenBadge";
import VocabularyPanel from "@/components/watch/VocabularyPanel";
import { getVideoLearning } from "@/app/learning";

const INFO_SCREENS = {
  nokey: {
    icon: Tv,
    titleKey: "watch.nokeyTitle",
    textKey: "watch.nokeyText",
    actionKey: "watch.openSettings",
    to: "/dashboard",
  },
  empty: {
    icon: Tv,
    titleKey: "watch.emptyTitle",
    textKey: "watch.emptyText",
    actionKey: "watch.backToProfiles",
    to: "/",
  },
  error: {
    icon: Tv,
    titleKey: "watch.errorTitle",
    textKey: "watch.errorText",
    actionKey: "watch.backToProfiles",
    to: "/",
  },
  done: {
    icon: Coins,
    titleKey: "watch.doneTitle",
    textKey: "watch.doneText",
    actionKey: "watch.backToProfiles",
    to: "/",
  },
};

const InfoScreen = ({ kind }) => {
  const { t } = useI18n();
  const message = INFO_SCREENS[kind];
  const Icon = message.icon;
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="grid h-24 w-24 place-items-center rounded-full bg-accent text-primary">
        <Icon className="h-12 w-12" />
      </div>
      <div className="space-y-2">
        <h2 className="font-heading text-3xl font-bold">{t(message.titleKey)}</h2>
        <p className="max-w-md text-lg text-muted-foreground">{t(message.textKey)}</p>
      </div>
      <Link
        to={message.to}
        className="flex h-16 items-center rounded-2xl bg-primary px-8 text-center font-heading text-lg font-bold text-primary-foreground shadow-lg"
      >
        {t(message.actionKey)}
      </Link>
    </div>
  );
};

export default function Watch() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();

  // Video length label, always at least "1 min".
  const durationLabel = (video) =>
    t("watch.duration", { minutes: Math.max(1, Math.round((video.durationSeconds ?? 0) / 60)) });

  const [profile, setProfile] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [phase, setPhase] = useState("loading"); // loading | nokey | empty | error | ready | softpause | intermission | timelock | done
  const [softPauseLine, setSoftPauseLine] = useState("");
  const [learning, setLearning] = useState(null);

  const playingRef = useRef(false);
  const sessionRef = useRef(null);
  const secondsRef = useRef(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const loaded = await loadProfileForToday(profileId);
      if (!alive) return;
      if (!loaded) {
        navigate("/", { replace: true });
        return;
      }
      setProfile(loaded);
      const session = await getTodaySession(profileId);
      sessionRef.current = session;
      secondsRef.current = session.secondsToday ?? 0;
      try {
        const { videos } = await loadFeed(loaded);
        if (!alive) return;
        if (!videos.length) {
          setPhase("empty");
          return;
        }
        // Never repeat a watched video across sessions; recycle the oldest-watched
        // ones (resetting history) only when everything has already been seen.
        const watchedIds = new Set(await getWatchedVideoIds(profileId));
        let candidates = videos.filter((v) => !watchedIds.has(v.id));
        if (!candidates.length) {
          await clearWatchedHistory(profileId);
          candidates = videos;
        }
        const { queue: built } = makeQueue(candidates, loaded.educationalTokens, loaded.comprehensionScore, loaded.ageGroup);
        setQueue(built);
        setQueueIndex(0);
        if (built[0]?.category === ENTERTAINMENT_CATEGORY) {
          await spendTokens(built[0], entertainmentCostFor(loaded.ageGroup), loaded);
        }
        if (!alive) return;
        setPhase(secondsRef.current >= (loaded.dailyTimeLimitMinutes ?? 60) * 60 ? "timelock" : "ready");
      } catch (error) {
        if (!alive) return;
        setPhase(error instanceof YoutubeApiError && error.code === "MISSING_API_KEY" ? "nokey" : "error");
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  const updateProfile = (changes) => {
    setProfile((current) => {
      const next = { ...current, ...changes };
      saveProfile(next);
      return next;
    });
  };

  async function spendTokens(video, cost, base) {
    updateProfile({ educationalTokens: Math.max(0, (base ?? profile).educationalTokens - cost) });
  }

  const awardTokens = (amount) => {
    updateProfile({ educationalTokens: profile.educationalTokens + amount });
  };

  const handleLiveQuestion = (correct) => {
    if (correct) awardTokens(TOKEN_RULES.PER_INTERMISSION);
  };

  const handleEndQuestion = (correct) => {
    if (correct) awardTokens(TOKEN_RULES.PER_INTERMISSION);
  };

  // Parent lifted the daily lock: reset today's counter and resume watching.
  const handleParentUnlock = () => {
    secondsRef.current = 0;
    sessionRef.current = { ...sessionRef.current, secondsToday: 0 };
    saveSession(sessionRef.current);
    updateProfile({ currentTimeSpent: 0 });
    setPhase("ready");
  };

  // Daily screen-time accrual while the video actually plays.
  useEffect(() => {
    if (phase !== "ready" || !profile) return undefined;
    let unsaved = 0;
    const timer = setInterval(() => {
      if (!playingRef.current) return;
      secondsRef.current += 1;
      unsaved += 1;
      const limitSeconds = (profile.dailyTimeLimitMinutes ?? 60) * 60;
      if (secondsRef.current >= limitSeconds) {
        playingRef.current = false;
        setPhase("timelock");
      }
      if (unsaved >= 5) {
        unsaved = 0;
        sessionRef.current = { ...sessionRef.current, secondsToday: secondsRef.current };
        saveSession(sessionRef.current);
        updateProfile({ currentTimeSpent: secondsRef.current });
      }
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, profile?.dailyTimeLimitMinutes]);

  // Fetch (or load cached) vocabulary + pop-up questions for the current video.
  useEffect(() => {
    if (phase !== "ready") return undefined;
    const video = queue[queueIndex];
    if (!video) return undefined;
    let alive = true;
    setLearning(null);
    getVideoLearning(video, profile).then((data) => {
      if (alive) setLearning(data);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, queueIndex]);

  const handleEnded = () => {
    const current = queue[queueIndex];
    if (current) recordWatchedVideo(profileId, current.id);
    if (current && EDUCATIONAL_CATEGORIES.includes(current.category)) {
      awardTokens(TOKEN_RULES.PER_EDUCATIONAL_VIDEO);
    }
    setSoftPauseLine(pickRandom(SOFT_PAUSE_LINES[profile.ageGroup]));
    setPhase("softpause");
  };

  const handleIntermission = ({ correct }) => {
    awardTokens(TOKEN_RULES.PER_INTERMISSION);
    updateProfile({
      comprehensionScore: updateComprehensionScore(profile.comprehensionScore, { quizCorrect: correct, watchRatio: 1 }),
    });
    sessionRef.current = {
      ...sessionRef.current,
      quizResults: [...(sessionRef.current.quizResults ?? []), { correct, at: new Date().toISOString() }],
    };
    saveSession(sessionRef.current);

    const nextIndex = queueIndex + 1;
    if (nextIndex >= queue.length) {
      setPhase("done");
      return;
    }
    const nextVideo = queue[nextIndex];
    setQueueIndex(nextIndex);
    if (nextVideo.category === ENTERTAINMENT_CATEGORY) {
      spendTokens(nextVideo, entertainmentCostFor(profile.ageGroup));
    }
    setPhase("ready");
  };

  // Child skips the current video: no token earned, straight to the next in the queue.
  const handleSkip = () => {
    if (queue[queueIndex]) recordWatchedVideo(profileId, queue[queueIndex].id);
    const nextIndex = queueIndex + 1;
    if (nextIndex >= queue.length) {
      setPhase("done");
      return;
    }
    const nextVideo = queue[nextIndex];
    setQueueIndex(nextIndex);
    if (nextVideo.category === ENTERTAINMENT_CATEGORY) {
      spendTokens(nextVideo, entertainmentCostFor(profile.ageGroup));
    }
    setPhase("ready");
  };

  if (phase === "timelock" && profile) {
    return <ScreenTimeLock returnTo={`/watch/${profileId}`} onParentUnlock={handleParentUnlock} />;
  }

  if (["loading", "nokey", "empty", "error", "done"].includes(phase)) {
    return (
      <div className="min-h-screen bg-background">
        <header className="mx-auto flex max-w-5xl items-center justify-between p-4 sm:p-6">
          <Link
            to="/"
            aria-label={t("watch.backToProfiles")}
            className="flex h-12 items-center gap-2 rounded-full border border-border bg-card px-4 font-medium hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" /> {t("common.profiles")}
          </Link>
        </header>
        <main className="mx-auto max-w-5xl">
          {phase === "loading" ? (
            <div className="flex justify-center py-24" role="status" aria-label={t("common.loading")}>
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <InfoScreen kind={phase} />
          )}
        </main>
      </div>
    );
  }

  const current = queue[queueIndex];
  const upNext = queue.slice(queueIndex + 1, queueIndex + 4);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background pt-safe">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 p-4 sm:p-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/"
              aria-label={t("watch.backToProfiles")}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-border bg-card hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate font-heading text-lg font-bold leading-tight sm:text-xl">{profile.childName}</h1>
              <p className="truncate text-xs text-muted-foreground">{t(`ageGroup.${profile.ageGroup}`)}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <TokenBadge tokens={profile.educationalTokens} />
            <Link
              to="/dashboard"
              aria-label={t("common.parentSettings")}
              className="grid h-12 w-12 place-items-center rounded-full border border-border bg-card hover:bg-accent"
            >
              <ShieldCheck className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          <SafePlayerView
            key={current.id}
            video={current}
            language={(profile.targetLanguages || ["en"])[0]}
            onEnded={handleEnded}
            liveQuestions={learning?.questions}
            onQuestionAnswered={handleLiveQuestion}
            onPlayingChange={(isPlaying) => {
              playingRef.current = isPlaying;
            }}
          />

          {phase === "softpause" && <SoftPauseScreen line={softPauseLine} onNext={() => setPhase("intermission")} />}

          {phase === "intermission" && (
            <IntermissionScreen
              ageGroup={profile.ageGroup}
              endQuestion={learning?.endQuestion}
              onEndQuestion={handleEndQuestion}
              onComplete={handleIntermission}
            />
          )}

          {phase === "ready" && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-accent px-3 py-1 font-semibold text-primary">
                  {t(`category.${current.category}`)}
                </span>
                <span className="rounded-full bg-muted px-3 py-1 font-semibold">{durationLabel(current)}</span>
                {current.category === ENTERTAINMENT_CATEGORY && <span>{t("watch.funUnlocked")}</span>}
              </div>
              <button
                type="button"
                onClick={handleSkip}
                aria-label={t("player.skip")}
                className="flex h-12 items-center gap-2 rounded-full border border-border bg-card px-5 font-heading text-base font-bold hover:bg-accent"
              >
                <SkipForward className="h-5 w-5" /> {t("player.skip")}
              </button>
            </div>
          )}

          {phase === "ready" && <VocabularyPanel items={learning?.vocabulary} />}

          {phase === "ready" && upNext.length > 0 && (
            <div className="mt-4 space-y-2 lg:hidden">
              <p className="text-sm font-semibold text-muted-foreground">{t("player.upNext")}</p>
              <ul className="space-y-2">
                {upNext.map((video) => (
                  <li key={video.id} className="rounded-xl bg-accent p-3 text-sm">
                    <p className="line-clamp-2 font-medium">{video.title}</p>
                    <p className="text-xs text-muted-foreground">{t(`category.${video.category}`)} · {durationLabel(video)}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Desktop side panel: token tracking + queue preview */}
        <aside className="hidden flex-col gap-4 rounded-3xl border border-border bg-card p-5 lg:flex">
          <div className="flex items-center gap-3">
            <Coins className="h-6 w-6 shrink-0 text-primary" />
            <p className="font-heading text-lg font-bold">
              {t("profile.tokens", { count: profile.educationalTokens })}
            </p>
          </div>
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <ListMusic className="h-4 w-4" /> {t("player.upNext")}
            </p>
            {upNext.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("player.queueDone")}</p>
            ) : (
              <ul className="space-y-2">
                {upNext.map((video) => (
                  <li key={video.id} className="rounded-xl bg-accent p-3 text-sm">
                    <p className="line-clamp-2 font-medium">{video.title}</p>
                    <p className="text-xs text-muted-foreground">{t(`category.${video.category}`)} · {durationLabel(video)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}