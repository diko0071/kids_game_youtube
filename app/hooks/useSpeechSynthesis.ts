import { useCallback } from 'react'
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';

export function useSpeechSynthesis() {
  const speakText = useCallback((text: string, lang: string = 'ru-RU'): Promise<void> => {
    return new Promise((resolve, reject) => {
      const speechConfig = speechsdk.SpeechConfig.fromSubscription(process.env.NEXT_PUBLIC_AZURE_SUBSCRIPTION_KEY!, "eastus");
      speechConfig.speechSynthesisVoiceName = lang === 'ru-RU' ? "zh-CN-XiaochenMultilingualNeural" : "zh-CN-XiaochenMultilingualNeural";
      const synthesizer = new speechsdk.SpeechSynthesizer(speechConfig);

      synthesizer.speakTextAsync(
        text,
        result => {
          if (result.reason === speechsdk.ResultReason.SynthesizingAudioCompleted) {
            console.log("Speech synthesized for text: ", text);
            resolve();
          } else {
            console.error("Speech synthesis canceled, " + result.errorDetails);
            reject(new Error(result.errorDetails));
          }
          synthesizer.close();
        },
        error => {
          console.error("Error occurred: ", error);
          synthesizer.close();
          reject(error);
        }
      );
    });
  }, [])

  return { speakText }
}
