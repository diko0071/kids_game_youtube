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
    const [currentLetter, setCurrentLetter] = useState<string>('')
    const [options, setOptions] = useState<string[]>([])

    const { speakText } = useSpeechSynthesis()

    const getRandomLetter = (): string => {
        return russianLetters[Math.floor(Math.random() * russianLetters.length)]
    }

    const generateNewQuestion = useCallback(() => {
        const newLetter = getRandomLetter()
        setCurrentLetter(newLetter)
        console.log('New target letter:', newLetter)

        let newOptions = [newLetter]
        while (newOptions.length < 3) {
            const option = getRandomLetter()
            if (!newOptions.includes(option)) {
                newOptions.push(option)
            }
        }
        setOptions(newOptions.sort(() => Math.random() - 0.5))
    }, [])

    // Separate effect for pronunciation
    useEffect(() => {
        if (currentLetter) {
            speakText(currentLetter.toLowerCase(), 'ru-RU')
        }
    }, [currentLetter, speakText])

    // Initialize game
    useEffect(() => {
        generateNewQuestion()
    }, [generateNewQuestion])

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
        console.log('Letter clicked:', letter)
        
        // Speak the letter and then the example word
        speakText(letter.toLowerCase(), 'ru-RU')
            .then(() => {
                setTimeout(() => {
                    const words = russianWords[letter as keyof typeof russianWords]
                    const randomWord = words[Math.floor(Math.random() * words.length)]
                    const textToSpeak = `${randomWord.russian}, ${randomWord.english}`
                    speakText(textToSpeak, 'ru-RU')
                }, 1000)
            })

        handleAnswer(letter)
    }

    return (
        <div className="flex flex-col items-center justify-start bg-gradient-to-r from-blue-300 to-green-300 p-4 rounded-lg w-full max-w-[550px]">
            <div className="flex justify-center mb-8 mt-8 sm:mb-12 sm:mt-12">
                <RussianLetter
                    letter={currentLetter}
                    color={letterColors[russianLetters.indexOf(currentLetter)]}
                    scale={0.8}
                />
            </div>
            <div className="flex gap-4 sm:gap-8 mb-6 sm:mb-8">
                {options.map((option) => (
                    <Button
                        key={option}
                        onClick={() => handleLetterClick(option)}
                        className="text-2xl sm:text-3xl font-bold w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-yellow-400 hover:bg-yellow-500 text-purple-800"
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
