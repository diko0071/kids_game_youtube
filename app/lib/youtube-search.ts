export interface YouTubeSearchResult {
  id: string;
  title: string;
  channel: string;
  thumbnailUrl: string;
}

type JsonRecord = Record<string, unknown>;

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

const asRecord = (value: unknown): JsonRecord | null =>
  typeof value === "object" && value !== null ? value as JsonRecord : null;

const decodeHtmlEntities = (value: string): string => value.replace(
  /&(?:amp|lt|gt|quot|apos|#39|#x27);/gi,
  (entity) => {
    const replacements: Record<string, string> = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": "\"",
      "&apos;": "'",
      "&#39;": "'",
      "&#x27;": "'",
    };
    return replacements[entity.toLowerCase()] ?? entity;
  },
);

export function normalizeYouTubeQuery(query: string): string {
  return query.replace(/\s+/g, " ").trim().slice(0, 100);
}

export function buildYouTubeApiUrl(query: string, apiKey: string): URL {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("q", normalizeYouTubeQuery(query));
  url.searchParams.set("order", "relevance");
  url.searchParams.set("maxResults", "12");
  url.searchParams.set("safeSearch", "strict");
  url.searchParams.set("videoEmbeddable", "true");
  url.searchParams.set("videoSyndicated", "true");
  url.searchParams.set("key", apiKey);
  return url;
}

// Session 01a0a68f-0546-74c1-bbfb-1c38a4ee07b4: treat the public API response as untrusted and preserve only ordered, playable card fields.
export function parseYouTubeSearchResponse(payload: unknown): YouTubeSearchResult[] {
  const root = asRecord(payload);
  const items = Array.isArray(root?.items) ? root.items : [];
  const seen = new Set<string>();

  return items.flatMap((item): YouTubeSearchResult[] => {
    const record = asRecord(item);
    const id = asRecord(record?.id)?.videoId;
    const snippet = asRecord(record?.snippet);
    const title = snippet?.title;
    const channel = snippet?.channelTitle;
    if (typeof id !== "string" || !VIDEO_ID.test(id) || seen.has(id)) return [];
    if (typeof title !== "string" || typeof channel !== "string") return [];
    const cleanTitle = decodeHtmlEntities(title).trim();
    const cleanChannel = decodeHtmlEntities(channel).trim();
    if (!cleanTitle || !cleanChannel) return [];
    seen.add(id);
    return [{
      id,
      title: cleanTitle.slice(0, 300),
      channel: cleanChannel.slice(0, 200),
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    }];
  });
}
