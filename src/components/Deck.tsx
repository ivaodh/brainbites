import React, { useRef, useEffect, useState, useCallback } from 'react';
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
  const [containerHeight, setContainerHeight] = useState<number>(() => {
    return typeof window !== 'undefined' ? window.innerHeight : 800;
  });

  const isScrollingProgrammatically = useRef<boolean>(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastReportedIndex = useRef<number>(currentIndex);

  const { light } = useHaptics();

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

  // Sync scroll position when currentIndex changes externally (buttons, jump, random)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || containerHeight <= 0) return;

    const targetTop = currentIndex * containerHeight;
    const currentTop = container.scrollTop;

    if (Math.abs(currentTop - targetTop) > 6) {
      isScrollingProgrammatically.current = true;
      lastReportedIndex.current = currentIndex;

      container.scrollTo({
        top: targetTop,
        behavior: 'smooth',
      });

      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 400);
    }
  }, [currentIndex, containerHeight]);

  // Handle native scroll and snap change detection
  const handleScroll = useCallback(() => {
    if (isScrollingProgrammatically.current || containerHeight <= 0) return;

    const container = containerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const newIdx = Math.round(scrollTop / containerHeight);

    if (newIdx >= 0 && newIdx < bites.length && newIdx !== lastReportedIndex.current) {
      lastReportedIndex.current = newIdx;
      light();
      onChangeIndex(newIdx);
    }
  }, [bites.length, containerHeight, onChangeIndex, light]);

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

  // Virtual window calculation (renders 7 cards around current view for 0 memory overhead)
  const windowSize = 3;
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

      {/* Native Continuous Vertical Scroll-Snap Track */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="relative z-10 w-full h-full overflow-y-auto no-scrollbar overscroll-y-contain select-none"
        style={{
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'smooth',
        }}
      >
        {/* Top Virtual Spacer */}
        {topSpacerHeight > 0 && (
          <div style={{ height: `${topSpacerHeight}px` }} aria-hidden="true" />
        )}

        {/* Visible Window of Cards in Continuous Physical Sequence */}
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
