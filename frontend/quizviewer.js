import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function QuizViewer({ questions }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        No quiz questions available yet
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleAnswerSelect = (answer) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    setShowResult(true);
    if (selectedAnswer === currentQuestion.correct_answer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setCompleted(false);
  };

  if (completed) {
    return (
      <Card className="max-w-2xl mx-auto bg-gradient-to-br from-purple-50 to-blue-50">
        <CardContent className="p-12 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Quiz Completed!</h2>
          <div className="text-5xl font-bold text-purple-600 mb-2">
            {score} / {questions.length}
          </div>
          <p className="text-slate-600 mb-8">
            {score === questions.length ? "Perfect score! Outstanding!" : 
             score >= questions.length * 0.7 ? "Great job!" : 
             "Keep studying!"}
          </p>
          <Button onClick={handleRestart} size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <span>Score: {score}</span>
      </div>

      <Card>
        <CardContent className="p-8">
          <h3 className="text-xl font-semibold text-slate-800 mb-6">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => {
              const isCorrect = option === currentQuestion.correct_answer;
              const isSelected = option === selectedAnswer;
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showResult}
                  className={cn(
                    "w-full p-4 text-left rounded-xl border-2 transition-all",
                    !showResult && "hover:border-purple-300 hover:bg-purple-50",
                    isSelected && !showResult && "border-purple-500 bg-purple-50",
                    showResult && isCorrect && "border-green-500 bg-green-50",
                    showResult && isSelected && !isCorrect && "border-red-500 bg-red-50",
                    !showResult && !isSelected && "border-slate-200"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-800">{option}</span>
                    {showResult && isCorrect && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600" />}
                  </div>
                </button>
              );
            })}
          </div>

          {showResult && currentQuestion.explanation && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-6">
              <p className="text-sm text-blue-900">
                <strong>Explanation:</strong> {currentQuestion.explanation}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            {!showResult ? (
              <Button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNext} className="bg-gradient-to-r from-purple-600 to-blue-600">
                {currentIndex < questions.length - 1 ? (
                  <>
                    Next Question <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  "View Results"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}