"use client"

import { useState } from "react"
import { CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface ContentViewProps {
  content: {
    videoUrl: string;
    playlistUrl: string;
  };
  onSave: (content: { videoUrl: string; playlistUrl: string }) => void;
  onClose: () => void;
}

export default function ContentView({ content, onSave, onClose }: ContentViewProps) {
  const [videoUrl, setVideoUrl] = useState(content.videoUrl)
  const [playlistUrl, setPlaylistUrl] = useState(content.playlistUrl)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ videoUrl, playlistUrl })
    toast.success(`Content URLs saved successfully.`, {
      action: {
        label: "Hide",
        onClick: () => onClose(),
      },
    })
    onClose()
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              id="videoUrl"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Save URLs</Button>
        </CardFooter>
      </form>
    </div>
  )
}