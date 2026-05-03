import { useState } from 'react';
import PropTypes from 'prop-types';

const TIMELINE_STAGES = [
  {
    id: 1,
    label: 'Registration',
    icon: '📝',
    subtitle: 'Enroll as an eligible voter',
    whatHappens: 'You fill out Form 6 to get your name on the electoral roll.',
    docs: ['Aadhaar Card', 'Age Proof', 'Address Proof'],
    duration: '1-3 weeks',
    tip: 'Apply online via the Voter Helpline App for faster processing.',
    source: 'https://voters.eci.gov.in',
    nextQuery: 'How do I check if my voter registration was approved?',
  },
  {
    id: 2,
    label: 'Verification',
    icon: '🔍',
    subtitle: 'Identity & address confirmation',
    whatHappens: 'A Booth Level Officer (BLO) may visit your address to verify details.',
    docs: ['Keep original documents ready'],
    duration: '1-2 weeks',
    tip: 'Ensure someone is home during the verification period.',
    source: 'https://voters.eci.gov.in',
    nextQuery: 'What happens if my voter verification fails?',
  },
  {
    id: 3,
    label: 'Polling Day',
    icon: '🏛️',
    subtitle: 'Cast your vote',
    whatHappens: 'You visit your polling booth, verify identity, and cast your vote on the EVM.',
    docs: ['Voter ID (EPIC) or alternate approved ID'],
    duration: '10-30 minutes on site',
    tip: 'Go early in the morning to avoid long queues.',
    source: 'https://eci.gov.in',
    nextQuery: 'What is the step-by-step process inside the polling booth?',
  },
  {
    id: 4,
    label: 'Counting',
    icon: '📊',
    subtitle: 'Votes tallied & verified',
    whatHappens: 'EVMs are opened in the presence of candidates and votes are tallied.',
    docs: ['N/A (Handled by officials)'],
    duration: '1 day',
    tip: 'Follow live results via the official ECI results portal.',
    source: 'https://results.eci.gov.in',
    nextQuery: 'How is EVM counting kept secure and tamper-proof?',
  },
  {
    id: 5,
    label: 'Results',
    icon: '📢',
    subtitle: 'Winners declared',
    whatHappens: 'The candidate with the most votes receives a Certificate of Election.',
    docs: ['N/A'],
    duration: 'Immediate after counting',
    tip: 'Results are legally binding unless challenged in court.',
    source: 'https://eci.gov.in',
    nextQuery: 'What happens if candidates get a tie in votes?',
  },
];

export default function Timeline({ onStepClick }) {
  const [activeId, setActiveId] = useState(null);

  const toggleAccordion = (id) => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <section className="card timeline" aria-labelledby="timeline-heading">
      <h2 id="timeline-heading">
        <span className="section-icon" aria-hidden="true">📅</span>
        Election Timeline
      </h2>
      <div className="timeline-list">
        {TIMELINE_STAGES.map((step, index) => {
          const isActive = activeId === step.id;
          return (
            <div key={step.id} className="timeline-item">
              <button
                className={`timeline-step ${isActive ? 'active' : ''}`}
                onClick={() => toggleAccordion(step.id)}
                aria-expanded={isActive}
                aria-controls={`step-details-${step.id}`}
              >
                <span className="step-number" aria-hidden="true">{step.id}</span>
                <span className="step-content">
                  <span className="step-label">{step.label}</span>
                  <span className="step-subtitle">{step.subtitle}</span>
                </span>
                <span className="step-arrow" aria-hidden="true">
                  {isActive ? '↓' : '→'}
                </span>
              </button>
              
              {isActive && (
                <div id={`step-details-${step.id}`} className="timeline-details">
                  <p><strong>What Happens:</strong> {step.whatHappens}</p>
                  <p><strong>Documents:</strong> {step.docs.join(', ')}</p>
                  <p><strong>Duration:</strong> {step.duration}</p>
                  <p><strong>💡 Tip:</strong> {step.tip}</p>
                  <p>
                    <strong>Source:</strong>{' '}
                    <a href={step.source} target="_blank" rel="noopener noreferrer">
                      Official Portal
                    </a>
                  </p>
                  <button 
                    className="timeline-ask-btn"
                    onClick={() => onStepClick({ query: step.nextQuery, intent: 'timeline' })}
                  >
                    Ask ELARA for Details
                  </button>
                </div>
              )}
              {index < TIMELINE_STAGES.length - 1 && <div className="timeline-connector" aria-hidden="true"></div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

Timeline.propTypes = {
  onStepClick: PropTypes.func.isRequired,
};
