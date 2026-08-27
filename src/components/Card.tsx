import React, { useState, useEffect } from 'react';
import { Share2, Bookmark, Check, Sparkles, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BrainBite, AuraColor } from '../types';
import { useHaptics } from '../hooks/useHaptics';

interface CardProps {
  bite: BrainBite;
  aura: AuraColor;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  index: number;
  isDark?: boolean;
}

export const Card: React.FC<CardProps> = ({
  bite,
  aura,
  isBookmarked,
  onToggleBookmark,
  isDark = true,
}) => {
  const [revealed, setRevealed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { light, success } = useHaptics();

  // Reset reveal state when bite changes
  useEffect(() => {
    setRevealed(false);
  }, [bite]);

  const handleReveal = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!revealed) {
      success();
      // Trigger celebratory micro-confetti
      confetti({
        particleCount: 28,
        spread: 55,
        origin: { y: 0.65 },
        colors: [aura.hex, '#10B981', '#F59E0B', '#38BDF8'],
        disableForReducedMotion: true,
      });
    } else {
      light();
    }
    setRevealed(!revealed);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    light();

    let shareText = `💡 ${bite.tag}\n\n"${bite.text}"`;
    if (bite.author) shareText += `\n— ${bite.author}`;
    if (bite.detail) shareText += `\n\n${bite.detail}`;
    if (bite.answer) shareText += `\n\nAnswer: ${bite.answer}`;
    shareText += `\n\nvia Brain Bites`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Brain Bite: ${bite.tag}`,
          text: shareText,
        });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      showToast('Copied to clipboard!');
    } catch (_) {
      showToast('Could not copy to clipboard');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2200);
  };

  const getIcon = () => {
    switch (bite.type) {
      case 'quote':
        return '💭';
      case 'quiz':
        return '⚡';
      case 'trivia':
        return '🧠';
      case 'vocab':
        return '📖';
      case 'puzzle':
        return '🔢';
      default:
        return '💡';
    }
  };

  return (
    <div className="relative w-full max-w-[440px] px-4 py-2 mx-auto select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-xs font-bold shadow-xl border border-white/10 dark:border-black/10 backdrop-blur-md transition-all animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Main Physical Glass Card */}
      <div
        className={`relative w-full rounded-[28px] p-6 sm:p-7 transition-all duration-300 overflow-hidden ${
          isDark
            ? 'bg-[#1E232B] text-zinc-50 border border-white/12'
            : 'bg-white text-zinc-900 border border-black/8'
        }`}
        style={{
          boxShadow: isDark
            ? `0 20px 48px -10px ${aura.hex}44, 0 10px 24px -6px rgba(0,0,0,0.65)`
            : `0 20px 48px -10px ${aura.hex}28, 0 10px 24px -6px rgba(0,0,0,0.08)`,
        }}
      >
        {/* Header Row: Category Badge & Actions */}
        <div className="flex items-center justify-between gap-2 mb-5">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors"
            style={{
              backgroundColor: `${aura.hex}22`,
              borderColor: `${aura.hex}55`,
            }}
          >
            <span className="text-xs leading-none">{getIcon()}</span>
            <span
              className="text-[11px] font-extrabold tracking-wider uppercase"
              style={{ color: isDark ? '#FFFFFF' : '#18181B' }}
            >
              {bite.tag}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Bookmark Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                light();
                onToggleBookmark();
              }}
              className="p-2 rounded-full text-zinc-400 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-90"
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark card'}
              aria-label="Bookmark"
            >
              <Bookmark
                className={`w-4 h-4 transition-all ${
                  isBookmarked ? 'fill-amber-500 text-amber-500 scale-110' : ''
                }`}
              />
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-2 rounded-full text-zinc-400 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-90"
              title="Share card"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="min-h-[140px] flex flex-col justify-center">
          {/* QUOTE */}
          {bite.type === 'quote' && (
            <div className="space-y-4">
              <span
                className="block text-4xl leading-none font-serif select-none"
                style={{ color: aura.hex }}
              >
                “
              </span>
              <p
                className={`text-[19px] sm:text-[21px] font-serif italic font-semibold leading-snug ${
                  isDark ? 'text-zinc-100' : 'text-zinc-900'
                }`}
              >
                {bite.text}
              </p>
              {bite.author && (
                <div className="pt-2 text-right">
                  <span
                    className="text-sm font-extrabold tracking-wide"
                    style={{ color: aura.hex }}
                  >
                    — {bite.author}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* VOCABULARY */}
          {bite.type === 'vocab' && (
            <div className="space-y-3">
              <h2
                className="text-2xl sm:text-3xl font-serif font-black tracking-tight"
                style={{ color: aura.hex }}
              >
                {bite.text}
              </h2>
              {bite.detail && (
                <p
                  className={`text-[15.5px] font-medium leading-relaxed ${
                    isDark ? 'text-zinc-200' : 'text-zinc-700'
                  }`}
                >
                  {bite.detail}
                </p>
              )}
            </div>
          )}

          {/* QUIZ & PUZZLE */}
          {(bite.type === 'quiz' || bite.type === 'puzzle') && (
            <div className="space-y-4">
              <p
                className={`text-[18px] sm:text-[19px] font-bold leading-snug ${
                  isDark ? 'text-zinc-100' : 'text-zinc-900'
                }`}
              >
                {bite.text}
              </p>

              {/* Reveal Button / Solution Box */}
              <div className="pt-2">
                {!revealed ? (
                  <button
                    onClick={handleReveal}
                    className="w-full py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 border font-bold text-sm tracking-wide transition-all active:scale-[0.98] shadow-sm hover:brightness-105"
                    style={{
                      backgroundColor: `${aura.hex}18`,
                      borderColor: `${aura.hex}55`,
                      color: aura.hex,
                    }}
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Tap to Reveal Answer</span>
                  </button>
                ) : (
                  <div
                    onClick={handleReveal}
                    className={`w-full p-4 rounded-2xl border flex items-start gap-3 transition-all cursor-pointer animate-in fade-in zoom-in-95 duration-200 ${
                      isDark
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                        : 'bg-emerald-50/90 border-emerald-400 text-emerald-950'
                    }`}
                  >
                    <div className="mt-0.5 p-1 rounded-full bg-emerald-500 text-white flex-shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-[10px] font-black uppercase tracking-wider block opacity-75 mb-0.5">
                        Answer
                      </span>
                      <p
                        className={`text-[15px] font-bold leading-snug ${
                          isDark ? 'text-emerald-200' : 'text-emerald-900'
                        }`}
                      >
                        {bite.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TRIVIA */}
          {bite.type === 'trivia' && (
            <div className="py-2">
              <p
                className={`text-[16.5px] sm:text-[17.5px] font-medium leading-relaxed ${
                  isDark ? 'text-zinc-100' : 'text-zinc-900'
                }`}
              >
                {bite.text}
              </p>
            </div>
          )}
        </div>

        {/* Bottom subtle shine footer */}
        <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Verified Brain Bite</span>
          </span>
          <span className="opacity-70 font-semibold">{aura.name}</span>
        </div>
      </div>
    </div>
  );
};
