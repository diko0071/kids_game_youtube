import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  formatCountdown,
  GAME_TYPES,
  normalizeSettings,
} from "../app/lib/settings";

describe("parent settings", () => {
  it("restores safe defaults from invalid storage", () => {
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(normalizeSettings({ intervalMinutes: 99, enabledGames: [] })).toEqual({
      menuLayout: "feed",
      learningEnabled: false,
      intervalMinutes: 5,
      soundEnabled: true,
      enabledGames: GAME_TYPES,
    });
  });

  it("keeps valid settings and removes unknown games", () => {
    expect(normalizeSettings({
      intervalMinutes: 10,
      soundEnabled: false,
      enabledGames: ["colors", "colors", "unknown"],
    })).toEqual({
      menuLayout: "feed",
      learningEnabled: false,
      intervalMinutes: 10,
      soundEnabled: false,
      enabledGames: ["colors"],
    });
  });

  it("formats the visible timer", () => {
    expect(formatCountdown(300)).toBe("5:00");
    expect(formatCountdown(61.9)).toBe("1:01");
    expect(formatCountdown(-3)).toBe("0:00");
  });

  it("keeps learning opt-in when upgrading older saved settings", () => {
    expect(normalizeSettings({ intervalMinutes: 1 }).learningEnabled).toBe(false);
    expect(normalizeSettings({ learningEnabled: "true" }).learningEnabled).toBe(false);
    expect(normalizeSettings({ learningEnabled: true, menuLayout: "grid" })).toMatchObject({ learningEnabled: true, menuLayout: "grid" });
    expect(normalizeSettings({ menuLayout: "unknown" }).menuLayout).toBe("feed");
  });
});
