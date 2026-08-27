import React from 'react';
import { Sun, Moon, Bookmark, Compass, Search } from 'lucide-react';
import { CategoryFilter } from '../types';
import { useHaptics } from '../hooks/useHaptics';

interface HeaderProps {
  currentIndex: number;
  totalCards: number;
  currentCategory: CategoryFilter;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenCategoryModal: () => void;
  onOpenJumpModal: () => void;
  onOpenBookmarks: () => void;
  bookmarkCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentIndex,
  totalCards,
  currentCategory,
  isDark,
  onToggleTheme,
  onOpenCategoryModal,
  onOpenJumpModal,
  onOpenBookmarks,
  bookmarkCount,
}) => {
  const { light } = useHaptics();

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 pt-safe bg-transparent">
      {/* Brand & Category */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 via-sky-400 to-amber-400 p-[1.5px] shadow-sm">
          <div className="w-full h-full rounded-[10px] bg-[#121417] dark:bg-[#121417] flex items-center justify-center">
            <span className="text-sm">🧠</span>
          </div>
        </div>
        <div>
          <h1 className="text-[17px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
            Brain Bites
          </h1>
          <button
            onClick={() => {
              light();
              onOpenCategoryModal();
            }}
            className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors mt-0.5"
          >
            <Compass className="w-3 h-3" />
            <span>{currentCategory === 'ALL' ? 'All 4,500 Cards' : currentCategory}</span>
          </button>
        </div>
      </div>

      {/* Index Pill & Quick Actions */}
      <div className="flex items-center gap-2">
        {/* Card Number Pill */}
        <button
          onClick={() => {
            light();
            onOpenJumpModal();
          }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold tracking-wide bg-zinc-200/70 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border border-black/5 dark:border-white/10 hover:border-purple-500/40 transition-all backdrop-blur-md active:scale-95"
          title="Jump to card"
        >
          <Search className="w-3 h-3 opacity-60" />
          <span>
            #{currentIndex + 1}
            <span className="text-[10px] font-normal opacity-50 ml-0.5">/{totalCards}</span>
          </span>
        </button>

        {/* Bookmarks Toggle */}
        <button
          onClick={() => {
            light();
            onOpenBookmarks();
          }}
          className="relative p-2 rounded-full bg-zinc-200/70 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-black/5 dark:border-white/10 hover:text-amber-500 transition-all backdrop-blur-md active:scale-95"
          title="Bookmarks"
          aria-label="Bookmarks"
        >
          <Bookmark className="w-4 h-4" />
          {bookmarkCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
              {bookmarkCount > 99 ? '99+' : bookmarkCount}
            </span>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => {
            light();
            onToggleTheme();
          }}
          className="p-2 rounded-full bg-zinc-200/70 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-black/5 dark:border-white/10 hover:text-purple-500 transition-all backdrop-blur-md active:scale-95"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
        </button>
      </div>
    </header>
  );
};
