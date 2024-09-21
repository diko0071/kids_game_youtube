"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"

interface QuizCardProps {
  question: string;
  options: string[];
  correctAnswer: string;
  onAnswerSelected: (answer: string) => void;
  onReset: () => void;
  isGenerating: boolean;
}

export default function SingleQuizCard({ 
  question, 
  options, 
  correctAnswer, 
  onAnswerSelected, 
  onReset,
  isGenerating 
}: QuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  const handleAnswerClick = (answer: string) => {
    setSelectedAnswer(answer)
    setIsCorrect(answer === correctAnswer)
    onAnswerSelected(answer)
  }

  const handleReset = () => {
    setSelectedAnswer("")
    setIsCorrect(null)
    onReset()
  }

  if (isGenerating) {
    return (
      <Card className="w-full">
        <CardContent className="text-center p-4">
          <p className="text-base font-medium">Generating...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl font-bold mb-2">Quiz Question</CardTitle>
        <CardDescription className="text-base">
          {question}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 pt-2">
        {options.map((option, index) => (
          <Button
            key={index}
            onClick={() => handleAnswerClick(option)}
            variant={selectedAnswer === option ? (isCorrect ? "default" : "destructive") : "outline"}
            className="p-3 text-sm h-auto"
            disabled={selectedAnswer !== ""}
          >
            {option}
          </Button>
        ))}
      </CardContent>
      <CardFooter className="flex justify-center pt-2">
        {isCorrect !== null && (
          <p className={`text-base font-medium ${isCorrect ? "text-green-600" : "text-red-600"}`}>
            {isCorrect ? "Correct!" : `Incorrect. The correct answer is ${correctAnswer}`}
          </p>
        )}
      </CardFooter>
    </Card>
  )
}