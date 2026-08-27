import React from 'react';
import { ChevronUp, ChevronDown, Shuffle, Compass } from 'lucide-react';
import { CategoryFilter } from '../types';
import { useHaptics } from '../hooks/useHaptics';

interface BottomDockProps {
  currentIndex: number;
  totalCards: number;
  currentCategory: CategoryFilter;
  onPrev: () => void;
  onNext: () => void;
  onRandom: () => void;
  onOpenCategoryModal: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  currentIndex,
  totalCards,
  currentCategory,
  onPrev,
  onNext,
  onRandom,
  onOpenCategoryModal,
}) => {
  const { light, medium } = useHaptics();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 rounded-full bg-white/80 dark:bg-[#1E2228]/85 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-2xl transition-all">
      {/* Previous Card Button */}
      <button
        onClick={() => {
          light();
          onPrev();
        }}
        disabled={currentIndex === 0}
        className="p-2.5 rounded-full text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all"
        title="Previous Card"
        aria-label="Previous Card"
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      {/* Category Quick Trigger Pill */}
      <button
        onClick={() => {
          light();
          onOpenCategoryModal();
        }}
        className="px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-black/5 dark:border-white/5 hover:border-purple-500/30 transition-all active:scale-95"
      >
        <Compass className="w-3.5 h-3.5 text-purple-500" />
        <span className="max-w-[80px] truncate">{currentCategory}</span>
      </button>

      {/* Random Shuffle Button */}
      <button
        onClick={() => {
          medium();
          onRandom();
        }}
        className="p-2.5 rounded-full text-zinc-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
        title="Random Card"
        aria-label="Random Card"
      >
        <Shuffle className="w-4 h-4" />
      </button>

      {/* Next Card Button */}
      <button
        onClick={() => {
          light();
          onNext();
        }}
        disabled={currentIndex >= totalCards - 1}
        className="p-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-md"
        title="Next Card"
        aria-label="Next Card"
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  );
};
