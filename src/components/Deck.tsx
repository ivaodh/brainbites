import React, { useRef, useEffect, useCallback, useState } from 'react';
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
  const activeCardRef = useRef<HTMLDivElement>(null);
  const nextCardRef = useRef<HTMLDivElement>(null);
  const prevCardRef = useRef<HTMLDivElement>(null);

  // Gesture tracking refs
  const isDragging = useRef<boolean>(false);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const startTime = useRef<number>(0);
  const isAnimating = useRef<boolean>(false);
  const rafId = useRef<number | null>(null);

  // Track drag direction state to show only the relevant incoming card during drag
  const [dragDirection, setDragDirection] = useState<'up' | 'down' | null>(null);

  const { light } = useHaptics();

  // Reset all card styles to clean idle state
  const resetCardStyles = useCallback(() => {
    if (activeCardRef.current) {
      activeCardRef.current.style.transition = 'transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.28s ease-out';
      activeCardRef.current.style.transform = 'translate3d(0, 0, 0)';
      activeCardRef.current.style.opacity = '1';
    }
    if (nextCardRef.current) {
      nextCardRef.current.style.transition = 'transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.28s ease-out';
      nextCardRef.current.style.transform = 'translate3d(0, calc(100% + 32px), 0)';
      nextCardRef.current.style.opacity = '0';
    }
    if (prevCardRef.current) {
      prevCardRef.current.style.transition = 'transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.28s ease-out';
      prevCardRef.current.style.transform = 'translate3d(0, calc(-100% - 32px), 0)';
      prevCardRef.current.style.opacity = '0';
    }
    setDragDirection(null);
  }, []);

  // Update card positions during drag with 120fps direct transform
  const updateDragTransforms = (diffY: number) => {
    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      const isTopBound = currentIndex === 0 && diffY > 0;
      const isBottomBound = currentIndex === bites.length - 1 && diffY < 0;
      const resistance = isTopBound || isBottomBound ? 0.25 : 1;
      const effectiveY = diffY * resistance;

      if (effectiveY < -4) {
        if (dragDirection !== 'up') setDragDirection('up');
      } else if (effectiveY > 4) {
        if (dragDirection !== 'down') setDragDirection('down');
      }

      // Active Card follows finger
      if (activeCardRef.current) {
        activeCardRef.current.style.transition = 'none';
        activeCardRef.current.style.transform = `translate3d(0, ${effectiveY}px, 0)`;
        activeCardRef.current.style.opacity = '1';
      }

      // Incoming Next Card (cleanly positioned below active card)
      if (effectiveY < 0 && nextCardRef.current) {
        nextCardRef.current.style.transition = 'none';
        nextCardRef.current.style.transform = `translate3d(0, calc(100% + 24px + ${effectiveY}px), 0)`;
        nextCardRef.current.style.opacity = '1';
      }

      // Incoming Prev Card (cleanly positioned above active card)
      if (effectiveY > 0 && prevCardRef.current) {
        prevCardRef.current.style.transition = 'none';
        prevCardRef.current.style.transform = `translate3d(0, calc(-100% - 24px + ${effectiveY}px), 0)`;
        prevCardRef.current.style.opacity = '1';
      }
    });
  };

  const handleNext = useCallback(() => {
    if (currentIndex < bites.length - 1 && !isAnimating.current) {
      isAnimating.current = true;
      setDragDirection('up');
      light();

      // Animate active card out to top
      if (activeCardRef.current) {
        activeCardRef.current.style.transition = 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.22s ease-out';
        activeCardRef.current.style.transform = 'translate3d(0, calc(-100% - 32px), 0)';
        activeCardRef.current.style.opacity = '0';
      }

      // Animate next card into view from bottom
      if (nextCardRef.current) {
        nextCardRef.current.style.transition = 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease-out';
        nextCardRef.current.style.transform = 'translate3d(0, 0, 0)';
        nextCardRef.current.style.opacity = '1';
      }

      setTimeout(() => {
        onChangeIndex(currentIndex + 1);
        resetCardStyles();
        isAnimating.current = false;
      }, 290);
    }
  }, [currentIndex, bites.length, onChangeIndex, light, resetCardStyles]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0 && !isAnimating.current) {
      isAnimating.current = true;
      setDragDirection('down');
      light();

      // Animate active card out to bottom
      if (activeCardRef.current) {
        activeCardRef.current.style.transition = 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.22s ease-out';
        activeCardRef.current.style.transform = 'translate3d(0, calc(100% + 32px), 0)';
        activeCardRef.current.style.opacity = '0';
      }

      // Animate prev card into view from top
      if (prevCardRef.current) {
        prevCardRef.current.style.transition = 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease-out';
        prevCardRef.current.style.transform = 'translate3d(0, 0, 0)';
        prevCardRef.current.style.opacity = '1';
      }

      setTimeout(() => {
        onChangeIndex(currentIndex - 1);
        resetCardStyles();
        isAnimating.current = false;
      }, 290);
    }
  }, [currentIndex, onChangeIndex, light, resetCardStyles]);

  // Pointer gesture handlers
  const onPointerDown = (e: React.PointerEvent) => {
    if (isAnimating.current) return;
    isDragging.current = true;
    startY.current = e.clientY;
    currentY.current = e.clientY;
    startTime.current = Date.now();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || isAnimating.current) return;
    currentY.current = e.clientY;
    const diff = currentY.current - startY.current;
    updateDragTransforms(diff);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current || isAnimating.current) return;
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);

    const diff = currentY.current - startY.current;
    const duration = Date.now() - startTime.current;
    const velocity = Math.abs(diff) / Math.max(duration, 1);

    const SWIPE_THRESHOLD = 50;
    const isFlick = velocity > 0.35 && Math.abs(diff) > 20;

    if ((diff < -SWIPE_THRESHOLD || (isFlick && diff < 0)) && currentIndex < bites.length - 1) {
      handleNext();
    } else if ((diff > SWIPE_THRESHOLD || (isFlick && diff > 0)) && currentIndex > 0) {
      handlePrev();
    } else {
      resetCardStyles();
    }
  };

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

  // Mouse Wheel / Trackpad scroll listener
  useEffect(() => {
    let lastWheelTime = 0;
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTime < 420 || isAnimating.current) return;

      if (Math.abs(e.deltaY) > 28) {
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

  // Clean initial state on index change
  useEffect(() => {
    resetCardStyles();
  }, [currentIndex, resetCardStyles]);

  if (!bites || bites.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center text-zinc-500">
        No BrainBits in this section.
      </div>
    );
  }

  const currentBite = bites[currentIndex];
  const nextBite = currentIndex < bites.length - 1 ? bites[currentIndex + 1] : null;
  const prevBite = currentIndex > 0 ? bites[currentIndex - 1] : null;

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="relative flex-1 w-full h-full flex flex-col items-center justify-center overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing"
    >
      {/* Dynamic Ambient Background Aura Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] rounded-full pointer-events-none blur-[150px] opacity-25 dark:opacity-40 transition-colors duration-700 ease-out"
        style={{
          backgroundColor: currentAura.hex,
        }}
      />

      {/* Clean Physical Card Stage (Single crisp card when idle, clean motion during swipe) */}
      <div className="relative z-10 w-full max-w-[440px] flex items-center justify-center px-4 will-change-transform">
        {/* PREVIOUS CARD (only rendered above when pulling down or during prev animation) */}
        {prevBite && (
          <div
            ref={prevCardRef}
            className={`absolute inset-x-0 pointer-events-none will-change-transform ${
              dragDirection === 'down' ? 'visible' : 'invisible'
            }`}
            style={{
              transform: 'translate3d(0, calc(-100% - 32px), 0)',
              opacity: 0,
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

        {/* ACTIVE CARD (The only card visible when idle) */}
        <div
          ref={activeCardRef}
          className="w-full relative z-20 will-change-transform"
          style={{
            transform: 'translate3d(0, 0, 0)',
            opacity: 1,
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

        {/* NEXT CARD (only rendered below when pulling up or during next animation) */}
        {nextBite && (
          <div
            ref={nextCardRef}
            className={`absolute inset-x-0 pointer-events-none will-change-transform ${
              dragDirection === 'up' ? 'visible' : 'invisible'
            }`}
            style={{
              transform: 'translate3d(0, calc(100% + 32px), 0)',
              opacity: 0,
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
