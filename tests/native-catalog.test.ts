import { describe, expect, it } from "vitest";
import { VIDEOS } from "../app/data/catalog";
import nativeCatalog from "../native/shared/approved-catalog.json";

describe("native catalog release boundary", () => {
  it("permits exactly the current catalog and its playback aliases", () => {
    expect(nativeCatalog.catalogIDs).toEqual(VIDEOS.map((video) => video.id));
    expect(nativeCatalog.playbackIDs).toEqual([...new Set(VIDEOS.map((video) => video.playbackId ?? video.id))]);
  });
});
