"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pause, Play, Settings } from "lucide-react";
import LearningGame from "./LearningGame";
import ParentSettings from "./ParentSettings";
import KidsCatalog from "./KidsCatalog";
import useNativeRecommendations from "./useNativeRecommendations";
import YouTubePlayer, { YouTubePlayerHandle } from "./YouTubePlayer";
import {
  CartoonVideo,
  getPlaybackId,
  getVideo,
  VIDEOS,
} from "@/app/data/catalog";
import { chooseNextGame } from "@/app/lib/game-engine";
import {
  AppSettings,
  DEFAULT_SETTINGS,
  GameType,
  normalizeSettings,
  SETTINGS_STORAGE_KEY,
  isMenuLayout,
} from "@/app/lib/settings";

export default function KidsTubeApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedVideoId = searchParams.get("video");
  const [selectedRecommendation, setSelectedRecommendation] = useState<CartoonVideo | null>(null);
  const knownVideo = getVideo(requestedVideoId) ?? (selectedRecommendation?.id === requestedVideoId ? selectedRecommendation : undefined);
  // Session 01a09d4d-67ed-7d10-aa87-a5bd1f1c0c17: a URL alone grants no playback; extra IDs enter only through a selected native recommendation.
  const blockedVideo = requestedVideoId !== null && !knownVideo;
  const currentVideo = knownVideo ?? VIDEOS[0];
  const recommendations = useNativeRecommendations(currentVideo);

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayVideoId, setAutoplayVideoId] = useState<string | null>(null);
  const playerRef = useRef<YouTubePlayerHandle | null>(null);
  const playingRef = useRef(false);
  const watchedSecondsRef = useRef(0);
  const previousGameRef = useRef<GameType | null>(null);
  const resumeAfterGameRef = useRef(false);
  const resumeAfterSettingsRef = useRef(false);
  const previewLayout = searchParams.get("menu");
  const menuLayout = isMenuLayout(previewLayout) ? previewLayout : settings.menuLayout;

  useEffect(() => {
    try {
      const storedSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) setSettings(normalizeSettings(JSON.parse(storedSettings)));
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  useEffect(() => {
    watchedSecondsRef.current = 0;
    setActiveGame(null);
    playingRef.current = false;
    setIsPlaying(false);
  }, [currentVideo.id, blockedVideo]);


  const handlePlayingChange = useCallback((playing: boolean) => {
    playingRef.current = playing;
    setIsPlaying(playing);
  }, []);

  const handlePlayerReady = useCallback((player: YouTubePlayerHandle | null) => {
    playerRef.current = player;
  }, []);

  const startGame = useCallback((forcedType?: GameType, resumeOverride?: boolean) => {
    resumeAfterGameRef.current = resumeOverride ?? playingRef.current;
    playerRef.current?.pauseVideo();
    const game = forcedType ?? chooseNextGame(
      settings.enabledGames,
      previousGameRef.current,
    );
    previousGameRef.current = game;
    setShowSettings(false);
    setActiveGame(game);
  }, [settings.enabledGames]);

  const openSettings = useCallback(() => {
    resumeAfterSettingsRef.current = playingRef.current;
    playerRef.current?.pauseVideo();
    setShowSettings(true);
  }, []);

  const closeSettings = useCallback(() => {
    setShowSettings(false);
    if (resumeAfterSettingsRef.current) playerRef.current?.playVideo();
    resumeAfterSettingsRef.current = false;
  }, []);

  const completeGame = useCallback(() => {
    setActiveGame(null);
    if (resumeAfterGameRef.current) playerRef.current?.playVideo();
    resumeAfterGameRef.current = false;
  }, []);

  const qaInterval = Number(searchParams.get("qaInterval"));
  const intervalSeconds =
    process.env.NODE_ENV !== "production" && Number.isFinite(qaInterval) && qaInterval > 0
      ? qaInterval
      : settings.intervalMinutes * 60;

  // Session 019ff4e6-45a8-7993-ba18-825ca748ca24: only real YouTube PLAYING time advances the hidden learning timer.
  useEffect(() => {
    if (!settings.learningEnabled || !isPlaying || activeGame) return;
    const timer = window.setInterval(() => {
      watchedSecondsRef.current += 1;
      if (watchedSecondsRef.current >= intervalSeconds) {
        watchedSecondsRef.current = 0;
        startGame();
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeGame, intervalSeconds, isPlaying, startGame, settings.learningEnabled]);

  const saveSettings = (nextSettings: AppSettings) => {
    const safeSettings = normalizeSettings(nextSettings);
    setSettings(safeSettings);
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(safeSettings));
    watchedSecondsRef.current = 0;
    if (previewLayout) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("menu");
      router.replace(`/?${params.toString()}`, { scroll: false });
    }
  };

  const openVideo = (video: CartoonVideo) => {
    if (!getVideo(video.id) && !recommendations.some(item => item.id === video.id) && selectedRecommendation?.id !== video.id) return;
    if (!getVideo(video.id)) setSelectedRecommendation(video);
    if (requestedVideoId === null || blockedVideo || video.id !== currentVideo.id) setAutoplayVideoId(video.id);
    else playerRef.current?.playVideo();
    const params = new URLSearchParams({ theme: video.topicId, video: video.id });
    if (isMenuLayout(previewLayout)) params.set("menu", previewLayout);
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="app-shell kids-app" data-testid="app-root">
      <header className="site-header">
        <div className="header-inner">
          <button type="button" className="brand kids-home-button" aria-label="Открыть меню мультфильмов" onClick={() => playerRef.current?.pauseVideo()}>
            <span className="brand-mark" aria-hidden="true"><Play fill="currentColor" /></span>
            <span><strong>Мира</strong> и Люк</span>
          </button>
          <button
            type="button"
            className="header-settings"
            onClick={openSettings}
            aria-label="Для взрослых"
            data-testid="settings-open"
          >
            <Settings aria-hidden="true" />
            <span>Для взрослых</span>
          </button>
        </div>
      </header>

      <main className="watch-only" data-testid="watch-screen">
        <section className="player-panel" aria-label={blockedVideo ? "Выбор мультфильма" : currentVideo.title}>
          {blockedVideo ? (
            <div className="player-frame" data-testid="video-not-approved" role="status">
              <div className="player-status">
                <strong>Этого видео нет в списке</strong>
                <span>Выбери мультфильм из списка.</span>
              </div>
            </div>
          ) : <YouTubePlayer
            key={currentVideo.id}
            videoId={getPlaybackId(currentVideo)}
            title={currentVideo.title}
            onPlayingChange={handlePlayingChange}
            onPlayerReady={handlePlayerReady}
            autoPlay={autoplayVideoId === currentVideo.id}
            initialMenu={requestedVideoId === null}
            renderPauseMenu={(ended, resume) => (
              <KidsCatalog currentVideo={currentVideo} recommendations={recommendations} layout={menuLayout} ended={ended} home={requestedVideoId === null} onResume={resume} onSelect={openVideo} onSettings={openSettings} />
            )}
          />}
          {isPlaying && !activeGame && !showSettings && (
            <button type="button" className="button watch-pause" onClick={() => playerRef.current?.pauseVideo()} data-testid="watch-pause">
              <Pause size={20} aria-hidden="true" />
              Пауза
            </button>
          )}
        </section>

        <aside className="video-sidebar kids-watch-catalog" aria-label="Следующие мультфильмы">
          <KidsCatalog currentVideo={currentVideo} recommendations={recommendations} layout={menuLayout} compact onSelect={openVideo} />
        </aside>
      </main>

      {showSettings && (
        <ParentSettings
          settings={{ ...settings, menuLayout }}
          onClose={closeSettings}
          onSave={saveSettings}
          onTestGame={(type) => {
            const shouldResume = resumeAfterSettingsRef.current;
            resumeAfterSettingsRef.current = false;
            startGame(type, shouldResume);
          }}
        />
      )}

      {activeGame && (
        <LearningGame
          key={`${activeGame}-${currentVideo.id}`}
          type={activeGame}
          soundEnabled={settings.soundEnabled}
          onComplete={completeGame}
        />
      )}
    </div>
  );
}
