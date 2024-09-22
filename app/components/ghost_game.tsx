"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"

const ghostColors = [
  { color: '#FFFFFF', name: 'Белый' },
  { color: '#FFC0CB', name: 'Розовый' },
  { color: '#FFFF00', name: 'Желтый' },
  { color: '#0000FF', name: 'Синий' },
  { color: '#FF0000', name: 'Красный' }
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
  const [currentColor, setCurrentColor] = useState<{ color: string; name: string }>({ color: '', name: '' })
  const [options, setOptions] = useState<{ color: string; name: string }[]>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  const speakRussianColor = useCallback((colorName: string) => {
    const utterance = new SpeechSynthesisUtterance(colorName)
    utterance.lang = 'ru-RU'
    speechSynthesis.speak(utterance)
  }, [])

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

  useEffect(() => {
    generateNewRound()
  }, [])

  const generateNewRound = () => {
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
    setIsCorrect(null)
  }

  const handleAnswer = (answer: { color: string; name: string }) => {
    speakRussianColor(answer.name)
    if (answer.color === currentColor.color) {
      setIsCorrect(true)
      playHappySound()
      setTimeout(() => {
        onComplete()
        generateNewRound()
      }, 2000)
    } else {
      setIsCorrect(false)
      playSadSound()
      setTimeout(generateNewRound, 2000)
    }
  }

  return (
    <div className="flex flex-col items-center justify-start bg-gradient-to-r from-gray-200 to-gray-400 p-4 rounded-lg w-[550px]">
      <div className="flex justify-center mb-12 mt-12">
        <Ghost color={currentColor.color} />
      </div>
      <div className="flex gap-8 mb-8">
        {options.map((option) => (
          <Button
            key={option.color}
            onClick={() => handleAnswer(option)}
            className="w-16 h-16 rounded-full"
            style={{ backgroundColor: option.color }}
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