"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { useGameLogic } from "@/app/hooks/useGameLogic"
import { useSpeechSynthesis } from "@/app/hooks/useSpeechSynthesis"
import { familyWords } from './constants'

interface WordMatchingGameProps {
    onComplete: () => void;
}

export default function WordMatchingGame({ onComplete }: WordMatchingGameProps) {
    const [currentWord, setCurrentWord] = useState<typeof familyWords[0] | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const isInitialMount = useRef(true);
    const speakTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { speakText } = useSpeechSynthesis();

    // Функция для произношения слова
    const speakWord = useCallback(async (word: typeof familyWords[0]) => {
        if (!word) return;
        
        try {
            await speakText(word.russian, 'ru-RU');
            
            if (speakTimeoutRef.current) {
                clearTimeout(speakTimeoutRef.current);
            }
            
            speakTimeoutRef.current = setTimeout(async () => {
                try {
                    await speakText(word.english, 'en-US');
                } catch (error) {
                    console.error('Error speaking English word:', error);
                }
            }, 500);
        } catch (error) {
            console.error('Error speaking Russian word:', error);
        }
    }, [speakText]);

    // Проверка ответа
    const checkAnswer = useCallback((answer: string) => {
        return currentWord?.russian === answer;
    }, [currentWord]);

    // Интеграция с игровой логикой
    const { isCorrect, message, handleAnswer } = useGameLogic(
        () => {}, // Пустая функция вместо generateNewQuestion
        checkAnswer,
        onComplete,
        () => {} // Нет специального действия при неправильном ответе
    );

    // Обработка клика по слову
    const handleWordClick = useCallback(async (word: string) => {
        // Сначала обрабатываем ответ
        handleAnswer(word);
        
        // Затем произносим слово, если это необходимо
        try {
            await speakText(word, 'ru-RU');
        } catch (error) {
            console.error('Error speaking word:', error);
        }
    }, [speakText, handleAnswer]);

    // Инициализация игры
    const initializeGame = useCallback(() => {
        const randomIndex = Math.floor(Math.random() * familyWords.length);
        const selectedWord = familyWords[randomIndex];
        
        const otherWords = familyWords
            .filter(word => word.russian !== selectedWord.russian)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        const allOptions = [selectedWord, ...otherWords]
            .map(word => word.russian)
            .sort(() => Math.random() - 0.5);

        setCurrentWord(selectedWord);
        setOptions(allOptions);
        speakWord(selectedWord);
    }, [speakWord]);

    // Инициализация игры только один раз при монтировании
    useEffect(() => {
        if (isInitialMount.current) {
            console.log('[DEBUG] First time initialization');
            isInitialMount.current = false;
            initializeGame();
        }
    }, []); // Remove dependencies that might cause re-runs

    // Очистка таймаутов при размонтировании
    useEffect(() => {
        return () => {
            if (speakTimeoutRef.current) {
                clearTimeout(speakTimeoutRef.current);
            }
        };
    }, []);

    // Повторное произношение слова при клике на него
    const handleRepeatWord = useCallback(() => {
        if (currentWord && !isProcessing) {
            speakWord(currentWord);
        }
    }, [currentWord, isProcessing, speakWord]);

    return (
        <div className="flex flex-col items-center justify-start bg-gradient-to-r from-purple-300 to-pink-300 p-2 sm:p-4 rounded-lg w-full max-w-[550px]">
            <button 
                onClick={handleRepeatWord}
                disabled={isProcessing}
                className="text-2xl sm:text-4xl font-bold mb-4 mt-4 sm:mb-8 sm:mt-8 hover:opacity-80 transition-opacity disabled:opacity-50"
            >
                {currentWord?.russian || ''}
            </button>

            <div className="flex flex-wrap gap-2 sm:gap-8 mb-4 sm:mb-8 justify-center w-full">
                {options.map((option) => (
                    <Button
                        key={option}
                        onClick={() => handleWordClick(option)}
                        disabled={isProcessing}
                        className={`flex-1 min-w-[120px] text-base sm:text-xl font-bold p-2 sm:p-4 h-auto rounded-lg 
                            bg-white hover:bg-gray-100 text-purple-800
                            transition-all duration-200`}
                    >
                        {option}
                    </Button>
                ))}
            </div>

            {message && (
                <div className={`text-lg sm:text-2xl font-bold mb-4 
                    ${isCorrect ? 'text-green-500' : 'text-red-500'}
                    animate-fade-in`}
                >
                    {message}
                </div>
            )}
        </div>
    );
} 