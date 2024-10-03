"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { useGameLogic } from '../hooks/useGameLogic'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'

const iceCreamColors = ['#87CEFA', '#FECA57', '#98FB98', '#FFB6C1']
const cakeColors = ['#FF69B4', '#20B2AA', '#FF7F50', '#FFD700']

const IceCream = ({ colors }: { colors: string[] }) => (
  <svg width="80" height="120" viewBox="0 0 120 180">
    <path d="M60 180 L20 80 L100 80 Z" fill="#FFA94D" />
    {colors.map((color, index) => (
      <ellipse
        key={index}
        cx="60"
        cy={80 - index * 40}
        rx="40"
        ry="20"
        fill={color}
      />
    ))}
    <circle cx="60" cy="10" r="8" fill="#FF0000" />
  </svg>
)

const Cake = ({ colors }: { colors: string[] }) => (
  <svg width="80" height="120" viewBox="0 0 120 120">
    {/* Base */}
    <rect x="20" y="80" width="80" height="20" fill="#8B4513" />
    {/* Layers */}
    {colors.map((color, index) => (
      <rect
        key={index}
        x="20"
        y={60 - index * 20}
        width="80"
        height="20"
        fill={color}
      />
    ))}
    {/* Cherry */}
    <circle cx="60" cy="10" r="8" fill="#FF0000" />
    {/* Frosting */}
    <path d="M20 40 Q60 20 100 40" stroke="white" strokeWidth="4" fill="none" />
  </svg>
)

interface NumbersGameProps {
  onComplete: () => void;
}

const russianNumbers = [
  'Ноль мороженых', 'Одно мороженое', 'Два мороженых', 'Три мороженых', 'Четыре мороженых',
  'Ноль тортиков', 'Один тортик', 'Два тортика', 'Три тортика', 'Четыре тортика'
]

const englishNumbers = [
  'Zero ice creams', 'One ice cream', 'Two ice creams', 'Three ice creams', 'Four ice creams',
  'Zero cakes', 'One cake', 'Two cakes', 'Three cakes', 'Four cakes'
]

export default function NumbersGame({ onComplete }: NumbersGameProps) {
  const [dessertCount, setDessertCount] = useState(2)
  const [options, setOptions] = useState<number[]>([])
  const [isIceCream, setIsIceCream] = useState(true)

  const { speakText } = useSpeechSynthesis()

  const speakRussianAndEnglishNumber = useCallback((number: number, isIceCream: boolean) => {
    const index = isIceCream ? number : number + 5
    const russianText = russianNumbers[index]
    const englishText = englishNumbers[index]
    speakText(`${russianText}, ${englishText}`)
  }, [speakText])

  const generateNewQuestion = useCallback(() => {
    const count = Math.floor(Math.random() * 4) + 1
    setDessertCount(count)
    setIsIceCream(prev => !prev)
    
    let newOptions = [count]
    while (newOptions.length < 3) {
      const option = Math.floor(Math.random() * 4) + 1
      if (!newOptions.includes(option)) {
        newOptions.push(option)
      }
    }
    setOptions(newOptions.sort(() => Math.random() - 0.5))
  }, [])

  const checkAnswer = useCallback((answer: number) => {
    return answer === dessertCount
  }, [dessertCount])

  const { isCorrect, message, handleAnswer, nextQuestion } = useGameLogic(
    generateNewQuestion,
    checkAnswer,
    onComplete,
    () => {} // No specific failure action
  )

  useEffect(() => {
    generateNewQuestion()
  }, [generateNewQuestion])

  const handleOptionClick = (option: number) => {
    speakRussianAndEnglishNumber(option, isIceCream)
    handleAnswer(option)
  }

  const DessertComponent = isIceCream ? IceCream : Cake
  const dessertColors = isIceCream ? iceCreamColors : cakeColors

  return (
    <div className="flex flex-col items-center justify-start bg-gradient-to-r from-pink-300 to-purple-300 p-4 rounded-lg w-[550px]">
      <div className="flex justify-center gap-12 mb-12 mt-12">
        {Array.from({ length: dessertCount }).map((_, index) => (
          <DessertComponent 
            key={index} 
            colors={[
              dessertColors[index % dessertColors.length],
              dessertColors[(index + 1) % dessertColors.length]
            ]} 
          />
        ))}
      </div>
      <div className="flex gap-8 mb-8">
        {options.map((option) => (
          <Button
            key={option}
            onClick={() => handleOptionClick(option)}
            className="text-3xl font-bold w-16 h-16 rounded-full bg-yellow-400 hover:bg-yellow-500 text-purple-800"
          >
            {option}
          </Button>
        ))}
      </div>
      {message && (
        <div
          className={`text-2xl font-bold mb-4 ${
            isCorrect ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  )
}