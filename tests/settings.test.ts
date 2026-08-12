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
});
