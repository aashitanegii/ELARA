/**
 * Google Analytics integration using gtag.js.
 * Loads the GA4 script dynamically and provides event logging.
 * Measurement ID is configured via VITE_GA_MEASUREMENT_ID environment variable.
 * @module analytics
 */

/**
 * Initialize Google Analytics by injecting the gtag.js script.
 * No-ops gracefully if measurement ID is not configured.
 */
export function initAnalytics() {
  if (typeof window === 'undefined') return;
  const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!GA_ID) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', GA_ID);

  window.gtag = gtag;
}

/**
 * Log a custom event to Google Analytics.
 * @param {string} eventName - The event name (e.g., 'ask_question', 'select_journey')
 * @param {Object} [params={}] - Optional event parameters
 */
export function logEvent(eventName, params = {}) {
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
}
