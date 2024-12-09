import React, { useEffect } from 'react';
import { useSyllableGame } from '../../hooks/useSyllableGame';

interface Props {
  language?: 'ru-RU' | 'en-US';
  onComplete?: () => void;
}

export const SyllableMatchingGame: React.FC<Props> = ({ language = 'ru-RU', onComplete }) => {
  const {
    targetWord,
    firstSyllables,
    secondSyllables,
    selectedFirst,
    selectedSecond,
    handleSyllableClick,
    isCorrect,
    message,
    generateNewQuestion,
    isInitialPronunciationComplete
  } = useSyllableGame(language, onComplete);

  useEffect(() => {
    generateNewQuestion();
  }, [generateNewQuestion]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onComplete) {
        onComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);

  if (!targetWord || !firstSyllables.length || !secondSyllables.length) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full max-w-[600px] mx-auto bg-gradient-to-br from-[#f6d365] to-[#fda085] rounded-xl landscape:max-w-full landscape:p-6">
      <div className="text-3xl font-bold text-gray-800 px-6 py-3 bg-white rounded-xl shadow-md animate-bounce-small landscape:text-2xl landscape:px-4 landscape:py-2">
        {targetWord}
      </div>

      <div className="flex flex-col items-center gap-4 w-full landscape:flex-row landscape:justify-center landscape:items-start">
        <div className="flex justify-center gap-8 w-full max-w-[400px] landscape:gap-4 landscape:max-w-[300px]">
          <div className="flex flex-col gap-3 min-w-[80px] landscape:min-w-[60px]">
            {firstSyllables.map((syllable) => (
              <button
                key={syllable.id}
                className={`px-4 py-3 text-xl font-bold text-center text-gray-600 bg-white border-2 rounded-lg shadow-sm transition-all hover:translate-y-[-2px] hover:shadow-md
                  ${selectedFirst?.id === syllable.id ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-gray-200'} 
                  ${selectedFirst?.id === syllable.id && selectedSecond && isCorrect ? 'border-green-500 bg-green-100 text-green-800' : ''}
                  ${!isInitialPronunciationComplete ? 'opacity-50 cursor-not-allowed' : ''} 
                  landscape:text-lg landscape:px-3 landscape:py-2`}
                onClick={() => handleSyllableClick(syllable)}
                disabled={!isInitialPronunciationComplete}
              >
                {syllable.text}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 min-w-[80px] landscape:min-w-[60px]">
            {secondSyllables.map((syllable) => (
              <button
                key={syllable.id}
                className={`px-4 py-3 text-xl font-bold text-center text-gray-600 bg-white border-2 rounded-lg shadow-sm transition-all hover:translate-y-[-2px] hover:shadow-md
                  ${selectedSecond?.id === syllable.id ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-gray-200'} 
                  ${selectedSecond?.id === syllable.id && isCorrect ? 'border-green-500 bg-green-100 text-green-800' : ''}
                  ${!isInitialPronunciationComplete ? 'opacity-50 cursor-not-allowed' : ''} 
                  landscape:text-lg landscape:px-3 landscape:py-2`}
                onClick={() => handleSyllableClick(syllable)}
                disabled={!isInitialPronunciationComplete}
              >
                {syllable.text}
              </button>
            ))}
          </div>
        </div>

        {!isInitialPronunciationComplete && (
          <div className="text-xl px-6 py-3 rounded-lg text-center animate-fade-in bg-blue-100 text-blue-800 landscape:text-lg landscape:px-4 landscape:py-2">
            Слушайте слово...
          </div>
        )}

        {isInitialPronunciationComplete && message && (
          <div className={`text-xl px-6 py-3 rounded-lg text-center animate-fade-in landscape:text-lg landscape:px-4 landscape:py-2
            ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}; 