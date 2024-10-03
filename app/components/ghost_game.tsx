"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { useGameLogic } from '../hooks/useGameLogic'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'

const ghostColors = [
  { color: '#FFFFFF', name: 'Белый', englishName: 'White' },
  { color: '#FFC0CB', name: 'Розовый', englishName: 'Pink' },
  { color: '#FFFF00', name: 'Желтый', englishName: 'Yellow' },
  { color: '#0000FF', name: 'Синий', englishName: 'Blue' },
  { color: '#FF0000', name: 'Красный', englishName: 'Red' },
  { color: '#000000', name: 'Черный', englishName: 'Black' },
  { color: '#800080', name: 'Фиолетовый', englishName: 'Violet' },
  { color: '#008000', name: 'Зеленый', englishName: 'Green' },
  { color: '#FFA500', name: 'Оранжевый', englishName: 'Orange' },
  { color: '#808080', name: 'Серый', englishName: 'Gray' },
  { color: '#FFC0CB', name: 'Розовый', englishName: 'Pink' },
  { color: '#FFFF00', name: 'Желтый', englishName: 'Yellow' },
  { color: '#0000FF', name: 'Синий', englishName: 'Blue' },
  { color: '#FF0000', name: 'Красный', englishName: 'Red' }
]

const Ghost = ({ color }: { color: string }) => (
  <svg width="150" height="200" viewBox="0 0 150 200">
    <path d="M75 20 C40 20, 20 60, 20 100 C20 160, 50 180, 75 180 C100 180, 130 160, 130 100 C130 60, 110 20, 75 20 Z" fill={color} />
    <circle cx="55" cy="80" r="10" fill="#FFFFFF" />
    <circle cx="95" cy="80" r="10" fill="#FFFFFF" />
    <circle cx="55" cy="80" r="5" fill="#000000" />
    <circle cx="95" cy="80" r="5" fill="#000000" />
    <ellipse cx="75" cy="120" rx="20" ry="10" fill="#000000" />
  </svg>
)

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
    () => {} // No specific failure action
  )

  const handleColorClick = useCallback((option: { color: string; name: string; englishName: string }) => {
    announceColor(option)
    handleAnswer(option)
  }, [announceColor, handleAnswer])

  useEffect(() => {
    generateNewQuestion()
  }, [generateNewQuestion])

  return (
    <div className="flex flex-col items-center justify-start bg-gradient-to-r from-gray-200 to-gray-400 p-4 rounded-lg w-[550px]">
      <div className="flex justify-center mb-12 mt-12">
        <Ghost color={currentColor.color} />
      </div>
      <div className="flex gap-8 mb-8">
        {options.map((option) => (
          <Button
            key={option.color}
            onClick={() => handleColorClick(option)}
            className="w-16 h-16 rounded-full"
            style={{ backgroundColor: option.color }}
          />
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