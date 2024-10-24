"use client"
import GhostGame from './ghost_game'
import { useState, useEffect, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import ExerciseSettings from './settings_view'
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Play, Pause, Volume2, Edit, Settings, Video, Github, Maximize, Minimize, PlayCircle, List, Loader2 } from "lucide-react"
import Game from './numbers_game'
import RussianAlphabetGame from './russian_alphabet_game'
import ContentView from './content_view'
import { DialogGame, DialogGameContent, DialogGameTitle, DialogGameDescription, DialogGameTrigger, DialogGameFooter } from '@/components/ui/dialog_game'
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter, useSearchParams } from 'next/navigation'

const PLAYLISTS = [
  { id: 'PLGwsVJEZNfQX8Q-0FP9IkV92nyJ7rEeb2', name: 'LIVE! Клео и Кукин' },
  { id: 'PLGwsVJEZNfQXoCEMzvRsV0CzOE21WzuLj', name: 'Хэллоуин с Клео и Кукином!' },
  { id: 'PLqyDar58v02Ees2Ix7k8rtKtJMV862q85', name: 'Тима и Тома! Все серии!' },
  { id: 'PLBCl59ugxrPso934cq1I8QKiqqoKeXW_U', name: 'Сказочный патруль Все серии подряд' },
  { id: 'PL8o0bgEaIz4WLKLMS86ocbPfAYLe9Hzuj', name: 'Детские развлекательные мультики' },
];

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
  const [debugMode, setDebugMode] = useState(false)
  const [content, setContent] = useState({ 
    videoUrl: '', 
    playlistId: 'PLRTB5A-krdflIE9SQt_2af1jbSxaomqTU' 
  })
  const [isFullScreen, setIsFullScreen] = useState(false);
  const fullscreenAttemptRef = useRef<number | null>(null);
  const wasFullScreenRef = useRef(false);
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        initializeYouTubePlayer(newContent.playlistId)
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
        initializeYouTubePlayer(newContent.playlistId)
      }
    }
  }

  const checkExerciseTime = () => {
    if (!playerRef.current || isGenerating || isExercising) return

    const currentTime = Math.floor(playerRef.current.getCurrentTime())
    const timeSinceLastExercise = Math.abs(currentTime - lastExerciseTime);
    
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

  const [lastGameIndex, setLastGameIndex] = useState<number | null>(null);

  const generateRandomGames = () => {
    const gameComponents = [
      () => <Game key="game" onComplete={handleGameComplete} />,
      () => <RussianAlphabetGame key="alphabet" onComplete={handleGameComplete} />,
      () => <GhostGame key="ghost" onComplete={handleGameComplete} />,
    ];
    
    let availableIndices = gameComponents.map((_, index) => index);
    const shuffled = [];
  
    for (let i = 0; i < numExercises; i++) {
      if (availableIndices.length === 0) {
        availableIndices = gameComponents.map((_, index) => index);
        if (lastGameIndex !== null) {
          availableIndices = availableIndices.filter(index => index !== lastGameIndex);
        }
      }
  
      const randomIndex = Math.floor(Math.random() * availableIndices.length);
      const chosenIndex = availableIndices[randomIndex];
  
      availableIndices.splice(randomIndex, 1);
  
      shuffled.push(gameComponents[chosenIndex]);
      setLastGameIndex(chosenIndex);
    }
    
    setGames(shuffled.map((Component, index) => 
      <Component key={index} />
    ));
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

  const handleSaveSettings = (newNumExercises: number, newFrequency: number, newControls: number, newDebugMode: boolean) => {
    if (playerRef.current) {
      setCurrentVideoTime(playerRef.current.getCurrentTime());
    }

    localStorage.setItem('videoSettings', JSON.stringify({
      numExercises: newNumExercises,
      frequency: newFrequency,
      controls: newControls,
      currentVideoTime: currentVideoTime,
      currentVideoId: currentVideoId,
      content: content,
      debugMode: newDebugMode
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
      setDebugMode(parsedSettings.debugMode);
    }
  }, []);


  const initializeYouTubePlayer = (playlistId: string) => {
    if (typeof window !== 'undefined' && window.YT) {
      setIsLoading(true);
      new window.YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        playerVars: {
          allowfullscreen: 1,
          listType: 'playlist',
          list: playlistId,
          loop: 1,
          rel: 0,
          controls: controls,
          modestbranding: 0,
          iv_load_policy: 3,
          showinfo: 0,
        },
        events: {
          onReady: (event: any) => {
            playerRef.current = event.target;
            playerRef.current.setVolume(volume);
            addCustomOverlay();
            setIsLoading(false);
            playerRef.current.loadPlaylist({
              listType: 'playlist',
              list: playlistId,
              index: 0,
              startSeconds: 0
            });
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
      const savedPlaylistId = localStorage.getItem('currentPlaylistId');
      const playlistId = searchParams.get('playlist') || savedPlaylistId || PLAYLISTS[0].id;
      initializeYouTubePlayer(playlistId);
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
        initializeYouTubePlayer(content.playlistId)
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

  useEffect(() => {
    const savedPlaylistId = localStorage.getItem('currentPlaylistId');
    const playlistId = searchParams.get('playlist') || savedPlaylistId || getRandomPlaylistId();
    setCurrentPlaylistId(playlistId);
    initializeYouTubePlayer(playlistId);

    // Если URL не содержит playlist, добавляем его
    if (!searchParams.get('playlist')) {
      router.push(`?playlist=${playlistId}`, { scroll: false });
    }

    // Сохраняем текущий плейлист в localStorage
    localStorage.setItem('currentPlaylistId', playlistId);
  }, [searchParams]);

  const getRandomPlaylistId = () => {
    const randomIndex = Math.floor(Math.random() * PLAYLISTS.length);
    return PLAYLISTS[randomIndex].id;
  };

  const handlePlaylistSelect = (playlistId: string) => {
    // Update the URL with the new playlist ID and reload the page
    window.location.href = `?playlist=${playlistId}`;
  };

  const resetPlayerState = () => {
    setIsExercising(false);
    setIsDialogOpen(false);
    setCurrentGameIndex(0);
    setCompletedGames(0);
    setLastExerciseTime(0);
    setGames([]);
    setIsPlaying(false);
  };

  useEffect(() => {
    if (currentPlaylistId) {
      if (playerRef.current) {
        playerRef.current.loadPlaylist({
          listType: 'playlist',
          list: currentPlaylistId,
          index: 0,
          startSeconds: 0,
        });
      } else {
        initializeYouTubePlayer(currentPlaylistId);
      }
      localStorage.setItem('currentPlaylistId', currentPlaylistId);
    }
  }, [currentPlaylistId]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8 flex flex-col items-center">
      <div className="w-[90%] max-w-6xl bg-white rounded-lg shadow-lg overflow-hidden flex">
        <div className="w-4/5">
          <div className="aspect-video bg-gray-200 relative" ref={playerContainerRef}>
            <div id="youtube-player" className="absolute inset-0"></div>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex justify-between items-center"> 
              <div>
                {debugMode && (
                  <Button variant="outline" size="sm" onClick={handleExercise}>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Start Exercises
                  </Button>
                )}
              </div>
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
                      debugMode={debugMode}
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
        <div className="w-1/5 border-l">
          <div className="w-full h-full p-2">
            <ScrollArea className="h-full w-full rounded-md border overflow-hidden">
              <div className="p-2">
                {PLAYLISTS.map((playlist) => (
                  <Card 
                    key={playlist.id} 
                    className={`mb-2 last:mb-0 cursor-pointer hover:bg-gray-100 ${playlist.id === currentPlaylistId ? 'bg-blue-100' : ''}`}
                    onClick={() => handlePlaylistSelect(playlist.id)}
                  >
                    <CardContent className="p-2 flex items-center space-x-2">
                      <List className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-medium truncate" title={playlist.name}>
                          {playlist.name}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
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
