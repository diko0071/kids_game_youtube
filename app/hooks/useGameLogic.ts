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

const englishPraises = [
  'Great job!',
  'Excellent!',
  'Correct!',
  'Super!',
  'You\'re smart!',
  'Wonderful!',
  'Right!',
  'You did it!',
  'Fantastic!',
  'Keep it up!'
]

export function useGameLogic<T>(
  generateNewQuestion: () => void,
  checkAnswer: (answer: T) => boolean,
  onSuccess: () => void,
  onFailure: () => void,
  language: 'ru-RU' | 'en-US' = 'ru-RU'
) {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [message, setMessage] = useState('')
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const { playHappySound, playSadSound } = useGameAudio()
  const { speakText } = useSpeechSynthesis()

  const getRandomPraise = () => {
    const praiseList = language === 'ru-RU' ? praises : englishPraises;
    return praiseList[Math.floor(Math.random() * praiseList.length)]
  }

  const handleAnswer = useCallback(async (answer: T) => {
    if (checkAnswer(answer)) {
      setIsCorrect(true)
      const praise = getRandomPraise()
      setMessage(praise)
      await playHappySound()
      await sleep(1000)
      await speakText(praise, language)
      onSuccess()
    } else {
      setIsCorrect(false)
      const tryAgainMessage = language === 'ru-RU' ? 'Попробуй ещё раз!' : 'Try again!';
      setMessage(tryAgainMessage)
      await playSadSound()
      await sleep(1000)
      await speakText(tryAgainMessage, language)
      onFailure()
    }
  }, [checkAnswer, onSuccess, onFailure, playHappySound, playSadSound, speakText, language])

  const nextQuestion = useCallback(() => {
    generateNewQuestion()
    setIsCorrect(null)
    setMessage('')
  }, [generateNewQuestion])

  return { isCorrect, message, handleAnswer, nextQuestion }
}