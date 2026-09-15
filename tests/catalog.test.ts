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
  it("has a closed taxonomy of five populated topics and only English editions", () => {
    const expectedCounts = {
      stories: 4,
      learning: 3,
      vehicles: 10,
      songs: 10,
      adventures: 4,
    };

    expect(TOPICS).toHaveLength(5);
    expect(VIDEOS).toHaveLength(31);
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

  it("removes Russian videos and their old playback aliases", () => {
    expect(VIDEOS.every(video => video.language === "en")).toBe(true);
    for (const id of ["OBjkNW11ujM", "oX_smlVKYUI", "ZcZVtt-baas", "650H2AQHuuY"]) {
      expect(getVideo(id)).toBeUndefined();
      expect(VIDEOS.some(video => getPlaybackId(video) === id)).toBe(false);
    }
  });

  it("rejects malformed direct-link IDs", () => {
    expect(isValidYouTubeId("short")) .toBe(false);
    expect(isValidYouTubeId("<script>")) .toBe(false);
    expect(isValidYouTubeId(null)).toBe(false);
  });
});
