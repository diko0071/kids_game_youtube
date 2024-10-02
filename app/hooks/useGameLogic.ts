import { useState, useCallback } from 'react'
import { useGameAudio } from './useGameAudio'
import { useSpeechSynthesis } from './useSpeechSynthesis'

export function useGameLogic<T>(
  generateNewQuestion: () => void,
  checkAnswer: (answer: T) => boolean,
  onSuccess: () => void,
  onFailure: () => void
) {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [message, setMessage] = useState('')

  const { playHappySound, playSadSound } = useGameAudio()
  const { speakText } = useSpeechSynthesis()

  const handleAnswer = (answer: T) => {
    if (checkAnswer(answer)) {
      setIsCorrect(true)
      message = 'Правильно! Молодец!'
      setMessage(message)
      playHappySound()
      speakText(message)
      onSuccess()
    } else {
      setIsCorrect(false)
      message = 'Неверно, попробуй еще раз!'
      setMessage(message)
      playSadSound()
      // Озвучиваем "Неверно, попробуй еще раз" на русском языке
      speakText(message)
      onFailure()
    }
  }

  const nextQuestion = useCallback(() => {
    generateNewQuestion()
    setIsCorrect(null)
    setMessage('')
  }, [generateNewQuestion])

  return { isCorrect, message, handleAnswer, nextQuestion }
}