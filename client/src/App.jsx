import { useState, lazy, Suspense, useEffect } from 'react';
import Header from './components/Header';
import JourneySelector from './components/JourneySelector';
import ChatPanel from './components/ChatPanel';
import Timeline from './components/Timeline';
import ErrorBoundary from './components/ErrorBoundary';

const JargonBuster = lazy(() => import('./components/JargonBuster'));

export default function App() {
  // Initialize journey from localStorage, default to 'Not Registered'
  const [journey, setJourney] = useState(() => {
    return localStorage.getItem('elara_journey') || 'Not Registered';
  });

  const [chatTrigger, setChatTrigger] = useState(null);
  
  // Initialize language from localStorage, default to 'en'
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('elara_lang') || 'en';
  });

  // Persist journey to localStorage
  useEffect(() => {
    localStorage.setItem('elara_journey', journey);
  }, [journey]);

  // Dynamically update the HTML lang, document title, and persist lang
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lang === 'hi' 
      ? 'एलारा — चुनाव मार्गदर्शन सहायक' 
      : 'ELARA — Election Assistance & Resource Assistant';
    localStorage.setItem('elara_lang', lang);
  }, [lang]);

  return (
    <ErrorBoundary>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <main className="app">
        <Header lang={lang} setLang={setLang} />
        <div className="layout" id="main-content" tabIndex={-1}>
          <aside className="left-panel" aria-label="Navigation panel">
            <JourneySelector journey={journey} setJourney={setJourney} />
            <Timeline onStepClick={(trigger) => setChatTrigger(trigger)} />
          </aside>
          <section className="center-panel" aria-label="AI Chat">
            <ChatPanel journey={journey} externalQuery={chatTrigger} lang={lang} />
          </section>
        </div>
        <section aria-label="Jargon Buster tool">
          <Suspense fallback={<div className="lazy-loader" role="status" aria-label="Loading Jargon Buster">Loading…</div>}>
            <JargonBuster journey={journey} lang={lang} />
          </Suspense>
        </section>
      </main>
    </ErrorBoundary>
  );
}
