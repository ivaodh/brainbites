import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronUp } from 'lucide-react';
import { BrainBite, AuraColor } from '../types';
import { Card } from './Card';
import { useHaptics } from '../hooks/useHaptics';

interface DeckProps {
  bites: BrainBite[];
  currentIndex: number;
  currentAura: AuraColor;
  onChangeIndex: (newIndex: number) => void;
  isBookmarked: (bite: BrainBite) => boolean;
  onToggleBookmark: (bite: BrainBite) => void;
}

export const Deck: React.FC<DeckProps> = ({
  bites,
  currentIndex,
  currentAura,
  onChangeIndex,
  isBookmarked,
  onToggleBookmark,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const touchCurrentY = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const { light } = useHaptics();

  const handleNext = useCallback(() => {
    if (currentIndex < bites.length - 1 && !isAnimating) {
      light();
      setIsAnimating(true);
      onChangeIndex(currentIndex + 1);
      setTimeout(() => setIsAnimating(false), 280);
    }
  }, [currentIndex, bites.length, isAnimating, onChangeIndex, light]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0 && !isAnimating) {
      light();
      setIsAnimating(true);
      onChangeIndex(currentIndex - 1);
      setTimeout(() => setIsAnimating(false), 280);
    }
  }, [currentIndex, isAnimating, onChangeIndex, light]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'j') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Wheel / Trackpad listener with throttling
  useEffect(() => {
    let lastWheelTime = 0;
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTime < 400) return;

      if (Math.abs(e.deltaY) > 35) {
        lastWheelTime = now;
        if (e.deltaY > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    };

    const node = containerRef.current;
    if (node) {
      node.addEventListener('wheel', handleWheel, { passive: true });
      return () => node.removeEventListener('wheel', handleWheel);
    }
  }, [handleNext, handlePrev]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    touchCurrentY.current = e.touches[0].clientY;
    const diff = touchCurrentY.current - touchStartY.current;
    // Add rubber banding resistance
    const damped = Math.sign(diff) * Math.min(Math.abs(diff) * 0.4, 90);
    setDragOffset(damped);
  };

  const handleTouchEnd = () => {
    if (touchStartY.current !== null && touchCurrentY.current !== null) {
      const diff = touchCurrentY.current - touchStartY.current;
      const SWIPE_THRESHOLD = 50;

      if (diff < -SWIPE_THRESHOLD) {
        handleNext();
      } else if (diff > SWIPE_THRESHOLD) {
        handlePrev();
      }
    }
    touchStartY.current = null;
    touchCurrentY.current = null;
    setDragOffset(0);
  };

  if (!bites || bites.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center text-zinc-500">
        No Brain Bites in this category yet.
      </div>
    );
  }

  const currentBite = bites[currentIndex];

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative flex-1 w-full h-full flex flex-col items-center justify-center overflow-hidden touch-none"
    >
      {/* Dynamic Background Aura Radial Morph */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[550px] rounded-full pointer-events-none blur-[120px] opacity-25 dark:opacity-35 transition-all duration-700 ease-out"
        style={{
          backgroundColor: currentAura.hex,
          transform: `translate(-50%, ${dragOffset * 0.3}px)`,
        }}
      />

      {/* Card Carousel Wrapper */}
      <div
        className="relative z-10 w-full flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transform: `translateY(${dragOffset}px)`,
        }}
      >
        <Card
          bite={currentBite}
          aura={currentAura}
          isBookmarked={isBookmarked(currentBite)}
          onToggleBookmark={() => onToggleBookmark(currentBite)}
          index={currentIndex}
        />
      </div>

      {/* Subtle Swipe Cue Indicator */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 opacity-55 hover:opacity-100 transition-opacity pointer-events-none">
        <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
          <ChevronUp className="w-3.5 h-3.5 animate-bounce" />
          <span>Swipe or press &darr; for next</span>
        </div>
      </div>
    </div>
  );
};
