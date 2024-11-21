"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { useGameLogic } from "@/app/hooks/useGameLogic"
import { useSpeechSynthesis } from "@/app/hooks/useSpeechSynthesis"
import { familyWords } from './constants'

interface WordMatchingGameProps {
    onComplete: () => void;
}

export default function WordMatchingGame({ onComplete }: WordMatchingGameProps) {
    const [currentWord, setCurrentWord] = useState<typeof familyWords[0]>({ russian: '', english: '' })
    const [options, setOptions] = useState<string[]>([])

    const { speakText } = useSpeechSynthesis()

    const speakRussianAndEnglishWord = useCallback((word: typeof familyWords[0]) => {
        speakText(`${word.russian}, ${word.english}`)
    }, [speakText])

    const generateNewQuestion = useCallback(() => {
        const word = familyWords[Math.floor(Math.random() * familyWords.length)]
        setCurrentWord(word)

        let newOptions = [word.russian]
        while (newOptions.length < 4) {
            const option = familyWords[Math.floor(Math.random() * familyWords.length)].russian
            if (!newOptions.includes(option)) {
                newOptions.push(option)
            }
        }
        setOptions(newOptions.sort(() => Math.random() - 0.5))
        
        // Speak the current word when a new question is generated
        speakRussianAndEnglishWord(word)
    }, [speakRussianAndEnglishWord])

    const checkAnswer = useCallback((answer: string) => {
        return answer === currentWord.russian
    }, [currentWord])

    const { isCorrect, message, handleAnswer } = useGameLogic(
        generateNewQuestion,
        checkAnswer,
        onComplete,
        () => {} // No specific failure action
    )

    const handleWordClick = (word: string) => {
        const selectedWord = familyWords.find(w => w.russian === word)
        if (selectedWord) {
            speakRussianAndEnglishWord(selectedWord)
        }
        handleAnswer(word)
    }

    useEffect(() => {
        generateNewQuestion()
    }, [generateNewQuestion])

    return (
        <div className="flex flex-col items-center justify-start bg-gradient-to-r from-purple-300 to-pink-300 p-4 rounded-lg w-full max-w-[550px]">
            <div className="text-3xl sm:text-4xl font-bold mb-8 mt-8 sm:mb-12 sm:mt-12">
                {currentWord.russian}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-[400px]">
                {options.map((option) => (
                    <Button
                        key={option}
                        onClick={() => handleWordClick(option)}
                        className="text-base sm:text-xl font-bold p-3 sm:p-6 h-auto rounded-lg bg-white hover:bg-gray-100 text-purple-800"
                    >
                        {option}
                    </Button>
                ))}
            </div>
            {message && (
                <div className={`text-xl sm:text-2xl font-bold mb-4 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                    {message}
                </div>
            )}
        </div>
    )
} 