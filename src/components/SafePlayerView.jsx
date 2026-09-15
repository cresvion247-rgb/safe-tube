// Safe video surface: distraction-free YouTube player with a full-bleed invisible overlay
// that swallows every click, plus a single big custom play/pause control (48px+).
// No YouTube chrome, no titles, no related videos, no click-through — ever.
import { useEffect, useRef, useState } from "react";
import { Play, Pause, Loader2, Maximize, Minimize } from "lucide-react";
import { createSafePlayer, PLAYER_STATE } from "@/adapters/safePlayer";
import VolumeControl, { applySessionVolume } from "@/components/VolumeControl";
import LiveQuestionBubble from "@/components/watch/LiveQuestionBubble";
import { useI18n } from "@/lib/i18n";

export default function SafePlayerView({
  video,
  language,
  onEnded,
  liveQuestions,
  onQuestionAnswered,
  onPlayingChange,
}) {
  const { t } = useI18n();
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ready, setReady] = useState(false);
  // "paused" = the big play overlay is shown. Buffering must NOT count as paused —
  // treating it as paused used to flash the play overlay over the video mid-playback.
  const [paused, setPaused] = useState(true);
  const [error, setError] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const shownQuestionsRef = useRef(new Set());

  // Native fullscreen on the whole player surface: the click-blocker overlay comes
  // along, so kids stay locked inside the safe frame even at full screen.
  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen?.();
    }
  };

  useEffect(() => {
    let destroyed = false;
    setReady(false);
    setPaused(true);
    setError(false);
    shownQuestionsRef.current = new Set();
    setActiveQuestion(null);

    createSafePlayer("safe-player-frame", video.id, {
      language,
      onEnded,
      onStateChange: (state) => {
        const isPlaying = state === PLAYER_STATE.PLAYING;
        setPaused(!isPlaying && state !== PLAYER_STATE.BUFFERING);
        onPlayingChange?.(isPlaying);
      },
    })
      .then((player) => {
        if (destroyed) {
          player.destroy?.();
          return;
        }
        playerRef.current = player;
        applySessionVolume(player);
        setReady(true);
      })
      .catch(() => {
        if (!destroyed) setError(true);
      });

    return () => {
      destroyed = true;
      onPlayingChange?.(false);
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.id]);

  // Pop-up questions ride the playback clock: each appears once and never pauses the video.
  useEffect(() => {
    if (!ready || paused) return undefined;
    const timer = setInterval(() => {
      const player = playerRef.current;
      if (!player?.getCurrentTime) return;
      const time = player.getCurrentTime() ?? 0;
      const due = (liveQuestions || []).find(
        (question) => !shownQuestionsRef.current.has(question) && time >= question.atSeconds - 0.5
      );
      if (due) {
        shownQuestionsRef.current.add(due);
        setActiveQuestion(due);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [ready, paused, liveQuestions]);

  return (
    <div ref={containerRef} className="relative aspect-video w-full overflow-hidden rounded-3xl bg-black shadow-lg">
      <div id="safe-player-frame" className="absolute inset-0 h-full w-full [&>*]:h-full [&>*]:w-full" />

      {/* Click-through blocker: kids cannot reach youtube.com, channel pages, or comments */}
      <div className="absolute inset-0 z-10" aria-hidden="true" />

      {!ready && !error && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/60">
          <Loader2 className="h-10 w-10 animate-spin text-white/80" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-card p-6 text-center font-medium">
          {t("player.error")}
        </div>
      )}

      {ready && paused && !error && (
        <button
          type="button"
          onClick={() => {
            const player = playerRef.current;
            player?.unMute?.(); // some browsers start embeds muted — audio never came on without this
            player?.playVideo();
          }}
          aria-label={t("player.play")}
          className="absolute inset-0 z-20 grid place-items-center"
        >
          <span className="grid h-24 w-24 place-items-center rounded-full bg-white/90 shadow-xl transition active:scale-95">
            <Play className="ml-1 h-10 w-10 text-foreground" />
          </span>
        </button>
      )}

      {/* Tap anywhere on the video to pause — the full-surface button sits above the
          click-blocker (z-10) and below the corner controls in the DOM, so those stay tappable. */}
      {ready && !paused && !error && (
        <button
          type="button"
          onClick={() => playerRef.current?.pauseVideo()}
          aria-label={t("player.pause")}
          className="absolute inset-0 z-20"
        />
      )}

      {ready && !paused && (
        <button
          type="button"
          onClick={() => playerRef.current?.pauseVideo()}
          aria-label={t("player.pause")}
          className="absolute bottom-4 left-4 z-20 grid h-12 w-12 place-items-center rounded-full bg-black/50 text-white transition active:scale-95"
        >
          <Pause className="h-6 w-6" />
        </button>
      )}

      {ready && !paused && activeQuestion && (
        <LiveQuestionBubble
          question={activeQuestion}
          onAnswer={onQuestionAnswered}
          onDismiss={() => setActiveQuestion(null)}
        />
      )}

      {ready && (
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={t("player.fullscreen")}
          className="absolute bottom-4 right-4 z-20 grid h-12 w-12 place-items-center rounded-full bg-black/50 text-white transition active:scale-95"
        >
          {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
        </button>
      )}

      {ready && !paused && <VolumeControl playerRef={playerRef} />}
    </div>
  );
}