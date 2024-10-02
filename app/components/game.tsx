"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { useGameAudio } from '../hooks/useGameAudio'
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

interface GameProps {
    onComplete: () => void;
  }

const russianNumbers = [
    'Ноль мороженых', 'Одно мороженое', 'Два мороженых', 'Три мороженых', 'Четыре мороженых',
    'Ноль то́ртиков', 'Один то́ртик', 'Два то́ртика', 'Три то́ртика', 'Четыре то́ртика'
]

export default function Game({ onComplete }: GameProps) {
  const [dessertCount, setDessertCount] = useState(2)
  const [options, setOptions] = useState<number[]>([])
  const [message, setMessage] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isIceCream, setIsIceCream] = useState(true)

  const { playHappySound, playSadSound } = useGameAudio()
  const { speakText } = useSpeechSynthesis()

  const speakRussianNumber = useCallback((number: number, isIceCream: boolean) => {
    const index = isIceCream ? number : number + 5
    const text = russianNumbers[index]
    speakText(text)
  }, [speakText, isIceCream])

  useEffect(() => {
    generateNewRound()
  }, [])

  const generateNewRound = () => {
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
    setMessage('')
    setIsCorrect(null)
  }

  const handleAnswer = (answer: number) => {
    speakRussianNumber(answer, isIceCream)
    if (answer === dessertCount) {
      setMessage('Правильно!')
      setIsCorrect(true)
      playHappySound()
      setTimeout(() => {
        onComplete()
        generateNewRound()
      }, 2000)
    } else {
      setMessage('Неверно, попробуй еще раз!')
      setIsCorrect(false)
      playSadSound()
      // Озвучиваем "Неверно, попробуй еще раз" на русском языке
      speakText('Неверно, попробуй еще раз')
      // Убираем вызов generateNewRound(), чтобы оставить ту же игру
    }
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
            onClick={() => handleAnswer(option)}
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