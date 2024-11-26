"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Settings, Video, PlayCircle } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter, useSearchParams } from 'next/navigation'
import { VIDEOS } from "./constants"
import dynamic from 'next/dynamic'
import ExerciseSettings from "@/app/components/Settings"
import ContentView from "@/app/components/ContentView"
import { DialogGame, DialogGameContent, DialogGameTitle, DialogGameDescription } from '@/components/ui/dialog_game'
import NumbersGame from "@/app/components/NumbersGame"
import RussianAlphabetGame from "@/app/components/RussianAlphabetGame"
import GhostGame from "@/app/components/GhostGame"
import WordMatchingGame from "@/app/components/WordMatchingGame"
import { SyllableMatchingGame } from "@/app/components/SyllableMatchingGame"
import { DEFAULT_SETTINGS } from '@/app/components/Settings/types'

// Динамический импорт YouTube компонента
const YouTube = dynamic(() => import('react-youtube'), { ssr: false })

declare global {
    interface Window {
        YT: {
            Player: any;
            PlayerState: {
                PLAYING: number;
                PAUSED: number;
                ENDED: number;
            };
        };
        onYouTubeIframeAPIReady: () => void;
    }
}

export default function GameWrapper() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [showContentView, setShowContentView] = useState(false)
    const [currentVideoId, setCurrentVideoId] = useState('')
    const [currentVideoTime, setCurrentVideoTime] = useState(0)
    const [numExercises, setNumExercises] = useState(5)
    const [frequency, setFrequency] = useState(3)
    const [controls, setControls] = useState(1)
    const [debugMode, setDebugMode] = useState(false)
    const [isExercising, setIsExercising] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [currentGameIndex, setCurrentGameIndex] = useState(0)
    const [completedGames, setCompletedGames] = useState(0)
    const [games, setGames] = useState<JSX.Element[]>([])
    const [lastGameIndex, setLastGameIndex] = useState<number | null>(null)

    const playerRef = useRef<any>(null)
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const videoId = searchParams.get('video') || VIDEOS[0].id
            setCurrentVideoId(videoId)
    }, [searchParams])

    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 1,
            controls: controls,
            modestbranding: 1,
            rel: 0,
        },
    }

    const handleReady = (event: any) => {
        playerRef.current = event.target
        if (currentVideoTime > 0) {
            playerRef.current.seekTo(currentVideoTime)
        }
    }

    const handleStateChange = (event: any) => {
        if (event.data === window.YT.PlayerState.PLAYING) {
            const timer = setInterval(() => {
                if (playerRef.current) {
            handleExercise()
                }
            }, frequency * 60 * 1000)
            return () => clearInterval(timer)
        }
    }

    const handleVideoSelect = (videoId: string) => {
        router.push(`/?video=${videoId}`)
        setCurrentVideoId(videoId)
        localStorage.setItem('currentVideoId', videoId)
    }

    const handleExercise = () => {
        if (!isExercising) {
            setIsExercising(true)
            setIsDialogOpen(true)
            setCurrentGameIndex(0)
            setCompletedGames(0)
            generateRandomGames()
        }
    }

    const handleGameComplete = () => {
        setCompletedGames(prev => {
            const newCompleted = prev + 1
            if (newCompleted >= numExercises) {
                setTimeout(() => {
                    resetExercise()
                }, 500)
            } else {
                setCurrentGameIndex(newCompleted)
            }
            return newCompleted
        })
    }

    const resetExercise = () => {
        setIsExercising(false)
        setIsDialogOpen(false)
        setCurrentGameIndex(0)
        setCompletedGames(0)
        setGames([])
    }

    const generateRandomGames = () => {
        const savedSettings = localStorage.getItem('settings')
        const settings = savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS

        const gameComponents = [
            { component: () => <NumbersGame key="game" onComplete={handleGameComplete} />, enabled: settings.games.numbersGame },
            { component: () => <RussianAlphabetGame key="alphabet" onComplete={handleGameComplete} />, enabled: settings.games.alphabetGame },
            { component: () => <GhostGame key="ghost" onComplete={handleGameComplete} />, enabled: settings.games.ghostGame },
            { component: () => <WordMatchingGame key="word-matching" onComplete={handleGameComplete} />, enabled: settings.games.wordMatchingGame },
            { component: () => <SyllableMatchingGame key="syllable-matching" onComplete={handleGameComplete} />, enabled: settings.games.syllableMatchingGame },
        ].filter(game => game.enabled).map(game => game.component)

        if (gameComponents.length === 0) {
            console.warn('No games are enabled in settings')
            return
        }

        let availableIndices = gameComponents.map((_, index) => index)
        const shuffled = []

        for (let i = 0; i < numExercises; i++) {
            if (availableIndices.length === 0) {
                availableIndices = gameComponents.map((_, index) => index)
                if (lastGameIndex !== null) {
                    availableIndices = availableIndices.filter(index => index !== lastGameIndex)
                }
            }

            const randomIndex = Math.floor(Math.random() * availableIndices.length)
            const chosenIndex = availableIndices[randomIndex]
            availableIndices.splice(randomIndex, 1)
            shuffled.push(gameComponents[chosenIndex])
            setLastGameIndex(chosenIndex)
        }

        setGames(shuffled.map((Component, index) => <Component key={index} />))
    }

    const handleSettingsSave = (newNumExercises: number, newFrequency: number, newControls: number, newDebugMode: boolean) => {
        setNumExercises(newNumExercises)
        setFrequency(newFrequency)
        setControls(newControls)
        setDebugMode(newDebugMode)
        setIsSettingsOpen(false)
    }

    return (
        <div className="container mx-auto p-4">
            <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row">
                <div className="w-full md:w-4/5">
                    <div className="relative" style={{ paddingBottom: '56.25%' }}>
                        <YouTube
                            videoId={currentVideoId}
                            opts={opts}
                            onReady={handleReady}
                            onStateChange={handleStateChange}
                            className="absolute top-0 left-0 w-full h-full"
                            iframeClassName="absolute top-0 left-0 w-full h-full"
                        />
                    </div>

                    <div className="p-4 flex justify-between items-center">
                        <Button onClick={handleExercise} className="flex items-center gap-2">
                            <PlayCircle className="h-4 w-4" />
                            Start Exercises
                        </Button>

                        <div className="flex gap-2">
                            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="flex items-center gap-2">
                                        <Settings className="h-4 w-4" />
                                        Settings
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogTitle>Настройки</DialogTitle>
                                    <DialogDescription>Настройте параметры игры</DialogDescription>
                                    <ExerciseSettings
                                        numExercises={numExercises}
                                        frequency={frequency}
                                        controls={controls}
                                        debugMode={debugMode}
                                        onSave={handleSettingsSave}
                                        onClose={() => setIsSettingsOpen(false)}
                                    />
                                </DialogContent>
                            </Dialog>

                            <Dialog open={showContentView} onOpenChange={setShowContentView}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="flex items-center gap-2">
                                        <Video className="h-4 w-4" />
                                        Content
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogTitle>Content URLs</DialogTitle>
                                    <DialogDescription>Enter a video URL or a playlist ID</DialogDescription>
                                    <ContentView
                                        onClose={() => setShowContentView(false)}
                                        content={{ videoUrl: '', videoId: currentVideoId }}
                                        onSave={() => {}}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-1/5 bg-gray-50 p-4">
                    <ScrollArea className="h-[500px]">
                        {VIDEOS.map((video) => (
                            <Card
                                key={video.id}
                                className={`mb-2 cursor-pointer ${currentVideoId === video.id ? 'bg-blue-50' : ''}`}
                                onClick={() => handleVideoSelect(video.id)}
                            >
                                <CardContent className="p-4">
                                    <p className="text-sm">{video.name}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </ScrollArea>
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
