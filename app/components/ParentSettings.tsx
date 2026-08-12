"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Check,
  CircleDot,
  Hash,
  Palette,
  Play,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  AppSettings,
  GAME_TYPES,
  GameType,
  INTERVAL_OPTIONS,
} from "@/app/lib/settings";

interface ParentSettingsProps {
  settings: AppSettings;
  onClose: () => void;
  onSave: (settings: AppSettings) => void;
  onTestGame: (type: GameType) => void;
}
const GAME_LABELS: Record<GameType, { title: string; description: string }> = {
  letters: { title: "Буквы", description: "Узнать и услышать букву" },
  counting: { title: "Счёт", description: "Посчитать от 2 до 6" },
  colors: { title: "Цвета", description: "Найти названный цвет" },
  words: { title: "Картинка и слово", description: "Соединить картинку со словом" },
  syllables: { title: "Слоги", description: "Собрать простое слово" },
};

const GAME_ICONS: Record<GameType, typeof BookOpen> = {
  letters: BookOpen,
  counting: Hash,
  colors: Palette,
  words: CircleDot,
  syllables: BookOpen,
};

export default function ParentSettings({
  settings,
  onClose,
  onSave,
  onTestGame,
}: ParentSettingsProps) {
  const [draft, setDraft] = useState(settings);
  const [validationMessage, setValidationMessage] = useState("");
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    titleRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const toggleGame = (type: GameType) => {
    setValidationMessage("");
    setDraft((current) => {
      const isEnabled = current.enabledGames.includes(type);
      if (isEnabled && current.enabledGames.length === 1) {
        setValidationMessage("Оставьте включённой хотя бы одну игру.");
        return current;
      }

      return {
        ...current,
        enabledGames: isEnabled
          ? current.enabledGames.filter((game) => game !== type)
          : [...current.enabledGames, type],
      };
    });
  };

  const save = () => {
    onSave(draft);
    onClose();
  };

  return (
    <div className="modal-overlay" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) onClose();
    }}>
      <section className="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title" data-testid="settings-dialog">
        <header className="settings-header">
          <div>
            <p className="settings-kicker">Для взрослых</p>
            <h2 id="settings-title" ref={titleRef} tabIndex={-1}>Настройки просмотра</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Закрыть настройки">
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="settings-body">
          <fieldset className="settings-section">
            <legend>Когда делать паузу на игру?</legend>
            <p>Таймер идёт только пока мультфильм действительно проигрывается.</p>
            <div className="interval-options" data-testid="interval-options">
              {INTERVAL_OPTIONS.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  className={draft.intervalMinutes === minutes ? "selected" : ""}
                  onClick={() => setDraft((current) => ({ ...current, intervalMinutes: minutes }))}
                  aria-pressed={draft.intervalMinutes === minutes}
                  data-testid={`interval-${minutes}`}
                >
                  {minutes}<small>мин</small>
                </button>
              ))}
            </div>
          </fieldset>

          <section className="settings-section" aria-labelledby="sound-setting-title">
            <div className="setting-row">
              <div className="setting-icon" aria-hidden="true">
                {draft.soundEnabled ? <Volume2 /> : <VolumeX />}
              </div>
              <div className="setting-copy">
                <h3 id="sound-setting-title">Голос заданий</h3>
                <p>Произносить буквы, задания и подсказки</p>
              </div>
              <button
                type="button"
                className={`switch ${draft.soundEnabled ? "on" : ""}`}
                role="switch"
                aria-checked={draft.soundEnabled}
                aria-label="Голос заданий"
                onClick={() => setDraft((current) => ({ ...current, soundEnabled: !current.soundEnabled }))}
                data-testid="sound-toggle"
              >
                <span />
              </button>
            </div>
          </section>

          <fieldset className="settings-section games-settings">
            <legend>Какие игры показывать?</legend>
            <p>Выберите набор или нажмите «Проверить», чтобы запустить игру сразу.</p>
            <div className="game-setting-list">
              {GAME_TYPES.map((type) => {
                const Icon = GAME_ICONS[type];
                const enabled = draft.enabledGames.includes(type);
                return (
                  <div className="game-setting-row" key={type}>
                    <button
                      type="button"
                      className={`game-checkbox ${enabled ? "checked" : ""}`}
                      onClick={() => toggleGame(type)}
                      aria-pressed={enabled}
                      aria-label={`${enabled ? "Выключить" : "Включить"} игру «${GAME_LABELS[type].title}»`}
                      data-testid={`game-toggle-${type}`}
                    >
                      {enabled && <Check size={18} aria-hidden="true" />}
                    </button>
                    <Icon className="game-setting-icon" aria-hidden="true" />
                    <div className="game-setting-copy">
                      <strong>{GAME_LABELS[type].title}</strong>
                      <span>{GAME_LABELS[type].description}</span>
                    </div>
                    <button
                      type="button"
                      className="test-game-button"
                      onClick={() => onTestGame(type)}
                      data-testid={`test-game-${type}`}
                    >
                      <Play size={16} fill="currentColor" aria-hidden="true" />
                      Проверить
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="settings-validation" role="alert">{validationMessage}</p>
          </fieldset>
        </div>

        <footer className="settings-footer">
          <button type="button" className="button button-quiet" onClick={onClose}>Отмена</button>
          <button type="button" className="button button-primary" onClick={save} data-testid="save-settings">
            <Check size={20} aria-hidden="true" />
            Сохранить
          </button>
        </footer>
      </section>
    </div>
  );
}
