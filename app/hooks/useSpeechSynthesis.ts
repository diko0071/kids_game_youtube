import { useCallback, useEffect } from 'react';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';

// Manages a single synthesizer and a global speech queue
class SynthesizerManager {
  private synthesizer: speechsdk.SpeechSynthesizer | null = null;
  private queue: { 
    text: string; 
    language: string; 
    resolve: () => void; 
    reject: (error: any) => void; 
  }[] = [];
  private isSpeaking: boolean = false;

  private getVoiceName(language: string): string {
    if (language.startsWith('en')) {
      return 'en-US-JennyNeural'; // Female English voice
    } else if (language.startsWith('ru')) {
      return 'ru-RU-SvetlanaNeural'; // Female Russian voice
    } else {
      return 'en-US-JennyNeural'; // Default to English
    }
  }

  private initializeSynthesizer(language: string) {
    const newVoiceName = this.getVoiceName(language);

    if (
      !this.synthesizer ||
      !(this.synthesizer.properties as any).speechSynthesisLanguage ||
      (this.synthesizer.properties as any).speechSynthesisLanguage !== language ||
      (this.synthesizer.properties as any).speechSynthesisVoiceName !== newVoiceName
    ) {
      // Close existing synthesizer if present
      if (this.synthesizer) {
        this.synthesizer.close();
        this.synthesizer = null;
      }
      const subscriptionKey = process.env.NEXT_PUBLIC_AZURE_SUBSCRIPTION_KEY;
      if (!subscriptionKey) {
        throw new Error('AZURE_SUBSCRIPTION_KEY is not set');
      }

      const speechConfig = speechsdk.SpeechConfig.fromSubscription(
        subscriptionKey,
        'eastus'
  
      );
      speechConfig.speechSynthesisLanguage = language;
      speechConfig.speechSynthesisVoiceName = newVoiceName;

      const audioConfig = speechsdk.AudioConfig.fromDefaultSpeakerOutput();
      this.synthesizer = new speechsdk.SpeechSynthesizer(speechConfig, audioConfig);
    }
  }

  public speak(text: string, language: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Add the speech request to the global queue
      this.queue.push({ text, language, resolve, reject });
      this.processQueue();
    });
  }

  private processQueue() {
    if (this.isSpeaking || this.queue.length === 0) {
      return;
    }

    const { text, language, resolve, reject } = this.queue.shift()!;
    this.isSpeaking = true;

    this.initializeSynthesizer(language);

    this.synthesizer!.speakTextAsync(
      text,
      result => {
        this.isSpeaking = false;

        if (result.reason === speechsdk.ResultReason.SynthesizingAudioCompleted) {
          console.log(`Speech synthesized for text "${text}" [${language}]`);
          resolve();
        } else {
          console.error(`Speech synthesis failed for text "${text}" [${language}]: ${result.errorDetails}`);
          reject(new Error(result.errorDetails));
        }

        // Process the next item in the queue
        this.processQueue();
      },
      error => {
        this.isSpeaking = false;
        console.error(`Error during speech synthesis for text "${text}" [${language}]:`, error);
        reject(error);

        // Process the next item in the queue
        this.processQueue();
      }
    );
  }

  // Cleanup method to close the synthesizer
  public closeSynthesizer() {
    if (this.synthesizer) {
      this.synthesizer.close();
      this.synthesizer = null;
    }
  }

  // New method to speak multiple texts with pauses
  public async speakTextsWithPauses(
    texts: { text: string; language: string }[],
    pauseDuration: number = 500 // Default pause of 500ms
  ): Promise<void> {
    for (let i = 0; i < texts.length; i++) {
      const { text, language } = texts[i];
      await this.speak(text, language);
      if (i < texts.length - 1) {
        await this.sleep(pauseDuration);
      }
    }
  }

  // Helper method for sleep
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const synthesizerManager = new SynthesizerManager();

export function useSpeechSynthesis() {
  useEffect(() => {
    // Cleanup synthesizer when the component unmounts
    return () => {
      synthesizerManager.closeSynthesizer();
    };
  }, []);

  const speakText = useCallback((text: string, language: string = 'ru-RU'): Promise<void> => {
    return synthesizerManager.speak(text, language);
  }, []);

  // Expose the new method
  const speakTextsWithPauses = useCallback(
    (texts: { text: string; language: string }[], pauseDuration?: number): Promise<void> => {
      return synthesizerManager.speakTextsWithPauses(texts, pauseDuration);
    },
    []
  );

  return { speakText, speakTextsWithPauses };
}