// loggingAdapter.js
// Replace fallback with your provided logger if available.

export function logEvent(eventType, payload = {}) {
  const entry = { eventType, payload, ts: Date.now() };

  // If the pre-test provided logger exists on window, use it
  if (window._PRETEST_LOGGER_ && typeof window._PRETEST_LOGGER_.log === 'function') {
    try {
      window._PRETEST_LOGGER_.log(entry);
      return;
    } catch (e) {
      // swallow and fallback
    }
  }

  // Fallback: store logs in localStorage (no console.log)
  const key = 'url_shortener_logs';
  const logs = JSON.parse(localStorage.getItem(key) || '[]');
  logs.push(entry);
  localStorage.setItem(key, JSON.stringify(logs));
}

