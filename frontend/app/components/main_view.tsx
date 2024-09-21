"use client"

import { useState, useEffect, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import ExerciseSettings from './settings_view'
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Play, Pause, Volume2, Edit, Settings } from "lucide-react"
import SingleQuizCard from './quiz_card'
import Confetti from 'react-confetti'
import Game from './game'
import RussianAlphabetGame from './russian_alphabet_game'

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function MainView() {
  const [currentVideoId, setCurrentVideoId] = useState<string>("")
  const [inputUrl, setInputUrl] = useState<string>("")
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [volume, setVolume] = useState<number>(50)
  const [isUrlLocked, setIsUrlLocked] = useState<boolean>(false)
  const playerRef = useRef<any>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [numExercises, setNumExercises] = useState(5)
  const [completedGames, setCompletedGames] = useState(0)
  const [frequency, setFrequency] = useState(1)
  const [transcript, setTranscript] = useState('')
  const [isExercising, setIsExercising] = useState(false)
  const [exercise, setExercise] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [rightAnswer, setRightAnswer] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [previousResponses, setPreviousResponses] = useState<Array<{question: string, answer: string}>>([])
  const [question, setQuestion] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [lastExerciseTime, setLastExerciseTime] = useState<number>(0)
  const [isCheckingExerciseTime, setIsCheckingExerciseTime] = useState<boolean>(false)
  const [currentGameIndex, setCurrentGameIndex] = useState(0)
  const [games, setGames] = useState<JSX.Element[]>([])

  const checkExerciseTime = () => {
    if (!playerRef.current || isGenerating || isExercising) return

    const currentTime = Math.floor(playerRef.current.getCurrentTime())
    if (currentTime - lastExerciseTime >= frequency * 60) {
      handleExercise()
      setLastExerciseTime(currentTime)
    }
  }

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
    if (isPlaying && !isCheckingExerciseTime) {
      setIsCheckingExerciseTime(true)
      intervalId = setInterval(checkExerciseTime, 1000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
      setIsCheckingExerciseTime(false)
    }
  }, [isPlaying, frequency, isGenerating, isExercising])

  const generateRandomGames = () => {
    const gameComponents = [
      () => <Game key="game" onComplete={handleGameComplete} />,
      () => <RussianAlphabetGame key="alphabet" onComplete={handleGameComplete} />,
    ]
    
    const shuffled = [...Array(numExercises)].map(() => 
      gameComponents[Math.floor(Math.random() * gameComponents.length)]
    )
    setGames(shuffled.map((Component, index) => 
      <Component key={index} />
    ))
  }


  const handleGameComplete = () => {
    setCompletedGames(prev => prev + 1)
    if (completedGames + 1 >= numExercises) {
      resetExercise()
    } else {
      setCurrentGameIndex(prev => prev + 1)
    }
  }

  const handleExercise = () => {
    if (!playerRef.current) return
    playerRef.current.pauseVideo()
    setIsExercising(true)
    setIsDialogOpen(true)
    generateRandomGames()
    setCurrentGameIndex(0)
    setCompletedGames(0)
  }

  const resetExercise = () => {
    setIsExercising(false)
    setIsDialogOpen(false)
    setCurrentGameIndex(0)
    setCompletedGames(0)
    if (playerRef.current) {
      playerRef.current.playVideo()
    }
  }

  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const handleSaveSettings = (newNumExercises: number, newFrequency: number) => {
    setNumExercises(newNumExercises)
    setFrequency(newFrequency)
  }

  const handleFetchVideo = () => {
    const videoId = extractVideoId(inputUrl)
    if (videoId) {
      setCurrentVideoId(videoId)
      setIsUrlLocked(true)
      if (playerRef.current) {
        playerRef.current.loadVideoById(videoId)
      } else {
        initializeYouTubePlayer(videoId)
      }
    }
  }

  const handleUrlEdit = () => {
    setIsUrlLocked(false)
  }

  const togglePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo()
      } else {
        playerRef.current.playVideo()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0])
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume[0])
    }
  }

  const initializeYouTubePlayer = (videoId: string) => {
    if (typeof window !== 'undefined' && window.YT) {
      new window.YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        events: {
          onReady: (event: any) => {
            playerRef.current = event.target
            playerRef.current.setVolume(volume)
          },
          onStateChange: (event: any) => {
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING)
          },
        },
      })
    }
  }

  useEffect(() => {
    const tag = document.createElement('script')
    tag.src = "https://www.youtube.com/iframe_api"
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => {
      if (currentVideoId) {
        initializeYouTubePlayer(currentVideoId)
      }
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="aspect-video bg-gray-200">
          <div id="youtube-player"></div>
        </div>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Input
              type="text"
              placeholder="Paste YouTube URL here"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-grow"
              disabled={isUrlLocked}
            />
            <Button 
              onClick={isUrlLocked ? handleUrlEdit : handleFetchVideo} 
              className="w-full sm:w-auto"
            >
              {isUrlLocked ? (
                <>
                  <Edit className="mr-2 h-4 w-4" /> Edit Video
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" /> Fetch Video
                </>
              )}
            </Button>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex flex-wrap items-center justify-start gap-4">
              <div className="flex items-center space-x-2">
                <Button size="icon" variant="outline" onClick={togglePlayPause}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
                </Button>
              </div>
              <div className="flex items-center space-x-2 flex-grow sm:flex-grow-0">
                <Volume2 className="h-4 w-4 text-gray-500" />
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-24 sm:w-32"
                />
              </div>
            </div>
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="link">
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <ExerciseSettings 
                  onClose={() => setShowSettings(false)} 
                  numExercises={numExercises} 
                  frequency={frequency} 
                  onSave={handleSaveSettings} 
                />
              </DialogContent>
            </Dialog>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogTitle>Mini-Game {currentGameIndex + 1}/{numExercises}</DialogTitle>
              <DialogDescription>Complete the game to continue watching the video.</DialogDescription>
              {isExercising && games[currentGameIndex]}
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {showConfetti && <Confetti className="absolute top-0 left-0 w-full h-full z-50" />}
    </div>
  )
}