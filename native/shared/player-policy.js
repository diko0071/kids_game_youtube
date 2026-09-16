(() => {
  // Session 01a09d4d-67ed-7d10-aa87-a5bd1f1c0c17: injected by the native host into each YouTube frame at document start, not by the cross-origin parent page.
  const hosts = new Set(['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com']);
  if (!hosts.has(location.hostname) || !location.pathname.startsWith('/embed/')) return;

  const recommendations = [
    '.fullscreen-watch-next-entrypoint-wrapper',
    'ytm-fullscreen-related-videos-entry-point-view-model',
    '.ytmFullscreenRelatedVideosEntryPointViewModelHost',
    '.ytFullscreenVideoRecommendationsHost',
    '.ytp-pause-overlay', '.ytp-endscreen-content', '.ytp-suggestion-set',
    '.ytp-ce-element', '.ytp-cards-teaser', '.ytp-next-button',
    'a.media-item-thumbnail-container[href*="feature=endscreen"]',
  ];
  const exits = [
    '.ytp-youtube-button', '.ytp-title-link', '.ytp-title-channel',
    '.ytp-watch-later-button', '.ytp-share-button',
    '.ytp-fullscreen-button', '.ytwPlayerBottomControlsFullscreenButtonWrapper',
    'a.ytmVideoInfoVideoTitle', 'a.ytmVideoInfoChannelTitle',
    '.watch-on-youtube-button',
  ];
  const style = document.createElement('style');
  style.id = 'kids-native-player-policy';
  style.textContent = `${[...recommendations, ...exits].join(',')} { display: none !important; pointer-events: none !important; }`;
  const attach = () => {
    if (!document.documentElement) return false;
    document.documentElement.appendChild(style);
    return true;
  };
  if (!attach()) {
    const observer = new MutationObserver(() => { if (attach()) observer.disconnect(); });
    observer.observe(document, { childList: true });
  }

  // Links can otherwise leave the catalog without reloading the host page. Playback buttons and seeking remain usable.
  for (const eventName of ['click', 'auxclick']) {
    document.addEventListener(eventName, event => {
      if (event.target instanceof Element && event.target.closest('a[href]')) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
  }
  document.addEventListener('contextmenu', event => event.preventDefault(), true);

  const recommendationBridge = window.webkit?.messageHandlers?.kidsRecommendations;
  if (recommendationBridge) {
    let previousBatch = '';
    const collect = () => {
      const sourceVideoId = location.pathname.split('/')[2];
      const cards = document.querySelectorAll('.ytFullscreenVideoRecommendationsRecommendation, .ytp-suggestion-link, .ytp-videowall-still');
      const videos = [];
      const seen = new Set([sourceVideoId]);
      for (const card of cards) {
        const link = card.matches('a[href]') ? card : card.querySelector('a[href*="watch?"]');
        if (!link) continue;
        let url;
        try { url = new URL(link.getAttribute('href'), location.origin); } catch { continue; }
        const id = url.searchParams.get('v');
        const title = (card.querySelector('.media-item-headline, .ytp-suggestion-title, .ytp-videowall-still-info-title')?.textContent || link.getAttribute('title') || '').trim();
        if (!hosts.has(url.hostname) || url.pathname !== '/watch' || !id || !/^[\w-]{11}$/.test(id) || seen.has(id) || !title || title.length > 300) continue;
        const durationLabel = (card.querySelector('.ytBadgeShapeText, .ytp-suggestion-duration, .ytp-videowall-still-info-duration')?.textContent || '').trim();
        seen.add(id);
        videos.push({ id, title, ...(durationLabel && durationLabel.length < 20 ? { durationLabel } : {}) });
        if (videos.length === 2) break;
      }
      if (!videos.length && previousBatch) return;
      const batch = JSON.stringify({ sourceVideoId, videos });
      if (batch !== previousBatch) { previousBatch = batch; recommendationBridge.postMessage(batch); }
    };
    document.addEventListener('DOMContentLoaded', collect, { once: true });
    document.addEventListener('playing', collect, true);
    document.addEventListener('pause', collect, true);
    setInterval(collect, 2000);
  }

  // The debug host exposes DOM evidence only; neither bridge executes commands or exposes credentials.
  const reporter = window.webkit?.messageHandlers?.kidsDiagnostics;
  if (reporter) {
    const report = () => {
      const matches = [...document.querySelectorAll(recommendations.join(','))];
      const visible = matches.filter(node => node.getClientRects().length > 0 && getComputedStyle(node).visibility !== 'hidden');
      const exitMatches = [...document.querySelectorAll(exits.join(','))];
      const visibleExits = exitMatches.filter(node => node.getClientRects().length > 0 && getComputedStyle(node).visibility !== 'hidden');
      const video = document.querySelector('video');
      reporter.postMessage(JSON.stringify({
        policy: Boolean(style.isConnected),
        recommendationsFound: matches.length,
        recommendationsVisible: visible.length,
        exitsFound: exitMatches.length,
        exitsVisible: visibleExits.length,
        paused: video?.paused ?? true,
        seconds: Math.floor(video?.currentTime ?? 0),
      }));
    };
    document.addEventListener('playing', report, true);
    document.addEventListener('pause', report, true);
    document.addEventListener('ended', report, true);
    setInterval(report, 2000);
  }
})();
