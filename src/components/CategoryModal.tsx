import React from 'react';
import { X, Sparkles, HelpCircle, BookOpen, Quote, Bookmark, Layers } from 'lucide-react';
import { CategoryFilter } from '../types';
import { useHaptics } from '../hooks/useHaptics';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCategory: CategoryFilter;
  onSelectCategory: (cat: CategoryFilter) => void;
  counts: Record<CategoryFilter, number>;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  currentCategory,
  onSelectCategory,
  counts,
}) => {
  const { light } = useHaptics();

  if (!isOpen) return null;

  const categories: { id: CategoryFilter; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
    {
      id: 'ALL',
      label: 'All Brain Bites',
      icon: <Layers className="w-5 h-5 text-purple-500" />,
      color: 'from-purple-500/20 to-purple-600/10',
      desc: 'Balanced mix of trivia, puzzles, quizzes & wisdom',
    },
    {
      id: 'PUZZLES',
      label: 'Logic & Lateral Puzzles',
      icon: <span className="text-lg">🔢</span>,
      color: 'from-emerald-500/20 to-emerald-600/10',
      desc: 'Lateral thinking, math bites, and classic riddles',
    },
    {
      id: 'TRIVIA',
      label: 'Science & Cosmos Trivia',
      icon: <Sparkles className="w-5 h-5 text-sky-400" />,
      color: 'from-sky-500/20 to-sky-600/10',
      desc: 'Fascinating verified facts across universe & biology',
    },
    {
      id: 'QUIZZES',
      label: 'Interactive Quizzes',
      icon: <HelpCircle className="w-5 h-5 text-amber-500" />,
      color: 'from-amber-500/20 to-amber-600/10',
      desc: 'Engaging Q&A with revealable answers',
    },
    {
      id: 'QUOTES',
      label: 'Timeless Wisdom',
      icon: <Quote className="w-5 h-5 text-rose-500" />,
      color: 'from-rose-500/20 to-rose-600/10',
      desc: 'Philosophical insights from history’s greatest thinkers',
    },
    {
      id: 'VOCAB',
      label: 'Word of the Hour',
      icon: <BookOpen className="w-5 h-5 text-teal-400" />,
      color: 'from-teal-500/20 to-teal-600/10',
      desc: 'Profound vocabulary & untranslatable cultural concepts',
    },
    {
      id: 'BOOKMARKS',
      label: 'Saved Bookmarks',
      icon: <Bookmark className="w-5 h-5 text-amber-400 fill-amber-400" />,
      color: 'from-amber-500/20 to-yellow-600/10',
      desc: 'Your personal collection of saved favorite cards',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Sheet */}
      <div className="relative z-10 w-full max-w-md max-h-[85vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] bg-white dark:bg-[#1E2228] border border-black/10 dark:border-white/10 shadow-2xl p-6 animate-in slide-in-from-bottom-8 duration-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
          <div>
            <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">
              Explore Categories
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Filter by your favorite format of mind fuel
            </p>
          </div>
          <button
            onClick={() => {
              light();
              onClose();
            }}
            className="p-2 rounded-full text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category List */}
        <div className="mt-4 space-y-2.5">
          {categories.map((cat) => {
            const isSelected = currentCategory === cat.id;
            const count = counts[cat.id] ?? 0;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  light();
                  onSelectCategory(cat.id);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-2xl flex items-center gap-3.5 text-left border transition-all active:scale-[0.98] ${
                  isSelected
                    ? 'bg-purple-500/10 border-purple-500/50 shadow-sm'
                    : 'bg-zinc-50/70 dark:bg-zinc-900/60 border-black/5 dark:border-white/5 hover:border-black/15 dark:hover:border-white/15'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center flex-shrink-0">
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {cat.label}
                    </span>
                    <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                      {count.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                    {cat.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
