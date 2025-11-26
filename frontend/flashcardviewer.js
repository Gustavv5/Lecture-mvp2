import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function FlashcardViewer({ flashcards }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        No flashcards available yet
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-sm text-slate-500 font-medium">
        Card {currentIndex + 1} of {flashcards.length}
      </div>

      <div
        className="relative w-full max-w-2xl h-80 cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={cn(
            "absolute inset-0 transition-all duration-500 transform-style-3d",
            isFlipped && "rotate-y-180"
          )}
        >
          {/* Front */}
          <Card
            className={cn(
              "absolute inset-0 p-8 flex flex-col items-center justify-center backface-hidden bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200",
              isFlipped && "invisible"
            )}
          >
            <div className="text-xs text-purple-600 font-semibold mb-4">QUESTION</div>
            <p className="text-xl font-medium text-center text-slate-800">
              {currentCard.question}
            </p>
            <div className="mt-8 text-sm text-slate-400">
              Click to reveal answer
            </div>
          </Card>

          {/* Back */}
          <Card
            className={cn(
              "absolute inset-0 p-8 flex flex-col items-center justify-center backface-hidden bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rotate-y-180",
              !isFlipped && "invisible"
            )}
          >
            <div className="text-xs text-blue-600 font-semibold mb-4">ANSWER</div>
            <p className="text-xl text-center text-slate-800">
              {currentCard.answer}
            </p>
            <div className="mt-8 text-sm text-slate-400">
              Click to see question
            </div>
          </Card>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={flashcards.length <= 1}
          className="h-12 w-12 rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsFlipped(!isFlipped)}
          className="h-12 w-12 rounded-full"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={flashcards.length <= 1}
          className="h-12 w-12 rounded-full"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}