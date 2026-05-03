import PropTypes from 'prop-types';

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

      <div className="card official-resources" style={{ marginTop: '16px', borderLeft: '4px solid var(--accent)', background: 'var(--bg-primary)' }}>
        <h3 style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span aria-hidden="true">🏛️</span> Official Resources
        </h3>
        <ul style={{ listStyle: 'none', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '10px', padding: 0 }}>
          <li>
            <a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-light)', textDecoration: 'none' }}>
              Register to Vote (Form 6) ↗
            </a>
          </li>
          <li>
            <a href="https://voters.eci.gov.in/download-e-epic" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-light)', textDecoration: 'none' }}>
              Download e-EPIC ↗
            </a>
          </li>
          <li>
            <a href="https://electoralsearch.eci.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-light)', textDecoration: 'none' }}>
              Search Name in Roll ↗
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}

JourneySelector.propTypes = {
  journey: PropTypes.string.isRequired,
  setJourney: PropTypes.func.isRequired,
};
