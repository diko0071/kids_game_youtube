"use client"

import { useState } from "react"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface ContentViewProps {
    content: {
        videoUrl: string;
        videoId: string;
    };
    onSave: (content: { videoUrl: string; videoId: string }) => void;
    onClose: () => void;
}

export default function ContentView({ content, onSave, onClose }: ContentViewProps) {
    const [localVideoUrl, setLocalVideoUrl] = useState(content.videoUrl)
    const [localVideoId, setLocalVideoId] = useState(content.videoId)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave({ videoUrl: localVideoUrl, videoId: localVideoId })
        toast.success(`Content saved successfully.`, {
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
                        <Label htmlFor="videoUrl">Video URL</Label>
                        <Input
                            id="videoUrl"
                            type="text"
                            value={localVideoUrl}
                            onChange={(e) => setLocalVideoUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="videoId">Video ID (optional)</Label>
                        <Input
                            id="videoId"
                            type="text"
                            value={localVideoId}
                            onChange={(e) => setLocalVideoId(e.target.value)}
                            placeholder="xxxxxxxxxxxxxxxx"
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full">Save Content</Button>
                </CardFooter>
            </form>
        </div>
    )
}

