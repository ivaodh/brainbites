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
  currentAura,
  onChangeIndex,
  isBookmarked,
  onToggleBookmark,
  isDark,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number>(() => {
    return typeof window !== 'undefined' ? window.innerHeight : 800;
  });

  // Track whether the user is actively touching or scrolling manually
  const isUserTouching = useRef<boolean>(false);
  const isProgrammaticScrolling = useRef<boolean>(false);
  const scrollSettleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Measure container height accurately
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const h = containerRef.current.clientHeight;
        if (h > 0) setContainerHeight(h);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    const observer = new ResizeObserver(updateHeight);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      window.removeEventListener('resize', updateHeight);
      observer.disconnect();
    };
  }, []);

  // Programmatic smooth scroll ONLY when currentIndex is changed externally (buttons, jump, keyboard)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || containerHeight <= 0) return;

    // If user is actively touching/dragging, let native scroll handle it
    if (isUserTouching.current) return;

    const targetTop = currentIndex * containerHeight;
    const currentTop = container.scrollTop;

    // Only scroll if there's a real offset difference (e.g. button clicked)
    if (Math.abs(currentTop - targetTop) > 10) {
      isProgrammaticScrolling.current = true;

      container.scrollTo({
        top: targetTop,
        behavior: 'smooth',
      });

      if (scrollSettleTimer.current) clearTimeout(scrollSettleTimer.current);
      scrollSettleTimer.current = setTimeout(() => {
        isProgrammaticScrolling.current = false;
      }, 350);
    }
  }, [currentIndex, containerHeight]);

  // Settle listener: updates index ONLY after scroll finishes (zero lag during swipe)
  const handleScrollSettle = useCallback(() => {
    if (isProgrammaticScrolling.current) return;

    const container = containerRef.current;
    if (!container || containerHeight <= 0) return;

    const scrollTop = container.scrollTop;
    const settledIndex = Math.round(scrollTop / containerHeight);

    if (settledIndex >= 0 && settledIndex < bites.length && settledIndex !== currentIndex) {
      onChangeIndex(settledIndex);
    }
  }, [bites.length, containerHeight, currentIndex, onChangeIndex]);

  // Handle scroll events with debounced settle detection
  const handleScroll = useCallback(() => {
    if (isProgrammaticScrolling.current) return;

    // Reset settle timer on every scroll tick
    if (scrollSettleTimer.current) clearTimeout(scrollSettleTimer.current);
    scrollSettleTimer.current = setTimeout(() => {
      handleScrollSettle();
    }, 120);
  }, [handleScrollSettle]);

  // Native 'scrollend' event support (modern browsers)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScrollEnd = () => {
      if (scrollSettleTimer.current) clearTimeout(scrollSettleTimer.current);
      handleScrollSettle();
    };

    container.addEventListener('scrollend', onScrollEnd);
    return () => container.removeEventListener('scrollend', onScrollEnd);
  }, [handleScrollSettle]);

  // User touch & pointer listeners to avoid programmatic conflicts
  const handleTouchStart = () => {
    isUserTouching.current = true;
    isProgrammaticScrolling.current = false;
  };

  const handleTouchEnd = () => {
    isUserTouching.current = false;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const container = containerRef.current;
      if (!container || containerHeight <= 0) return;

      if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'j') {
        e.preventDefault();
        if (currentIndex < bites.length - 1) {
          onChangeIndex(currentIndex + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        if (currentIndex > 0) {
          onChangeIndex(currentIndex - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, bites.length, containerHeight, onChangeIndex]);

  if (!bites || bites.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center text-zinc-500">
        No BrainBits in this section.
      </div>
    );
  }

  // Generous virtual window (renders ±5 cards around active view to prevent any spacer jumping)
  const windowSize = 5;
  const startIdx = Math.max(0, currentIndex - windowSize);
  const endIdx = Math.min(bites.length, currentIndex + windowSize + 1);

  const topSpacerHeight = startIdx * containerHeight;
  const bottomSpacerHeight = (bites.length - endIdx) * containerHeight;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {/* Ambient Background Aura Radial Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] rounded-full pointer-events-none blur-[150px] opacity-25 dark:opacity-40 transition-colors duration-700 ease-out"
        style={{
          backgroundColor: currentAura.hex,
        }}
      />

      {/* 100% Native Continuous Vertical Scroll-Snap Track */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onPointerDown={handleTouchStart}
        onPointerUp={handleTouchEnd}
        className="relative z-10 w-full h-full overflow-y-auto no-scrollbar overscroll-y-contain select-none"
        style={{
          scrollSnapType: 'y mandatory',
        }}
      >
        {/* Top Virtual Spacer */}
        {topSpacerHeight > 0 && (
          <div style={{ height: `${topSpacerHeight}px` }} aria-hidden="true" />
        )}

        {/* Visible Window of Cards in Continuous Physical Track */}
        {bites.slice(startIdx, endIdx).map((bite, i) => {
          const actualIndex = startIdx + i;
          const aura = getAuraForIndex(actualIndex);

          return (
            <div
              key={`${actualIndex}_${bite.text.substring(0, 15)}`}
              data-card-index={actualIndex}
              className="w-full flex items-center justify-center px-4"
              style={{
                height: `${containerHeight}px`,
                paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 56px), 64px)',
                paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 64px), 72px)',
                scrollSnapAlign: 'center',
                scrollSnapStop: 'always',
              }}
            >
              <Card
                bite={bite}
                aura={aura}
                isBookmarked={isBookmarked(bite)}
                onToggleBookmark={() => onToggleBookmark(bite)}
                index={actualIndex}
                isDark={isDark}
              />
            </div>
          );
        })}

        {/* Bottom Virtual Spacer */}
        {bottomSpacerHeight > 0 && (
          <div style={{ height: `${bottomSpacerHeight}px` }} aria-hidden="true" />
        )}
      </div>

      {/* Subtle Swipe Cue Indicator */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 opacity-50 hover:opacity-90 transition-opacity pointer-events-none">
        <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
          <ChevronUp className="w-3.5 h-3.5 animate-bounce" />
          <span>Swipe or scroll for next</span>
        </div>
      </div>
    </div>
  );
};
