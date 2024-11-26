import React, { useEffect } from 'react';
import { useSyllableGame } from '../../hooks/useSyllableGame';
import styles from './SyllableMatchingGame.module.css';

interface Props {
  language?: 'ru-RU' | 'en-US';
  onComplete?: () => void;
}

export const SyllableMatchingGame: React.FC<Props> = ({ language = 'ru-RU', onComplete }) => {
  const {
    targetWord,
    firstSyllables,
    secondSyllables,
    selectedFirst,
    selectedSecond,
    handleSyllableClick,
    isCorrect,
    message,
    generateNewQuestion
  } = useSyllableGame(language, onComplete);

  // Инициализация игры
  useEffect(() => {
    generateNewQuestion();
  }, [generateNewQuestion]);

  return (
    <div className={styles.container}>
      {/* Целевое слово */}
      <div className={styles.targetWord}>
        {targetWord}
      </div>

      {/* Контейнер для слогов */}
      <div className={styles.syllablesContainer}>
        {/* Первый столбец - первые слоги */}
        <div className={styles.syllableColumn}>
          {firstSyllables.map((syllable) => (
            <button
              key={syllable.id}
              className={`${styles.syllable} 
                ${selectedFirst?.id === syllable.id ? styles.selected : ''} 
                ${selectedFirst?.id === syllable.id && selectedSecond && isCorrect ? styles.correct : ''}`}
              onClick={() => handleSyllableClick(syllable)}
              disabled={isCorrect === true}
            >
              {syllable.text}
            </button>
          ))}
        </div>

        {/* Второй столбец - вторые слоги */}
        <div className={styles.syllableColumn}>
          {secondSyllables.map((syllable) => (
            <button
              key={syllable.id}
              className={`${styles.syllable} 
                ${selectedSecond?.id === syllable.id ? styles.selected : ''} 
                ${selectedSecond?.id === syllable.id && isCorrect ? styles.correct : ''}`}
              onClick={() => handleSyllableClick(syllable)}
              disabled={isCorrect === true}
            >
              {syllable.text}
            </button>
          ))}
        </div>
      </div>

      {/* Сообщение об ответе */}
      {message && (
        <div className={`${styles.message} ${isCorrect ? styles.correct : styles.incorrect}`}>
          {message}
        </div>
      )}
    </div>
  );
}; 