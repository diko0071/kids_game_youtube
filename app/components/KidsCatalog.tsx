"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Heart, LoaderCircle, Music2, Play, Rocket, Search, SlidersHorizontal, Sparkles, Truck, Tv, X } from "lucide-react";
import { CartoonVideo, getPlaybackId, getThumbnailUrl, TOPICS, TopicId, VIDEOS } from "../data/catalog";
import { filterCatalog } from "../lib/catalog-search";
import { MenuLayout } from "../lib/settings";
import { buildForYou } from "../lib/recommendations";
import { YouTubeSearchResult } from "../lib/youtube-search";
import { notifyNativeSearchResults } from "../lib/native-search-bridge";

const ICONS = { stories: Tv, learning: Sparkles, vehicles: Truck, songs: Music2, adventures: Rocket };

export default function KidsCatalog({ currentVideo, recommendations, layout, initialTopic, onSelect, onResume, ended = false, home = false, compact = false, onSettings }: {
  currentVideo: CartoonVideo;
  recommendations: CartoonVideo[];
  layout: MenuLayout;
  initialTopic?: TopicId;
  onSelect: (video: CartoonVideo) => void;
  onResume?: () => void;
  onSettings?: () => void;
  ended?: boolean;
  home?: boolean;
  compact?: boolean;
}) {
  const [topic, setTopic] = useState<TopicId | "for-you">(initialTopic ?? "for-you");
  const [query, setQuery] = useState("");
  const [youtubeResults, setYouTubeResults] = useState<YouTubeSearchResult[]>([]);
  const [youtubeStatus, setYouTubeStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [youtubeError, setYouTubeError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const rail = useRef<HTMLDivElement>(null);
  const filterDialogId = useId();
  const sourceVideos = topic === "for-you" ? buildForYou(VIDEOS, recommendations, currentVideo.id) : VIDEOS.filter(video => video.topicId === topic);
  const videos = filterCatalog(sourceVideos, query);
  const recommendedIDs = new Set(recommendations.slice(0, 2).map(video => video.id));
  const title = topic === "for-you" ? "Все видео" : TOPICS.find(item => item.id === topic)?.shortTitle;
  const normalizedQuery = query.replace(/\s+/g, " ").trim();
  const searching = normalizedQuery.length > 0;
  const searchTopic = topic === "for-you" ? currentVideo.topicId : topic;

  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
  }, [initialTopic]);

  useEffect(() => {
    if (!showFilters) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowFilters(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showFilters]);

  useEffect(() => {
    const reset = () => rail.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
    reset();
    const mediaQuery = window.matchMedia("(orientation: portrait)");
    mediaQuery.addEventListener("change", reset);
    return () => mediaQuery.removeEventListener("change", reset);
  }, [topic, layout]);

  // Session 01a0a68f-0546-74c1-bbfb-1c38a4ee07b4: debounce public YouTube searches so the family quota is spent on deliberate queries, while local matches stay instant.
  useEffect(() => {
    if (normalizedQuery.length < 2) {
      setYouTubeResults([]);
      setYouTubeStatus("idle");
      setYouTubeError("");
      return;
    }

    const controller = new AbortController();
    setYouTubeResults([]);
    setYouTubeStatus("loading");
    setYouTubeError("");
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/youtube-search?q=${encodeURIComponent(normalizedQuery)}`, { signal: controller.signal });
        const payload = await response.json() as { items?: YouTubeSearchResult[]; error?: string };
        if (!response.ok) throw new Error(payload.error || "YouTube сейчас не ответил.");
        const items = Array.isArray(payload.items) ? payload.items : [];
        setYouTubeResults(items);
        setYouTubeStatus("ready");
        // The native allowlist is closed over the catalog, so a search result stays unplayable in the app until this page vouches for it. Only IDs this route just returned are handed over.
        notifyNativeSearchResults(items.map((item) => item.id));
      } catch (error) {
        if (controller.signal.aborted) return;
        setYouTubeStatus("error");
        setYouTubeError(error instanceof Error ? error.message : "YouTube сейчас не ответил.");
      }
    }, 700);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [normalizedQuery]);

  return <section className={`${compact ? "kids-catalog-compact" : "pause-catalog"} kids-catalog layout-${layout}`} data-testid={compact ? "browse-catalog" : "pause-catalog"} data-layout={layout} aria-label="Выбор мультфильма">
    {!compact && <header className="kids-menu-header">
      <div className="kids-menu-title">
        {home ? <><span className="kids-welcome-mark" aria-hidden="true"><Sparkles /></span><h2>Что посмотрим?</h2></> : <><span>{ended ? "Посмотрим ещё?" : "Сейчас на паузе"}</span><h2>{currentVideo.title}</h2></>}
      </div>
      {home ? <button className="kids-parent-button" type="button" onClick={onSettings} aria-label="Для взрослых">Для взрослых</button> : <button className="kids-resume" type="button" onClick={onResume}><Play fill="currentColor" size={20} aria-hidden="true" />{ended ? "Ещё раз" : "Продолжить"}</button>}
    </header>}

    <div className="kids-discovery-bar">
      <label className="kids-search">
        <Search aria-hidden="true" />
        <span className="sr-only">Найти в нашем списке и на YouTube</span>
        <input type="search" maxLength={100} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по всему YouTube" autoComplete="off" data-testid="catalog-search" />
        {query && <button type="button" onClick={() => setQuery("")} aria-label="Очистить поиск"><X aria-hidden="true" /></button>}
      </label>
      <button type="button" className="kids-filter-button" onClick={() => setShowFilters(true)} aria-haspopup="dialog" aria-expanded={showFilters} aria-controls={filterDialogId} data-testid="open-topic-filter">
        <SlidersHorizontal aria-hidden="true" />
        <span><small>Тип</small><strong>{title}</strong></span>
        <ChevronDown aria-hidden="true" />
      </button>
    </div>

    {!searching && <>
      <div className="kids-catalog-caption"><h3>{title}</h3><div className="kids-rail-buttons"><button type="button" aria-label="Предыдущие мультики" onClick={() => rail.current?.scrollBy({ left: -rail.current.clientWidth * .85, behavior: "smooth" })}><ChevronLeft /></button><button type="button" aria-label="Следующие мультики" onClick={() => rail.current?.scrollBy({ left: rail.current.clientWidth * .85, behavior: "smooth" })}><ChevronRight /></button></div></div>
      <div className="kids-card-list" ref={rail} tabIndex={0} role="region" aria-label="Каталог мультфильмов">
        {videos.map((video, index) => <button className="kids-video-card" type="button" key={video.id} onClick={() => !home && video.id === currentVideo.id && onResume ? onResume() : onSelect(video)} data-testid={`kids-video-${video.id}`} data-recommended={topic === "for-you" && recommendedIDs.has(video.id) ? "true" : undefined}>
          <span className="kids-thumbnail"><img src={getThumbnailUrl(getPlaybackId(video))} alt="" loading={index < 4 ? "eager" : "lazy"} /><span className="kids-thumbnail-play" aria-hidden="true"><Play fill="currentColor" /></span>{video.durationLabel && <span className="kids-duration">{video.durationLabel}</span>}{!home && video.id === currentVideo.id && <span className="kids-current">Смотрим</span>}</span>
          <span className="kids-card-copy"><strong>{video.title}</strong><span>{topic === "for-you" && recommendedIDs.has(video.id) ? "Рекомендует YouTube" : video.channel}</span></span>
        </button>)}
      </div>
    </>}

    {searching && <div className="kids-search-results" ref={rail} tabIndex={0} role="region" aria-label={`Результаты поиска ${normalizedQuery}`}>
      <section className="kids-search-section" aria-labelledby={`${filterDialogId}-catalog-results`}>
        <header className="kids-search-heading"><div><span>Сначала проверили</span><h3 id={`${filterDialogId}-catalog-results`}>Наш список</h3></div><b>{videos.length}</b></header>
        {videos.length > 0 ? <div className="kids-search-grid">
          {videos.map((video, index) => <button className="kids-video-card" type="button" key={video.id} onClick={() => !home && video.id === currentVideo.id && onResume ? onResume() : onSelect(video)} data-testid={`kids-video-${video.id}`}>
            <span className="kids-thumbnail"><img src={getThumbnailUrl(getPlaybackId(video))} alt="" loading={index < 4 ? "eager" : "lazy"} /><span className="kids-thumbnail-play" aria-hidden="true"><Play fill="currentColor" /></span>{video.durationLabel && <span className="kids-duration">{video.durationLabel}</span>}</span>
            <span className="kids-card-copy"><strong>{video.title}</strong><span>{video.channel}</span></span>
          </button>)}
        </div> : <p className="kids-search-note">В одобренном списке совпадений нет - смотрим дальше на YouTube.</p>}
      </section>

      <section className="kids-search-section kids-youtube-section" aria-labelledby={`${filterDialogId}-youtube-results`}>
        <header className="kids-search-heading"><div><span>Дальше - по релевантности YouTube</span><h3 id={`${filterDialogId}-youtube-results`}><Play fill="currentColor" aria-hidden="true" /> YouTube</h3></div>{youtubeStatus === "ready" && <b>{youtubeResults.length}</b>}</header>
        {normalizedQuery.length < 2 && <p className="kids-search-note">Напиши ещё хотя бы одну букву, чтобы искать по всему YouTube.</p>}
        {youtubeStatus === "loading" && <div className="kids-youtube-status" role="status"><LoaderCircle className="spin" aria-hidden="true" /><strong>Ищем на YouTube...</strong></div>}
        {youtubeStatus === "error" && <div className="kids-youtube-status kids-youtube-error" role="alert"><strong>{youtubeError}</strong><span>Совпадения из нашего списка выше по-прежнему доступны.</span></div>}
        {youtubeStatus === "ready" && youtubeResults.length === 0 && <p className="kids-search-note">YouTube не нашёл подходящих видео. Попробуй другие слова.</p>}
        {youtubeStatus === "ready" && youtubeResults.length > 0 && <div className="kids-search-grid">
          {youtubeResults.map((video, index) => <button className="kids-video-card kids-youtube-card" type="button" key={video.id} onClick={() => onSelect({ id: video.id, title: video.title, channel: video.channel, language: "unknown", topicId: searchTopic, source: "youtube-search" })} data-testid={`youtube-video-${video.id}`}>
            <span className="kids-thumbnail"><img src={video.thumbnailUrl} alt="" loading={index < 4 ? "eager" : "lazy"} /><span className="kids-youtube-badge"><Play fill="currentColor" aria-hidden="true" /> YouTube</span><span className="kids-thumbnail-play" aria-hidden="true"><Play fill="currentColor" /></span></span>
            <span className="kids-card-copy"><strong>{video.title}</strong><span>{video.channel}</span></span>
          </button>)}
        </div>}
        <p className="kids-youtube-legal">Результаты даёт YouTube. <a href="https://www.youtube.com/t/terms" target="_blank" rel="noreferrer">Условия YouTube</a> · <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Конфиденциальность Google</a></p>
      </section>
    </div>}

    {showFilters && <div className="kids-filter-overlay" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) setShowFilters(false);
    }}>
      <section className="kids-filter-sheet" id={filterDialogId} role="dialog" aria-modal="true" aria-labelledby={`${filterDialogId}-title`} data-testid="topic-filter-dialog">
        <header><div><span>Фильтр каталога</span><h3 id={`${filterDialogId}-title`}>Что будем смотреть?</h3></div><button type="button" onClick={() => setShowFilters(false)} aria-label="Закрыть выбор типа"><X aria-hidden="true" /></button></header>
        <div className="kids-filter-options">
          <button type="button" className="category-for-you" aria-pressed={topic === "for-you"} onClick={() => { setTopic("for-you"); setShowFilters(false); }} data-testid="kids-topic-all"><Heart fill="currentColor" aria-hidden="true" /><span><strong>Все видео</strong><small>Любимые и новые</small></span><b>{VIDEOS.length}</b></button>
          {TOPICS.map(item => {
            const Icon = ICONS[item.id];
            const count = VIDEOS.filter(video => video.topicId === item.id).length;
            return <button type="button" className={`category-${item.id}`} key={item.id} aria-pressed={topic === item.id} onClick={() => { setTopic(item.id); setShowFilters(false); }} data-testid={`kids-topic-${item.id}`}><Icon aria-hidden="true" /><span><strong>{item.id === "stories" ? "Мультики" : item.shortTitle}</strong><small>{item.description}</small></span><b>{count}</b></button>;
          })}
        </div>
      </section>
    </div>}
  </section>;
}
