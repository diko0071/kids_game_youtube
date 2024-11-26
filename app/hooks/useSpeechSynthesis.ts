import { useCallback } from 'react'
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

export const useSpeechSynthesis = () => {
  const speakText = useCallback(async (text: string, language: string = 'ru-RU') => {
    try {
      // Если браузерный синтез речи доступен, используем его как запасной вариант
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        window.speechSynthesis.speak(utterance);
        return;
      }

      // Если нет браузерного синтеза, пробуем использовать Microsoft Speech Services
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        process.env.NEXT_PUBLIC_SPEECH_KEY || '',
        process.env.NEXT_PUBLIC_SPEECH_REGION || ''
      );

      speechConfig.speechSynthesisLanguage = language;
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

      return new Promise((resolve, reject) => {
        synthesizer.speakTextAsync(
          text,
          result => {
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
              resolve(result);
            } else {
              console.log("Speech synthesis canceled, using browser synthesis as fallback");
              // Пробуем использовать браузерный синтез как запасной вариант
              if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = language;
                window.speechSynthesis.speak(utterance);
                resolve(null);
              } else {
                reject(new Error("Speech synthesis not available"));
              }
            }
            synthesizer.close();
          },
          error => {
            console.log("Speech synthesis error, using browser synthesis as fallback");
            // Пробуем использовать браузерный синтез как запасной вариант
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.lang = language;
              window.speechSynthesis.speak(utterance);
              resolve(null);
            } else {
              reject(error);
            }
            synthesizer.close();
          }
        );
      });
    } catch (error) {
      console.log("Speech synthesis error caught in try-catch");
      // Пробуем использовать браузерный синтез как последний запасной вариант
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, []);

  return { speakText };
};
