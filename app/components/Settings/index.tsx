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
    onSave: (numExercises: number, frequency: number, controls: number, selectedGames: Settings['games']) => void;
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
        onSave(localNumExercises, localFrequency, localControls, settings.games)
        onClose()
    }

    return (
        <div className="max-h-[80vh] overflow-y-auto">
            <div className="space-y-4 py-4 pb-4 w-full max-w-lg mx-auto px-4 sm:px-6">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Количество упражнений</Label>
                                <Input
                                    type="number"
                                    value={localNumExercises}
                                    onChange={(e) => setLocalNumExercises(Number(e.target.value))}
                                    min={1}
                                    max={20}
                                    className="mt-2 w-full"
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
                                    className="mt-2 w-full"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 py-2">
                            <Checkbox
                                id="controls"
                                checked={localControls === 1}
                                onCheckedChange={(checked) => setLocalControls(checked ? 1 : 0)}
                            />
                            <Label htmlFor="controls" className="text-sm sm:text-base">Показывать управление YouTube</Label>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-lg font-semibold block">Доступные игры</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="numbersGame" 
                                        checked={settings.games.numbersGame}
                                        onCheckedChange={(checked) => handleGameSettingChange('numbersGame', checked as boolean)}
                                    />
                                    <Label htmlFor="numbersGame" className="text-sm sm:text-base">Игра с числами</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="alphabetGame" 
                                        checked={settings.games.alphabetGame}
                                        onCheckedChange={(checked) => handleGameSettingChange('alphabetGame', checked as boolean)}
                                    />
                                    <Label htmlFor="alphabetGame" className="text-sm sm:text-base">Алфавит</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="ghostGame" 
                                        checked={settings.games.ghostGame}
                                        onCheckedChange={(checked) => handleGameSettingChange('ghostGame', checked as boolean)}
                                    />
                                    <Label htmlFor="ghostGame" className="text-sm sm:text-base">Призраки и цвета</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="wordMatchingGame" 
                                        checked={settings.games.wordMatchingGame}
                                        onCheckedChange={(checked) => handleGameSettingChange('wordMatchingGame', checked as boolean)}
                                    />
                                    <Label htmlFor="wordMatchingGame" className="text-sm sm:text-base">Сопоставление слов</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="syllableMatchingGame" 
                                        checked={settings.games.syllableMatchingGame}
                                        onCheckedChange={(checked) => handleGameSettingChange('syllableMatchingGame', checked as boolean)}
                                    />
                                    <Label htmlFor="syllableMatchingGame" className="text-sm sm:text-base">Слоги</Label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-2">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={onClose}
                            className="w-full sm:w-auto"
                        >
                            Отмена
                        </Button>
                        <Button 
                            type="submit" 
                            className="bg-blue-600 text-white w-full sm:w-auto"
                        >
                            Сохранить
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

