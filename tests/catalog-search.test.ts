import { describe, expect, it } from "vitest";
import { VIDEOS } from "../app/data/catalog";
import { filterCatalog } from "../app/lib/catalog-search";

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
});
