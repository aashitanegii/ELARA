import { useState } from 'react';
import Header from './components/Header';
import JourneySelector from './components/JourneySelector';
import ChatPanel from './components/ChatPanel';
import Timeline from './components/Timeline';
import JargonBuster from './components/JargonBuster';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [journey, setJourney] = useState('Not Registered');
  const [chatTrigger, setChatTrigger] = useState('');

  return (
    <ErrorBoundary>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <main className="app">
        <Header />
        <div className="layout" id="main-content" tabIndex={-1}>
          <aside className="left-panel" aria-label="Navigation panel">
            <JourneySelector journey={journey} setJourney={setJourney} />
            <Timeline onStepClick={(step) => setChatTrigger(step)} />
          </aside>
          <section className="center-panel" aria-label="AI Chat">
            <ChatPanel journey={journey} externalQuery={chatTrigger} />
          </section>
        </div>
        <section aria-label="Jargon Buster tool">
          <JargonBuster journey={journey} />
        </section>
      </main>
    </ErrorBoundary>
  );
}
