/**
 * Игра "Найди слоги для слова"
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useGameLogic } from './useGameLogic';
import { useSpeechSynthesis } from './useSpeechSynthesis';

interface Syllable {
  id: string;
  text: string;
  type: 'first' | 'second';
}

// Только базовые слова для маленьких детей
const WORDS = ['Мама', 'Папа', 'Баба'];

export const useSyllableGame = (language: 'ru-RU' | 'en-US' = 'ru-RU', onComplete?: () => void) => {
  const [displayedWord, setDisplayedWord] = useState<string>('');
  const [firstSyllables, setFirstSyllables] = useState<Syllable[]>([]);
  const [secondSyllables, setSecondSyllables] = useState<Syllable[]>([]);
  const [selectedFirst, setSelectedFirst] = useState<Syllable | null>(null);
  const [selectedSecond, setSelectedSecond] = useState<Syllable | null>(null);
  const isInitialMount = useRef(true);
  const isSpeaking = useRef(false);

  const { speakText } = useSpeechSynthesis();

  // Генерация нового вопроса
  const generateNewQuestion = useCallback(() => {
    const targetWordIndex = Math.floor(Math.random() * WORDS.length);
    const newTargetWord = WORDS[targetWordIndex];
    console.log('[DEBUG] New target word:', newTargetWord);
    
    // Устанавливаем слово для отображения
    setDisplayedWord(newTargetWord);
    
    // Создаем слоги для всех слов
    const allSyllables = WORDS.map(word => createSyllables(word));
    const firstSyllablesArray = allSyllables.map(s => s.first)
      .sort(() => Math.random() - 0.5);
    const secondSyllablesArray = allSyllables.map(s => s.second)
      .sort(() => Math.random() - 0.5);
    
    setFirstSyllables(firstSyllablesArray);
    setSecondSyllables(secondSyllablesArray);
    clearSelection();

    // Произносим новое загаданное слово только если это не первая загрузка
    if (!isInitialMount.current) {
      setTimeout(() => {
        if (!isSpeaking.current) {
          console.log('[DEBUG] Speaking target word:', newTargetWord);
          isSpeaking.current = true;
          speakText(newTargetWord, language).finally(() => {
            isSpeaking.current = false;
          });
        }
      }, 500);
    }
  }, [language, speakText]);

  // Создание слогов для слова
  const createSyllables = useCallback((word: string): { first: Syllable; second: Syllable } => {
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
  }, []);

  // Очистка выбранных слогов
  const clearSelection = useCallback(() => {
    setSelectedFirst(null);
    setSelectedSecond(null);
  }, []);

  // Инициализация игры
  useEffect(() => {
    let mounted = true;

    if (isInitialMount.current) {
      console.log('[DEBUG] First time initialization');
      generateNewQuestion();
      
      // Произносим слово только при первой загрузке
      setTimeout(() => {
        if (mounted && !isSpeaking.current) {
          console.log('[DEBUG] Speaking initial word');
          isSpeaking.current = true;
          speakText(displayedWord, language).finally(() => {
            if (mounted) {
              isSpeaking.current = false;
              isInitialMount.current = false;
            }
          });
        }
      }, 500);
    }

    return () => {
      mounted = false;
    };
  }, [generateNewQuestion, displayedWord, language, speakText]);

  // Произнесение слогов при выборе
  const pronounceSelection = useCallback(async (first: Syllable | null, second: Syllable | null) => {
    if (!first && !second || isSpeaking.current) return;
    
    try {
      isSpeaking.current = true;
      
      // Если выбран только первый слог
      if (first && !second) {
        await speakText(first.text, language);
      }
      // Если выбраны оба слога, произносим их как одно слово
      else if (first && second) {
        await speakText(first.text + second.text, language);
      }
    } finally {
      isSpeaking.current = false;
    }
  }, [language, speakText]);

  // Проверка ответа
  const checkAnswer = useCallback((answer: { first: Syllable | null, second: Syllable | null }): boolean => {
    if (!answer.first || !answer.second) return false;
    const selectedWord = answer.first.text + answer.second.text;
    const isCorrect = selectedWord === displayedWord;
    
    if (!isCorrect) {
      clearSelection();
    }
    
    return isCorrect;
  }, [displayedWord, clearSelection]);

  // Интеграция с общей игровой логикой
  const { isCorrect, message, handleAnswer } = useGameLogic(
    generateNewQuestion,
    checkAnswer,
    onComplete || (() => {}),
    () => {}, // Убираем задержку при неправильном ответе
    language
  );

  // Обработка выбора слога
  const handleSyllableClick = useCallback(async (syllable: Syllable) => {
    if (isSpeaking.current) return;
    
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
      handleAnswer({ first: newFirst, second: newSecond });
    }
  }, [selectedFirst, selectedSecond, handleAnswer, pronounceSelection]);

  return {
    targetWord: displayedWord,
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