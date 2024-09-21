"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"

const ghostColors = ['#FFC0CB', '#87CEFA', '#98FB98', '#FFD700', '#FFFFFF']

const Ghost = ({ color }: { color: string }) => (
  <svg width="150" height="200" viewBox="0 0 150 200">
    {/* Тело призрака */}
    <path d="M75 20 C40 20, 20 60, 20 100 C20 160, 50 180, 75 180 C100 180, 130 160, 130 100 C130 60, 110 20, 75 20 Z" fill={color} />
    {/* Глаза */}
    <circle cx="55" cy="80" r="10" fill="#FFFFFF" />
    <circle cx="95" cy="80" r="10" fill="#FFFFFF" />
    <circle cx="55" cy="80" r="5" fill="#000000" />
    <circle cx="95" cy="80" r="5" fill="#000000" />
    {/* Рот */}
    <ellipse cx="75" cy="120" rx="20" ry="10" fill="#000000" />
  </svg>
)

interface GhostGameProps {
  onComplete: () => void;
}

export default function GhostGame({ onComplete }: GhostGameProps) {
  const [currentColor, setCurrentColor] = useState<string>('')
  const [options, setOptions] = useState<string[]>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  useEffect(() => {
    generateNewRound()
  }, [])

  const generateNewRound = () => {
    const color = ghostColors[Math.floor(Math.random() * ghostColors.length)]
    setCurrentColor(color)

    let newOptions = [color]
    while (newOptions.length < 3) {
      const option = ghostColors[Math.floor(Math.random() * ghostColors.length)]
      if (!newOptions.includes(option)) {
        newOptions.push(option)
      }
    }
    setOptions(newOptions.sort(() => Math.random() - 0.5))
    setIsCorrect(null)
  }

  const handleAnswer = (answer: string) => {
    if (answer === currentColor) {
      setIsCorrect(true)
      setTimeout(() => {
        onComplete()
        generateNewRound()
      }, 2000)
    } else {
      setIsCorrect(false)
      setTimeout(generateNewRound, 2000)
    }
  }

  return (
    <div className="flex flex-col items-center justify-start bg-gradient-to-r from-gray-200 to-gray-400 p-4 rounded-lg w-[550px]">
      <div className="flex justify-center mb-12 mt-12">
        <Ghost color={currentColor} />
      </div>
      <div className="flex gap-8 mb-8">
        {options.map((option) => (
          <Button
            key={option}
            onClick={() => handleAnswer(option)}
            className="w-16 h-16 rounded-full"
            style={{ backgroundColor: option }}
          />
        ))}
      </div>
      {isCorrect !== null && (
        <div className={`text-2xl font-bold mb-4 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
          {isCorrect ? 'Правильно!' : 'Попробуй еще раз!'}
        </div>
      )}
    </div>
  )
}