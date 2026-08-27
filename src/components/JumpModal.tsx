import React, { useState } from 'react';
import { X, ArrowRight, Shuffle } from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';

interface JumpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIndex: number;
  totalCards: number;
  onJump: (index: number) => void;
  onRandom: () => void;
}

export const JumpModal: React.FC<JumpModalProps> = ({
  isOpen,
  onClose,
  currentIndex,
  totalCards,
  onJump,
  onRandom,
}) => {
  const [targetNumber, setTargetNumber] = useState<string>('');
  const { light, medium } = useHaptics();

  if (!isOpen) return null;

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(targetNumber, 10);
    if (!isNaN(num) && num >= 1 && num <= totalCards) {
      light();
      onJump(num - 1);
      onClose();
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      onJump(val);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-sm rounded-[32px] bg-white dark:bg-[#1E232B] border border-black/10 dark:border-white/10 shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
          <div>
            <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">
              Jump to Bite
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Enter any card number or scrub the timeline
            </p>
          </div>
          <button
            onClick={() => {
              light();
              onClose();
            }}
            className="p-2 rounded-full text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleJumpSubmit} className="mt-5 space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max={totalCards}
              placeholder="e.g. 150"
              value={targetNumber}
              onChange={(e) => setTargetNumber(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-sm font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-purple-500"
              autoFocus
            />
            <button
              type="submit"
              className="p-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all active:scale-95 shadow-md"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Scrub Slider (No total shown, only current card number) */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <span>Start</span>
              <span className="font-extrabold text-purple-600 dark:text-purple-400 text-sm">
                Bite #{currentIndex + 1}
              </span>
              <span>Ahead &rarr;</span>
            </div>
            <input
              type="range"
              min="0"
              max={totalCards - 1}
              value={currentIndex}
              onChange={handleSliderChange}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>

          {/* Shuffle Button */}
          <button
            type="button"
            onClick={() => {
              medium();
              onRandom();
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center justify-center gap-2 border border-black/5 dark:border-white/5 transition-all"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Surprise Me (Random Bite)</span>
          </button>
        </form>
      </div>
    </div>
  );
};
