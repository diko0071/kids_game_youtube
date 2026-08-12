import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SPEECH_AUDIO_PATHS } from "../app/lib/speech";

describe("recorded Russian voice", () => {
  it("ships every mapped phrase as a non-empty local audio file", () => {
    const paths = Object.values(SPEECH_AUDIO_PATHS);
    expect(paths).toHaveLength(29);
    expect(new Set(paths).size).toBe(paths.length);

    for (const path of paths) {
      const absolutePath = join(process.cwd(), "public", path);
      expect(existsSync(absolutePath), path).toBe(true);
      expect(statSync(absolutePath).size, path).toBeGreaterThan(1_000);
    }
  });

  it("covers every letter and every game instruction variant", () => {
    for (const letter of ["А", "Б", "В", "Г", "Д", "К", "М", "О", "П", "С", "Т", "У"]) {
      expect(SPEECH_AUDIO_PATHS[`Найди букву ${letter}`]).toBeTruthy();
    }
    for (const color of ["красный", "жёлтый", "зелёный", "синий", "фиолетовый"]) {
      expect(SPEECH_AUDIO_PATHS[`Найди ${color} цвет`]).toBeTruthy();
    }
    for (const word of ["МАМА", "ПАПА", "РЫБА", "ЛИСА", "РУКА"]) {
      expect(SPEECH_AUDIO_PATHS[`Собери слово ${word}`]).toBeTruthy();
    }
  });
});
