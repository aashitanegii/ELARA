const stages = [
  { label: 'Not Registered', icon: '📋', description: 'Start your voting journey' },
  { label: 'Registered', icon: '✅', description: 'Already registered to vote' },
  { label: 'Ready to Vote', icon: '🗳️', description: 'Prepared for election day' },
];

export default function JourneySelector({ journey, setJourney }) {
  return (
    <section className="card journey-selector" aria-labelledby="journey-heading">
      <h2 id="journey-heading">
        <span className="section-icon" aria-hidden="true">🧭</span>
        Your Journey
      </h2>
      <div className="journey-buttons" role="group" aria-label="Voting journey stages">
        {stages.map((stage) => (
          <button
            key={stage.label}
            className={`journey-btn ${journey === stage.label ? 'active' : ''}`}
            onClick={() => setJourney(stage.label)}
            aria-pressed={journey === stage.label}
            aria-label={`Select stage: ${stage.label}`}
          >
            <span className="journey-btn-icon" aria-hidden="true">{stage.icon}</span>
            <span className="journey-btn-content">
              <span className="journey-btn-label">{stage.label}</span>
              <span className="journey-btn-desc">{stage.description}</span>
            </span>
          </button>
        ))}
      </div>
      <div className="context-display" aria-live="polite">
        <span className="context-dot" aria-hidden="true"></span>
        Active context: <strong>{journey}</strong>
      </div>
    </section>
  );
}
