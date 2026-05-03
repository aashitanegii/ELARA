import { useState } from 'react';
import PropTypes from 'prop-types';
import { renderMarkdown, parseBadges } from '../utils/markdown';
import { BADGE_ICONS } from '../utils/constants';
import { logEvent } from '../analytics';
import { logFirestoreInteraction } from '../firebase';

const QUICK_TERMS = [
  'Electoral College',
  'Constituency',
  'Gerrymandering',
  'VVPAT',
  'EPIC',
  'First Past The Post',
  'NOTA',
  'EVM',
];

/**
 * JargonBuster Component
 * Provides plain-language explanations of election terminology.
 * Features quick-pick chips for common terms and free-text input.
 *
 * @param {Object} props
 * @param {string} props.journey - The user's current election stage context.
 * @param {string} props.lang - Response language code ('en' or 'hi').
 */
export default function JargonBuster({ journey, lang = 'en' }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleBust = async (term) => {
    const termToUse = term || input;
    if (!termToUse.trim() || loading) return;
    setLoading(true);
    setResult('');
    setBadges([]);

    // If called via quick-pick chip, also update the input field
    if (term) setInput(term);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `Explain this election term in plain language for a beginner: "${termToUse}"`,
          context: journey,
          intent: 'jargon',
          lang,
        }),
      });
      const data = await res.json();
      const raw = data.response || data.error;
      const parsed = parseBadges(raw);
      setResult(parsed.cleanText);
      setBadges(parsed.badges);

      logEvent('jargon_lookup', { term: termToUse, lang });
      logFirestoreInteraction('jargon', { query: termToUse, lang });
    } catch {
      setResult('Service unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    handleBust();
  };

  return (
    <section className="card jargon-buster" aria-labelledby="jargon-heading">
      <div className="jargon-header">
        <h2 id="jargon-heading">
          <span className="section-icon" aria-hidden="true">🧠</span>
          Jargon Buster
        </h2>
        <p className="jargon-desc">Paste any confusing election term or phrase below and get a plain-language explanation.</p>
      </div>

      <div className="jargon-chips" role="group" aria-label="Quick-pick election terms">
        {QUICK_TERMS.map((term) => (
          <button
            key={term}
            className="jargon-chip"
            onClick={() => handleBust(term)}
            disabled={loading}
            aria-label={`Explain: ${term}`}
          >
            {term}
          </button>
        ))}
      </div>

      <form className="jargon-input-row" onSubmit={handleSubmit}>
        <label htmlFor="jargon-input" className="sr-only">
          Election term to simplify
        </label>
        <input
          id="jargon-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Electoral College, Constituency, Gerrymandering…"
          aria-label="Enter election jargon to simplify"
          maxLength={500}
          disabled={loading}
        />
        <button
          type="submit"
          aria-label="Simplify this term"
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <>
              <span className="btn-spinner" aria-hidden="true"></span>
              Simplifying…
            </>
          ) : (
            'Simplify'
          )}
        </button>
      </form>
      {result && (
        <div className="jargon-result" role="region" aria-label="Simplified explanation" aria-live="polite">
          <h3>
            <span aria-hidden="true">✨</span> Simplified Explanation
          </h3>
          <div>{renderMarkdown(result)}</div>
          {badges.length > 0 && (
            <div className="trust-badges" aria-label="Response quality indicators">
              {badges.map((badge) => (
                <span key={badge} className="trust-badge">
                  <span aria-hidden="true">{BADGE_ICONS[badge] || '✅'}</span>
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

JargonBuster.propTypes = {
  journey: PropTypes.string.isRequired,
  lang: PropTypes.oneOf(['en', 'hi']),
};
