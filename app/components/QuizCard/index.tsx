"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
interface QuizCardProps {
    question: string;
    options: string[];
    correctAnswer: string;
    onAnswerSelected: (answer: string) => void;
    onReset: () => void;
    isGenerating: boolean;
}

export default function QuizCard({
                                     question,
                                     options,
                                     correctAnswer,
                                     onAnswerSelected,
                                     onReset,
                                     isGenerating
                                 }: QuizCardProps) {
    const [selectedAnswer, setSelectedAnswer] = useState("")
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
    const [attempts, setAttempts] = useState(0)

    const handleAnswerClick = (answer: string) => {
        setSelectedAnswer(answer)
        const correct = answer === correctAnswer
        setIsCorrect(correct)
        setAttempts(prev => prev + 1)
        if (correct) {
            onAnswerSelected(answer)
        }
    }
    const handleTryAgain = () => {
        setSelectedAnswer("")
        setIsCorrect(null)
    }
    const handleReset = () => {
        setSelectedAnswer("")
        setIsCorrect(null)
        onReset()
    }

    if (isGenerating) {
        return (
            <div className="w-full text-center p-4">
                <p className="text-sm font-medium">Generating question...</p>
            </div>
        )
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            <p className="text-base mb-4 text-center">{question}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {options.map((option, index) => (
                    <Button
                        key={index}
                        onClick={() => handleAnswerClick(option)}
                        variant={selectedAnswer === option ? (isCorrect ? "default" : "destructive") : "outline"}
                        className={`p-3 text-sm h-auto transition-all duration-200 break-words whitespace-normal ${
                            selectedAnswer === option
                                ? isCorrect
                                    ? "bg-green-500 hover:bg-green-600"
                                    : "bg-red-500 hover:bg-red-600"
                                : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                        disabled={isCorrect !== null}
                    >
                        {option}
                    </Button>
                ))}
            </div>
            {isCorrect === false && (
                <div className="text-center">
                    <p className="text-base font-medium text-red-600 mb-2">
                        Incorrect. {attempts < 2 ? "Try again!" : `The correct answer is ${correctAnswer}`}
                    </p>
                    {attempts < 2 && (
                        <Button onClick={handleTryAgain} variant="outline" className="mt-2">
                            Try Again
                        </Button>
                    )}
                    {attempts >= 2 && (
                        <Button onClick={onReset} variant="outline" className="mt-2">
                            Next Question
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}
