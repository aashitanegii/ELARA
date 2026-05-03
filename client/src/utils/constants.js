/**
 * Shared constants used across multiple components.
 * Centralizes badge icons and supported languages to prevent duplication.
 * @module utils/constants
 */

/** Badge icon mapping — maps AI trust badge labels to emoji indicators */
export const BADGE_ICONS = {
  'Beginner Friendly': '📘',
  'Step-by-Step Guidance': '🧭',
  'Next Step Ready': '🧭',
  'Timeline Included': '⏱',
  'Verified Educational Info': '✅',
  'Myth Busted': '🛡️',
  'Offline Mode': '📴',
};

/** Supported language codes for the Hindi/English toggle */
export const SUPPORTED_LANGUAGES = {
  en: { label: 'English', flag: '🇬🇧', nativeLabel: 'English' },
  hi: { label: 'Hindi', flag: '🇮🇳', nativeLabel: 'हिन्दी' },
};

/** Official Election Commission of India resource links */
export const OFFICIAL_SOURCES = {
  voterRegistration: 'https://voters.eci.gov.in/',
  nvsp: 'https://www.nvsp.in/',
  eci: 'https://eci.gov.in/',
  voterHelpline: 'https://voterportal.eci.gov.in/',
  eEPIC: 'https://voters.eci.gov.in/download-e-epic',
};
