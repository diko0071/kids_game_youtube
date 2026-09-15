import { describe, expect, it } from "vitest";
import { VIDEOS } from "../app/data/catalog";
import { buildForYou, parseRecommendations } from "../app/lib/recommendations";

describe("two YouTube recommendations followed by the family catalog", () => {
  it("preserves rank, caps at two and removes catalog duplicates", () => {
    const result = buildForYou(VIDEOS, [VIDEOS[4], VIDEOS[3], VIDEOS[2]]);
    expect(result.slice(0, 3).map(v => v.id)).toEqual([VIDEOS[4].id, VIDEOS[3].id, VIDEOS[0].id]);
    expect(new Set(result.map(v => v.id)).size).toBe(VIDEOS.length);
    expect(result).toHaveLength(VIDEOS.length);
  });
  it("never fills missing recommendations with invented recommendations", () => {
    expect(buildForYou(VIDEOS, [])).toEqual(VIDEOS);
    expect(buildForYou(VIDEOS, [VIDEOS[1]], VIDEOS[1].id)).toEqual(VIDEOS);
  });
  it("validates IDs and titles, drops duplicates, and cannot grant a third slot", () => {
    expect(parseRecommendations({ sourceVideoId: VIDEOS[0].id, videos: [
      { id: VIDEOS[1].id, title: VIDEOS[1].title },
      { id: VIDEOS[1].id, title: VIDEOS[1].title },
      { id: VIDEOS[2].id, title: VIDEOS[2].title },
    ] })?.videos).toHaveLength(1);
    expect(parseRecommendations({ sourceVideoId: "invalid", videos: [] })).toBeNull();
    expect(parseRecommendations({ sourceVideoId: VIDEOS[0].id, videos: [{ id: VIDEOS[1].id, title: "" }] })?.videos).toEqual([]);
  });
});
