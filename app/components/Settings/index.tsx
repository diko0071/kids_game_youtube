"use client"

import React, { useEffect, useState } from 'react'
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Settings, DEFAULT_SETTINGS } from './types'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface ExerciseSettingsProps {
    numExercises: number;
    frequency: number;
    controls: number;
    onSave: (numExercises: number, frequency: number, controls: number) => void;
    onClose: () => void;
}

export default function ExerciseSettings({ 
    numExercises = 5, 
    frequency = 3, 
    controls = 1, 
    onSave, 
    onClose 
}: ExerciseSettingsProps) {
    const [localNumExercises, setLocalNumExercises] = useState(numExercises)
    const [localFrequency, setLocalFrequency] = useState(frequency)
    const [localControls, setLocalControls] = useState(controls)
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)

    useEffect(() => {
        const savedSettings = localStorage.getItem('settings')
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings))
        }
    }, [])

    const handleGameSettingChange = (key: keyof Settings['games'], value: boolean) => {
        const newGames = { ...settings.games, [key]: value }
        const newSettings = { ...settings, games: newGames }
        setSettings(newSettings)
        localStorage.setItem('settings', JSON.stringify(newSettings))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(localNumExercises, localFrequency, localControls)
        onClose()
    }

    return (
        <div className="space-y-4 py-4 pb-4">
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <Label>Количество упражнений</Label>
                        <Input
                            type="number"
                            value={localNumExercises}
                            onChange={(e) => setLocalNumExercises(Number(e.target.value))}
                            min={1}
                            max={20}
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <Label>Частота показа (минуты)</Label>
                        <Input
                            type="number"
                            value={localFrequency}
                            onChange={(e) => setLocalFrequency(Number(e.target.value))}
                            min={1}
                            max={60}
                            className="mt-2"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="controls"
                            checked={localControls === 1}
                            onCheckedChange={(checked) => setLocalControls(checked ? 1 : 0)}
                        />
                        <Label htmlFor="controls">Показывать управление YouTube</Label>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-lg font-semibold">Доступные игры</Label>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="numbersGame" 
                                    checked={settings.games.numbersGame}
                                    onCheckedChange={(checked) => handleGameSettingChange('numbersGame', checked as boolean)}
                                />
                                <Label htmlFor="numbersGame">Игра с числами</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="alphabetGame" 
                                    checked={settings.games.alphabetGame}
                                    onCheckedChange={(checked) => handleGameSettingChange('alphabetGame', checked as boolean)}
                                />
                                <Label htmlFor="alphabetGame">Алфавит</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="ghostGame" 
                                    checked={settings.games.ghostGame}
                                    onCheckedChange={(checked) => handleGameSettingChange('ghostGame', checked as boolean)}
                                />
                                <Label htmlFor="ghostGame">Призраки и цвета</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="wordMatchingGame" 
                                    checked={settings.games.wordMatchingGame}
                                    onCheckedChange={(checked) => handleGameSettingChange('wordMatchingGame', checked as boolean)}
                                />
                                <Label htmlFor="wordMatchingGame">Сопоставление слов</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="syllableMatchingGame" 
                                    checked={settings.games.syllableMatchingGame}
                                    onCheckedChange={(checked) => handleGameSettingChange('syllableMatchingGame', checked as boolean)}
                                />
                                <Label htmlFor="syllableMatchingGame">Слоги</Label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button type="submit" className="bg-blue-600 text-white">
                        Сохранить
                    </Button>
                </div>
            </form>
        </div>
    )
}
