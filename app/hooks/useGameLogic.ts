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
  const [isCompleted, setIsCompleted] = useState(false)
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const { playHappySound, playSadSound } = useGameAudio()
  const { speakText } = useSpeechSynthesis()

  const getRandomPraise = () => {
    const praiseList = language === 'ru-RU' ? praises : englishPraises;
    return praiseList[Math.floor(Math.random() * praiseList.length)]
  }

  const handleAnswer = useCallback((answer: T) => {
    if (isCompleted) return // Prevent multiple completions

    if (checkAnswer(answer)) {
      setIsCorrect(true);
      setIsCompleted(true); // Mark as completed
      const praise = getRandomPraise();
      setMessage(praise);

      // Chain the promises to ensure proper sequencing
      playHappySound()
        .then(() => sleep(1300))
        .then(() => speakText(praise, language))
        .then(() => sleep(500)) // Add small delay after speech
        .then(() => onSuccess())
        .catch(error => {
          console.error('Error in success sequence:', error);
          onSuccess(); // Ensure completion even if audio/speech fails
        });
    } else {
      setIsCorrect(false);
      const tryAgainMessage = language === 'ru-RU' ? 'Попробуй ещё раз!' : 'Try again!';
      setMessage(tryAgainMessage);

      playSadSound()
        .then(() => sleep(1300))
        .then(() => speakText(tryAgainMessage, language))
        .then(() => onFailure())
        .catch(error => {
          console.error('Error in failure sequence:', error);
          onFailure();
        });
    }
  }, [checkAnswer, onSuccess, onFailure, playHappySound, playSadSound, speakText, language, isCompleted]);

  const nextQuestion = useCallback(() => {
    generateNewQuestion()
    setIsCorrect(null)
    setMessage('')
    setIsCompleted(false)
  }, [generateNewQuestion])

  return { isCorrect, message, handleAnswer, nextQuestion }
}
