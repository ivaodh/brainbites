import React from 'react';
import { Sun, Moon, Bookmark, Compass, Search } from 'lucide-react';
import { CategoryFilter } from '../types';

interface HeaderProps {
  currentIndex: number;
  currentCategory: CategoryFilter;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenCategoryModal: () => void;
  onOpenJumpModal: () => void;
  onOpenBookmarks: () => void;
  bookmarkCount: number;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  currentIndex,
  currentCategory,
  isDark,
  onToggleTheme,
  onOpenCategoryModal,
  onOpenJumpModal,
  onOpenBookmarks,
  bookmarkCount,
}) => {
  const getCategoryLabel = () => {
    switch (currentCategory) {
      case 'ALL':
        return 'All Bits';
      case 'PUZZLES':
        return 'Logic Puzzles';
      case 'TRIVIA':
        return 'Science Trivia';
      case 'QUIZZES':
        return 'Quick Quizzes';
      case 'QUOTES':
        return 'Timeless Wisdom';
      case 'VOCAB':
        return 'Word of the Hour';
      case 'BOOKMARKS':
        return 'Saved Bookmarks';
      default:
        return 'BrainBits';
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 sm:px-6 pb-3.5 bg-white/60 dark:bg-[#121417]/75 backdrop-blur-xl border-b border-black/5 dark:border-white/5 transition-colors duration-500"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 14px)',
      }}
    >
      {/* Brand & Category */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 via-sky-400 to-amber-400 p-[1.5px] shadow-sm flex-shrink-0">
          <div className="w-full h-full rounded-[10px] bg-[#1E232B] dark:bg-[#1E232B] flex items-center justify-center">
            <span className="text-sm">🧠</span>
          </div>
        </div>
        <div>
          <h1 className="text-[17px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
            BrainBits
          </h1>
          <button
            onClick={onOpenCategoryModal}
            className="flex items-center gap-1 text-[11.5px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors mt-0.5"
          >
            <Compass className="w-3 h-3 text-purple-500" />
            <span>{getCategoryLabel()}</span>
          </button>
        </div>
      </div>

      {/* Index Pill & Quick Actions (Properly safe-padded for iOS status bar) */}
      <div className="flex items-center gap-2">
        {/* Current Card Progress Pill */}
        <button
          onClick={onOpenJumpModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold tracking-wide bg-zinc-100/90 dark:bg-[#1E232B]/90 text-zinc-900 dark:text-zinc-100 border border-black/8 dark:border-white/12 hover:border-purple-500/40 transition-all backdrop-blur-md active:scale-95 shadow-sm"
          title="Jump to Bit"
        >
          <Search className="w-3 h-3 opacity-60 text-purple-500" />
          <span>#{currentIndex + 1}</span>
        </button>

        {/* Bookmarks Toggle */}
        <button
          onClick={onOpenBookmarks}
          className="relative p-2 rounded-full bg-zinc-100/90 dark:bg-[#1E232B]/90 text-zinc-700 dark:text-zinc-300 border border-black/8 dark:border-white/12 hover:text-amber-500 transition-all backdrop-blur-md active:scale-95 shadow-sm"
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
          onClick={onToggleTheme}
          className="p-2 rounded-full bg-zinc-100/90 dark:bg-[#1E232B]/90 text-zinc-700 dark:text-zinc-300 border border-black/8 dark:border-white/12 hover:text-purple-500 transition-all backdrop-blur-md active:scale-95 shadow-sm"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
        </button>
      </div>
    </header>
  );
});
