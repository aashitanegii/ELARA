import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SUPPORTED_LANGUAGES } from '../utils/constants';

/** Trust indicators shown below hero text */
const TRUST_BADGES = [
  { icon: '✦', label: 'Gemini Powered' },
  { icon: '📘', label: 'Beginner Friendly' },
  { icon: '♿', label: 'Accessible' },
  { icon: '🏛️', label: 'Official Sources' },
];

/**
 * Header Component
 * Premium hero banner that collapses into a compact navbar on scroll.
 *
 * @param {Object} props
 * @param {string} props.lang - Current language code ('en' or 'hi').
 * @param {Function} props.setLang - Setter to toggle language.
 */
export default function Header({ lang = 'en', setLang }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'hi' : 'en';
    setLang(newLang);
  };

  const targetLang = lang === 'en' ? SUPPORTED_LANGUAGES.hi : SUPPORTED_LANGUAGES.en;

  return (
    <header className={`header ${isScrolled ? 'header-compact' : ''}`} role="banner">
      <div className="header-inner">
        <div className="header-left">
          <div className="header-brand">
            <div className="logo-icon" aria-hidden="true">🗳️</div>
            <div>
              <h1 className="header-title">ELARA</h1>
              <p className="header-subtitle">
                AI Election Guide for India <span aria-hidden="true">🇮🇳</span>
              </p>
            </div>
          </div>
          <p className="header-tagline">
            Understand registration, voting, timelines, and election terms — instantly.
          </p>
          <div className="header-trust" aria-label="Trust indicators">
            {TRUST_BADGES.map((b) => (
              <span key={b.label} className="trust-pill">
                <span aria-hidden="true">{b.icon}</span> {b.label}
              </span>
            ))}
          </div>
        </div>
        <div className="header-actions">
          <button
            className="lang-toggle"
            onClick={toggleLang}
            aria-label={`Switch language to ${targetLang.label}`}
            title={`Switch to ${targetLang.nativeLabel}`}
          >
            <span aria-hidden="true">{targetLang.flag}</span>
            {targetLang.nativeLabel}
          </button>
          <span className="badge" aria-label="Powered by Google Gemini">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
              <path d="M8 0L10 6L16 8L10 10L8 16L6 10L0 8L6 6L8 0Z" fill="currentColor" />
            </svg>
            Powered by Google Gemini
          </span>
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  lang: PropTypes.oneOf(['en', 'hi']),
  setLang: PropTypes.func.isRequired,
};
