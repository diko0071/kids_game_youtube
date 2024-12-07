"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { useGameLogic } from '@/app/hooks/useGameLogic'
import { useSpeechSynthesis } from '@/app/hooks/useSpeechSynthesis'
import {IceCream, Cake, russianNumbers, englishNumbers, cakeColors, iceCreamColors} from "./constants"

interface NumbersGameProps {
    onComplete: () => void;
}

function NumbersGame({ onComplete }: NumbersGameProps): JSX.Element {
    const [dessertCount, setDessertCount] = useState<number>(2)
    const [options, setOptions] = useState<number[]>([])
    const [isIceCream, setIsIceCream] = useState<boolean>(true)
    const [isAnswering, setIsAnswering] = useState<boolean>(false)

    const { speakText } = useSpeechSynthesis()

    const speakRussianAndEnglishNumber = useCallback((number: number, isIceCream: boolean): void => {
        const index = isIceCream ? number - 3 : number + 1
        const russianText = russianNumbers[index]
        const englishText = englishNumbers[index]
        speakText(`${russianText}, ${englishText}`)
    }, [speakText])

    const generateNewQuestion = useCallback((): void => {
        const count = Math.floor(Math.random() * 4) + 3
        setDessertCount(count)
        setIsIceCream(prev => !prev)

        let newOptions = [count]
        while (newOptions.length < 3) {
            const option = Math.floor(Math.random() * 4) + 3
            if (!newOptions.includes(option)) {
                newOptions.push(option)
            }
        }
        setOptions(newOptions.sort(() => Math.random() - 0.5))
    }, [])

    const checkAnswer = useCallback((answer: number): boolean => {
        return answer === dessertCount
    }, [dessertCount])

    const { isCorrect, message, handleAnswer } = useGameLogic(
        generateNewQuestion,
        checkAnswer,
        onComplete,
        () => {}
    )

    useEffect(() => {
        generateNewQuestion()
    }, [generateNewQuestion])

    const handleOptionClick = async (option: number): Promise<void> => {
        if (isAnswering) return
        setIsAnswering(true)
        
        try {
            speakRussianAndEnglishNumber(option, isIceCream)
            await handleAnswer(option)
        } finally {
            setTimeout(() => {
                setIsAnswering(false)
            }, 1000)
        }
    }

    const DessertComponent = isIceCream ? IceCream : Cake
    const dessertColors = isIceCream ? iceCreamColors : cakeColors

    return (
        <div className="flex flex-col items-center justify-start bg-gradient-to-r from-pink-300 to-purple-300 p-2 sm:p-4 rounded-lg w-full max-w-[550px]">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4 mt-4 sm:mb-8 sm:mt-8">
                {Array.from({ length: dessertCount }).map((_, index) => (
                    <div key={index} className="flex justify-center items-center">
                        <DessertComponent
                            colors={[
                                dessertColors[index % dessertColors.length],
                                dessertColors[(index + 1) % dessertColors.length]
                            ]}
                            scale={0.6}
                        />
                    </div>
                ))}
            </div>
            <div className="flex gap-2 sm:gap-8 mb-4 sm:mb-8 justify-center">
                {options.map((option) => (
                    <Button
                        key={option}
                        onClick={() => handleOptionClick(option)}
                        disabled={isAnswering}
                        className="w-12 h-12 sm:w-16 sm:h-16 text-lg sm:text-2xl font-bold rounded-full 
                            bg-yellow-400 hover:bg-yellow-500 text-purple-800 
                            disabled:opacity-50"
                    >
                        {option}
                    </Button>
                ))}
            </div>
            {message && (
                <div className={`text-lg sm:text-2xl font-bold mb-4 
                    ${isCorrect ? 'text-green-500' : 'text-red-500'}`}
                >
                    {message}
                </div>
            )}
        </div>
    )
}

export default NumbersGame
