"use client"

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Plus, Trash2, Volume2, Edit } from "lucide-react"

interface Video {
  id: string;
  title: string;
}

export default function Component() {
  const [currentVideoId, setCurrentVideoId] = useState<string>("")
  const [inputUrl, setInputUrl] = useState<string>("")
  const [playlist, setPlaylist] = useState<Video[]>([])
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [volume, setVolume] = useState<number>(50)
  const [isUrlLocked, setIsUrlLocked] = useState<boolean>(false)

  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const addToPlaylist = () => {
    const videoId = extractVideoId(inputUrl)
    if (videoId && !playlist.some(video => video.id === videoId)) {
      setPlaylist([...playlist, { id: videoId, title: `Video ${playlist.length + 1}` }])
      if (!currentVideoId) setCurrentVideoId(videoId)
      setIsUrlLocked(true) // {change 1} Lock the URL after adding to playlist
    }
  }

  const removeFromPlaylist = (idToRemove: string) => {
    setPlaylist(playlist.filter(video => video.id !== idToRemove))
    if (currentVideoId === idToRemove) {
      const nextVideo = playlist.find(video => video.id !== idToRemove)
      setCurrentVideoId(nextVideo ? nextVideo.id : "")
    }
  }

  const playVideo = (id: string) => {
    setCurrentVideoId(id)
    setIsPlaying(true)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
    // In a real implementation, you would use the YouTube Player API to control playback
  }
  
  const handleUrlEdit = () => {
    setIsUrlLocked(false) // {change 1} Unlock the URL for editing
  }

  const playNext = () => {
    const currentIndex = playlist.findIndex(video => video.id === currentVideoId)
    if (currentIndex < playlist.length - 1) {
      setCurrentVideoId(playlist[currentIndex + 1].id)
    }
  }

  const playPrevious = () => {
    const currentIndex = playlist.findIndex(video => video.id === currentVideoId)
    if (currentIndex > 0) {
      setCurrentVideoId(playlist[currentIndex - 1].id)
    }
  }

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0])
    // In a real implementation, you would use the YouTube Player API to set the volume
  }

  useEffect(() => {
    // In a real implementation, you would initialize the YouTube Player API here
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="aspect-video bg-gray-200">
          {currentVideoId ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${currentVideoId}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No video selected
            </div>
          )}
        </div>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Input
              type="text"
              placeholder="Paste YouTube URL here"
              value={inputUrl}
              onChange={(e) => !isUrlLocked && setInputUrl(e.target.value)}
              className="flex-grow"
              disabled={isUrlLocked}
            />
            {isUrlLocked ? (
              <Button onClick={handleUrlEdit} className="w-full sm:w-auto">
                <Edit className="mr-2 h-4 w-4" /> Edit Video
              </Button>
            ) : (
              <Button onClick={addToPlaylist} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Fetch Video
              </Button>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Button size="icon" variant="outline" onClick={playPrevious}>
                <SkipBack className="h-4 w-4" />
                <span className="sr-only">Previous video</span>
              </Button>
              <Button size="icon" variant="outline" onClick={togglePlayPause}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
              </Button>
              <Button size="icon" variant="outline" onClick={playNext}>
                <SkipForward className="h-4 w-4" />
                <span className="sr-only">Next video</span>
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
        </div>
      </div>
    </div>
  )
}