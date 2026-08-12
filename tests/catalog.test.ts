import { describe, expect, it } from "vitest";
import {
  getTopic,
  getPlaybackId,
  getVideo,
  getVideosForTopic,
  isValidYouTubeId,
  TOPICS,
  VIDEOS,
} from "../app/data/catalog";

describe("cartoon catalog", () => {
  it("has a closed taxonomy of five populated topics and 34 videos", () => {
    const expectedCounts = {
      stories: 7,
      learning: 8,
      vehicles: 4,
      songs: 7,
      adventures: 8,
    };

    expect(TOPICS).toHaveLength(5);
    expect(VIDEOS).toHaveLength(34);
    for (const topic of TOPICS) {
      expect(getVideosForTopic(topic.id)).toHaveLength(expectedCounts[topic.id]);
      expect(getTopic(topic.id)).toEqual(topic);
    }
  });

  it("contains unique valid YouTube IDs", () => {
    const ids = VIDEOS.map((video) => video.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(isValidYouTubeId(id)).toBe(true));
  });

  it("keeps the original shared deep link but uses an embeddable Luntik source", () => {
    const legacyVideo = getVideo("OBjkNW11ujM");
    expect(legacyVideo).toBeDefined();
    expect(legacyVideo && getPlaybackId(legacyVideo)).toBe("oX_smlVKYUI");
  });

  it("rejects malformed direct-link IDs", () => {
    expect(isValidYouTubeId("short")) .toBe(false);
    expect(isValidYouTubeId("<script>")) .toBe(false);
    expect(isValidYouTubeId(null)).toBe(false);
  });
});
