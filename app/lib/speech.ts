export const SPEECH_AUDIO_PATHS: Record<string, string> = {
  "Найди букву А": "/audio/ru/letter-a.mp3",
  "Найди букву Б": "/audio/ru/letter-b.mp3",
  "Найди букву В": "/audio/ru/letter-v.mp3",
  "Найди букву Г": "/audio/ru/letter-g.mp3",
  "Найди букву Д": "/audio/ru/letter-d.mp3",
  "Найди букву К": "/audio/ru/letter-k.mp3",
  "Найди букву М": "/audio/ru/letter-m.mp3",
  "Найди букву О": "/audio/ru/letter-o.mp3",
  "Найди букву П": "/audio/ru/letter-p.mp3",
  "Найди букву С": "/audio/ru/letter-s.mp3",
  "Найди букву Т": "/audio/ru/letter-t.mp3",
  "Найди букву У": "/audio/ru/letter-u.mp3",
  "Сосчитай фигуры": "/audio/ru/count-shapes.mp3",
  "Найди красный цвет": "/audio/ru/color-red.mp3",
  "Найди жёлтый цвет": "/audio/ru/color-yellow.mp3",
  "Найди зелёный цвет": "/audio/ru/color-green.mp3",
  "Найди синий цвет": "/audio/ru/color-blue.mp3",
  "Найди фиолетовый цвет": "/audio/ru/color-purple.mp3",
  "Выбери правильное слово": "/audio/ru/choose-word.mp3",
  "Собери слово МАМА": "/audio/ru/syllables-mama.mp3",
  "Собери слово ПАПА": "/audio/ru/syllables-papa.mp3",
  "Собери слово РЫБА": "/audio/ru/syllables-fish.mp3",
  "Собери слово ЛИСА": "/audio/ru/syllables-fox.mp3",
  "Собери слово РУКА": "/audio/ru/syllables-hand.mp3",
  "Молодец!": "/audio/ru/praise-well-done.mp3",
  "Правильно!": "/audio/ru/praise-correct.mp3",
  "Супер!": "/audio/ru/praise-super.mp3",
  "Отличная работа!": "/audio/ru/praise-great-work.mp3",
  "Попробуй ещё раз": "/audio/ru/try-again.mp3",
};

let activeAudio: HTMLAudioElement | null = null;

function playRecordedVoice(path: string): Promise<void> {
  if (!activeAudio) {
    activeAudio = document.createElement("audio");
    activeAudio.id = "game-voice-audio";
    activeAudio.preload = "auto";
    activeAudio.setAttribute("aria-hidden", "true");
    activeAudio.hidden = true;
    document.body.appendChild(activeAudio);
  }

  activeAudio.pause();
  activeAudio.currentTime = 0;
  activeAudio.src = path;
  activeAudio.dataset.voicePath = path;
  return activeAudio.play();
}

function playSystemVoice(text: string): void {
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ru-RU";
  utterance.rate = 0.86;
  utterance.pitch = 1.05;

  const russianVoice = window.speechSynthesis
    .getVoices()
    .find((voice) => voice.lang.toLowerCase().startsWith("ru"));
  if (russianVoice) utterance.voice = russianVoice;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  activeAudio?.pause();
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function speakRussian(text: string, enabled: boolean): void {
  if (!enabled || typeof window === "undefined") return;

  const recordedPath = SPEECH_AUDIO_PATHS[text];
  if (recordedPath) {
    playRecordedVoice(recordedPath).catch(() => playSystemVoice(text));
    return;
  }

  playSystemVoice(text);
}
