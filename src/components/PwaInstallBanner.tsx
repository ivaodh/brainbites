import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const { light, success } = useHaptics();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Only show if not dismissed in this session
      if (!sessionStorage.getItem('dismissed_pwa_install')) {
        setVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!visible || !deferredPrompt) return null;

  const handleInstall = async () => {
    light();
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      success();
    }
    setVisible(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    light();
    setVisible(false);
    sessionStorage.setItem('dismissed_pwa_install', 'true');
  };

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md p-3.5 rounded-2xl bg-zinc-900/95 dark:bg-zinc-800/95 text-zinc-100 border border-purple-500/30 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-amber-400 flex items-center justify-center text-base flex-shrink-0">
          🧠
        </div>
        <div className="min-w-0">
          <h3 className="text-xs font-bold truncate">Install Brain Bites PWA</h3>
          <p className="text-[11px] text-zinc-400 truncate">Read 4,500+ bites 100% offline</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>
        <button
          onClick={handleDismiss}
          className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
