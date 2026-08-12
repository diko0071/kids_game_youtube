export const GAME_TYPES = ["letters", "counting", "colors", "words", "syllables"] as const;

export type GameType = (typeof GAME_TYPES)[number];

export interface AppSettings {
  intervalMinutes: number;
  soundEnabled: boolean;
  enabledGames: GameType[];
}

export const INTERVAL_OPTIONS = [1, 3, 5, 10, 15] as const;

export const DEFAULT_SETTINGS: AppSettings = {
  intervalMinutes: 5,
  soundEnabled: true,
  enabledGames: [...GAME_TYPES],
};

export const SETTINGS_STORAGE_KEY = "mira-cartoon-game-settings-v2";

export function normalizeSettings(value: unknown): AppSettings {
  if (!value || typeof value !== "object") {
    return DEFAULT_SETTINGS;
  }

  const candidate = value as Partial<AppSettings>;
  const intervalMinutes = INTERVAL_OPTIONS.includes(
    candidate.intervalMinutes as (typeof INTERVAL_OPTIONS)[number],
  )
    ? (candidate.intervalMinutes as number)
    : DEFAULT_SETTINGS.intervalMinutes;

  const enabledGames = Array.isArray(candidate.enabledGames)
    ? candidate.enabledGames.filter((game): game is GameType =>
        GAME_TYPES.includes(game as GameType),
      )
    : [...DEFAULT_SETTINGS.enabledGames];

  return {
    intervalMinutes,
    soundEnabled:
      typeof candidate.soundEnabled === "boolean"
        ? candidate.soundEnabled
        : DEFAULT_SETTINGS.soundEnabled,
    enabledGames: enabledGames.length > 0 ? Array.from(new Set(enabledGames)) : [...GAME_TYPES],
  };
}

export function formatCountdown(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
