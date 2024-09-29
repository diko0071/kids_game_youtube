"use client"
import GhostGame from './ghost_game'
import { useState, useEffect, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import ExerciseSettings from './settings_view'
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Play, Pause, Volume2, Edit, Settings, Video, Github, Maximize, Minimize } from "lucide-react"
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
  const [controls, setControls] = useState(1)
  const [isExercising, setIsExercising] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [lastExerciseTime, setLastExerciseTime] = useState<number>(0)
  const [isCheckingExerciseTime, setIsCheckingExerciseTime] = useState<boolean>(false)
  const [currentGameIndex, setCurrentGameIndex] = useState(0)
  const [games, setGames] = useState<JSX.Element[]>([])
  const [showContentView, setShowContentView] = useState(false)
  const [isYouTubeApiReady, setIsYouTubeApiReady] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);
  const [content, setContent] = useState({ 
    videoUrl: '', 
    playlistId: 'PLRTB5A-krdflIE9SQt_2af1jbSxaomqTU' 
  })
  const [isFullScreen, setIsFullScreen] = useState(false);
  const fullscreenAttemptRef = useRef<number | null>(null);
  const wasFullScreenRef = useRef(false);


  useEffect(() => {
    if (isYouTubeApiReady) {
      handleSaveContent(content);
    }
  }, [isYouTubeApiReady, content]);
  

  const handleSaveContent = (newContent: { videoUrl: string; playlistId: string }) => {
    setContent(newContent)
    const videoId = extractVideoId(newContent.videoUrl)
    if (videoId) {
      setCurrentVideoId(videoId)
      if (playerRef.current) {
        if (newContent.playlistId) {
          playerRef.current.loadPlaylist({
            listType: 'playlist',
            list: newContent.playlistId,
            index: 0,
            startSeconds: 0
          })
        } else {
          playerRef.current.loadVideoById(videoId)
        }
      } else {
        initializeYouTubePlayer(videoId, newContent.playlistId)
      }
    } else if (newContent.playlistId) {
      if (playerRef.current) {
        playerRef.current.loadPlaylist({
          listType: 'playlist',
          list: newContent.playlistId,
          index: 0,
          startSeconds: 0
        })
      } else {
        initializeYouTubePlayer(null, newContent.playlistId)
      }
    }
  }

  const checkExerciseTime = () => {
    if (!playerRef.current || isGenerating || isExercising) return

    const currentTime = Math.floor(playerRef.current.getCurrentTime())
    const timeSinceLastExercise = currentTime - lastExerciseTime
    
    console.log(`Current time: ${currentTime}, Last exercise time: ${lastExerciseTime}, Time since last exercise: ${timeSinceLastExercise}, Frequency: ${frequency * 60}`)
    
    if (timeSinceLastExercise >= frequency * 60) {
      console.log('Time to show exercise!')
      handleExercise()
      setLastExerciseTime(currentTime)
    }
  }

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
    if (isPlaying && !isCheckingExerciseTime) {
      setIsCheckingExerciseTime(true)
      intervalId = setInterval(checkExerciseTime, 1000)
      console.log('Started exercise check interval')
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
        console.log('Cleared exercise check interval')
      }
      setIsCheckingExerciseTime(false)
    }
  }, [isPlaying, frequency, isGenerating, isExercising, lastExerciseTime]) 

  const generateRandomGames = () => {
    const gameComponents = [
      () => <Game key="game" onComplete={handleGameComplete} />,
      () => <RussianAlphabetGame key="alphabet" onComplete={handleGameComplete} />,
      () => <GhostGame key="ghost" onComplete={handleGameComplete} />,
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
    if (!playerRef.current) return;
    playerRef.current.pauseVideo();
    const iframe = playerRef.current.getIframe();
    const isCurrentlyFullscreen = 
      document.fullscreenElement === iframe ||
      (document as any).webkitFullscreenElement === iframe ||
      (document as any).mozFullScreenElement === iframe ||
      (document as any).msFullscreenElement === iframe;
    
    console.log('handleExercise: Current fullscreen state:', isCurrentlyFullscreen);
    wasFullScreenRef.current = isCurrentlyFullscreen; 
    if (isCurrentlyFullscreen) {
      console.log('handleExercise: Exiting fullscreen');
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
    setIsExercising(true);
    setIsDialogOpen(true);
    generateRandomGames();
    setCurrentGameIndex(0);
    setCompletedGames(0);
  }

  const resetExercise = () => {
    console.log('resetExercise: Starting reset');
    setIsExercising(false);
    setIsDialogOpen(false);
    setCurrentGameIndex(0);
    setCompletedGames(0);
    if (playerRef.current) {
      console.log('resetExercise: Resuming video');
      playerRef.current.playVideo();
      if (wasFullScreenRef.current) {
        console.log('resetExercise: Attempting to enter fullscreen');
        if (fullscreenAttemptRef.current) {
          clearTimeout(fullscreenAttemptRef.current);
        }
        fullscreenAttemptRef.current = window.setTimeout(() => {
          const iframe = playerRef.current.getIframe();
          const enterFullscreen = () => {
            console.log('enterFullscreen: Trying to enter fullscreen mode');
            const fullscreenPromise = 
              iframe.requestFullscreen?.() || 
              iframe.webkitRequestFullscreen?.() || 
              iframe.mozRequestFullScreen?.() || 
              iframe.msRequestFullscreen?.();
            
            if (fullscreenPromise instanceof Promise) {
              fullscreenPromise.then(() => {
                console.log('enterFullscreen: Successfully entered fullscreen mode');
              }).catch((error) => {
                console.log('enterFullscreen: Failed to enter fullscreen mode:', error);
                console.log('enterFullscreen: Retrying in 500ms');
                setTimeout(enterFullscreen, 500);
              });
            } else {
              console.log('enterFullscreen: Fullscreen method is not a Promise');
            }
          };
          enterFullscreen();
          fullscreenAttemptRef.current = null;
        }, 100);
      } else {
        console.log('resetExercise: Not attempting fullscreen, wasFullScreen is false');
      }
    }
  };

  useEffect(() => {
    return () => {
      if (fullscreenAttemptRef.current) {
        console.log('Cleanup: Clearing fullscreen attempt timeout');
        clearTimeout(fullscreenAttemptRef.current);
      }
    };
  }, []);

  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const handleSaveSettings = (newNumExercises: number, newFrequency: number, newControls: number) => {
    if (playerRef.current) {
      setCurrentVideoTime(playerRef.current.getCurrentTime());
    }

    localStorage.setItem('videoSettings', JSON.stringify({
      numExercises: newNumExercises,
      frequency: newFrequency,
      controls: newControls,
      currentVideoTime: currentVideoTime,
      currentVideoId: currentVideoId,
      content: content
    }));

    window.location.reload();
  }

  useEffect(() => {
    const savedSettings = localStorage.getItem('videoSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setNumExercises(parsedSettings.numExercises);
      setFrequency(parsedSettings.frequency);
      setControls(parsedSettings.controls);
      setCurrentVideoTime(parsedSettings.currentVideoTime);
      setCurrentVideoId(parsedSettings.currentVideoId);
      setContent(parsedSettings.content);
    }
  }, []);


  const initializeYouTubePlayer = (videoId: string | null, playlistId?: string) => {
    if (typeof window !== 'undefined' && window.YT) {
      new window.YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoId || undefined,
        playerVars: {
          allowfullscreen: 1,
          listType: playlistId ? 'playlist' : undefined,
          list: playlistId || undefined,
          loop: 1,
          rel: 0,
          controls: controls,
          modestbranding: 0,
          start: Math.floor(currentVideoTime),
          iv_load_policy: 3,
          showinfo: 0,
        },
        events: {
          onReady: (event: any) => {
            playerRef.current = event.target;
            playerRef.current.setVolume(volume);
            addCustomOverlay();
          },
          onStateChange: (event: any) => {
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          },
          onError: (event: any) => {
            console.error('YouTube player error:', event.data);
            if (playerRef.current) {
              playerRef.current.nextVideo();
            }
          }
        },
      });
    }
  }

  useEffect(() => {
    const tag = document.createElement('script')
    tag.src = "https://www.youtube.com/iframe_api"
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => {
      setIsYouTubeApiReady(true);
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

  useEffect(() => {
    const videoId = extractVideoId(content.videoUrl)
    if (videoId) {
      setCurrentVideoId(videoId)
      if (playerRef.current) {
        playerRef.current.loadVideoById(videoId)
      } else {
        initializeYouTubePlayer(videoId)
      }
    }
  }, [])

  const playerContainerRef = useRef<HTMLDivElement>(null);

  const addCustomOverlay = () => {
    if (playerContainerRef.current) {
      const overlay = document.createElement('div');
      overlay.style.position = 'absolute';
      overlay.style.top = '60%';
      overlay.style.left = '0';
      overlay.style.right = '0';
      overlay.style.bottom = '5%';
      overlay.style.backgroundColor = 'transparent';
      overlay.style.zIndex = '10';
      overlay.style.pointerEvents = 'auto';
  
      overlay.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (playerRef.current) {
          if (playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING) {
            playerRef.current.pauseVideo();
          } else {
            playerRef.current.playVideo();
          }
        }
      });
  
      playerContainerRef.current.appendChild(overlay);
    }
  }
  useEffect(() => {
    const preventNavigation = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const preventBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    // Capture clicks in the capturing phase
    document.addEventListener('click', preventNavigation, true);
    document.addEventListener('touchend', preventNavigation, true);

    // Prevent page unload
    window.addEventListener('beforeunload', preventBeforeUnload);

    // Clean up event listeners on component unmount
    return () => {
      document.removeEventListener('click', preventNavigation, true);
      document.removeEventListener('touchend', preventNavigation, true);
      window.removeEventListener('beforeunload', preventBeforeUnload);
    };
  }, []); 

  useEffect(() => {
    const preventLinkNavigation = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')) {
        event.preventDefault();
      }
    };

    document.addEventListener('click', preventLinkNavigation, true);

    return () => {
      document.removeEventListener('click', preventLinkNavigation, true);
    };
  }, []); 

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8 flex flex-col items-center">
      <div className="w-[90%] max-w-6xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="aspect-video bg-gray-200 relative" ref={playerContainerRef}>
          <div id="youtube-player" className="absolute inset-0"></div>
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
                    controls={controls}
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
                  <DialogDescription>Enter a video URL or a playlist ID</DialogDescription>
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