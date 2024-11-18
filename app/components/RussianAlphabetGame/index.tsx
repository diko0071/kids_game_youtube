"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { useGameLogic } from "@/app/hooks/useGameLogic";
import { useSpeechSynthesis } from "@/app/hooks/useSpeechSynthesis";
import {
    letterColors,
    RussianLetter,
    russianLetters,
    russianWords
} from "@/app/components/RussianAlphabetGame/constants";

interface RussianAlphabetGameProps {
    onComplete: () => void;
}

export default function RussianAlphabetGame({ onComplete }: RussianAlphabetGameProps) {
    const [currentLetter, setCurrentLetter] = useState('')
    const [options, setOptions] = useState<string[]>([])

    const { speakText } = useSpeechSynthesis()

    const generateNewQuestion = useCallback(() => {
        const letter = russianLetters[Math.floor(Math.random() * russianLetters.length)]
        setCurrentLetter(letter)

        let newOptions = [letter]
        while (newOptions.length < 3) {
            const option = russianLetters[Math.floor(Math.random() * russianLetters.length)]
            if (!newOptions.includes(option)) {
                newOptions.push(option)
            }
        }
        setOptions(newOptions.sort(() => Math.random() - 0.5))
    }, [])

    const checkAnswer = useCallback((answer: string) => {
        return answer === currentLetter
    }, [currentLetter])

    const speakRussianAndEnglishWord = useCallback((letter: string) => {
        const words = russianWords[letter as keyof typeof russianWords]
        const randomWord = words[Math.floor(Math.random() * words.length)]
        speakText(`${randomWord.russian}, ${randomWord.english}`)
    }, [speakText])

    const { isCorrect, message, handleAnswer } = useGameLogic(
        generateNewQuestion,
        checkAnswer,
        onComplete,
        () => {} // No specific failure action
    )

    const handleLetterClick = (letter: string) => {
        speakRussianAndEnglishWord(letter)
        handleAnswer(letter)
    }

    useEffect(() => {
        generateNewQuestion()
    }, [generateNewQuestion])



    return (
        <div className="flex flex-col items-center justify-start bg-gradient-to-r from-blue-300 to-green-300 p-4 rounded-lg w-[550px]">
            <div className="flex justify-center mb-12 mt-12">
                <RussianLetter
                    letter={currentLetter}
                    color={letterColors[russianLetters.indexOf(currentLetter)]}
                />
            </div>
            <div className="flex gap-8 mb-8">
                {options.map((option) => (
                    <Button
                        key={option}
                        onClick={() => handleLetterClick(option)}
                        className="text-3xl font-bold w-16 h-16 rounded-full bg-yellow-400 hover:bg-yellow-500 text-purple-800"
                    >
                        {option}
                    </Button>
                ))}
            </div>
            {message && (
                <div className={`text-2xl font-bold mb-4 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                    {message}
                </div>
            )}
        </div>
    )
}
