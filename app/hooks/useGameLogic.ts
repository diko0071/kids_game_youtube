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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useGameLogic<T>(
  generateNewQuestion: () => void,
  checkAnswer: (answer: T) => boolean,
  onSuccess: () => void,
  onFailure: () => void,
  options?: { customIncorrectSpeech?: { text: string; language: string }[] }
) {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [message, setMessage] = useState('')

  const { playHappySound, playSadSound } = useGameAudio()
  const { speakText, speakTextsWithPauses } = useSpeechSynthesis()

  const getRandomPraise = () => praises[Math.floor(Math.random() * praises.length)]

  const handleAnswer = useCallback(
    async (answer: T) => {
      if (checkAnswer(answer)) {
        setIsCorrect(true);
        const praise = getRandomPraise();
        setMessage(praise);
        playHappySound();

        // Speak the praise with a pause
        await speakTextsWithPauses([{ text: praise, language: 'ru-RU' }], 500);

        onSuccess();
      } else {
        setIsCorrect(false);
        setMessage('Неверно. Попробуй ещё раз!');
        playSadSound();

        if (options?.customIncorrectSpeech) {
          // Use custom speech sequence
          await speakTextsWithPauses(options.customIncorrectSpeech, 500);
        } else {
          // Default incorrect speech
          await speakTextsWithPauses(
            [
              { text: 'Неверно', language: 'ru-RU' },
              { text: 'Попробуй ещё раз!', language: 'ru-RU' },
            ],
            500
          );
        }

        onFailure();
      }
    },
    [
      checkAnswer,
      onSuccess,
      onFailure,
      playHappySound,
      playSadSound,
      speakTextsWithPauses,
      getRandomPraise,
      options,
    ]
  );

  const nextQuestion = useCallback(() => {
    generateNewQuestion()
    setIsCorrect(null)
    setMessage('')
  }, [generateNewQuestion])

  return { isCorrect, message, handleAnswer, nextQuestion }
}