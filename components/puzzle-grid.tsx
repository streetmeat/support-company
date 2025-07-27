'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface PuzzleGridProps {
  images: Array<{
    src: string;
    alt: string;
    isCorrect: boolean;
  }>;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export default function PuzzleGrid({ 
  images, 
  selectedIndex, 
  onSelect, 
  disabled = false 
}: PuzzleGridProps) {
  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
      role="radiogroup"
      aria-label="Select an image"
    >
      {images.map((image, index) => {
        const isSelected = selectedIndex === index;
        const showResult = selectedIndex !== null;
        const isCorrectChoice = showResult && image.isCorrect;
        const isWrongChoice = showResult && isSelected && !image.isCorrect;

        return (
          <motion.button
            key={index}
            onClick={() => !disabled && onSelect(index)}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            className={`
              relative overflow-hidden rounded-lg border-4 transition-all
              ${!showResult ? 'border-gray-300 hover:border-[#FFB500]' : ''}
              ${isCorrectChoice ? 'border-green-500 ring-4 ring-green-200' : ''}
              ${isWrongChoice ? 'border-red-500 ring-4 ring-red-200' : ''}
              ${showResult && !isSelected && !isCorrectChoice ? 'border-gray-300 opacity-50' : ''}
              ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              focus:outline-none focus:ring-4 focus:ring-[#FFB500] focus:ring-opacity-50
            `}
            role="radio"
            aria-checked={isSelected}
            aria-label={`Option ${index + 1}: ${image.alt}`}
          >
            {/* Image container with aspect ratio */}
            <div className="relative w-full aspect-square bg-gray-100">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
              
              {/* Selection overlay */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`
                    absolute inset-0 flex items-center justify-center
                    ${isCorrectChoice ? 'bg-green-500/20' : 'bg-red-500/20'}
                  `}
                >
                  <div className={`
                    rounded-full p-4 ${isCorrectChoice ? 'bg-green-500' : 'bg-red-500'}
                  `}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="text-white text-4xl font-bold"
                    >
                      {isCorrectChoice ? '✓' : '✗'}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Hover effect for unselected state */}
            {!showResult && (
              <motion.div
                className="absolute inset-0 bg-[#FFB500]/0 hover:bg-[#FFB500]/10 transition-colors"
                aria-hidden="true"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}