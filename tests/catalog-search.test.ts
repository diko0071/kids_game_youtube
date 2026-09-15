import { describe, expect, it } from "vitest";
import { VIDEOS } from "../app/data/catalog";
import { buildYouTubeSearchUrl, filterCatalog } from "../app/lib/catalog-search";

describe("catalog search", () => {
  it("searches titles, channels, topic copy and Russian aliases", () => {
    expect(filterCatalog(VIDEOS, "машинки").every((video) => video.topicId === "vehicles")).toBe(true);
    expect(filterCatalog(VIDEOS, "экскаватор").map((video) => video.id)).toEqual([
      "a-dv3HUjU74",
      "E2mQhr5V2xE",
      "AwQjZA-zKU0",
    ]);
    expect(filterCatalog(VIDEOS, "Thomas Friends").map((video) => video.id)).toEqual(["H-6AX5GbAYo"]);
  });

  it("returns the original list for an empty query and no results for unknown text", () => {
    expect(filterCatalog(VIDEOS, "   ")).toEqual(VIDEOS);
    expect(filterCatalog(VIDEOS, "нет-такого-мультика")).toEqual([]);
  });

  it("builds an official YouTube search URL without accepting a blank query", () => {
    expect(buildYouTubeSearchUrl("  грузовики   для детей ")).toBe(
      "https://www.youtube.com/results?search_query=%D0%B3%D1%80%D1%83%D0%B7%D0%BE%D0%B2%D0%B8%D0%BA%D0%B8+%D0%B4%D0%BB%D1%8F+%D0%B4%D0%B5%D1%82%D0%B5%D0%B9",
    );
    expect(buildYouTubeSearchUrl("  ")).toBeNull();
  });
});
