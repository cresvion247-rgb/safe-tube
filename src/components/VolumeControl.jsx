// Kid-friendly volume control for the safe player: a speaker button that opens
// a big vertical slider. Volume only — no other player controls are ever exposed.
import { useEffect, useRef, useState } from "react";
import { Volume, Volume1, Volume2, VolumeX } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// Volume persists for the whole watch session, across video changes.
let sessionVolume = 100;

// A new player instance starts at YouTube's default; re-apply the session level.
export function applySessionVolume(player) {
  player?.unMute?.(); // counteract browsers that start embedded players muted
  player?.setVolume?.(sessionVolume);
}

const clamp = (value) => Math.min(100, Math.max(0, Math.round(value)));

export default function VolumeControl({ playerRef }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [volume, setVolume] = useState(sessionVolume);
  const lastAudibleRef = useRef(sessionVolume >= 25 ? sessionVolume : 50);
  const rootRef = useRef(null);

  // Click-away: any tap outside the volume control (player, page, anywhere) closes the slider.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const setLevel = (value) => {
    const next = clamp(value);
    sessionVolume = next;
    setVolume(next);
    if (next >= 25) lastAudibleRef.current = next;
    playerRef.current?.setVolume?.(next);
  };

  const pickFromTrack = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setLevel(((rect.bottom - event.clientY) / rect.height) * 100);
  };

  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    // Tapping the speaker while muted or very low restores the previous level.
    if (volume < 25) setLevel(lastAudibleRef.current);
    setOpen(true);
  };

  const VolumeIcon = volume === 0 ? VolumeX : volume <= 40 ? Volume1 : volume <= 75 ? Volume2 : Volume;

  return (
    <div ref={rootRef} className="contents">
      {open && (
        <div className="absolute bottom-20 left-20 z-30 flex flex-col items-center rounded-2xl bg-black/60 p-3 shadow-lg backdrop-blur-sm">
          <div
            role="slider"
            aria-label={t("player.volume")}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={volume}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              pickFromTrack(event);
            }}
            onPointerMove={(event) => {
              if (event.buttons) pickFromTrack(event);
            }}
            className="relative h-40 w-12 cursor-pointer touch-none rounded-xl bg-white/25"
          >
            <div
              className="absolute bottom-0 left-1/2 w-8 -translate-x-1/2 rounded-full bg-white/90"
              style={{ height: `${volume}%` }}
            />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-label={volume === 0 ? t("player.mute") : t("player.volume")}
        aria-expanded={open}
        className="absolute bottom-4 left-20 z-20 grid h-12 w-12 place-items-center rounded-full bg-black/50 text-white transition active:scale-95"
      >
        <VolumeIcon className="h-6 w-6" />
      </button>
    </div>
  );
}