import { GameType } from "./settings";

export interface GameChoice {
  id: string;
  label: string;
  spokenLabel: string;
  color?: string;
}
export interface GameQuestion {
  type: GameType;
  eyebrow: string;
  title: string;
  instruction: string;
  spokenPrompt: string;
  visual: string;
  choices: GameChoice[];
  correctChoiceId: string;
}

type RandomSource = () => number;

const LETTERS = ["А", "Б", "В", "Г", "Д", "К", "М", "О", "П", "С", "Т", "У"];
const COUNT_OBJECTS = ["●", "★", "♥", "◆"];
const COLORS = [
  { id: "red", label: "Красный", color: "#ef476f" },
  { id: "yellow", label: "Жёлтый", color: "#ffd166" },
  { id: "green", label: "Зелёный", color: "#3ecf8e" },
  { id: "blue", label: "Синий", color: "#3a86ff" },
  { id: "purple", label: "Фиолетовый", color: "#9b5de5" },
];
const WORDS = [
  { id: "cat", label: "КОТ", visual: "🐱" },
  { id: "house", label: "ДОМ", visual: "🏠" },
  { id: "fish", label: "РЫБА", visual: "🐟" },
  { id: "sun", label: "СОЛНЦЕ", visual: "☀" },
  { id: "car", label: "МАШИНА", visual: "🚗" },
];
const SYLLABLE_WORDS = [
  { id: "mama", word: "МАМА", visual: "👩", pair: "МА · МА" },
  { id: "papa", word: "ПАПА", visual: "👨", pair: "ПА · ПА" },
  { id: "fish", word: "РЫБА", visual: "🐟", pair: "РЫ · БА" },
  { id: "fox", word: "ЛИСА", visual: "🦊", pair: "ЛИ · СА" },
  { id: "hand", word: "РУКА", visual: "✋", pair: "РУ · КА" },
];

function sampleOne<T>(items: readonly T[], random: RandomSource): T {
  return items[Math.floor(random() * items.length) % items.length];
}

function shuffle<T>(items: readonly T[], random: RandomSource): T[] {
  return [...items]
    .map((item) => ({ item, order: random() }))
    .sort((a, b) => a.order - b.order)
    .map(({ item }) => item);
}

function choicesAround<T>(
  correct: T,
  all: readonly T[],
  getId: (item: T) => string,
  random: RandomSource,
  count = 3,
): T[] {
  const alternatives = shuffle(
    all.filter((item) => getId(item) !== getId(correct)),
    random,
  ).slice(0, count - 1);
  return shuffle([correct, ...alternatives], random);
}

// Session 019ff4e6-45a8-7993-ba18-825ca748ca24: injectable randomness keeps every game fully testable without shipping fake questions.
export function createGameQuestion(
  type: GameType,
  random: RandomSource = Math.random,
): GameQuestion {
  if (type === "letters") {
    const letter = sampleOne(LETTERS, random);
    const choices = choicesAround(letter, LETTERS, (value) => value, random).map((value) => ({
      id: value,
      label: value,
      spokenLabel: value,
    }));
    return {
      type,
      eyebrow: "Игра с буквами",
      title: "Найди такую же букву",
      instruction: "Послушай букву и нажми на такую же.",
      spokenPrompt: `Найди букву ${letter}`,
      visual: letter,
      choices,
      correctChoiceId: letter,
    };
  }

  if (type === "counting") {
    const count = Math.floor(random() * 5) + 2;
    const object = sampleOne(COUNT_OBJECTS, random);
    const values = shuffle(
      [count, ...[2, 3, 4, 5, 6].filter((value) => value !== count).slice(0, 2)],
      random,
    );
    return {
      type,
      eyebrow: "Игра со счётом",
      title: "Сколько фигур?",
      instruction: "Сосчитай фигуры и выбери число.",
      spokenPrompt: "Сосчитай фигуры",
      visual: Array.from({ length: count }, () => object).join(" "),
      choices: values.map((value) => ({
        id: String(value),
        label: String(value),
        spokenLabel: String(value),
      })),
      correctChoiceId: String(count),
    };
  }

  if (type === "colors") {
    const color = sampleOne(COLORS, random);
    const choices = choicesAround(color, COLORS, (value) => value.id, random).map((value) => ({
      id: value.id,
      label: value.label,
      spokenLabel: value.label,
      color: value.color,
    }));
    return {
      type,
      eyebrow: "Игра с цветами",
      title: `Найди ${color.label.toLowerCase()} цвет`,
      instruction: "Нажми на кружок нужного цвета.",
      spokenPrompt: `Найди ${color.label.toLowerCase()} цвет`,
      visual: "●",
      choices,
      correctChoiceId: color.id,
    };
  }

  if (type === "words") {
    const word = sampleOne(WORDS, random);
    const choices = choicesAround(word, WORDS, (value) => value.id, random, 4).map((value) => ({
      id: value.id,
      label: value.label,
      spokenLabel: value.label,
    }));
    return {
      type,
      eyebrow: "Картинка и слово",
      title: "Как называется картинка?",
      instruction: "Посмотри на картинку и выбери слово.",
      spokenPrompt: "Выбери правильное слово",
      visual: word.visual,
      choices,
      correctChoiceId: word.id,
    };
  }

  const word = sampleOne(SYLLABLE_WORDS, random);
  const choices = choicesAround(word, SYLLABLE_WORDS, (value) => value.id, random).map((value) => ({
    id: value.id,
    label: value.pair,
    spokenLabel: value.word,
  }));
  return {
    type,
    eyebrow: "Собираем слоги",
    title: `Собери слово «${word.word.toLowerCase()}»`,
    instruction: "Выбери два слога, из которых получится слово.",
    spokenPrompt: `Собери слово ${word.word}`,
    visual: word.visual,
    choices,
    correctChoiceId: word.id,
  };
}

export function chooseNextGame(
  enabledGames: readonly GameType[],
  previousGame: GameType | null,
  random: RandomSource = Math.random,
): GameType {
  const pool = enabledGames.length > 1
    ? enabledGames.filter((game) => game !== previousGame)
    : enabledGames;
  return sampleOne(pool.length > 0 ? pool : ["letters"], random);
}
