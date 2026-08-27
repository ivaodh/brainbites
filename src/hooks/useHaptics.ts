export function useHaptics() {
  const triggerHaptic = (pattern: number | number[] = 15) => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (_) {}
  };

  const light = () => triggerHaptic(10);
  const medium = () => triggerHaptic(25);
  const success = () => triggerHaptic([15, 40, 25]);

  return { light, medium, success, triggerHaptic };
}
