import React from 'react';
import { X, Sparkles, HelpCircle, BookOpen, Quote, Bookmark, Layers } from 'lucide-react';
import { CategoryFilter } from '../types';
import { useHaptics } from '../hooks/useHaptics';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCategory: CategoryFilter;
  onSelectCategory: (cat: CategoryFilter) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  currentCategory,
  onSelectCategory,
}) => {
  const { light } = useHaptics();

  if (!isOpen) return null;

  const categories: { id: CategoryFilter; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'ALL',
      label: 'All Brain Bites',
      icon: <Layers className="w-5 h-5 text-purple-500" />,
      desc: 'Balanced infinite stream of trivia, puzzles, quizzes & wisdom',
    },
    {
      id: 'PUZZLES',
      label: 'Logic & Lateral Puzzles',
      icon: <span className="text-lg">🔢</span>,
      desc: 'Lateral thinking, math curiosities, and classic riddles',
    },
    {
      id: 'TRIVIA',
      label: 'Science & Cosmos Trivia',
      icon: <Sparkles className="w-5 h-5 text-sky-400" />,
      desc: 'Mind-expanding facts across the universe & biology',
    },
    {
      id: 'QUIZZES',
      label: 'Interactive Quizzes',
      icon: <HelpCircle className="w-5 h-5 text-amber-500" />,
      desc: 'Engaging Q&As with revealable answers',
    },
    {
      id: 'QUOTES',
      label: 'Timeless Wisdom',
      icon: <Quote className="w-5 h-5 text-rose-500" />,
      desc: 'Philosophical insights from history’s greatest thinkers',
    },
    {
      id: 'VOCAB',
      label: 'Word of the Hour',
      icon: <BookOpen className="w-5 h-5 text-teal-400" />,
      desc: 'Profound vocabulary & untranslatable cultural concepts',
    },
    {
      id: 'BOOKMARKS',
      label: 'Saved Bookmarks',
      icon: <Bookmark className="w-5 h-5 text-amber-400 fill-amber-400" />,
      desc: 'Your personal collection of saved favorite cards',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Sheet */}
      <div className="relative z-10 w-full max-w-md max-h-[85vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] bg-white dark:bg-[#1E232B] border border-black/10 dark:border-white/10 shadow-2xl p-6 animate-in slide-in-from-bottom-8 duration-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
          <div>
            <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">
              Explore Categories
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Select your preferred format of daily mind fuel
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

        {/* Category List (NO numbers shown) */}
        <div className="mt-4 space-y-2.5">
          {categories.map((cat) => {
            const isSelected = currentCategory === cat.id;

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
                    ? 'bg-purple-500/15 border-purple-500/50 shadow-sm'
                    : 'bg-zinc-50 dark:bg-zinc-900/60 border-black/5 dark:border-white/5 hover:border-black/15 dark:hover:border-white/15'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center flex-shrink-0">
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block">
                    {cat.label}
                  </span>
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
