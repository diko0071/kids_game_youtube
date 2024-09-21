//REWRITE
"use client"

import { useState, useEffect, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import ExerciseSettings from './settings_view'
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Play, Pause, Volume2, Edit, Settings, Video } from "lucide-react"
import Game from './game'
import RussianAlphabetGame from './russian_alphabet_game'
import ContentView from './content_view'
import { DialogGame, DialogGameContent, DialogGameTitle, DialogGameDescription, DialogGameTrigger, DialogGameFooter } from '@/components/ui/dialog_game'

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
  const [numExercises, setNumExercises] = useState(2)
  const [completedGames, setCompletedGames] = useState(0)
  const [frequency, setFrequency] = useState(1)
  const [isExercising, setIsExercising] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [lastExerciseTime, setLastExerciseTime] = useState<number>(0)
  const [isCheckingExerciseTime, setIsCheckingExerciseTime] = useState<boolean>(false)
  const [currentGameIndex, setCurrentGameIndex] = useState(0)
  const [games, setGames] = useState<JSX.Element[]>([])
  const [showContentView, setShowContentView] = useState(false)
  const [content, setContent] = useState({ videoUrl: '', playlistUrl: '' })

  const handleSaveContent = (newContent: { videoUrl: string; playlistUrl: string }) => {
    setContent(newContent)
    const videoId = extractVideoId(newContent.videoUrl)
    if (videoId) {
      setCurrentVideoId(videoId)
      if (playerRef.current) {
        playerRef.current.loadVideoById(videoId)
      } else {
        initializeYouTubePlayer(videoId)
      }
    }
  }

  const checkExerciseTime = () => {
    if (!playerRef.current || isGenerating || isExercising) return

    const currentTime = Math.floor(playerRef.current.getCurrentTime())
    const timeSinceLastExercise = currentTime - lastExerciseTime
    
    if (timeSinceLastExercise >= frequency * 60) {
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
    setCompletedGames(prev => {
      const newCompletedGames = prev + 1;
      console.log(`Completed games: ${newCompletedGames}, Total games: ${numExercises}`);
      
      if (newCompletedGames >= numExercises) {
        console.log('All games completed, resetting exercise');
        setTimeout(() => {
          resetExercise();
        }, 500);
      } else {
        const nextGameIndex = Math.min(newCompletedGames, numExercises - 1);
        console.log(`Moving to next game: ${nextGameIndex + 1}`);
        setCurrentGameIndex(nextGameIndex);
      }
      
      return newCompletedGames;
    });
  };

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
    console.log('Resetting exercise');
    setIsExercising(false);
    setIsDialogOpen(false);
    setCurrentGameIndex(0);
    setCompletedGames(0);
    if (playerRef.current) {
      console.log('Resuming video');
      playerRef.current.playVideo();
    }
  };
  

  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const handleSaveSettings = (newNumExercises: number, newFrequency: number) => {
    setNumExercises(newNumExercises)
    setFrequency(newFrequency)
    setLastExerciseTime(0)
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
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex justify-end items-center">
            <div className="flex space-x-2">
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Settings</DialogTitle>
                  <DialogDescription>Configure your video exercise routine</DialogDescription>
                  <ExerciseSettings 
                    onClose={() => setShowSettings(false)} 
                    numExercises={numExercises} 
                    frequency={frequency} 
                    onSave={handleSaveSettings} 
                  />
                </DialogContent>
              </Dialog>
              <Dialog open={showContentView} onOpenChange={setShowContentView}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4 mr-2" />
                    Content
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Content URLs</DialogTitle>
                  <DialogDescription>Enter a video URL</DialogDescription>
                  <ContentView 
                    onClose={() => setShowContentView(false)} 
                    content={content} 
                    onSave={handleSaveContent}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
      <DialogGame 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          console.log(`Dialog open state changed to: ${open}`);
          if (!open) {
            resetExercise();
          }
          setIsDialogOpen(open);
        }}
      >
        <DialogGameContent className="sm:max-w-[600px] flex flex-col items-center">
          <DialogGameTitle>Мини-игра {Math.min(currentGameIndex + 1, numExercises)}/{numExercises}</DialogGameTitle>
          <DialogGameDescription>Завершите мини-игру, чтобы продолжить просмотр видео.</DialogGameDescription>
          {isExercising && currentGameIndex < numExercises && games[currentGameIndex]}
          {isExercising && currentGameIndex >= numExercises && <p>Все мини-игры завершены!</p>}
        </DialogGameContent>
      </DialogGame>
    </div>
  )
}