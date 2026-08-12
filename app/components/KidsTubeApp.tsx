"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Heart,
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
  getTopic,
  getPlaybackId,
  getThumbnailUrl,
  getVideo,
  getVideosForTopic,
  isValidYouTubeId,
  TOPICS,
  TopicId,
  VIDEOS,
} from "@/app/data/catalog";
import { chooseNextGame } from "@/app/lib/game-engine";
import {
  AppSettings,
  DEFAULT_SETTINGS,
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

function TopicChoice({
  topic,
  selected,
  videoCount,
  onSelect,
}: {
  topic: CartoonTopic;
  selected: boolean;
  videoCount: number;
  onSelect: () => void;
}) {
  const Icon = TOPIC_ICONS[topic.icon];

  return (
    <button
      type="button"
      className={`topic-choice tone-${topic.tone}`}
      onClick={onSelect}
      aria-label={`${topic.title}, ${videoCount} видео`}
      aria-pressed={selected}
      aria-controls="video-list"
      data-testid={`topic-${topic.id}`}
    >
      <Icon aria-hidden="true" />
      <span>{topic.shortTitle}</span>
    </button>
  );
}

function VideoListItem({
  video,
  selected,
  onSelect,
}: {
  video: CartoonVideo;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`video-list-item ${selected ? "selected" : ""}`}
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      data-testid={`video-card-${video.id}`}
    >
      <span className="video-list-thumbnail">
        <img
          src={getThumbnailUrl(getPlaybackId(video))}
          alt=""
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
        <span className="video-list-play" aria-hidden="true">
          <Play fill="currentColor" />
        </span>
      </span>
      <span className="video-list-copy">
        <strong>{video.title}</strong>
        <span>{video.channel}</span>
      </span>
    </button>
  );
}

export default function KidsTubeApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedVideoId = searchParams.get("video");
  const requestedTopic = getTopic(searchParams.get("theme"));
  const knownVideo = getVideo(requestedVideoId);
  const currentVideo = useMemo<CartoonVideo>(() => {
    if (!isValidYouTubeId(requestedVideoId)) return VIDEOS[0];
    return knownVideo ?? {
      id: requestedVideoId,
      title: "Мультфильм по вашей ссылке",
      channel: "YouTube",
      language: "ru",
      topicId: "stories",
    };
  }, [knownVideo, requestedVideoId]);

  const [activeTopicId, setActiveTopicId] = useState<TopicId>(
    requestedTopic?.id ?? currentVideo.topicId,
  );
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<YouTubePlayerHandle | null>(null);
  const playingRef = useRef(false);
  const watchedSecondsRef = useRef(0);
  const previousGameRef = useRef<GameType | null>(null);
  const resumeAfterGameRef = useRef(false);
  const resumeAfterSettingsRef = useRef(false);
  const activeTopic = getTopic(activeTopicId) ?? TOPICS[0];
  const visibleVideos = useMemo(
    () => getVideosForTopic(activeTopicId),
    [activeTopicId],
  );

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
  }, [currentVideo.id]);

  useEffect(() => {
    setActiveTopicId(requestedTopic?.id ?? currentVideo.topicId);
  }, [currentVideo.topicId, requestedTopic?.id]);

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
    if (!isPlaying || activeGame) return;
    const timer = window.setInterval(() => {
      watchedSecondsRef.current += 1;
      if (watchedSecondsRef.current >= intervalSeconds) {
        watchedSecondsRef.current = 0;
        startGame();
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeGame, intervalSeconds, isPlaying, startGame]);

  const saveSettings = (nextSettings: AppSettings) => {
    const safeSettings = normalizeSettings(nextSettings);
    setSettings(safeSettings);
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(safeSettings));
    watchedSecondsRef.current = 0;
  };

  const openVideo = (video: CartoonVideo) => {
    if (video.id !== currentVideo.id) {
      router.push(`/?theme=${video.topicId}&video=${video.id}`, { scroll: false });
    }
  };

  const openTopic = (topic: CartoonTopic) => {
    setActiveTopicId(topic.id);

    // Session 019ff4e6-45a8-7993-ba18-825ca748ca24: level one only filters level two; playback changes only after an explicit video choice.
    const params = new URLSearchParams(searchParams.toString());
    params.set("theme", topic.id);
    params.set("video", currentVideo.id);
    window.history.pushState(null, "", `/?${params.toString()}`);
  };

  return (
    <div className="app-shell" data-testid="app-root">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand" aria-label="МультиИгра">
            <span className="brand-mark" aria-hidden="true"><Play fill="currentColor" /></span>
            <span><strong>Мульти</strong>Игра</span>
          </div>
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
        <section className="player-panel" aria-label={currentVideo.title}>
          <YouTubePlayer
            key={currentVideo.id}
            videoId={getPlaybackId(currentVideo)}
            title={currentVideo.title}
            onPlayingChange={handlePlayingChange}
            onPlayerReady={handlePlayerReady}
          />
        </section>

        <aside className="video-sidebar" aria-labelledby="picker-title">
          <h1 id="picker-title" className="sr-only">Выбор мультфильма</h1>

          <section className="picker-step topic-step" aria-labelledby="topic-step-title">
            <div className="picker-step-heading">
              <span className="picker-step-number" aria-hidden="true">1</span>
              <h2 id="topic-step-title">Тип мультфильма</h2>
            </div>
            <div className="topic-choices" role="group" aria-label="Тип мультфильма">
              {TOPICS.map((topic) => (
                <TopicChoice
                  key={topic.id}
                  topic={topic}
                  selected={topic.id === activeTopicId}
                  videoCount={getVideosForTopic(topic.id).length}
                  onSelect={() => openTopic(topic)}
                />
              ))}
            </div>
          </section>

          <section className="picker-step video-step" aria-labelledby="video-step-title">
            <div className="picker-step-heading video-step-heading">
              <span className="picker-step-number" aria-hidden="true">2</span>
              <div>
                <h2 id="video-step-title">Мультфильм</h2>
                <p aria-live="polite">{activeTopic.title} · {visibleVideos.length} видео</p>
              </div>
            </div>
            <div className="video-list" id="video-list" key={activeTopicId}>
              {visibleVideos.map((video) => (
                <VideoListItem
                  key={video.id}
                  video={video}
                  selected={video.id === currentVideo.id}
                  onSelect={() => openVideo(video)}
                />
              ))}
            </div>
          </section>
        </aside>
      </main>

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
          key={`${activeGame}-${currentVideo.id}`}
          type={activeGame}
          soundEnabled={settings.soundEnabled}
          onComplete={completeGame}
        />
      )}
    </div>
  );
}
