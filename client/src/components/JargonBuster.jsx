import { useState } from 'react';

/**
 * Lightweight markdown renderer — converts **bold** and ## headers to React elements.
 */
function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let key = 0;
  for (const line of lines) {
    key++;
    if (/^#{1,3}\s/.test(line)) {
      const content = line.replace(/^#{1,3}\s*/, '');
      elements.push(<strong key={key} className="md-heading">{renderInline(content)}</strong>);
      elements.push(<br key={key + 'br'} />);
      continue;
    }
    if (line.trim() === '') { elements.push(<br key={key} />); continue; }
    elements.push(<span key={key}>{renderInline(line)}</span>);
    elements.push(<br key={key + 'br'} />);
  }
  return elements;
}

function renderInline(text) {
  const parts = [];
  let remaining = text;
  let idx = 0;
  const boldRegex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;
  while ((match = boldRegex.exec(remaining)) !== null) {
    if (match.index > lastIndex) parts.push(remaining.slice(lastIndex, match.index));
    parts.push(<strong key={`b${idx++}`}>{match[1]}</strong>);
    lastIndex = boldRegex.lastIndex;
  }
  if (lastIndex < remaining.length) parts.push(remaining.slice(lastIndex));
  return parts.length > 0 ? parts : text;
}

const QUICK_TERMS = [
  'Electoral College',
  'Constituency',
  'Gerrymandering',
  'VVPAT',
  'EPIC',
  'First Past The Post',
];

export default function JargonBuster({ journey }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);

  /** Parse [BADGE: ...] tags from response */
  function parseBadges(text) {
    const badgeRegex = /\[BADGE:\s*([^\]]+)\]/g;
    const found = [];
    let match;
    while ((match = badgeRegex.exec(text)) !== null) {
      found.push(match[1].trim());
    }
    return { cleanText: text.replace(badgeRegex, '').trim(), badges: found };
  }

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
        }),
      });
      const data = await res.json();
      const raw = data.response || data.error;
      const parsed = parseBadges(raw);
      setResult(parsed.cleanText);
      setBadges(parsed.badges);
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

  const BADGE_ICONS = {
    'Beginner Friendly': '📘',
    'Step-by-Step Guidance': '🧭',
    'Timeline Included': '⏱',
    'Verified Educational Info': '✅',
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
