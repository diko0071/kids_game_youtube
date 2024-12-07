"use client"
import GhostGame from "@/app/components/GhostGame";
import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import ExerciseSettings from "@/app/components/Settings";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger  } from "@/components/ui/dialog"
import { Settings as SettingsIcon, Video,  PlayCircle, List, Loader2 } from "lucide-react"
import NumbersGame from "@/app/components/NumbersGame";
import RussianAlphabetGame from "@/app/components/RussianAlphabetGame";
import ContentView from "@/app/components/ContentView";
import { DialogGame, DialogGameContent, DialogGameTitle, DialogGameDescription, DialogGameTrigger, DialogGameFooter } from '@/components/ui/dialog_game'
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter, useSearchParams } from 'next/navigation'
import {extractVideoId, getRandomVideoId, handleVideoSelect} from "@/app/components/GameWrapper/utils";
import {VIDEOS} from "@/app/components/GameWrapper/constants";
import WordMatchingGame from "@/app/components/WordMatchingGame";
import { SyllableMatchingGame } from "@/app/components/SyllableMatchingGame";
import { Settings, DEFAULT_SETTINGS } from '@/app/components/Settings/types'

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}
export default function GameWrapper() {
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const [volume, setVolume] = useState<number>(50)
    const playerRef = useRef<any>(null)
    const [showSettings, setShowSettings] = useState(false)
    const [numExercises, setNumExercises] = useState(2)
    const [completedGames, setCompletedGames] = useState(0)
    const [frequency, setFrequency] = useState(1)
    const [controls, setControls] = useState(1)
    const [isExercising, setIsExercising] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [lastExerciseTime, setLastExerciseTime] = useState<number>(0)
    const [isCheckingExerciseTime, setIsCheckingExerciseTime] = useState<boolean>(false)
    const [currentGameIndex, setCurrentGameIndex] = useState(0)
    const [games, setGames] = useState<JSX.Element[]>([])
    const [showContentView, setShowContentView] = useState(false)
    const [isYouTubeApiReady, setIsYouTubeApiReady] = useState(false)
    const [currentVideoTime, setCurrentVideoTime] = useState<number>(0)
    const [debugMode, setDebugMode] = useState(false)
    const [currentVideoId, setCurrentVideoId] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    const [lastGameIndex, setLastGameIndex] = useState<number | null>(null)
    const [content, setContent] = useState({
        videoUrl: '',
        videoId: VIDEOS[0].id
    })

    const fullscreenAttemptRef = useRef<number | null>(null)
    const wasFullScreenRef = useRef(false)
    const playerContainerRef = useRef<HTMLDivElement>(null)

    const router = useRouter()
    const searchParams = useSearchParams()

    const handleSaveContent = (newContent: { videoUrl: string; videoId: string }) => {
        setContent(newContent)
        const videoId = extractVideoId(newContent.videoUrl) || newContent.videoId
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
        if (!playerRef.current || isExercising) return

        const currentTime = Math.floor(playerRef.current.getCurrentTime())
        const timeSinceLastExercise = Math.abs(currentTime - lastExerciseTime);

        console.log(`Current time: ${currentTime}, Last exercise time: ${lastExerciseTime}, Time since last exercise: ${timeSinceLastExercise}, Frequency: ${frequency * 60}`)

        if (timeSinceLastExercise >= frequency * 60) {
            console.log('Time to show exercise!')
            handleExercise()
            setLastExerciseTime(currentTime)
        }
    }

    const generateRandomGames = () => {
        const gameComponents = [
            { component: () => <NumbersGame key="game" onComplete={handleGameComplete} />, id: 'numbersGame' },
            { component: () => <RussianAlphabetGame key="alphabet" onComplete={handleGameComplete} />, id: 'alphabetGame' },
            { component: () => <GhostGame key="ghost" onComplete={handleGameComplete} />, id: 'ghostGame' },
            { component: () => <WordMatchingGame key="word-matching" onComplete={handleGameComplete} />, id: 'wordMatchingGame' },
            { component: () => <SyllableMatchingGame key="syllable-matching" onComplete={handleGameComplete} />, id: 'syllableMatchingGame' },
        ];

        // Filter games based on settings
        const savedSettings = localStorage.getItem('videoSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : null;
        const selectedGames = settings?.selectedGames || {};

        const availableGames = gameComponents.filter(game => selectedGames[game.id]);
        
        if (availableGames.length === 0) {
            // If no games are selected, use all games as fallback
            availableGames.push(...gameComponents);
        }

        let availableIndices = availableGames.map((_, index) => index);
        const shuffled = [];

        for (let i = 0; i < numExercises; i++) {
            if (availableIndices.length === 0) {
                availableIndices = availableGames.map((_, index) => index);
                if (lastGameIndex !== null) {
                    availableIndices = availableIndices.filter(index => index !== lastGameIndex);
                }
            }

            const randomIndex = Math.floor(Math.random() * availableIndices.length);
            const chosenIndex = availableIndices[randomIndex];

            availableIndices.splice(randomIndex, 1);

            shuffled.push(availableGames[chosenIndex].component);
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
        setCurrentGameIndex(0);
        setCompletedGames(0);
        generateRandomGames();
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

    const handleSaveSettings = (
        newNumExercises: number, 
        newFrequency: number, 
        newControls: number, 
        selectedGames: Settings['games']
    ) => {
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
            selectedGames: selectedGames,
        }));

        window.location.reload();
    }

    const addCustomOverlay = () => {
        if (playerContainerRef.current) {
            const overlay = document.createElement('div');
            Object.assign(overlay.style, {
                position: 'absolute',
                top: '60%',
                left: '0',
                right: '0',
                bottom: '5%',
                backgroundColor: 'transparent',
                zIndex: '10',
                pointerEvents: 'auto'
            });

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

    const initializeYouTubePlayer = (videoId: string) => {
        if (typeof window !== 'undefined' && window.YT) {
            setIsLoading(true);
            new window.YT.Player('youtube-player', {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    allowfullscreen: 1,
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
                        playerRef.current.playVideo();
                    },
                    onStateChange: (event: any) => {
                        setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
                    },
                    onError: (event: any) => {
                        console.error('YouTube player error:', event.data);
                        const nextVideo = getRandomVideoId();
                        if (nextVideo) {
                            setCurrentVideoId(nextVideo);
                            playerRef.current?.loadVideoById(nextVideo);
                        }
                    }
                },
            });
        }
    }

    useEffect(() => {
        if (isYouTubeApiReady) {
            handleSaveContent(content);
        }
    }, [isYouTubeApiReady, content]);

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
    }, [isPlaying, frequency, isExercising, lastExerciseTime])

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

        const tag = document.createElement('script')
        tag.src = "https://www.youtube.com/iframe_api"
        const firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

        window.onYouTubeIframeAPIReady = () => {
            const savedVideoId = localStorage.getItem('currentVideoId')
            const videoId = searchParams.get('video') || savedVideoId || VIDEOS[0].id
            setCurrentVideoId(videoId)
            initializeYouTubePlayer(videoId)
        }

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

        document.addEventListener('click', preventNavigation, true);
        document.addEventListener('touchend', preventNavigation, true);

        //window.addEventListener('beforeunload', preventBeforeUnload);

        const preventLinkNavigation = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.tagName === 'A' && target.getAttribute('href')) {
                event.preventDefault();
            }
        };

        document.addEventListener('click', preventLinkNavigation, true);

        return () => {
            if (fullscreenAttemptRef.current) {
                console.log('Cleanup: Clearing fullscreen attempt timeout');
                clearTimeout(fullscreenAttemptRef.current);
            }

            if (playerRef.current) {
                playerRef.current.destroy()
            }

            document.removeEventListener('click', preventNavigation, true);
            document.removeEventListener('touchend', preventNavigation, true);
            document.removeEventListener('click', preventLinkNavigation, true);

            window.removeEventListener('beforeunload', preventBeforeUnload);
        }
    }, []);

    useEffect(() => {
        const savedVideoId = localStorage.getItem('currentVideoId')
        const videoId = searchParams.get('video') || savedVideoId || getRandomVideoId()
        setCurrentVideoId(videoId)
        
        if (!searchParams.get('video')) {
            router.push(`?video=${videoId}`, { scroll: false })
        }

        localStorage.setItem('currentVideoId', videoId)
    }, [searchParams])

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8 flex flex-col items-center">
            <div className="w-[100%] max-w-6xl bg-white rounded-lg shadow-lg overflow-hidden flex">
                <div className="w-4/6">
                    <div className="aspect-video bg-gray-200 relative" ref={playerContainerRef}>
                        <div id="youtube-player" className="absolute inset-0"></div>
                        {isLoading && (                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                <Loader2 className="w-12 h-12 text-white animate-spin" />
                            </div>
                        )}
                    </div>
                    <div className="p-4 sm:p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-start sm:justify-between items-start sm:items-center gap-2 sm:gap-0">
                            <div>
                                <Button variant="outline" size="sm" onClick={handleExercise} className="w-auto">
                                    <PlayCircle className="h-4 w-4 mr-2" />
                                    Start Exercises
                                </Button>
                            </div>
                            <div className="flex flex-row space-x-2 w-auto">
                                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="w-auto">
                                            <SettingsIcon className="h-4 w-4 mr-2" />
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
                                        <Button variant="outline" size="sm" className="w-auto">
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
                <div className="w-2/6">
                    <div className="w-full h-full p-2">
                        <ScrollArea className="h-[calc(105vh-120px)] md:h-[calc(110vh-120px)] w-full rounded-md border overflow-hidden">
                            <div className="p-2">
                                {VIDEOS.map((video) => (
                                    <Card
                                        key={video.id}
                                        className={`mb-2 last:mb-0 cursor-pointer hover:bg-gray-100 ${
                                            video.id === currentVideoId ? 'bg-blue-100' : ''
                                        }`}
                                        onClick={() => handleVideoSelect(video.id)}
                                    >
                                        <CardContent className="p-2">
                                            <div className="flex flex-col space-y-2">
                                                <h3 className="text-sm font-medium line-clamp-2" title={video.name}>
                                                    {video.name}
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
                    if (!open) {
                        resetExercise()
                    }
                    setIsDialogOpen(open)
                }}
            >
                <DialogGameContent className="sm:max-w-[600px] flex flex-col items-center">
                    <DialogGameTitle>
                        Мини-игра {Math.min(currentGameIndex + 1, numExercises)}/{numExercises}
                    </DialogGameTitle>
                    <DialogGameDescription>
                        Завершите мини-игру, чтобы продолжить просмотр видео.
                    </DialogGameDescription>
                    {isExercising && currentGameIndex < numExercises ? (
                        games[currentGameIndex]
                    ) : (
                        <p>Все мини-игры завершены!</p>
                    )}
                </DialogGameContent>
            </DialogGame>
        </div>
    )
}