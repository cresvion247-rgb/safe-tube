// Safe embedded-player adapter — YouTube IFrame Player API with all navigation blocked.
// The consuming component renders an invisible overlay above the iframe to swallow clicks,
// so kids can never reach youtube.com, channel pages, comments, or related videos.
let apiPromise = null;

export const PLAYER_STATE = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3 };

export function loadYouTubeApi() {
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      if (window.YT && window.YT.Player) return resolve(window.YT);
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof previous === "function") previous();
        resolve(window.YT);
      };
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    });
  }
  return apiPromise;
}

export async function createSafePlayer(containerId, videoId, { language = "en", onEnded, onStateChange } = {}) {
  const YT = await loadYouTubeApi();
  return new Promise((resolve, reject) => {
    const player = new YT.Player(containerId, {
      videoId,
      playerVars: {
        modestbranding: 1,
        rel: 0, // never show related videos
        iv_load_policy: 3, // no video annotations
        controls: 0, // no YouTube chrome — custom kid-friendly controls only
        disablekb: 1,
        fs: 0,
        playsinline: 1,
        hl: language,
      },
      events: {
        onReady: () => resolve(player),
        onError: () => reject(new Error("This video could not be played.")),
        onStateChange: (event) => {
          onStateChange?.(event.data);
          if (event.data === PLAYER_STATE.ENDED) onEnded?.();
        },
      },
    });
  });
}