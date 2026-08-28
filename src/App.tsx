import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { BrainBite, CategoryFilter } from './types';
import { fetchBrainBites, getAuraForIndex } from './data/bites';
import { useTheme } from './hooks/useTheme';
import { useBookmarks } from './hooks/useBookmarks';
import { Header } from './components/Header';
import { Deck } from './components/Deck';
import { BottomDock } from './components/BottomDock';
import { CategoryModal } from './components/CategoryModal';
import { JumpModal } from './components/JumpModal';
import { PwaInstallBanner } from './components/PwaInstallBanner';

const LAST_INDEX_KEY = 'brainbits_last_seen_index';

export default function App() {
  const [allBites, setAllBites] = useState<BrainBite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [category, setCategory] = useState<CategoryFilter>('ALL');
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [isJumpModalOpen, setIsJumpModalOpen] = useState<boolean>(false);

  // Custom Hooks
  const { isDark, toggleTheme } = useTheme();
  const { bookmarks, isBookmarked, toggleBookmark } = useBookmarks();

  // Load dataset
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const bites = await fetchBrainBites();
      setAllBites(bites);

      // Restore last seen index
      try {
        const stored = localStorage.getItem(LAST_INDEX_KEY);
        if (stored) {
          const parsed = parseInt(stored, 10);
          if (!isNaN(parsed) && parsed >= 0 && parsed < bites.length) {
            setCurrentIndex(parsed);
          }
        }
      } catch (_) {}

      setLoading(false);
    }
    loadData();
  }, []);

  // Filter bites based on category
  const filteredBites = useMemo(() => {
    if (category === 'BOOKMARKS') {
      return bookmarks;
    }
    if (category === 'ALL') {
      return allBites;
    }
    const typeMap: Record<CategoryFilter, string | undefined> = {
      ALL: undefined,
      PUZZLES: 'puzzle',
      TRIVIA: 'trivia',
      QUIZZES: 'quiz',
      QUOTES: 'quote',
      VOCAB: 'vocab',
      BOOKMARKS: undefined,
    };
    const targetType = typeMap[category];
    if (!targetType) return allBites;
    return allBites.filter((b) => b.type === targetType);
  }, [allBites, category, bookmarks]);

  // Current Aura Color
  const currentAura = useMemo(() => getAuraForIndex(currentIndex), [currentIndex]);

  // Save last seen index when browsing 'ALL' (debounced to avoid write thrash)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleIndexChange = useCallback((newIdx: number) => {
    setCurrentIndex(newIdx);
    if (category === 'ALL') {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        try {
          localStorage.setItem(LAST_INDEX_KEY, newIdx.toString());
        } catch (_) {}
      }, 500);
    }
  }, [category]);

  const handleSelectCategory = (cat: CategoryFilter) => {
    setCategory(cat);
    setCurrentIndex(0);
  };

  const handleRandom = () => {
    if (filteredBites.length > 1) {
      let rand = Math.floor(Math.random() * filteredBites.length);
      if (rand === currentIndex) {
        rand = (rand + 1) % filteredBites.length;
      }
      handleIndexChange(rand);
    }
  };

  if (loading) {
    return (
      <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-[#F8F9FA] dark:bg-[#121417] text-zinc-800 dark:text-zinc-200">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-amber-400 p-[2px] animate-pulse">
          <div className="w-full h-full rounded-[14px] bg-[#1E232B] flex items-center justify-center text-xl">
            🧠
          </div>
        </div>
        <p className="mt-4 text-xs font-bold tracking-widest uppercase opacity-60">
          Loading BrainBits...
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative h-[100dvh] w-full flex flex-col overflow-hidden select-none transition-colors duration-300 ${
        isDark ? 'bg-ambient-dark text-zinc-100' : 'bg-ambient-light text-zinc-900'
      }`}
    >
      {/* Full-Screen Ambient Aura Glow (Seamless edge-to-edge on iOS) */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-500 ease-out opacity-20 dark:opacity-30"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 45%, ${currentAura.hex}, transparent 75%)`,
        }}
      />

      {/* PWA Install Banner */}
      <PwaInstallBanner />

      {/* Header */}
      <Header
        currentIndex={currentIndex}
        currentCategory={category}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
        onOpenJumpModal={() => setIsJumpModalOpen(true)}
        onOpenBookmarks={() => {
          setCategory('BOOKMARKS');
          setCurrentIndex(0);
        }}
        bookmarkCount={bookmarks.length}
      />

      {/* Main 3-Slot Gesture Deck */}
      <main className="flex-1 w-full h-full flex flex-col items-center justify-center relative z-10">
        {filteredBites.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <span className="text-4xl mb-3">⭐</span>
            <h3 className="text-lg font-bold">No Bookmarks Saved</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs">
              Tap the bookmark icon on any BrainBit to save your favorite insights here.
            </p>
            <button
              onClick={() => handleSelectCategory('ALL')}
              className="mt-5 px-5 py-2.5 rounded-full bg-purple-600 text-white text-xs font-bold active:scale-95 transition-all shadow-md"
            >
              Browse All Bits
            </button>
          </div>
        ) : (
          <Deck
            bites={filteredBites}
            currentIndex={currentIndex}
            currentAura={currentAura}
            onChangeIndex={handleIndexChange}
            isBookmarked={isBookmarked}
            onToggleBookmark={toggleBookmark}
            isDark={isDark}
          />
        )}
      </main>

      {/* Bottom Floating Navigation Dock */}
      <BottomDock
        currentIndex={currentIndex}
        totalCards={filteredBites.length}
        currentCategory={category}
        onPrev={() => handleIndexChange(Math.max(0, currentIndex - 1))}
        onNext={() => handleIndexChange(Math.min(filteredBites.length - 1, currentIndex + 1))}
        onRandom={handleRandom}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
      />

      {/* Category Explorer Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        currentCategory={category}
        onSelectCategory={handleSelectCategory}
      />

      {/* Direct Jump Modal */}
      <JumpModal
        isOpen={isJumpModalOpen}
        onClose={() => setIsJumpModalOpen(false)}
        currentIndex={currentIndex}
        totalCards={filteredBites.length}
        onJump={(idx) => handleIndexChange(idx)}
        onRandom={handleRandom}
      />
    </div>
  );
}
