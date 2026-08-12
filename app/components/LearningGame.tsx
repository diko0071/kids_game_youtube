"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, RotateCcw, Volume2 } from "lucide-react";
import { createGameQuestion } from "@/app/lib/game-engine";
import { GameType } from "@/app/lib/settings";
import { speakRussian, stopSpeaking } from "@/app/lib/speech";

interface LearningGameProps {
  type: GameType;
  soundEnabled: boolean;
  onComplete: () => void;
}

const PRAISES = ["Молодец!", "Правильно!", "Супер!", "Отличная работа!"];

export default function LearningGame({
  type,
  soundEnabled,
  onComplete,
}: LearningGameProps) {
  const question = useMemo(() => createGameQuestion(type), [type]);
  const [result, setResult] = useState<"idle" | "wrong" | "correct">("idle");
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const completionTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    titleRef.current?.focus();
    speakRussian(question.spokenPrompt, soundEnabled);

    return () => {
      document.body.style.overflow = previousOverflow;
      if (completionTimerRef.current) {
        window.clearTimeout(completionTimerRef.current);
      }
      stopSpeaking();
    };
  }, [question, soundEnabled]);

  const handleChoice = (choiceId: string) => {
    if (result === "correct") return;
    setSelectedChoiceId(choiceId);

    if (choiceId === question.correctChoiceId) {
      const praise = PRAISES[Math.floor(Math.random() * PRAISES.length)];
      setResult("correct");
      speakRussian(praise, soundEnabled);
      completionTimerRef.current = window.setTimeout(onComplete, 1100);
      return;
    }

    setResult("wrong");
    speakRussian("Попробуй ещё раз", soundEnabled);
    window.setTimeout(() => {
      setSelectedChoiceId(null);
      setResult("idle");
    }, 700);
  };

  return (
    <div className="game-overlay" role="dialog" aria-modal="true" aria-labelledby="game-title" data-testid="game-dialog">
      <div className={`game-card game-${question.type}`}>
        <div className="game-progress" aria-label="Учебная пауза">
          <span className="game-progress-dot active" />
          <span className="game-progress-dot" />
          <span className="game-progress-dot" />
        </div>

        <p className="game-eyebrow">{question.eyebrow}</p>
        <h2 id="game-title" ref={titleRef} tabIndex={-1}>
          {question.title}
        </h2>
        <p className="game-instruction">{question.instruction}</p>

        <button
          type="button"
          className="repeat-button"
          onClick={() => speakRussian(question.spokenPrompt, soundEnabled)}
          aria-label="Повторить задание голосом"
          data-testid="repeat-prompt"
        >
          <Volume2 size={21} aria-hidden="true" />
          Повторить
        </button>

        <div className={`game-visual visual-${question.type}`} aria-hidden="true">
          {question.visual}
        </div>

        <div className={`game-choices choices-${question.type}`}>
          {question.choices.map((choice) => {
            const isCorrectChoice = choice.id === question.correctChoiceId;
            const isSelected = choice.id === selectedChoiceId;
            const stateClass = isSelected
              ? result === "correct"
                ? "choice-correct"
                : result === "wrong"
                  ? "choice-wrong"
                  : ""
              : "";

            return (
              <button
                key={choice.id}
                type="button"
                className={`game-choice ${stateClass}`}
                onClick={() => handleChoice(choice.id)}
                disabled={result === "correct"}
                data-testid={`game-choice-${choice.id}`}
                data-answer={isCorrectChoice ? "correct" : "wrong"}
                aria-label={question.type === "colors" ? choice.label : undefined}
              >
                {choice.color && (
                  <span className="color-swatch" style={{ backgroundColor: choice.color }} aria-hidden="true" />
                )}
                <span>{choice.label}</span>
                {isSelected && result === "correct" && <Check size={24} aria-hidden="true" />}
                {isSelected && result === "wrong" && <RotateCcw size={22} aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        <div className="game-feedback" aria-live="polite">
          {result === "correct" && <strong className="feedback-correct">Молодец! Возвращаемся к мультику…</strong>}
          {result === "wrong" && <strong className="feedback-wrong">Почти! Попробуй ещё раз.</strong>}
          {result === "idle" && <span>Выбери один ответ</span>}
        </div>
      </div>
    </div>
  );
}
