"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { CartoonVideo, getPlaybackId, getThumbnailUrl, TOPICS, TopicId, VIDEOS } from "@/app/data/catalog";

export default function PauseCatalog({ currentVideo, ended, onResume, onSelect }: {
  currentVideo: CartoonVideo;
  ended: boolean;
  onResume: () => void;
  onSelect: (video: CartoonVideo) => void;
}) {
  const [topic, setTopic] = useState<TopicId | "all">(currentVideo.topicId);
  const rail = useRef<HTMLDivElement>(null);
  const topics = useRef<HTMLDivElement>(null);
  const videos = topic === "all" ? VIDEOS : VIDEOS.filter((video) => video.topicId === topic);

  // Session 01a09d4d-67ed-7d10-aa87-a5bd1f1c0c17: filtering only changes the catalog, preserving the paused media session.
  const selectTopic = (next: TopicId | "all") => {
    setTopic(next);
  };

  useEffect(() => {
    const strip = topics.current;
    if (!strip) return;
    const revealTopic = () => {
      const selected = strip.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
      if (selected) strip.scrollTo({ left: selected.offsetLeft - strip.offsetLeft - 12, behavior: "instant" });
    };
    const observer = new ResizeObserver(revealTopic);
    observer.observe(strip);
    revealTopic();
    return () => observer.disconnect();
  }, [topic]);

  useEffect(() => {
    // Session 01a09d4d-67ed-7d10-aa87-a5bd1f1c0c17: a scroll offset from the other axis can clip thumbnails when the phone rotates.
    const orientation = window.matchMedia("(orientation: portrait)");
    const resetRail = () => rail.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
    orientation.addEventListener("change", resetRail);
    return () => orientation.removeEventListener("change", resetRail);
  }, []);

  return (
    <section className="pause-catalog" data-testid="pause-catalog" aria-label="Мультики на паузе">
      <header className="pause-catalog-header">
        <div>
          <p>{ended ? "Мультик закончился" : "Сейчас на паузе"}</p>
          <h2>{currentVideo.title}</h2>
        </div>
        <button className="button pause-resume" type="button" onClick={onResume}>
          <Play size={20} fill="currentColor" aria-hidden="true" />
          {ended ? "Ещё раз" : "Продолжить"}
        </button>
      </header>

      <div className="pause-topics" ref={topics} role="group" aria-label="Типы мультиков">
        <button type="button" aria-pressed={topic === "all"} onClick={() => selectTopic("all")} aria-controls="pause-videos">Все</button>
        {TOPICS.map((item) => (
          <button type="button" key={item.id} aria-pressed={topic === item.id} aria-controls="pause-videos" onClick={() => selectTopic(item.id)} data-testid={`pause-topic-${item.id}`}>
            {item.shortTitle}
          </button>
        ))}
      </div>

      <div className="pause-rail-heading">
        <h3>Что посмотрим?</h3>
        <label className="compact-topic pause-topic-compact">
          <span className="sr-only">Тип мультфильма</span>
          <select aria-label="Тип мультфильма на паузе" value={topic} onChange={(event) => selectTopic(event.target.value as TopicId | "all")}>
            <option value="all">Тип: все мультики</option>
            {TOPICS.map((item) => <option key={item.id} value={item.id}>Тип: {item.shortTitle}</option>)}
          </select>
        </label>
        <span aria-live="polite">{videos.length} видео</span>
        <div className="pause-rail-arrows">
          <button type="button" aria-label="Предыдущие мультики" onClick={() => rail.current?.scrollBy({ left: -rail.current.clientWidth * 0.85, behavior: "smooth" })}><ChevronLeft aria-hidden="true" /></button>
          <button type="button" aria-label="Следующие мультики" onClick={() => rail.current?.scrollBy({ left: rail.current.clientWidth * 0.85, behavior: "smooth" })}><ChevronRight aria-hidden="true" /></button>
        </div>
      </div>

      <div className="pause-video-rail" key={topic} ref={rail} id="pause-videos" tabIndex={0} role="region" aria-label="Каталог мультфильмов">
        {videos.map((video) => (
          <button type="button" className="pause-video-card" key={video.id} onClick={() => video.id === currentVideo.id ? onResume() : onSelect(video)} data-testid={`pause-video-${video.id}`}>
            <span className="pause-video-image">
              <img src={getThumbnailUrl(getPlaybackId(video))} alt="" loading="lazy" />
              {video.id === currentVideo.id && <span className="pause-current-badge">{ended ? "Ещё раз" : "Продолжить"}</span>}
              {video.durationLabel && <span className="pause-duration">{video.durationLabel}</span>}
            </span>
            <strong>{video.title}</strong>
            <span className="pause-video-channel">{video.channel}</span>
          </button>
        ))}
      </div>
      <p className="pause-swipe-hint"><span className="pause-swipe-horizontal">Листай мультики влево и вправо</span><span className="pause-swipe-vertical">Листай вниз и выбирай мультик</span></p>
    </section>
  );
}
