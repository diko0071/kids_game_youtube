import { useCallback } from 'react'

export function useSpeechSynthesis() {
  const speakText = useCallback((text: string, lang: string = 'ru-RU') => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    speechSynthesis.speak(utterance)
  }, [])

  return { speakText }
}