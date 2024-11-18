"use client"

import { useState } from "react"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"

interface ExerciseSettingsProps {
    numExercises: number;
    frequency: number;
    controls: number;
    debugMode: boolean;
    onSave: (numExercises: number, frequency: number, controls: number, debugMode: boolean) => void;
    onClose: () => void;
}

export default function ExerciseSettings({ numExercises = 5, frequency = 3, controls = 1, debugMode = false, onSave, onClose }: ExerciseSettingsProps) {
    const [localNumExercises, setLocalNumExercises] = useState(numExercises)
    const [localFrequency, setLocalFrequency] = useState(frequency)
    const [localControls, setLocalControls] = useState(controls)
    const [localDebugMode, setLocalDebugMode] = useState(debugMode)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(localNumExercises, localFrequency, localControls, localDebugMode)
        toast.success(`Settings saved successfully.`, {
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
                        <Label htmlFor="numExercises">Number of Exercises (inside the quiz)</Label>
                        <Input
                            id="numExercises"
                            type="number"
                            value={localNumExercises}
                            onChange={(e) => setLocalNumExercises(Number(e.target.value))}
                            min={1}
                            max={20}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="frequency">Frequency (show exercise every x minutes)</Label>
                        <Input
                            id="frequency"
                            type="number"
                            value={localFrequency}
                            onChange={(e) => setLocalFrequency(Number(e.target.value))}
                            min={1}
                            max={60}
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="controls"
                            checked={localControls === 1}
                            onCheckedChange={(checked) => setLocalControls(checked ? 1 : 0)}
                        />
                        <Label htmlFor="controls">Show YouTube controls (player options)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="debugMode"
                            checked={localDebugMode}
                            onCheckedChange={(checked) => setLocalDebugMode(checked as boolean)}
                        />
                        <Label htmlFor="debugMode">Debug Mode</Label>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full">Save Settings</Button>
                </CardFooter>
            </form>
        </div>
    )
}
