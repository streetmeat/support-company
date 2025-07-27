'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PuzzleGrid from './puzzle-grid';
import confetti from 'canvas-confetti';
import { AnyPuzzleEvent } from '@/lib/types/puzzle-events';

interface PuzzleContainerProps {
  conversationId: string;
  onComplete: () => void;
  onPuzzleSolved: (puzzleType: string) => void;
}

interface PuzzleData {
  prompt: string;
  images: Array<{
    src: string;
    alt: string;
    isCorrect: boolean;
  }>;
  type: 'hands' | 'fboy' | 'cute';
}

export default function PuzzleContainer({ 
  conversationId, 
  onComplete, 
  onPuzzleSolved 
}: PuzzleContainerProps) {
  const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleData | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [puzzleNumber, setPuzzleNumber] = useState(1);
  const [attemptCount, setAttemptCount] = useState(0);
  const [hasEmittedOpen, setHasEmittedOpen] = useState(false);
  
  // Helper to emit puzzle events to chat
  const emitPuzzleEvent = (event: AnyPuzzleEvent) => {
    console.log('Emitting puzzle event:', event);
    
    // Try to call the chat handler if it exists
    if (typeof window !== 'undefined' && (window as any).chatPuzzleEventHandler) {
      (window as any).chatPuzzleEventHandler(event);
    }
  };

  useEffect(() => {
    loadNextPuzzle();
  }, []);
  
  // Emit puzzle opened event when puzzle changes
  useEffect(() => {
    if (currentPuzzle && puzzleNumber > 0 && !hasEmittedOpen) {
      const timer = setTimeout(() => {
        emitPuzzleEvent({
          type: 'puzzle_opened',
          puzzleNumber: puzzleNumber,
          puzzleType: currentPuzzle.type,
          timestamp: new Date()
        });
        setHasEmittedOpen(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [currentPuzzle?.type, puzzleNumber]); // Only re-run when puzzle type or number changes

  const loadNextPuzzle = async () => {
    setIsLoading(true);
    setSelectedIndex(null);
    setShowResult(false);
    setAttemptCount(0);
    setHasEmittedOpen(false); // Reset for new puzzle

    try {
      const response = await fetch(`/api/puzzle?conversationId=${conversationId}`);
      const data = await response.json();

      if (data.error === 'All puzzles completed') {
        onComplete();
        return;
      }

      // Use the actual puzzle data from API
      const puzzleData: PuzzleData = {
        prompt: data.puzzleData.prompt,
        type: data.puzzleType,
        images: data.puzzleData.images || []
      };
      
      setCurrentPuzzle(puzzleData);
      setPuzzleNumber(data.puzzleNumber);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load puzzle:', error);
      setIsLoading(false);
    }
  };

  const handleSelection = async (index: number) => {
    if (selectedIndex !== null || !currentPuzzle) return;

    setSelectedIndex(index);
    const selected = currentPuzzle.images[index];
    setIsCorrect(selected.isCorrect);
    setShowResult(true);
    
    // Increment attempt count
    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);

    // Submit result to API
    try {
      await fetch('/api/puzzle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          puzzleType: currentPuzzle.type,
          correct: selected.isCorrect,
        }),
      });

      if (selected.isCorrect) {
        // Trigger confetti immediately
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        onPuzzleSolved(currentPuzzle.type);

        // Emit success event after a delay to ensure server state is updated
        setTimeout(() => {
          // Calculate expected state after this puzzle
          const expectedState = puzzleNumber === 1 ? 'puzzle1' : 
                               puzzleNumber === 2 ? 'puzzle2' : 
                               puzzleNumber === 3 ? 'completed' : 'completed';
          
          emitPuzzleEvent({
            type: 'puzzle_passed',
            puzzleNumber,
            puzzleType: currentPuzzle.type,
            attempts: newAttemptCount,
            timestamp: new Date(),
            expectedPuzzleState: expectedState
          });
        }, 1000); // Give server more time to update state

        // Load next puzzle after delay
        setTimeout(() => {
          loadNextPuzzle();
        }, 2500); // Slightly longer delay for better UX
      } else {
        // Emit failure event
        emitPuzzleEvent({
          type: 'puzzle_failed',
          puzzleNumber,
          puzzleType: currentPuzzle.type,
          attempts: newAttemptCount,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Failed to submit puzzle result:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFB500] mx-auto mb-4"></div>
          <p className="text-[#5A3A30]">Loading verification task...</p>
        </div>
      </div>
    );
  }

  if (!currentPuzzle) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPuzzle.type}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-8"
        >
          {/* Progress indicator */}
          <div className="flex justify-center space-x-2 mb-8">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`h-2 w-16 rounded-full transition-colors ${
                  num <= puzzleNumber ? 'bg-[#FFB500]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Puzzle prompt */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#351C15] mb-2">
              {currentPuzzle.prompt}
            </h2>
          </div>

          {/* Puzzle grid */}
          <PuzzleGrid
            images={currentPuzzle.images}
            selectedIndex={selectedIndex}
            onSelect={handleSelection}
            disabled={selectedIndex !== null}
          />

          {/* Result feedback */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                {isCorrect ? (
                  <div className="text-green-600">
                    <div className="text-6xl mb-2">✓</div>
                    <p className="text-2xl font-bold">PASSED!</p>
                    <p className="text-lg mt-2">Great job! Loading next task...</p>
                  </div>
                ) : (
                  <div className="text-red-600">
                    <div className="text-6xl mb-2">✗</div>
                    <p className="text-2xl font-bold">Incorrect</p>
                    <p className="text-lg mt-2">That&apos;s not quite right. Try again!</p>
                    <button
                      onClick={() => {
                        setSelectedIndex(null);
                        setShowResult(false);
                      }}
                      className="mt-4 px-6 py-2 bg-[#FFB500] text-[#351C15] rounded-lg hover:bg-[#FFC833] transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}