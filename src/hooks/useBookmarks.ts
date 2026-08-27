import { useState, useEffect } from 'react';
import { BrainBite } from '../types';

const BOOKMARKS_KEY = 'brainbites_bookmarks';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BrainBite[]>(() => {
    try {
      const stored = localStorage.getItem(BOOKMARKS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (_) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (_) {}
  }, [bookmarks]);

  const isBookmarked = (bite: BrainBite) => {
    return bookmarks.some((b) => b.text === bite.text && b.type === bite.type);
  };

  const toggleBookmark = (bite: BrainBite) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.text === bite.text && b.type === bite.type);
      if (exists) {
        return prev.filter((b) => !(b.text === bite.text && b.type === bite.type));
      } else {
        return [bite, ...prev];
      }
    });
  };

  return { bookmarks, isBookmarked, toggleBookmark };
}
