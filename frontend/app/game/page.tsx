"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getYoutubeTranscriptionAndInfo } from '../services/transcription-extractor'
import { generateExercise } from '../services/ai-service'

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
  const [videoId, setVideoId] = useState('dQw4w9WgXcQ')
  const [videoUrl, setVideoUrl] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const [isExercising, setIsExercising] = useState(false)
  const [exercise, setExercise] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [rightAnswer, setRightAnswer] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [transcript, setTranscript] = useState('')
  const [videoInfo, setVideoInfo] = useState<any>(null)

  const playerRef = useRef<YT.Player | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = initializePlayer // {change 1}
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
      const { transcript, videoInfo } = await getYoutubeTranscriptionAndInfo(videoUrl)
      setTranscript(transcript)
      setVideoInfo(videoInfo)
    } catch (error) {
      console.error('Error fetching transcript and info:', error)
    }
  }


  const handleExercise = async () => {
    if (playerRef.current && videoInfo) {
      const currentTime = Math.floor(playerRef.current.getCurrentTime())
      setCurrentTime(currentTime)
      setIsExercising(true)
      playerRef.current.pauseVideo()

      try {
        const { exercise, options, rightAnswer } = await generateExercise(
          videoInfo.title,
          currentTime,
          transcript
        )
        setExercise(exercise)
        setOptions(options)
        setRightAnswer(rightAnswer)
      } catch (error) {
        console.error('Error generating exercise:', error)
        setFeedback('Failed to generate exercise. Please try again.')
      }
    }
  }

  const checkAnswer = () => {
    if (userAnswer === rightAnswer) {
      setFeedback('Correct!')
    } else {
      setFeedback(`Incorrect. The correct answer is ${rightAnswer}.`)
    }
  }

  const resetExercise = () => {
    setIsExercising(false)
    setUserAnswer('')
    setFeedback('')
    setExercise('')
    setOptions([])
    setRightAnswer('')
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
        <Button onClick={handleExercise} disabled={isExercising}>
          Generate Exercise
        </Button>
        {isExercising && (
          <div className="space-y-2">
            <p className="text-lg font-semibold">{exercise}</p>
            {options.map((option, index) => (
              <Button
                key={index}
                onClick={() => setUserAnswer(option)}
                variant={userAnswer === option ? "default" : "outline"}
                className="w-full"
              >
                {option}
              </Button>
            ))}
            <Button onClick={checkAnswer} disabled={!userAnswer}>Check Answer</Button>
            <Button onClick={resetExercise} variant="outline">
              Resume Video
            </Button>
            {feedback && <p className="text-lg font-semibold">{feedback}</p>}
          </div>
        )}
      </div>
    </div>
  )
}