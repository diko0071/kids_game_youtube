"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { useGameAudio } from '../hooks/useGameAudio'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'

const russianLetters = ['А', 'Б', 'В', 'Г', 'Д']
const letterColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']

const RussianLetter = ({ letter, color }: { letter: string; color: string }) => (
  <svg width="80" height="120" viewBox="0 0 120 120">
    <rect x="10" y="10" width="100" height="100" rx="10" ry="10" fill={color} />
    <text
      x="60"
      y="80"
      fontSize="80"
      fontWeight="bold"
      textAnchor="middle"
      fill="white"
    >
      {letter}
    </text>
  </svg>
)

const russianWords = {
    'А': ['Арбуз', 'Апельсин', 'Автобус', 'Аист'],
    'Б': ['Банан', 'Бабочка', 'Белка', 'Берёза'],
    'В': ['Ваза', 'Волк', 'Вода', 'Велосипед'],
    'Г': ['Гриб', 'Груша', 'Гитара', 'Голубь'],
    'Д': ['Дом', 'Дерево', 'Дождь', 'Дыня']
  }
  

interface RussianAlphabetGameProps {
    onComplete: () => void;
  }

export default function RussianAlphabetGame({ onComplete }: RussianAlphabetGameProps) {
  const [currentLetter, setCurrentLetter] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  const { playHappySound, playSadSound } = useGameAudio()
  const { speakText } = useSpeechSynthesis()

  const speakRussianWord = useCallback((letter: string) => {
    const words = russianWords[letter as keyof typeof russianWords]
    const randomWord = words[Math.floor(Math.random() * words.length)]
    const utterance = new SpeechSynthesisUtterance(randomWord)
    utterance.lang = 'ru-RU'
    speechSynthesis.speak(utterance)
  }, [])

  useEffect(() => {
    generateNewRound()
  }, [])

  const generateNewRound = () => {
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
    setMessage('')
    setIsCorrect(null)
  }

  const handleAnswer = (answer: string) => {
    speakRussianWord(answer)
    if (answer === currentLetter) {
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