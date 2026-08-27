import { BrainBite, AuraColor } from '../types';

export const AURA_PALETTE: AuraColor[] = [
  { hex: '#A855F7', name: 'Cosmic Violet' },
  { hex: '#F59E0B', name: 'Sunset Amber' },
  { hex: '#10B981', name: 'Emerald Matrix' },
  { hex: '#38BDF8', name: 'Electric Azure' },
  { hex: '#F43F5E', name: 'Crimson Rose' },
  { hex: '#0EA5E9', name: 'Ocean Blue' },
  { hex: '#EC4899', name: 'Neon Orchid' },
  { hex: '#14B8A6', name: 'Deep Teal' },
  { hex: '#8B5CF6', name: 'Royal Indigo' },
  { hex: '#FB923C', name: 'Tangerine Glow' },
];

export const FALLBACK_BITES: BrainBite[] = [
  {
    type: 'quote',
    tag: 'WISDOM',
    text: 'Simplicity is the ultimate sophistication.',
    author: 'Leonardo da Vinci',
  },
  {
    type: 'trivia',
    tag: 'COSMOS',
    text: 'Sunlight takes 8 minutes and 20 seconds to travel 93 million miles to Earth.',
  },
  {
    type: 'quiz',
    tag: 'QUICK QUIZ',
    text: 'Which planet spins clockwise?',
    answer: 'Venus',
  },
  {
    type: 'vocab',
    tag: 'WORD OF THE HOUR',
    text: 'Petrichor',
    detail: 'The pleasant, earthy smell that rises when rain falls on dry soil.',
  },
  {
    type: 'puzzle',
    tag: 'RIDDLE',
    text: 'What gets wetter the more it dries?',
    answer: 'A Towel',
  },
];

let cachedBites: BrainBite[] | null = null;

export async function fetchBrainBites(): Promise<BrainBite[]> {
  if (cachedBites && cachedBites.length > 0) {
    return cachedBites;
  }

  try {
    const res = await fetch('/brain_bites.json');
    if (!res.ok) throw new Error('Failed to fetch dataset');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      cachedBites = data;
      return data;
    }
  } catch (err) {
    console.warn('Using fallback Brain Bites:', err);
  }

  cachedBites = FALLBACK_BITES;
  return FALLBACK_BITES;
}

export function getAuraForIndex(index: number): AuraColor {
  const safeIdx = Math.abs(index) % AURA_PALETTE.length;
  return AURA_PALETTE[safeIdx];
}
