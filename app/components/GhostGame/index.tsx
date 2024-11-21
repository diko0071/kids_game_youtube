"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { useGameLogic } from "@/app/hooks/useGameLogic";
import { useSpeechSynthesis } from "@/app/hooks/useSpeechSynthesis";
import {Ghost, ghostColors} from "@/app/components/GhostGame/constants";
interface GhostGameProps {
    onComplete: () => void;
}
export default function GhostGame({ onComplete }: GhostGameProps) {
    const [currentColor, setCurrentColor] = useState<{ color: string; name: string; englishName: string }>({ color: '', name: '', englishName: '' })
    const [options, setOptions] = useState<{ color: string; name: string; englishName: string }[]>([])

    const { speakText } = useSpeechSynthesis()

    const generateNewQuestion = useCallback(() => {
        const color = ghostColors[Math.floor(Math.random() * ghostColors.length)]
        setCurrentColor(color)

        let newOptions = [color]
        while (newOptions.length < 3) {
            const option = ghostColors[Math.floor(Math.random() * ghostColors.length)]
            if (!newOptions.find(o => o.color === option.color)) {
                newOptions.push(option)
            }
        }
        setOptions(newOptions.sort(() => Math.random() - 0.5))
    }, [])

    const checkAnswer = useCallback((answer: { color: string; name: string; englishName: string }) => {
        return answer.color === currentColor.color
    }, [currentColor])

    const announceColor = useCallback((color: { name: string; englishName: string }) => {
        speakText(`${color.name}, ${color.englishName}`)
    }, [speakText])

    const { isCorrect, message, handleAnswer, nextQuestion } = useGameLogic(
        generateNewQuestion,
        checkAnswer,
        onComplete,
        () => {}
    )

    const handleColorClick = useCallback((option: { color: string; name: string; englishName: string }) => {
        announceColor(option)
        handleAnswer(option)
    }, [announceColor, handleAnswer])

    useEffect(() => {
        generateNewQuestion()
    }, [generateNewQuestion])

    return (
        <div className="flex flex-col items-center justify-start bg-gradient-to-r from-gray-200 to-gray-400 p-4 rounded-lg w-full max-w-[550px]">
            <div className="flex justify-center mb-8 mt-8 sm:mb-12 sm:mt-12">
                <Ghost color={currentColor.color} scale={0.8} />
            </div>
            <div className="flex gap-4 sm:gap-8 mb-6 sm:mb-8">
                {options.map((option) => (
                    <Button
                        key={option.color}
                        onClick={() => handleColorClick(option)}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
                        style={{ backgroundColor: option.color }}
                    />
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
