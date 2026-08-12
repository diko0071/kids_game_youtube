"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, LoaderCircle, Play } from "lucide-react";

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  onPlayingChange: (isPlaying: boolean) => void;
  onPlayerReady: (player: YouTubePlayerHandle | null) => void;
}

export interface YouTubePlayerHandle {
  pauseVideo: () => void;
  playVideo: () => void;
  destroy?: () => void;
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
            onReady: (event: { target: YouTubePlayerHandle }) => void;
            onStateChange: (event: { data: number }) => void;
            onError: (event: { data: number }) => void;
          };
        },
      ) => YouTubePlayerHandle;
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
}: YouTubePlayerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayerHandle | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setErrorCode(null);
    onPlayingChange(false);

    const initialize = async () => {
      try {
        await loadYouTubeApi();
        if (cancelled || !mountRef.current || !window.YT?.Player) {
          return;
        }

        // Session 019ff4e6-45a8-7993-ba18-825ca748ca24: YouTube replaces its target node, so keep that node inside a React-owned wrapper to avoid removeChild crashes during navigation.
        const playerTarget = document.createElement("div");
        mountRef.current.replaceChildren(playerTarget);
        playerRef.current = new window.YT.Player(playerTarget, {
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            enablejsapi: 1,
            fs: 1,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: ({ target }) => {
              if (cancelled) return;
              playerRef.current = target;
              setStatus("ready");
              onPlayerReady(target);
            },
            onStateChange: ({ data }) => {
              if (cancelled) return;
              onPlayingChange(data === window.YT?.PlayerState.PLAYING);
            },
            onError: ({ data }) => {
              if (cancelled) return;
              setErrorCode(data);
              setStatus("error");
              onPlayingChange(false);
            },
          },
        });
      } catch {
        if (!cancelled) {
          setStatus("error");
        }
      }
    };

    initialize();

    return () => {
      cancelled = true;
      onPlayerReady(null);
      onPlayingChange(false);
      playerRef.current?.destroy?.();
      playerRef.current = null;
      mountRef.current?.replaceChildren();
    };
  }, [videoId, onPlayerReady, onPlayingChange, retryKey]);

  return (
    <div className="player-frame" data-testid="player-shell" aria-label={`Плеер: ${title}`}>
      <div ref={mountRef} className="youtube-mount" data-testid="youtube-player" />

      {status === "loading" && (
        <div className="player-status" role="status">
          <LoaderCircle className="spin" aria-hidden="true" />
          <strong>Готовим мультфильм…</strong>
          <span>Обычно это занимает несколько секунд</span>
        </div>
      )}

      {status === "error" && (
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
