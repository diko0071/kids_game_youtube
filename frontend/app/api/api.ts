import ApiService from '../services/apiService';

export interface TranscriptionAndInfo {
  transcript: string;
  videoInfo: any;
}

export interface Exercise {
  exercise: string;
  options: string[];
  rightAnswer: string;
}

export const getYoutubeTranscriptionAndInfo = async (url: string): Promise<TranscriptionAndInfo> => {
    try {
        const response = await ApiService.post('/generate_transcription', { url });
        console.log('response', response)
        return response;
    } catch (error) {
        console.error('Error fetching transcription and info:', error);
        throw error;
    }
};

export const generateExercise = async (
  currentTime: number,
  transcript: string,
  previousAnswer: string // добавляем предыдущий ответ
): Promise<Exercise> => {
  return ApiService.post('/generate_exercise', {
    current_time: currentTime,
    transcript,
    previous_answer: previousAnswer // передаем предыдущий ответ
  });
};