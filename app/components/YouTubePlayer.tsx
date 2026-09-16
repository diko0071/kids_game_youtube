"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { AlertTriangle, LoaderCircle, Play } from "lucide-react";

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  onPlayingChange: (isPlaying: boolean) => void;
  onPlayerReady: (player: YouTubePlayerHandle | null) => void;
  renderPauseMenu: (ended: boolean, resume: () => void) => ReactNode;
  autoPlay?: boolean;
  initialMenu?: boolean;
}

export interface YouTubePlayerHandle {
  pauseVideo: () => void;
  playVideo: () => void;
}

interface EmbeddedPlayer extends YouTubePlayerHandle {
  destroy: () => void;
  getCurrentTime: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: {
          videoId: string;
          playerVars: Record<string, number | string>;
          events: {
            onReady: (event: { target: EmbeddedPlayer }) => void;
            onStateChange: (event: { data: number }) => void;
            onError: (event: { data: number }) => void;
          };
        },
      ) => EmbeddedPlayer;
      PlayerState: {
        PLAYING: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      youtubeApiPromise = null;
      reject(new Error("YouTube API timeout"));
    }, 15000);

    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      window.clearTimeout(timeout);
      resolve();
    };

    if (!document.querySelector("script[data-youtube-iframe-api]")) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.dataset.youtubeIframeApi = "true";
      script.onerror = () => {
        window.clearTimeout(timeout);
        youtubeApiPromise = null;
        reject(new Error("YouTube API failed to load"));
      };
      document.head.appendChild(script);
    }
  });

  return youtubeApiPromise;
}

export default function YouTubePlayer({
  videoId,
  title,
  onPlayingChange,
  onPlayerReady,
  renderPauseMenu,
  autoPlay = false,
  initialMenu = false,
}: YouTubePlayerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const commandsRef = useRef<YouTubePlayerHandle | null>(null);
  const initialMenuRef = useRef(initialMenu);
  const [status, setStatus] = useState<"loading" | "ready" | "paused" | "ended" | "error">("loading");
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let generation = 0;
    let player: EmbeddedPlayer | null = null;
    let position = 0;
    let hasPlayed = false;
    let held = false;
    let restartOnResume = false;
    let resumePending = false;
    const mount = mountRef.current;

    // Session 01a09d4d-67ed-7d10-aa87-a5bd1f1c0c17: only navigation, errors and unmount destroy the player; generation rejects events from an obsolete instance.
    const removePlayer = () => {
      generation += 1;
      const previous = player;
      player = null;
      try {
        previous?.destroy();
      } catch {
        // The iframe may already be gone after browser navigation; detach the wrapper either way.
      } finally {
        mount?.replaceChildren();
      }
    };

    const hold = (ended = false) => {
      if (cancelled || held) return;
      const currentTime = player?.getCurrentTime?.();
      if (typeof currentTime === "number" && Number.isFinite(currentTime)) {
        position = Math.max(0, currentTime);
      }
      if (ended) position = 0;
      held = true;
      restartOnResume = ended;
      resumePending = false;
      player?.pauseVideo?.();
      onPlayingChange(false);
      setStatus(ended ? "ended" : "paused");
    };

    const initialize = async (resume = false) => {
      const token = ++generation;
      held = false;
      hasPlayed = false;
      setStatus("loading");
      setErrorCode(null);
      onPlayingChange(false);
      try {
        await loadYouTubeApi();
        if (cancelled || token !== generation || !mount || !window.YT?.Player) {
          return;
        }

        // Session 019ff4e6-45a8-7993-ba18-825ca748ca24: YouTube replaces its target node, so keep that node inside a React-owned wrapper to avoid removeChild crashes during navigation.
        const playerTarget = document.createElement("div");
        mount.replaceChildren(playerTarget);
        player = new window.YT.Player(playerTarget, {
          videoId,
          playerVars: {
            autoplay: resume ? 1 : 0,
            start: Math.floor(position),
            controls: 1,
            enablejsapi: 1,
            // Session 0aa8acbc-3477-4317-9e99-5ad65c8c70e3: YouTube's own fullscreen escapes our landscape CSS and restores the "Watch on YouTube" chrome, so the exit reappears. The supported player parameter removes the control outright, which the browser build cannot achieve by hiding DOM inside a cross-origin frame.
            fs: 0,
            iv_load_policy: 3,
            playsinline: 1,
            rel: 0,
            hl: "en",
            cc_lang_pref: "en",
            origin: window.location.origin,
          },
          events: {
            onReady: ({ target }) => {
              if (cancelled || token !== generation) return;
              player = target;
              if (held) { target.pauseVideo(); return; }
              if (initialMenuRef.current && !resume) {
                initialMenuRef.current = false;
                hold();
                return;
              }
              setStatus("ready");
              if (resume) {
                if (position > 0) target.seekTo(position, true);
                target.playVideo();
              }
            },
            onStateChange: ({ data }) => {
              if (cancelled || token !== generation) return;
              if (held) {
                if (data === 1) player?.pauseVideo?.();
                return;
              }
              if (data === 1) { hasPlayed = true; resumePending = false; }
              if (data === 0 || (data === 2 && hasPlayed && !resumePending)) {
                hold(data === 0);
                return;
              }
              onPlayingChange(data === window.YT?.PlayerState.PLAYING);
            },
            onError: ({ data }) => {
              if (cancelled || token !== generation) return;
              removePlayer();
              setErrorCode(data);
              setStatus("error");
              onPlayingChange(false);
            },
          },
        });
      } catch {
        if (!cancelled && token === generation) {
          removePlayer();
          setStatus("error");
        }
      }
    };

    const commands: YouTubePlayerHandle = {
      pauseVideo: () => hold(),
      playVideo: () => {
        if (held && player) {
          held = false;
          resumePending = true;
          // Session 01a09d4d-67ed-7d10-aa87-a5bd1f1c0c17: reveal the same media element and issue play within the tap, preserving iOS user activation instead of awaiting a new iframe.
          flushSync(() => setStatus("ready"));
          if (restartOnResume) player.seekTo(0, true);
          restartOnResume = false;
          player.playVideo();
        } else if (held) {
          void initialize(true);
        } else {
          player?.playVideo?.();
        }
      },
    };
    commandsRef.current = commands;
    onPlayerReady(commands);
    void initialize(autoPlay);

    return () => {
      cancelled = true;
      onPlayerReady(null);
      onPlayingChange(false);
      commandsRef.current = null;
      removePlayer();
    };
  }, [videoId, onPlayerReady, onPlayingChange, retryKey, autoPlay]);

  const showMenu = initialMenu || status === "paused" || status === "ended";

  return (
    <div className="player-frame" data-testid="player-shell" data-video-stage={!showMenu && status !== "error"} aria-label={`Плеер: ${title}`}>
      <div ref={mountRef} className="youtube-mount" data-testid="youtube-player" hidden={showMenu} inert={showMenu} />

      {showMenu && (
        <div data-testid={`player-${status}`}>
          {renderPauseMenu(status === "ended", () => commandsRef.current?.playVideo())}
        </div>
      )}

      {status === "loading" && !showMenu && (
        <div className="player-status" role="status">
          <LoaderCircle className="spin" aria-hidden="true" />
          <strong>Готовим мультфильм…</strong>
          <span>Обычно это занимает несколько секунд</span>
        </div>
      )}

      {status === "error" && !showMenu && (
        <div className="player-status player-status-error" role="alert" data-testid="player-error">
          <AlertTriangle aria-hidden="true" />
          <strong>Этот мультфильм сейчас не открылся</strong>
          <span>
            {errorCode ? `YouTube вернул ошибку ${errorCode}. ` : ""}
            Можно повторить или выбрать другой мультфильм.
          </span>
          <button type="button" className="button button-primary" onClick={() => setRetryKey((key) => key + 1)}>
            <Play size={20} aria-hidden="true" />
            Попробовать снова
          </button>
        </div>
      )}
    </div>
  );
}
