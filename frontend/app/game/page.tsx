"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getYoutubeTranscription, generateExercise } from '../api/api' //{change 1}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // {change 1}
import Confetti from 'react-confetti';
import SingleQuizCard from '../components_game/quiz_card';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog" // {change 1}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: {
      Player: new (elementId: string, options: YT.PlayerOptions) => YT.Player;
    };
  }
}

namespace YT {
  export interface PlayerOptions {
    height: string;
    width: string;
    videoId: string;
    events: {
      onReady: (event: { target: Player }) => void;
    };
  }

  export interface Player {
    destroy: () => void;
    getCurrentTime: () => number;
    pauseVideo: () => void;
    playVideo: () => void;
  }
}

export default function InteractivePlayer() {
  const [player, setPlayer] = useState<YT.Player | null>(null)
  const [videoId, setVideoId] = useState('ZfBDS2MSTWI')
  const [videoUrl, setVideoUrl] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const [isExercising, setIsExercising] = useState(false)
  const [exercise, setExercise] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [rightAnswer, setRightAnswer] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedback, setFeedback] = useState('')
  const [transcript, setTranscript] = useState('')
  const [videoInfo, setVideoInfo] = useState<any>(null)
  const [previousResponses, setPreviousResponses] = useState<Array<{question: string, answer: string}>>([]);
  const [question, setQuestion] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // {change 2}

  const playerRef = useRef<YT.Player | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = initializePlayer
    } else if (window.YT && window.YT.Player) {
      initializePlayer()
    }
  }, [videoId])

  useEffect(() => {
    if (videoId) {
      fetchTranscriptAndInfo()
    }
  }, [videoId])

  const initializePlayer = () => {
    if (playerRef.current) {
      playerRef.current.destroy()
    }

    const newPlayer = new window.YT.Player('youtube-player', {
      height: '360',
      width: '640',
      videoId: videoId,
      events: {
        onReady: (event) => setPlayer(event.target),
      },
    })
    playerRef.current = newPlayer
  }

  const fetchTranscriptAndInfo = async () => {
    try {
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const response = await getYoutubeTranscription(videoUrl);
      
      if (!response) {
        throw new Error('Invalid response from API');
      }
      
      if (typeof response === 'object' && 'transcript' in response) {
        setTranscript(response.transcript);
      } else if (typeof response === 'string') {
        setTranscript(response);
      } else {
        throw new Error('Unexpected response format from API');
      }
    } catch (error) {
      console.error('Error fetching transcript and info:', error);
    }
  }

  const handleExercise = async () => {
    if (!playerRef.current) return;
  
    const currentTime = Math.floor(playerRef.current.getCurrentTime());
    setCurrentTime(currentTime);
    setIsExercising(true);
    setIsDialogOpen(true);
    setIsGenerating(true);
    playerRef.current.pauseVideo();
  
    try {
      console.log('previousResponses', previousResponses)
      const response = await generateExercise(
        currentTime.toString(),
        transcript,
        previousResponses.map(response => `${response.question} - ${response.answer}`).join(', ')
      );
  
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response from generateExercise');
      }
  
      const { question, options, correct_option } = response;
      if (!question || !options || !correct_option) {
        throw new Error('Incomplete response from generateExercise');
      }
  
      setQuestion(question);
      setOptions(options);
      setRightAnswer(correct_option);
      setExercise(question); 
      setFeedback(''); 
      setUserAnswer(''); 
    } catch (error) {
      console.error('Error generating exercise:', error);
      setFeedback('Failed to generate exercise. Please try again.');
      setIsExercising(false);
      setExercise(''); 
      setOptions([]); 
      setRightAnswer(''); 
    } finally {
      setIsGenerating(false);
    }
  };

  const checkAnswer = (selectedOption: string) => {
    setUserAnswer(selectedOption);
    if (selectedOption === rightAnswer) {
      setFeedback('Correct!');
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        resetExercise();
      }, 3000); 
    } else {
      setFeedback(`Incorrect. The correct answer is ${rightAnswer}.`);
    }
    setPreviousResponses([...previousResponses, { question: question, answer: selectedOption }]);
  };

  const resetExercise = () => {
    setIsExercising(false)
    setUserAnswer('')
    setFeedback('')
    setExercise('')
    setOptions([])
    setRightAnswer('')
    setIsDialogOpen(false); // {change 2}
    if (playerRef.current) {
      playerRef.current.playVideo()
    }
  }

  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setVideoUrl(url)
    const id = extractVideoId(url)
    if (id) {
      setVideoId(id)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <Input
          type="text"
          value={videoUrl}
          onChange={handleVideoUrlChange}
          placeholder="Enter YouTube video URL"
          className="w-full"
        />
      </div>
      <div className="aspect-video mb-4">
        <div id="youtube-player"></div>
      </div>
      <div className="space-y-4">
        <Button onClick={handleExercise}>
          Generate Exercise
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            {isExercising && (
              <SingleQuizCard
                question={question}
                options={options}
                correctAnswer={rightAnswer}
                onAnswerSelected={(selectedOption) => {
                  checkAnswer(selectedOption);
                }}
                onReset={resetExercise}
                isGenerating={isGenerating}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
      {showConfetti && <Confetti />}
    </div>
  )
}