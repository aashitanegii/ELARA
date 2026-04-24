import { useState } from 'react';

export default function JargonBuster({ journey }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBust = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;
    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `Explain this election term in simple bullet points that anyone can understand: "${input}"`,
          context: journey,
        }),
      });
      const data = await res.json();
      setResult(data.response || data.error);
    } catch {
      setResult('Service unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
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
      <form className="jargon-input-row" onSubmit={handleBust}>
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
          <p>{result}</p>
        </div>
      )}
    </section>
  );
}
