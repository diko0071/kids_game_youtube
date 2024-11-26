/**
 * Игра "Найди слоги для слова"
 */

import { useState, useCallback } from 'react';
import { useGameLogic } from './useGameLogic';
import { useSpeechSynthesis } from './useSpeechSynthesis';

interface Syllable {
  id: string;
  text: string;
  type: 'first' | 'second';
}

// Только 3 слова для выбора слогов
const WORDS = ['Мама', 'Папа', 'Баба'];

export const useSyllableGame = (language: 'ru-RU' | 'en-US' = 'ru-RU', onComplete?: () => void) => {
  const [targetWord, setTargetWord] = useState<string>('');
  const [firstSyllables, setFirstSyllables] = useState<Syllable[]>([]);
  const [secondSyllables, setSecondSyllables] = useState<Syllable[]>([]);
  const [selectedFirst, setSelectedFirst] = useState<Syllable | null>(null);
  const [selectedSecond, setSelectedSecond] = useState<Syllable | null>(null);

  const { speakText } = useSpeechSynthesis();

  // Произнесение слогов и слов
  const pronounceSelection = useCallback(async (first: Syllable | null, second: Syllable | null) => {
    if (!first && !second) return;
    
    // Если выбран только первый слог
    if (first && !second) {
      await speakText(first.text, language);
      return;
    }

    // Если выбраны оба слога
    if (first && second) {
      const word = first.text + second.text;
      await speakText(word, language);
    }
  }, [language, speakText]);

  // Создание слогов для слова
  const createSyllables = (word: string): { first: Syllable; second: Syllable } => {
    return {
      first: {
        id: `first-${word}`,
        text: word.slice(0, 2),
        type: 'first'
      },
      second: {
        id: `second-${word}`,
        text: word.slice(2),
        type: 'second'
      }
    };
  };

  // Генерация нового вопроса
  const generateNewQuestion = useCallback(() => {
    // Выбираем случайное целевое слово
    const targetWordIndex = Math.floor(Math.random() * WORDS.length);
    const newTargetWord = WORDS[targetWordIndex];
    setTargetWord(newTargetWord);

    // Создаем слоги для всех трех слов
    const allSyllables = WORDS.map(word => createSyllables(word));
    
    // Разделяем на первые и вторые слоги и перемешиваем
    const firstSyllablesArray = allSyllables.map(s => s.first)
      .sort(() => Math.random() - 0.5);
    const secondSyllablesArray = allSyllables.map(s => s.second)
      .sort(() => Math.random() - 0.5);
    
    setFirstSyllables(firstSyllablesArray);
    setSecondSyllables(secondSyllablesArray);
    setSelectedFirst(null);
    setSelectedSecond(null);
  }, []);

  // Проверка ответа
  const checkAnswer = useCallback((answer: { first: Syllable | null, second: Syllable | null }): boolean => {
    if (!answer.first || !answer.second) return false;
    const selectedWord = answer.first.text + answer.second.text;
    return selectedWord === targetWord;
  }, [targetWord]);

  // Интеграция с общей игровой логикой
  const { isCorrect, message, handleAnswer } = useGameLogic(
    generateNewQuestion,
    checkAnswer,
    onComplete || (() => {}),
    () => {
      // При неправильном ответе сбрасываем выбор
      setTimeout(() => {
        setSelectedFirst(null);
        setSelectedSecond(null);
      }, 1000);
    },
    language
  );

  // Обработка выбора слога
  const handleSyllableClick = useCallback(async (syllable: Syllable) => {
    let newFirst = selectedFirst;
    let newSecond = selectedSecond;

    if (syllable.type === 'first') {
      if (selectedFirst?.id === syllable.id) {
        setSelectedFirst(null);
        newFirst = null;
      } else {
        setSelectedFirst(syllable);
        newFirst = syllable;
      }
    } else {
      if (selectedSecond?.id === syllable.id) {
        setSelectedSecond(null);
        newSecond = null;
      } else {
        setSelectedSecond(syllable);
        newSecond = syllable;
      }
    }

    // Произносим текущий выбор
    await pronounceSelection(
      syllable.type === 'first' ? newFirst : selectedFirst,
      syllable.type === 'second' ? newSecond : selectedSecond
    );

    // Проверяем комбинацию только если выбраны оба слога
    if (newFirst && newSecond) {
      // Даем время на произнесение слова перед проверкой
      setTimeout(() => {
        handleAnswer({ first: newFirst, second: newSecond });
      }, 500);
    }
  }, [selectedFirst, selectedSecond, handleAnswer, pronounceSelection]);

  return {
    targetWord,
    firstSyllables,
    secondSyllables,
    selectedFirst,
    selectedSecond,
    handleSyllableClick,
    isCorrect,
    message,
    generateNewQuestion
  };
}; 