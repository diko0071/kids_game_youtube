import { useCallback } from 'react'
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

export const useSpeechSynthesis = () => {
  const speakText = useCallback(async (text: string, language: string = 'ru-RU') => {
    console.log('Speaking text:', text, 'in language:', language);
    
    try {
      // Используем браузерный синтез речи
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        
        // Для русского языка установим специальный голос
        if (language === 'ru-RU') {
          const voices = window.speechSynthesis.getVoices();
          const russianVoice = voices.find(voice => 
            voice.lang.includes('ru') || 
            voice.name.toLowerCase().includes('russian')
          );
          if (russianVoice) {
            utterance.voice = russianVoice;
          }
        }

        // Настройка параметров речи
        utterance.rate = 0.9; // Немного замедляем скорость
        utterance.pitch = 1;
        utterance.volume = 1;

        return new Promise((resolve) => {
          utterance.onend = () => {
            console.log('Speech finished successfully');
            resolve(true);
          };
          utterance.onerror = (event) => {
            console.error('Speech error:', event);
            resolve(false);
          };
          window.speechSynthesis.speak(utterance);
        });
      }

      // Если браузерный синтез недоступен, используем Microsoft Speech Services
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        process.env.NEXT_PUBLIC_SPEECH_KEY || '',
        process.env.NEXT_PUBLIC_SPEECH_REGION || ''
      );

      speechConfig.speechSynthesisLanguage = language;
      
      // Для русского языка установим специальный голос
      if (language === 'ru-RU') {
        speechConfig.speechSynthesisVoiceName = "ru-RU-SvetlanaNeural";
      }
      
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

      return new Promise((resolve, reject) => {
        synthesizer.speakTextAsync(
          text,
          result => {
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
              console.log('Microsoft Speech synthesis completed successfully');
              resolve(true);
            } else {
              console.log("Speech synthesis canceled, trying browser synthesis");
              // Пробуем браузерный синтез как запасной вариант
              if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = language;
                window.speechSynthesis.speak(utterance);
                resolve(true);
              } else {
                reject(new Error("Speech synthesis not available"));
              }
            }
            synthesizer.close();
          },
          error => {
            console.error("Speech synthesis error:", error);
            synthesizer.close();
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error("Speech synthesis error caught in try-catch:", error);
      // Последняя попытка использовать браузерный синтез
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        window.speechSynthesis.speak(utterance);
        return true;
      }
      return false;
    }
  }, []);

  return { speakText };
};
