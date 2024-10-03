import { useState, useCallback } from 'react'
import { useGameAudio } from './useGameAudio'
import { useSpeechSynthesis } from './useSpeechSynthesis'

const praises = [
  'Молодец!',
  'Отлично!',
  'Правильно!',
  'Супер!',
  'Ты умница!',
  'Здорово!',
  'Верно!',
  'Ты справилась!',
  'Замечательно!',
  'Так держать!'
]

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

  const getRandomPraise = () => praises[Math.floor(Math.random() * praises.length)]

  const handleAnswer = useCallback((answer: T) => {
    if (checkAnswer(answer)) {
      setIsCorrect(true)
      const praise = getRandomPraise()
      setMessage(praise)
      playHappySound()
      speakText(praise)
      onSuccess()
    } else {
      setIsCorrect(false)
      setMessage('Попробуй ещё раз!')
      playSadSound()
      speakText('Попробуй ещё раз!')
      onFailure()
    }
  }, [checkAnswer, onSuccess, onFailure, playHappySound, playSadSound, speakText])

  const nextQuestion = useCallback(() => {
    generateNewQuestion()
    setIsCorrect(null)
    setMessage('')
  }, [generateNewQuestion])

  return { isCorrect, message, handleAnswer, nextQuestion }
}