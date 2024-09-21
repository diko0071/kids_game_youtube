import ApiService from '../services/apiService';

export interface TranscriptionResponse {
  transcript: string;
}

export interface ExerciseResponse {
  question: string;
  options: string[];
  correct_option: string;
}

export const getYoutubeTranscription = async (url: string): Promise<TranscriptionResponse> => {
    try {
        const response = await ApiService.post('/generate_transcription', { url });
        console.log('response', response);
        return response.transcript;
    } catch (error) {
        console.error('Error fetching transcription:', error);
        throw error;
    }
};

export const generateExercise = async (
  currentTime: string,
  transcript: string,
  previousAnswer: string
): Promise<ExerciseResponse> => {
  try {
    const response = await ApiService.post('/generate_exercise', {
      current_time: currentTime,
      transcript,
      previous_answer: previousAnswer
    });
    console.log('Generate exercise response:', response);
    return {
      question: response.question,
      options: response.options,
      correct_option: response.correct_option
    };
  } catch (error) {
    console.error('Error in generateExercise:', error);
    throw error;
  }
};