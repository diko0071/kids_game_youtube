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
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [canAnswer, setCanAnswer] = useState(true);
    const isInitialMount = useRef(true);
    const speakTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { speakText } = useSpeechSynthesis();

    // Функция для произношения слова
    const speakWord = useCallback(async (word: typeof familyWords[0]) => {
        if (!word || isSpeaking) return;
        
        setIsSpeaking(true);

        try {
            await speakText(word.russian, 'ru-RU');
            
            if (speakTimeoutRef.current) {
                clearTimeout(speakTimeoutRef.current);
            }
            
            speakTimeoutRef.current = setTimeout(async () => {
                await speakText(word.english, 'en-US');
                setIsSpeaking(false);
            }, 500);
            
        } catch (error) {
            console.error('Error speaking word:', error);
            setIsSpeaking(false);
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
    const handleWordClick = useCallback((word: string) => {
        if (isSpeaking) return;
        handleAnswer(word);
    }, [isSpeaking, handleAnswer]);

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
        
        // Сразу произносим слово без задержки
        speakWord(selectedWord);
    }, [speakWord]);

    // Инициализация игры только один раз при монтировании
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            initializeGame();
        }
    }, [initializeGame]);

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
        if (currentWord && !isSpeaking) {
            speakWord(currentWord);
        }
    }, [currentWord, isSpeaking, speakWord]);

    return (
        <div className="flex flex-col items-center justify-start bg-gradient-to-r from-purple-300 to-pink-300 p-4 rounded-lg w-full max-w-[550px]">
            <button 
                onClick={handleRepeatWord}
                disabled={isSpeaking}
                className="text-3xl sm:text-4xl font-bold mb-8 mt-8 sm:mb-12 sm:mt-12 hover:opacity-80 transition-opacity disabled:opacity-50"
            >
                {currentWord?.russian || ''}
            </button>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-[400px]">
                {options.map((option) => (
                    <Button
                        key={option}
                        onClick={() => handleWordClick(option)}
                        disabled={isSpeaking}
                        className={`text-base sm:text-xl font-bold p-3 sm:p-6 h-auto rounded-lg 
                            bg-white hover:bg-gray-100 text-purple-800
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-200`}
                    >
                        {option}
                    </Button>
                ))}
            </div>

            {message && (
                <div className={`text-xl sm:text-2xl font-bold mb-4 
                    ${isCorrect ? 'text-green-500' : 'text-red-500'}
                    animate-fade-in`}
                >
                    {message}
                </div>
            )}
        </div>
    );
} 