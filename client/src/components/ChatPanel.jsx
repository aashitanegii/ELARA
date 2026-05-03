import { useState, useEffect, useRef, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { renderMarkdown, parseBadges } from '../utils/markdown';
import { BADGE_ICONS } from '../utils/constants';
import { logEvent } from '../analytics';
import { logFirestoreInteraction } from '../firebase';

/** Generate unique message IDs to avoid array-index keys */
let messageIdCounter = 0;
function createMessage(role, text, badges = []) {
  return { id: ++messageIdCounter, role, text, badges };
}

/** Journey step progression map */
const STEP_MAP = {
  'Not Registered': { current: 'Registration', next: 'Verification' },
  'Registered': { current: 'Verification', next: 'Polling Day' },
  'Ready to Vote': { current: 'Polling Day', next: 'Results' },
};

/**
 * ChatPanel Component
 * Handles the AI conversation interface, intent routing requests, and walkthrough auto-play.
 *
 * @param {Object} props
 * @param {string} props.journey - The user's current election stage context.
 * @param {Object} props.externalQuery - External triggers from timeline clicks ({query, intent}).
 * @param {string} props.lang - Response language code ('en' or 'hi').
 */
function ChatPanel({ journey, externalQuery, lang = 'en' }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [walkthroughActive, setWalkthroughActive] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const bottomRef = useRef(null);
  const prevExternalQuery = useRef('');
  const hasAutoTriggered = useRef(false);
  const lastTopicRef = useRef(null);
  const walkthroughRef = useRef(false);

  /** Derive topic from query for micro-memory */
  function detectTopic(text) {
    const t = text.toLowerCase();
    if (t.includes('register') || t.includes('registration')) return 'registration';
    if (t.includes('verif')) return 'verification';
    if (t.includes('poll') || t.includes('vote') || t.includes('election day')) return 'polling';
    if (t.includes('count') || t.includes('result')) return 'counting';
    if (t.includes('document') || t.includes('aadhaar') || t.includes('id proof')) return 'documents';
    if (t.includes('deadline') || t.includes('date') || t.includes('when')) return 'deadlines';
    return null;
  }

  /** Send a message to the ELARA API */
  const sendMessage = useCallback(async (messageText, intent = 'general') => {
    const q = messageText.trim();
    if (!q || loading) return;

    setMessages((prev) => [...prev, createMessage('user', q)]);
    setQuery('');
    setLoading(true);

    try {
      let attempt = 0;
      let res;
      while (attempt < 3) {
        try {
          res = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: q,
              context: journey,
              intent,
              lang,
              lastTopic: lastTopicRef.current,
            }),
          });
          if (res.ok) break;
        } catch (e) {
          // Network error — retry with backoff
        }
        attempt++;
        if (attempt < 3) await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
      }

      if (!res || !res.ok) throw new Error('Network error');

      lastTopicRef.current = detectTopic(q);
      const data = await res.json();
      const raw = data.response || data.error;
      const { cleanText, badges } = parseBadges(raw);
      setMessages((prev) => [
        ...prev,
        createMessage('ai', cleanText, badges),
      ]);

      logEvent('ai_response', { intent, journey, lang });
      logFirestoreInteraction(intent, { query: q, context: journey, lang });
    } catch {
      setMessages((prev) => [
        ...prev,
        createMessage('ai', 'Service unavailable after retries. Please try again.', ['Offline Mode']),
      ]);
    } finally {
      setLoading(false);
    }
  }, [journey, loading, lang]);

  // Smart Guidance: auto-trigger on first load when "Not Registered"
  useEffect(() => {
    if (journey === 'Not Registered' && !hasAutoTriggered.current && messages.length === 0) {
      hasAutoTriggered.current = true;
      sendMessage(
        "I'm not registered to vote yet. Since that's my current stage, guide me through exactly what I should do next — documents needed, where to apply, and any deadlines I should know about.",
        'journey'
      );
    }
  }, [journey, messages.length, sendMessage]);

  // Handle external queries from Timeline clicks (now receives {query, intent})
  useEffect(() => {
    if (externalQuery && externalQuery.query && externalQuery.query !== prevExternalQuery.current) {
      prevExternalQuery.current = externalQuery.query;
      sendMessage(externalQuery.query, externalQuery.intent || 'timeline');
    }
  }, [externalQuery, sendMessage]);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Guided Walkthrough — advance through stages
  useEffect(() => {
    if (!walkthroughActive || loading) return;
    walkthroughRef.current = true;

    const STAGES = ['Registration', 'Verification', 'Polling Day', 'Counting', 'Results'];
    if (walkthroughStep < STAGES.length) {
      const stage = STAGES[walkthroughStep];
      sendMessage(
        `Explain the ${stage} stage of the election process in detail. What happens, who is involved, how long it takes, and what comes next.`,
        'timeline'
      );
      setWalkthroughStep((prev) => prev + 1);
    } else {
      setWalkthroughActive(false);
      walkthroughRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walkthroughActive, walkthroughStep, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(query, 'general');
    logEvent('user_question', { journey, lang });
  };

  const startWalkthrough = () => {
    setMessages([]);
    setWalkthroughStep(0);
    setWalkthroughActive(true);
    logEvent('start_walkthrough');
  };

  return (
    <section className="card chat-panel" aria-labelledby="chat-heading">
      <div className="chat-header">
        <h2 id="chat-heading">
          <span className="section-icon" aria-hidden="true">💬</span>
          AI Advisory
          <span className="chat-header-sub">— Personalized for your journey</span>
        </h2>
        <span className="gemini-label" aria-label="Generated by Google Gemini">
          <span className="gemini-dot" aria-hidden="true"></span>
          Generated by Gemini
        </span>
      </div>
      <div className="chat-guidance" aria-live="polite">
        <span className="guidance-icon" aria-hidden="true">✨</span>
        {STEP_MAP[journey]
          ? <>
              Currently at: <strong>{STEP_MAP[journey].current}</strong>
              <span className="step-progress-arrow" aria-hidden="true"> → </span>
              Next: <strong>{STEP_MAP[journey].next}</strong>
            </>
          : "I'll guide you step-by-step based on where you are in the voting process."
        }
      </div>

      {walkthroughActive && (
        <div className="walkthrough-progress" aria-live="assertive" role="region" aria-label="Walkthrough progress">
          <span className="walkthrough-progress-label">
            🎓 Guided Walkthrough — Stage {Math.min(walkthroughStep, 5)} of 5
          </span>
          <div className="walkthrough-bar">
            <div
              className="walkthrough-bar-fill"
              style={{ width: `${(Math.min(walkthroughStep, 5) / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="chat-messages" role="log" aria-live="polite" aria-busy={loading} aria-label="Chat messages">
        {messages.length === 0 && !loading && (
          <div className="chat-empty">
            <div className="chat-empty-icon" aria-hidden="true">🗳️</div>
            <p className="chat-placeholder">
              {journey === 'Not Registered'
                ? "Since you're not registered yet, let me help you get started."
                : journey === 'Registered'
                  ? "You're registered — let's make sure you're fully prepared."
                  : "You're ready to vote! Ask me anything about election day."}
            </p>
            <p className="chat-hint">Click a timeline step or type a question — I'll guide you through it.</p>
            <button
              className="walkthrough-btn"
              onClick={startWalkthrough}
              aria-label="Start guided walkthrough of the full election journey"
            >
              <span aria-hidden="true">🎓</span>
              Start Guided Walkthrough
            </button>
            <div className="quick-prompts" aria-label="Suggested questions">
              <button className="quick-prompt-chip" onClick={() => sendMessage("How do I register to vote?")}>How do I register?</button>
              <button className="quick-prompt-chip" onClick={() => sendMessage("What documents do I need to vote?")}>What documents do I need?</button>
              <button className="quick-prompt-chip" onClick={() => sendMessage("What is NOTA?")}>What is NOTA?</button>
              <button className="quick-prompt-chip" onClick={() => sendMessage("How does election day voting work?")}>Voting Day Steps</button>
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.role}`}
            aria-label={`${msg.role === 'ai' ? 'ELARA' : 'You'}: ${msg.text.substring(0, 100)}`}
          >
            <span className="message-label">
              {msg.role === 'ai' ? (
                <><span className="avatar" aria-hidden="true">🤖</span> ELARA</>
              ) : (
                <><span className="avatar" aria-hidden="true">👤</span> You</>
              )}
            </span>
            <div className="message-text" dir={lang === 'hi' ? 'auto' : 'ltr'}>
              {msg.role === 'ai' ? renderMarkdown(msg.text) : msg.text}
            </div>
            {msg.badges && msg.badges.length > 0 && (
              <div className="trust-badges" aria-label="Response quality indicators">
                {msg.badges.map((badge) => (
                  <span key={badge} className="trust-badge">
                    <span aria-hidden="true">{BADGE_ICONS[badge] || '✅'}</span>
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="message ai loading-message" aria-live="assertive" aria-label="ELARA is thinking">
            <span className="message-label">
              <span className="avatar" aria-hidden="true">🤖</span> ELARA
            </span>
            <div className="typing-indicator" role="status" aria-label="Loading response">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-form" onSubmit={handleSubmit} aria-label="Ask ELARA a question">
        <label htmlFor="chat-input" className="sr-only">
          Your question
        </label>
        <input
          id="chat-input"
          className="chat-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about voting, registration, timelines…"
          aria-label="Type your question here"
          maxLength={1000}
          disabled={loading}
        />
        <button
          type="submit"
          className="send-btn"
          aria-label="Send question to ELARA"
          disabled={loading || !query.trim()}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" />
          </svg>
          Ask
        </button>
      </form>

      <div className="chat-disclaimer" role="note">
        <small>⚠️ ELARA provides educational guidance only. For official information, visit <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer">eci.gov.in</a></small>
      </div>
    </section>
  );
}

ChatPanel.propTypes = {
  journey: PropTypes.string.isRequired,
  externalQuery: PropTypes.shape({
    query: PropTypes.string,
    intent: PropTypes.string,
  }),
  lang: PropTypes.oneOf(['en', 'hi']),
};

export default memo(ChatPanel);
