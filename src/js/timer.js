export function createTimer({ initial = 0, onTick = () => {}, onComplete = () => {} } = {}) {
  let remaining = Math.max(0, Math.floor(initial)); // seconds
  let intervalId = null;

  function start(seconds = null) {
    if (typeof seconds === "number") remaining = Math.max(0, Math.floor(seconds));
    if (intervalId) clearInterval(intervalId);
    // tick immediately for UI consistency (optional)
    onTick(remaining);
    intervalId = setInterval(() => {
      remaining = Math.max(0, remaining - 1);
      onTick(remaining);
      if (remaining <= 0) {
        clearInterval(intervalId);
        intervalId = null;
        onComplete();
      }
    }, 1000);
  }

  function pause() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function reset(seconds = 0) {
    pause();
    remaining = Math.max(0, Math.floor(seconds));
    onTick(remaining);
  }

  function isRunning() {
    return !!intervalId;
  }

  function getRemaining() {
    return remaining;
  }

  return { start, pause, reset, isRunning, getRemaining };
}
