import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronUp } from 'lucide-react';
import { BrainBite, AuraColor } from '../types';
import { Card } from './Card';
import { getAuraForIndex } from '../data/bites';
import { useHaptics } from '../hooks/useHaptics';

interface DeckProps {
  bites: BrainBite[];
  currentIndex: number;
  currentAura: AuraColor;
  onChangeIndex: (newIndex: number) => void;
  isBookmarked: (bite: BrainBite) => boolean;
  onToggleBookmark: (bite: BrainBite) => void;
  isDark: boolean;
}

export const Deck: React.FC<DeckProps> = ({
  bites,
  currentIndex,
  currentAura,
  onChangeIndex,
  isBookmarked,
  onToggleBookmark,
  isDark,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const touchCurrentY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);

  const [dragOffset, setDragOffset] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const { light } = useHaptics();

  const handleNext = useCallback(() => {
    if (currentIndex < bites.length - 1 && !isTransitioning) {
      light();
      setIsTransitioning(true);
      setSlideDirection('next');

      setTimeout(() => {
        onChangeIndex(currentIndex + 1);
        setSlideDirection(null);
        setIsTransitioning(false);
      }, 260);
    }
  }, [currentIndex, bites.length, isTransitioning, onChangeIndex, light]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0 && !isTransitioning) {
      light();
      setIsTransitioning(true);
      setSlideDirection('prev');

      setTimeout(() => {
        onChangeIndex(currentIndex - 1);
        setSlideDirection(null);
        setIsTransitioning(false);
      }, 260);
    }
  }, [currentIndex, isTransitioning, onChangeIndex, light]);

  // Keyboard Navigation
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

  // Mouse Wheel / Trackpad with acceleration throttling
  useEffect(() => {
    let lastWheelTime = 0;
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTime < 450) return;

      if (Math.abs(e.deltaY) > 30) {
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

  // Touch Drag Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isTransitioning) return;
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null || isTransitioning) return;
    touchCurrentY.current = e.touches[0].clientY;
    const diff = touchCurrentY.current - touchStartY.current;

    // Resistance at bounds
    if ((currentIndex === 0 && diff > 0) || (currentIndex === bites.length - 1 && diff < 0)) {
      setDragOffset(diff * 0.25);
    } else {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartY.current !== null && touchCurrentY.current !== null && !isTransitioning) {
      const diff = touchCurrentY.current - touchStartY.current;
      const duration = Date.now() - touchStartTime.current;
      const velocity = Math.abs(diff) / Math.max(duration, 1);

      const SWIPE_THRESHOLD = 50;
      const isFastFlick = velocity > 0.45 && Math.abs(diff) > 25;

      if ((diff < -SWIPE_THRESHOLD || (isFastFlick && diff < 0)) && currentIndex < bites.length - 1) {
        // Swipe Up -> Next
        light();
        setIsTransitioning(true);
        setSlideDirection('next');
        setTimeout(() => {
          onChangeIndex(currentIndex + 1);
          setSlideDirection(null);
          setDragOffset(0);
          setIsTransitioning(false);
        }, 220);
      } else if ((diff > SWIPE_THRESHOLD || (isFastFlick && diff > 0)) && currentIndex > 0) {
        // Swipe Down -> Prev
        light();
        setIsTransitioning(true);
        setSlideDirection('prev');
        setTimeout(() => {
          onChangeIndex(currentIndex - 1);
          setSlideDirection(null);
          setDragOffset(0);
          setIsTransitioning(false);
        }, 220);
      } else {
        // Snap back
        setDragOffset(0);
      }
    }
    touchStartY.current = null;
    touchCurrentY.current = null;
  };

  if (!bites || bites.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center text-zinc-500">
        No Brain Bites available in this section.
      </div>
    );
  }

  const currentBite = bites[currentIndex];
  const nextBite = currentIndex < bites.length - 1 ? bites[currentIndex + 1] : null;
  const prevBite = currentIndex > 0 ? bites[currentIndex - 1] : null;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative flex-1 w-full h-full flex flex-col items-center justify-center overflow-hidden touch-none"
    >
      {/* Dynamic Ambient Background Aura Radial Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full pointer-events-none blur-[140px] opacity-25 dark:opacity-40 transition-all duration-700 ease-out"
        style={{
          backgroundColor: currentAura.hex,
          transform: `translate(-50%, calc(-50% + ${dragOffset * 0.25}px))`,
        }}
      />

      {/* Card Deck Stage */}
      <div className="relative z-10 w-full max-w-[440px] flex items-center justify-center px-4">
        {/* Previous Card (visible when pulling down) */}
        {prevBite && dragOffset > 10 && (
          <div
            className="absolute inset-x-0 transition-opacity duration-200 pointer-events-none"
            style={{
              transform: `translateY(calc(-100% + ${dragOffset}px - 20px)) scale(0.94)`,
              opacity: Math.min(dragOffset / 120, 0.9),
            }}
          >
            <Card
              bite={prevBite}
              aura={getAuraForIndex(currentIndex - 1)}
              isBookmarked={isBookmarked(prevBite)}
              onToggleBookmark={() => {}}
              index={currentIndex - 1}
              isDark={isDark}
            />
          </div>
        )}

        {/* Current Active Physical Card */}
        <div
          className={`w-full transition-all ease-out ${
            isTransitioning ? 'duration-250' : dragOffset === 0 ? 'duration-300' : 'duration-0'
          }`}
          style={{
            transform:
              slideDirection === 'next'
                ? 'translateY(-110%) scale(0.92)'
                : slideDirection === 'prev'
                ? 'translateY(110%) scale(0.92)'
                : `translateY(${dragOffset}px) scale(${1 - Math.abs(dragOffset) * 0.0004})`,
            opacity: isTransitioning ? 0.3 : 1,
          }}
        >
          <Card
            bite={currentBite}
            aura={currentAura}
            isBookmarked={isBookmarked(currentBite)}
            onToggleBookmark={() => onToggleBookmark(currentBite)}
            index={currentIndex}
            isDark={isDark}
          />
        </div>

        {/* Next Card (visible when pulling up or during next transition) */}
        {nextBite && (dragOffset < -10 || slideDirection === 'next') && (
          <div
            className={`absolute inset-x-0 pointer-events-none transition-all ${
              isTransitioning ? 'duration-250 ease-out' : 'duration-0'
            }`}
            style={{
              transform:
                slideDirection === 'next'
                  ? 'translateY(0) scale(1)'
                  : `translateY(calc(100% + ${dragOffset}px + 20px)) scale(${
                      0.92 + Math.min(Math.abs(dragOffset) / 300, 0.08)
                    })`,
              opacity: slideDirection === 'next' ? 1 : Math.min(Math.abs(dragOffset) / 80, 0.85),
            }}
          >
            <Card
              bite={nextBite}
              aura={getAuraForIndex(currentIndex + 1)}
              isBookmarked={isBookmarked(nextBite)}
              onToggleBookmark={() => {}}
              index={currentIndex + 1}
              isDark={isDark}
            />
          </div>
        )}
      </div>

      {/* Subtle Swipe Cue Indicator */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 opacity-50 hover:opacity-90 transition-opacity pointer-events-none">
        <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
          <ChevronUp className="w-3.5 h-3.5 animate-bounce" />
          <span>Swipe for next</span>
        </div>
      </div>
    </div>
  );
};
