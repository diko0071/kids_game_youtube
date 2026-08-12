"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Clock3,
  Heart,
  Home,
  Music2,
  Play,
  Rocket,
  Settings,
  Sparkles,
  Truck,
} from "lucide-react";
import LearningGame from "./LearningGame";
import ParentSettings from "./ParentSettings";
import YouTubePlayer, { YouTubePlayerHandle } from "./YouTubePlayer";
import {
  CartoonTopic,
  CartoonVideo,
  getPlaybackId,
  getThumbnailUrl,
  getTopic,
  getVideo,
  getVideosForTopic,
  isValidYouTubeId,
  TOPICS,
} from "@/app/data/catalog";
import { chooseNextGame } from "@/app/lib/game-engine";
import {
  AppSettings,
  DEFAULT_SETTINGS,
  formatCountdown,
  GameType,
  normalizeSettings,
  SETTINGS_STORAGE_KEY,
} from "@/app/lib/settings";

const TOPIC_ICONS = {
  heart: Heart,
  sparkles: Sparkles,
  truck: Truck,
  music: Music2,
  rocket: Rocket,
};

const LAST_VIDEO_KEY = "mira-cartoon-game-last-video";

function formatVideoCount(count: number): string {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return `${count} мультфильмов`;
  if (last === 1) return `${count} мультфильм`;
  if (last >= 2 && last <= 4) return `${count} мультфильма`;
  return `${count} мультфильмов`;
}

function VideoCard({ video, onSelect }: { video: CartoonVideo; onSelect: () => void }) {
  return (
    <button
      type="button"
      className="video-card"
      onClick={onSelect}
      data-testid={`video-card-${video.id}`}
    >
      <span className="video-thumbnail">
        <img
          src={getThumbnailUrl(getPlaybackId(video))}
          alt=""
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
        <span className="thumbnail-play" aria-hidden="true">
          <Play fill="currentColor" />
        </span>
        <span className="language-badge">{video.language === "ru" ? "RU" : "EN"}</span>
      </span>
      <span className="video-card-copy">
        <strong>{video.title}</strong>
        <span>{video.channel}</span>
      </span>
    </button>
  );
}

function TopicCard({ topic, onSelect }: { topic: CartoonTopic; onSelect: () => void }) {
  const Icon = TOPIC_ICONS[topic.icon];
  const count = getVideosForTopic(topic.id).length;
  return (
    <button
      type="button"
      className={`topic-card tone-${topic.tone}`}
      onClick={onSelect}
      data-testid={`topic-${topic.id}`}
    >
      <span className="topic-card-icon" aria-hidden="true"><Icon /></span>
      <span className="topic-card-copy">
        <strong>{topic.title}</strong>
        <span>{topic.description}</span>
        <small>{formatVideoCount(count)}</small>
      </span>
      <ChevronRight className="topic-card-arrow" aria-hidden="true" />
    </button>
  );
}

export default function KidsTubeApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedVideoId = searchParams.get("video");
  const requestedTopic = getTopic(searchParams.get("theme"));
  const knownVideo = getVideo(requestedVideoId);
  const currentVideo = useMemo<CartoonVideo | null>(() => {
    if (!isValidYouTubeId(requestedVideoId)) return null;
    return knownVideo ?? {
      id: requestedVideoId,
      title: "Мультфильм по вашей ссылке",
      channel: "YouTube",
      language: "ru",
      topicId: requestedTopic?.id ?? "stories",
    };
  }, [knownVideo, requestedTopic?.id, requestedVideoId]);
  const currentTopic = currentVideo
    ? getTopic(currentVideo.topicId) ?? TOPICS[0]
    : requestedTopic;

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [recentVideo, setRecentVideo] = useState<CartoonVideo | null>(null);
  const playerRef = useRef<YouTubePlayerHandle | null>(null);
  const playingRef = useRef(false);
  const watchedSecondsRef = useRef(0);
  const previousGameRef = useRef<GameType | null>(null);
  const resumeAfterGameRef = useRef(false);
  const resumeAfterSettingsRef = useRef(false);

  useEffect(() => {
    try {
      const storedSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) setSettings(normalizeSettings(JSON.parse(storedSettings)));
      const recentId = window.localStorage.getItem(LAST_VIDEO_KEY);
      setRecentVideo(getVideo(recentId) ?? null);
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  useEffect(() => {
    watchedSecondsRef.current = 0;
    setWatchedSeconds(0);
    setActiveGame(null);
    playingRef.current = false;
    setIsPlaying(false);

    if (currentVideo && getVideo(currentVideo.id)) {
      window.localStorage.setItem(LAST_VIDEO_KEY, currentVideo.id);
      setRecentVideo(currentVideo);
    }
  }, [currentVideo?.id]);

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
    if (resumeAfterSettingsRef.current) {
      playerRef.current?.playVideo();
    }
    resumeAfterSettingsRef.current = false;
  }, []);

  const completeGame = useCallback(() => {
    setActiveGame(null);
    if (resumeAfterGameRef.current) {
      playerRef.current?.playVideo();
    }
    resumeAfterGameRef.current = false;
  }, []);

  const qaInterval = Number(searchParams.get("qaInterval"));
  const intervalSeconds =
    process.env.NODE_ENV !== "production" && Number.isFinite(qaInterval) && qaInterval > 0
      ? qaInterval
      : settings.intervalMinutes * 60;

  // Session 019ff4e6-45a8-7993-ba18-825ca748ca24: count only YT PLAYING seconds so pauses and buffering never steal cartoon time.
  useEffect(() => {
    if (!isPlaying || activeGame || !currentVideo) return;
    const timer = window.setInterval(() => {
      const next = watchedSecondsRef.current + 1;
      if (next >= intervalSeconds) {
        watchedSecondsRef.current = 0;
        setWatchedSeconds(0);
        startGame();
        return;
      }
      watchedSecondsRef.current = next;
      setWatchedSeconds(next);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeGame, currentVideo, intervalSeconds, isPlaying, startGame]);

  const saveSettings = (nextSettings: AppSettings) => {
    const safeSettings = normalizeSettings(nextSettings);
    setSettings(safeSettings);
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(safeSettings));
    watchedSecondsRef.current = 0;
    setWatchedSeconds(0);
  };

  const openTopic = (topic: CartoonTopic) => {
    router.push(`/?theme=${topic.id}`);
  };

  const openVideo = (video: CartoonVideo) => {
    router.push(`/?theme=${video.topicId}&video=${video.id}`);
  };

  const backToTopic = () => {
    if (currentTopic) router.push(`/?theme=${currentTopic.id}`);
    else router.push("/");
  };

  const backToTopics = () => router.push("/");
  const secondsUntilGame = Math.max(0, intervalSeconds - watchedSeconds);

  return (
    <div className="app-shell" data-testid="app-root">
      <header className="site-header">
        <button type="button" className="brand" onClick={backToTopics} aria-label="На главную — к темам">
          <span className="brand-mark" aria-hidden="true"><Play fill="currentColor" /></span>
          <span><strong>Мульти</strong>Игра</span>
        </button>
        <button type="button" className="header-settings" onClick={openSettings} data-testid="settings-open">
          <Settings aria-hidden="true" />
          <span>Для взрослых</span>
        </button>
      </header>

      {!currentTopic && !currentVideo && (
        <main className="main-content home-screen" data-testid="topics-screen">
          <section className="hero">
            <div className="hero-copy">
              <p className="hero-kicker">Смотрим · играем · учимся</p>
              <h1>Что будем смотреть?</h1>
              <p>Сначала выбери тему, потом любимый мультфильм. Через несколько минут появится короткая игра.</p>
            </div>
            <div className="hero-orbit" aria-hidden="true">
              <span className="orbit-play"><Play fill="currentColor" /></span>
              <span className="orbit-star star-one">★</span>
              <span className="orbit-star star-two">●</span>
              <span className="orbit-star star-three">▲</span>
            </div>
          </section>

          {recentVideo && (
            <button type="button" className="continue-card" onClick={() => openVideo(recentVideo)} data-testid="continue-video">
              <img src={getThumbnailUrl(getPlaybackId(recentVideo))} alt="" />
              <span className="continue-copy">
                <small>Продолжить просмотр</small>
                <strong>{recentVideo.title}</strong>
                <span>{recentVideo.channel}</span>
              </span>
              <span className="continue-play" aria-hidden="true"><Play fill="currentColor" /></span>
            </button>
          )}

          <section className="topic-section" aria-labelledby="topics-title">
            <div className="section-heading">
              <div>
                <p>Шаг 1 из 2</p>
                <h2 id="topics-title">Выбери тему</h2>
              </div>
              <span>{TOPICS.length} тем</span>
            </div>
            <div className="topic-grid">
              {TOPICS.map((topic) => (
                <TopicCard key={topic.id} topic={topic} onSelect={() => openTopic(topic)} />
              ))}
            </div>
          </section>
        </main>
      )}

      {currentTopic && !currentVideo && (
        <main className="main-content catalog-screen" data-testid="catalog-screen">
          <nav className="breadcrumb" aria-label="Навигация">
            <button type="button" onClick={backToTopics} data-testid="back-to-topics">
              <ArrowLeft aria-hidden="true" />
              Все темы
            </button>
          </nav>
          <section className={`catalog-hero tone-${currentTopic.tone}`}>
            <span className="catalog-icon" aria-hidden="true">
              {(() => {
                const Icon = TOPIC_ICONS[currentTopic.icon];
                return <Icon />;
              })()}
            </span>
            <div>
              <p>Шаг 2 из 2</p>
              <h1>{currentTopic.title}</h1>
              <span>{currentTopic.description}</span>
            </div>
          </section>
          <section aria-labelledby="cartoons-title">
            <div className="section-heading">
              <div>
                <p>Нажми на картинку</p>
                <h2 id="cartoons-title">Выбери мультфильм</h2>
              </div>
              <span>{getVideosForTopic(currentTopic.id).length} вариантов</span>
            </div>
            <div className="video-grid">
              {getVideosForTopic(currentTopic.id).map((video) => (
                <VideoCard key={video.id} video={video} onSelect={() => openVideo(video)} />
              ))}
            </div>
          </section>
        </main>
      )}

      {currentVideo && currentTopic && (
        <main className="main-content watch-screen" data-testid="watch-screen">
          <nav className="watch-nav" aria-label="Навигация просмотра">
            <button type="button" className="back-button" onClick={backToTopic} data-testid="back-to-videos">
              <ArrowLeft aria-hidden="true" />
              <span>Назад к мультфильмам</span>
            </button>
            <button type="button" className="home-button" onClick={backToTopics}>
              <Home aria-hidden="true" />
              <span>Сменить тему</span>
            </button>
          </nav>

          <div className="watch-layout">
            <section className="watch-main" aria-labelledby="video-title">
              <YouTubePlayer
                key={currentVideo.id}
                videoId={getPlaybackId(currentVideo)}
                title={currentVideo.title}
                onPlayingChange={handlePlayingChange}
                onPlayerReady={handlePlayerReady}
              />

              <div className="video-info">
                <div>
                  <span className="video-topic-label">{currentTopic.shortTitle}</span>
                  <h1 id="video-title">{currentVideo.title}</h1>
                  <p>{currentVideo.channel}</p>
                </div>
                <span className="language-label">{currentVideo.language === "ru" ? "На русском" : "In English"}</span>
              </div>

              <div className="watch-controls">
                <div className={`timer-status ${isPlaying ? "playing" : "paused"}`} data-testid="timer-status">
                  <Clock3 aria-hidden="true" />
                  <span>
                    <small>{isPlaying ? "Следующая игра через" : "Таймер ждёт запуска видео"}</small>
                    <strong>{isPlaying ? formatCountdown(secondsUntilGame) : `Каждые ${settings.intervalMinutes} мин`}</strong>
                  </span>
                </div>
                <button type="button" className="button button-game" onClick={() => startGame()} data-testid="start-game">
                  <Sparkles aria-hidden="true" />
                  Игра сейчас
                </button>
                  <button type="button" className="button button-quiet" onClick={openSettings}>
                  <Settings aria-hidden="true" />
                  Настроить
                </button>
              </div>
            </section>

            <aside className="more-cartoons" aria-labelledby="more-title">
              <div className="aside-heading">
                <div>
                  <p>В этой теме</p>
                  <h2 id="more-title">Ещё мультфильмы</h2>
                </div>
                <button type="button" onClick={backToTopic}>Все</button>
              </div>
              <div className="compact-video-list">
                {getVideosForTopic(currentTopic.id)
                  .filter((video) => video.id !== currentVideo.id)
                  .slice(0, 4)
                  .map((video) => (
                    <VideoCard key={video.id} video={video} onSelect={() => openVideo(video)} />
                  ))}
              </div>
            </aside>
          </div>
        </main>
      )}

      {showSettings && (
        <ParentSettings
          settings={settings}
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
          key={`${activeGame}-${currentVideo?.id ?? "library"}`}
          type={activeGame}
          soundEnabled={settings.soundEnabled}
          onComplete={completeGame}
        />
      )}
    </div>
  );
}
