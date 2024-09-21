"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"

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

const russianWords = [
    'Арбуз', 'Банан', 'Ваза', 'Гриб', 'Дом'
]

interface RussianAlphabetGameProps {
    onComplete: () => void;
  }

export default function RussianAlphabetGame({ onComplete }: RussianAlphabetGameProps) {
  const [currentLetter, setCurrentLetter] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  const playSound = useCallback((frequency: number, duration: number) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01)
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration - 0.01)

    oscillator.start()
    oscillator.stop(audioContext.currentTime + duration)
  }, [])

  const playHappySound = useCallback(() => {
    playSound(523.25, 0.2) // C5
    setTimeout(() => playSound(659.25, 0.2), 200) // E5
    setTimeout(() => playSound(783.99, 0.3), 400) // G5
  }, [playSound])

  const playSadSound = useCallback(() => {
    playSound(392.00, 0.3) // G4
    setTimeout(() => playSound(349.23, 0.3), 300) // F4
  }, [playSound])

  const speakRussianWord = useCallback((letter: string) => {
    const index = russianLetters.indexOf(letter)
    const utterance = new SpeechSynthesisUtterance(russianWords[index])
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
      setMessage('Попробуй еще раз!')
      setIsCorrect(false)
      playSadSound()
      setTimeout(generateNewRound, 2000)
    }
  }

  return (
    <div className="flex flex-col items-center justify-start bg-gradient-to-r from-blue-300 to-green-300 p-4 rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-white text-center">
        Русский алфавит
      </h1>
      <div className="flex justify-center mb-12">
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