export type BiteType = 'quote' | 'trivia' | 'quiz' | 'vocab' | 'puzzle';

export interface BrainBite {
  type: BiteType;
  tag: string;
  text: string;
  author?: string;
  answer?: string;
  detail?: string;
}

export type CategoryFilter = 'ALL' | 'PUZZLES' | 'TRIVIA' | 'QUIZZES' | 'QUOTES' | 'VOCAB' | 'BOOKMARKS';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface AuraColor {
  hex: string;
  name: string;
}
