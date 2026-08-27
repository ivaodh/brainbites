# 🧠 BrainBits — Daily Mind Fuel (Standalone PWA)

A high-performance, offline-first Progressive Web App (PWA) delivering an infinite stream of **genuine and fact-checked BrainBits** across five curated formats:
- 🔢 **1,100 Lateral Thinking & Logic Puzzles** (with interactive tap-to-reveal solutions)
- 🧠 **1,250 Science, Nature & Cosmos Trivia**
- ⚡ **1,050 Interactive Multi-Domain Quizzes**
- 💭 **550 Timeless Quotes & Philosophical Wisdom**
- 📖 **550 Words of the Hour & Untranslatable Concepts**

---

## ✨ Key Features

- **🌈 Dynamic Aura Extension**: Ambient color-morphing radial glow that dynamically tints the app's top bar and the phone's native status bar (iOS Safari & Android).
- **🎴 120fps Hardware-Accelerated Physical Card Stack**: Gesture-tracked 3D card movement with layered depth, spring physics, and subtle rotation.
- **🌓 Dark & Light Modes**: Seamless theme switcher respecting system preferences with zero Flash of Unstyled Content (FOUC).
- **📱 100% Offline PWA**: Installable to iOS/Android home screen. Works on airplanes, subways, and off-grid.
- **💾 Instant Resume**: Automatically remembers the user's exact last-viewed card across browser restarts and device reboots via `localStorage`.
- **🎉 Interactive Reveals**: Tap-to-reveal answers for quizzes & puzzles with micro-confetti celebrations and tactile Web Haptics (`navigator.vibrate`).
- **🔖 Local Bookmarks**: Save favorite bits locally for quick reference.
- **🚀 Ultra-Fast & Zero-Cost**: 100% static client bundle on Vercel with 0ms database latency.

---

## 🛠️ Local Development

```bash
# Navigate to project
cd afiman/Brainbites

# Start local dev server (opens at http://localhost:3000)
npm run dev

# Build for production
npm run build
```

---

## 🚀 Deploy to Vercel (Free & Instant)

### Option 1: Using Vercel CLI
```bash
npx vercel
```

### Option 2: Using GitHub & Vercel Dashboard
1. Connected repository: [github.com/ivaodh/brainbites](https://github.com/ivaodh/brainbites).
2. Framework Preset: **Vite** (automatically detected).
3. Click **Deploy** — your PWA is live with automatic SSL, global edge CDN, and offline caching!
