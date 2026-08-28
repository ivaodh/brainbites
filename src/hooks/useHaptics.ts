// Haptics completely disabled as per user request
export function useHaptics() {
  const light = () => {};
  const medium = () => {};
  const success = () => {};
  const triggerHaptic = () => {};

  return { light, medium, success, triggerHaptic };
}
