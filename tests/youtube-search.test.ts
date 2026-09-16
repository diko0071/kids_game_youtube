import { describe, expect, it } from "vitest";
import { buildYouTubeApiUrl, normalizeYouTubeQuery, parseYouTubeSearchResponse } from "../app/lib/youtube-search";

describe("YouTube search", () => {
  it("builds a strict, embeddable, relevance-ordered video search", () => {
    const url = buildYouTubeApiUrl("  машинки   для детей ", "test-key");
    expect(url.origin + url.pathname).toBe("https://www.googleapis.com/youtube/v3/search");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      part: "snippet",
      type: "video",
      q: "машинки для детей",
      order: "relevance",
      maxResults: "12",
      safeSearch: "strict",
      videoEmbeddable: "true",
      videoSyndicated: "true",
      key: "test-key",
    });
  });

  it("normalizes and caps a query", () => {
    expect(normalizeYouTubeQuery("  hello   world ")).toBe("hello world");
    expect(normalizeYouTubeQuery("a".repeat(120))).toHaveLength(100);
  });

  it("keeps API order, decodes titles and rejects malformed or duplicate items", () => {
    expect(parseYouTubeSearchResponse({ items: [
      { id: { videoId: "abcdefghijk" }, snippet: { title: "Cars &amp; Trucks", channelTitle: "Kids &#39;R&#39; Us" } },
      { id: { videoId: "12345678901" }, snippet: { title: "Second", channelTitle: "Channel" } },
      { id: { videoId: "abcdefghijk" }, snippet: { title: "Duplicate", channelTitle: "Channel" } },
      { id: { videoId: "bad" }, snippet: { title: "Bad", channelTitle: "Channel" } },
    ] })).toEqual([
      { id: "abcdefghijk", title: "Cars & Trucks", channel: "Kids 'R' Us", thumbnailUrl: "https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg" },
      { id: "12345678901", title: "Second", channel: "Channel", thumbnailUrl: "https://i.ytimg.com/vi/12345678901/hqdefault.jpg" },
    ]);
  });
});
