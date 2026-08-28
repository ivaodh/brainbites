import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronUp } from 'lucide-react';
import { BrainBite, AuraColor } from '../types';
import { Card } from './Card';
import { getAuraForIndex } from '../data/bites';

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
  onChangeIndex,
  isBookmarked,
  onToggleBookmark,
  isDark,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [transitionDirection, setTransitionDirection] = useState<'next' | 'prev' | 'reset' | null>(null);

  // Gesture tracking refs
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const lastTouchY = useRef<number>(0);
  const lastTouchTime = useRef<number>(0);
  const isHorizontalScroll = useRef<boolean | null>(null);
  const wheelLockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Transition to target index with smooth GPU slide
  const slideTo = useCallback(
    (direction: 'next' | 'prev') => {
      if (isTransitioning) return;

      if (direction === 'next' && currentIndex < bites.length - 1) {
        setIsTransitioning(true);
        setTransitionDirection('next');

        if (transitionTimer.current) clearTimeout(transitionTimer.current);
        transitionTimer.current = setTimeout(() => {
          onChangeIndex(currentIndex + 1);
          setDragY(0);
          setIsTransitioning(false);
          setTransitionDirection(null);
        }, 260);
      } else if (direction === 'prev' && currentIndex > 0) {
        setIsTransitioning(true);
        setTransitionDirection('prev');

        if (transitionTimer.current) clearTimeout(transitionTimer.current);
        transitionTimer.current = setTimeout(() => {
          onChangeIndex(currentIndex - 1);
          setDragY(0);
          setIsTransitioning(false);
          setTransitionDirection(null);
        }, 260);
      } else {
        // Snap back
        setIsTransitioning(true);
        setTransitionDirection('reset');
        setDragY(0);
        setTimeout(() => {
          setIsTransitioning(false);
          setTransitionDirection(null);
        }, 200);
      }
    },
    [bites.length, currentIndex, isTransitioning, onChangeIndex]
  );

  // Touch handlers for 1:1 fluid tracking
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isTransitioning) return;
    const touch = e.touches[0];
    touchStartY.current = touch.clientY;
    touchStartX.current = touch.clientX;
    touchStartTime.current = Date.now();
    lastTouchY.current = touch.clientY;
    lastTouchTime.current = Date.now();
    isHorizontalScroll.current = null;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isTransitioning) return;
    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStartY.current;
    const deltaX = touch.clientX - touchStartX.current;

    // Detect if user intended horizontal vs vertical swipe
    if (isHorizontalScroll.current === null) {
      if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
        isHorizontalScroll.current = true;
        return;
      } else if (Math.abs(deltaY) > 6) {
        isHorizontalScroll.current = false;
      }
    }

    if (isHorizontalScroll.current) return;

    // Apply boundary resistance
    let clampedDelta = deltaY;
    if ((currentIndex === 0 && deltaY > 0) || (currentIndex === bites.length - 1 && deltaY < 0)) {
      clampedDelta = deltaY * 0.3; // Rubber-band effect
    }

    setDragY(clampedDelta);
    lastTouchY.current = touch.clientY;
    lastTouchTime.current = Date.now();
  };

  const handleTouchEnd = () => {
    if (!isDragging || isTransitioning) return;
    setIsDragging(false);

    if (isHorizontalScroll.current) {
      setDragY(0);
      return;
    }

    const elapsed = Math.max(1, Date.now() - touchStartTime.current);
    const distance = dragY;
    const velocity = distance / elapsed; // px per ms

    // Threshold: either distance > 55px or fast flick (velocity > 0.4)
    if ((distance < -55 || velocity < -0.45) && currentIndex < bites.length - 1) {
      slideTo('next');
    } else if ((distance > 55 || velocity > 0.45) && currentIndex > 0) {
      slideTo('prev');
    } else {
      // Snap back to current
      setIsTransitioning(true);
      setTransitionDirection('reset');
      setDragY(0);
      setTimeout(() => {
        setIsTransitioning(false);
        setTransitionDirection(null);
      }, 200);
    }
  };

  // Trackpad / Mouse Wheel Support with velocity lock
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isTransitioning || wheelLockTimer.current) return;

      if (Math.abs(e.deltaY) > 24) {
        if (e.deltaY > 0 && currentIndex < bites.length - 1) {
          slideTo('next');
        } else if (e.deltaY < 0 && currentIndex > 0) {
          slideTo('prev');
        }

        // Lock wheel for 320ms to prevent skipping multiple cards per swipe
        wheelLockTimer.current = setTimeout(() => {
          wheelLockTimer.current = null;
        }, 320);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [currentIndex, bites.length, isTransitioning, slideTo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning) return;

      if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'j') {
        e.preventDefault();
        slideTo('next');
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        slideTo('prev');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTransitioning, slideTo]);

  if (!bites || bites.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center text-zinc-500">
        No BrainBits in this section.
      </div>
    );
  }

  // 3-Slot Window: previous (-1), current (0), next (+1)
  const slots: { slotIndex: number; biteIndex: number }[] = [];
  if (currentIndex > 0) {
    slots.push({ slotIndex: -1, biteIndex: currentIndex - 1 });
  }
  slots.push({ slotIndex: 0, biteIndex: currentIndex });
  if (currentIndex < bites.length - 1) {
    slots.push({ slotIndex: 1, biteIndex: currentIndex + 1 });
  }

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden touch-none select-none"
      style={{ touchAction: 'none' }}
    >
      {/* 3-Card Physical Deck */}
      <div className="relative w-full h-full flex items-center justify-center">
        {slots.map(({ slotIndex, biteIndex }) => {
          const bite = bites[biteIndex];
          const aura = getAuraForIndex(biteIndex);

          // Calculate transform offset
          let translateY = slotIndex * 100;
          let transitionStyle = 'none';

          if (isTransitioning) {
            transitionStyle = 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1), opacity 260ms ease-out';
            if (transitionDirection === 'next') {
              translateY = (slotIndex - 1) * 100;
            } else if (transitionDirection === 'prev') {
              translateY = (slotIndex + 1) * 100;
            } else if (transitionDirection === 'reset') {
              translateY = slotIndex * 100;
            }
          }

          const isCurrent = slotIndex === 0;

          return (
            <div
              key={`${biteIndex}_${bite.text.substring(0, 15)}`}
              className="absolute inset-0 w-full h-full flex items-center justify-center px-4 gpu-layer"
              style={{
                transform: isDragging
                  ? `translate3d(0, calc(${slotIndex * 100}% + ${dragY}px), 0)`
                  : `translate3d(0, ${translateY}%, 0)`,
                transition: transitionStyle,
                paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 52px), 58px)',
                paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 68px), 74px)',
                opacity: isCurrent ? 1 : Math.max(0.4, 1 - Math.abs(slotIndex) * 0.4),
                willChange: isDragging || isTransitioning ? 'transform' : 'auto',
                pointerEvents: isCurrent ? 'auto' : 'none',
              }}
            >
              <Card
                bite={bite}
                aura={aura}
                isBookmarked={isBookmarked(bite)}
                onToggleBookmark={() => onToggleBookmark(bite)}
                index={biteIndex}
                isDark={isDark}
              />
            </div>
          );
        })}
      </div>

      {/* Subtle Swipe Cue Indicator */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 opacity-40 hover:opacity-80 transition-opacity pointer-events-none">
        <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
          <ChevronUp className="w-3.5 h-3.5 animate-bounce" />
          <span>Swipe for next</span>
        </div>
      </div>
    </div>
  );
};

