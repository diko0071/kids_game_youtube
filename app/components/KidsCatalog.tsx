"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, Music2, Play, Rocket, Sparkles, Truck, Tv } from "lucide-react";
import { CartoonVideo, getPlaybackId, getThumbnailUrl, TOPICS, TopicId, VIDEOS } from "../data/catalog";
import { MenuLayout } from "../lib/settings";
import { buildForYou } from "../lib/recommendations";

const ICONS = { stories: Tv, learning: Sparkles, vehicles: Truck, songs: Music2, adventures: Rocket };

export default function KidsCatalog({ currentVideo, recommendations, layout, onSelect, onResume, ended = false, home = false, compact = false, onSettings }: {
  currentVideo: CartoonVideo;
  recommendations: CartoonVideo[];
  layout: MenuLayout;
  onSelect: (video: CartoonVideo) => void;
  onResume?: () => void;
  onSettings?: () => void;
  ended?: boolean;
  home?: boolean;
  compact?: boolean;
}) {
  const [topic, setTopic] = useState<TopicId | "for-you">("for-you");
  const rail = useRef<HTMLDivElement>(null);
  const videos = topic === "for-you" ? buildForYou(VIDEOS, recommendations, currentVideo.id) : VIDEOS.filter(video => video.topicId === topic);
  const recommendedIDs = new Set(recommendations.slice(0, 2).map(video => video.id));
  const title = topic === "for-you" ? "Для тебя" : TOPICS.find(item => item.id === topic)?.shortTitle;

  useEffect(() => {
    const reset = () => rail.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
    reset();
    const query = window.matchMedia("(orientation: portrait)");
    query.addEventListener("change", reset);
    return () => query.removeEventListener("change", reset);
  }, [topic, layout]);

  return <section className={`${compact ? "kids-catalog-compact" : "pause-catalog"} kids-catalog layout-${layout}`} data-testid={compact ? "browse-catalog" : "pause-catalog"} data-layout={layout} aria-label="Выбор мультфильма">
    {!compact && <header className="kids-menu-header">
      <div className="kids-menu-title">
        {home ? <><span className="kids-welcome-mark" aria-hidden="true"><Sparkles /></span><h2>Что посмотрим?</h2></> : <><span>{ended ? "Посмотрим ещё?" : "Сейчас на паузе"}</span><h2>{currentVideo.title}</h2></>}
      </div>
      {home ? <button className="kids-parent-button" type="button" onClick={onSettings} aria-label="Для взрослых">Для взрослых</button> : <button className="kids-resume" type="button" onClick={onResume}><Play fill="currentColor" size={20} aria-hidden="true" />{ended ? "Ещё раз" : "Продолжить"}</button>}
    </header>}

    <nav className="kids-categories" aria-label="Разделы мультфильмов">
      <button type="button" className="category-for-you" aria-pressed={topic === "for-you"} onClick={() => setTopic("for-you")}><Heart fill="currentColor" aria-hidden="true" /><span>Для тебя</span></button>
      {TOPICS.map(item => {
        const Icon = ICONS[item.id];
        return <button type="button" className={`category-${item.id}`} key={item.id} aria-pressed={topic === item.id} onClick={() => setTopic(item.id)} data-testid={`kids-topic-${item.id}`}><Icon aria-hidden="true" /><span>{item.id === "stories" ? "Мультики" : item.shortTitle}</span></button>;
      })}
    </nav>

    <div className="kids-catalog-caption"><h3>{title}</h3><div className="kids-rail-buttons"><button type="button" aria-label="Предыдущие мультики" onClick={() => rail.current?.scrollBy({ left: -rail.current.clientWidth * .85, behavior: "smooth" })}><ChevronLeft /></button><button type="button" aria-label="Следующие мультики" onClick={() => rail.current?.scrollBy({ left: rail.current.clientWidth * .85, behavior: "smooth" })}><ChevronRight /></button></div></div>
    <div className="kids-card-list" ref={rail} tabIndex={0} role="region" aria-label="Каталог мультфильмов">
      {videos.map((video, index) => <button className="kids-video-card" type="button" key={video.id} onClick={() => !home && video.id === currentVideo.id && onResume ? onResume() : onSelect(video)} data-testid={`kids-video-${video.id}`} data-recommended={topic === "for-you" && recommendedIDs.has(video.id) ? "true" : undefined}>
        <span className="kids-thumbnail"><img src={getThumbnailUrl(getPlaybackId(video))} alt="" loading={index < 4 ? "eager" : "lazy"} /><span className="kids-thumbnail-play" aria-hidden="true"><Play fill="currentColor" /></span>{video.durationLabel && <span className="kids-duration">{video.durationLabel}</span>}{!home && video.id === currentVideo.id && <span className="kids-current">Смотрим</span>}</span>
        <span className="kids-card-copy"><strong>{video.title}</strong><span>{topic === "for-you" && recommendedIDs.has(video.id) ? "Рекомендует YouTube" : video.channel}</span></span>
      </button>)}
    </div>
  </section>;
}
