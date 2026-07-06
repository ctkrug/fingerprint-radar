export function createSignalRegistry() {
  const signals = [];
  return {
    register(signal) {
      signals.push(signal);
    },
    all() {
      return [...signals];
    },
  };
}
