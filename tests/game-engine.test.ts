import { describe, expect, it } from "vitest";
import { chooseNextGame, createGameQuestion } from "../app/lib/game-engine";
import { GAME_TYPES } from "../app/lib/settings";

const sequenceRandom = (...values: number[]) => {
  let index = 0;
  return () => values[index++ % values.length];
};

describe("learning game engine", () => {
  it.each(GAME_TYPES)("builds a playable %s question", (type) => {
    const question = createGameQuestion(
      type,
      sequenceRandom(0.12, 0.84, 0.35, 0.61, 0.24, 0.73, 0.48),
    );
    const choiceIds = question.choices.map((choice) => choice.id);

    expect(question.type).toBe(type);
    expect(question.spokenPrompt.length).toBeGreaterThan(0);
    expect(question.visual.length).toBeGreaterThan(0);
    expect(choiceIds).toContain(question.correctChoiceId);
    expect(new Set(choiceIds).size).toBe(choiceIds.length);
    expect(choiceIds.length).toBeGreaterThanOrEqual(3);
  });

  it("does not repeat a game when another enabled game is available", () => {
    const next = chooseNextGame(["letters", "colors"], "letters", () => 0);
    expect(next).toBe("colors");
  });

  it("uses the only enabled game", () => {
    expect(chooseNextGame(["counting"], "counting", () => 0.7)).toBe("counting");
  });

  it("fails safe to letters when a corrupt setting has no games", () => {
    expect(chooseNextGame([], null, () => 0.2)).toBe("letters");
  });
});
