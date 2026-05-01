import { useState, useEffect, useRef, useCallback } from 'react';

/** Generate unique message IDs to avoid array-index keys */
let messageIdCounter = 0;
function createMessage(role, text, badges = []) {
  return { id: ++messageIdCounter, role, text, badges };
}

/** Parse [BADGE: ...] tags from response text and return { cleanText, badges } */
function parseBadges(text) {
  const badgeRegex = /\[BADGE:\s*([^\]]+)\]/g;
  const badges = [];
  let match;
  while ((match = badgeRegex.exec(text)) !== null) {
    badges.push(match[1].trim());
  }
  const cleanText = text.replace(badgeRegex, '').trim();
  return { cleanText, badges };
}

/** Badge icon mapping */
/**
 * Lightweight markdown renderer — converts **bold**, ## headers, and lists to React elements.
 * No external dependencies.
 */
function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let key = 0;

  for (const line of lines) {
    key++;
    // ## Header
    if (/^#{1,3}\s/.test(line)) {
      const content = line.replace(/^#{1,3}\s*/, '');
      elements.push(<strong key={key} className="md-heading">{renderInline(content)}</strong>);
      elements.push(<br key={key + 'br'} />);
      continue;
    }
    // Empty line = spacing
    if (line.trim() === '') {
      elements.push(<br key={key} />);
      continue;
    }
    // Regular line with inline formatting
    elements.push(<span key={key}>{renderInline(line)}</span>);
    elements.push(<br key={key + 'br'} />);
  }
  return elements;
}

/** Render inline **bold** and *italic* within a single line */
function renderInline(text) {
  const parts = [];
  let remaining = text;
  let idx = 0;
  // Match **bold** patterns
  const boldRegex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;
  while ((match = boldRegex.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      parts.push(remaining.slice(lastIndex, match.index));
    }
    parts.push(<strong key={`b${idx++}`}>{match[1]}</strong>);
    lastIndex = boldRegex.lastIndex;
  }
  if (lastIndex < remaining.length) {
    parts.push(remaining.slice(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}

const BADGE_ICONS = {
  'Beginner Friendly': '📘',
  'Step-by-Step Guidance': '🧭',
  'Next Step Ready': '🧭',
  'Timeline Included': '⏱',
  'Verified Educational Info': '✅',
};

export default function ChatPanel({ journey, externalQuery }) {
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

  /** Journey step progression map */
  const STEP_MAP = {
    'Not Registered': { current: 'Registration', next: 'Verification' },
    'Registered': { current: 'Verification', next: 'Polling Day' },
    'Ready to Vote': { current: 'Polling Day', next: 'Results' },
  };

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
              lastTopic: lastTopicRef.current,
            }),
          });
          if (res.ok) break;
        } catch (e) {
          // fetch error
        }
        attempt++;
        if (attempt < 3) await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1))); // Exponential backoff: 1s, 2s
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
    } catch {
      setMessages((prev) => [
        ...prev,
        createMessage('ai', 'Service unavailable after retries. Please try again.', ['Offline Mode']),
      ]);
    } finally {
      setLoading(false);
    }
  }, [journey, loading]);

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
  };

  const startWalkthrough = () => {
    setMessages([]);
    setWalkthroughStep(0);
    setWalkthroughActive(true);
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

      <div className="chat-messages" role="log" aria-live="polite" aria-label="Chat messages">
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
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.role}`}
            aria-label={`${msg.role === 'ai' ? 'ELARA' : 'You'}: ${msg.text.substring(0, 100)}`}
          >
            <span className="message-label">
              {msg.role === 'ai' ? '🤖 ELARA' : '👤 You'}
            </span>
            <div className="message-text">{msg.role === 'ai' ? renderMarkdown(msg.text) : msg.text}</div>
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
            <span className="message-label">🤖 ELARA</span>
            <div className="typing-indicator">
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
    </section>
  );
}
