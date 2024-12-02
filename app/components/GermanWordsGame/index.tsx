"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { useGameLogic } from "@/app/hooks/useGameLogic"
import { useSpeechSynthesis } from "@/app/hooks/useSpeechSynthesis"
import { germanWords } from './constants'

interface GermanWordsGameProps {
    onComplete: () => void;
}

export default function GermanWordsGame({ onComplete }: GermanWordsGameProps): JSX.Element {
    const [currentWord, setCurrentWord] = useState<typeof germanWords[0] | null>(null)
    const [options, setOptions] = useState<typeof germanWords[0][]>([])
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false)

    const { speakText } = useSpeechSynthesis()

    // Function to speak the word in German and English
    const speakWord = useCallback(async (word: typeof germanWords[0]): Promise<void> => {
        if (!word || isSpeaking) return
        
        setIsSpeaking(true)
        try {
            await speakText(word.german, 'de-DE')
            setTimeout(async () => {
                await speakText(word.english, 'en-US')
                setIsSpeaking(false)
            }, 1000)
        } catch (error) {
            console.error('Error speaking word:', error)
            setIsSpeaking(false)
        }
    }, [speakText, isSpeaking])

    // Generate new question
    const generateNewQuestion = useCallback((): void => {
        const randomIndex: number = Math.floor(Math.random() * germanWords.length)
        const selectedWord = germanWords[randomIndex]
        
        // Get 4 other random words for options
        const otherWords = germanWords
            .filter(word => word.german !== selectedWord.german)
            .sort(() => Math.random() - 0.5)
            .slice(0, 4)

        // Combine selected word with other words and shuffle
        const allOptions = [selectedWord, ...otherWords].sort(() => Math.random() - 0.5)

        setCurrentWord(selectedWord)
        setOptions(allOptions)
        
        // Speak the current word
        speakWord(selectedWord)
    }, [speakWord])

    // Check if the answer is correct
    const checkAnswer = useCallback((answer: typeof germanWords[0]): boolean => {
        return currentWord?.german === answer.german
    }, [currentWord])

    // Handle word click
    const handleWordClick = useCallback((word: typeof germanWords[0]): void => {
        if (isSpeaking) return
        speakWord(word)
        handleAnswer(word)
    }, [isSpeaking, speakWord, handleAnswer])

    const { isCorrect, message, handleAnswer } = useGameLogic(
        generateNewQuestion,
        checkAnswer,
        onComplete,
        () => {} // No specific failure action
    )

    // Initialize game
    useEffect(() => {
        generateNewQuestion()
    }, [generateNewQuestion])

    return (
        <div className="flex flex-col items-center justify-start bg-gradient-to-r from-yellow-300 to-red-300 p-4 rounded-lg w-full max-w-[550px]">
            {currentWord && (
                <div className="text-4xl font-bold mb-8 mt-8 text-purple-800">
                    {currentWord.german}
                </div>
            )}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {options.map((option) => (
                    <Button
                        key={option.german}
                        onClick={() => handleWordClick(option)}
                        disabled={isSpeaking}
                        className="text-xl font-bold p-4 h-auto min-h-[60px] bg-white hover:bg-gray-100 text-purple-800 disabled:opacity-50"
                    >
                        {option.german}
                    </Button>
                ))}
            </div>
            {message && (
                <div className={`text-xl font-bold mb-4 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                    {message}
                </div>
            )}
        </div>
    )
} 