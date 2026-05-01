const steps = [
  {
    id: 1,
    label: 'Registration',
    icon: '📝',
    subtitle: 'Enroll as an eligible voter',
    query: 'Explain the Registration stage of the election process in detail. What documents are needed, where to apply, how long it takes, and what happens after submission.',
  },
  {
    id: 2,
    label: 'Verification',
    icon: '🔍',
    subtitle: 'Identity & address confirmation',
    query: 'Explain the Verification stage in elections. What happens after registration? Who checks documents? How long can it take? What happens if approved or rejected?',
  },
  {
    id: 3,
    label: 'Polling Day',
    icon: '🏛️',
    subtitle: 'Cast your vote',
    query: 'Explain exactly what happens on Polling Day at the polling station — step by step, from arrival to casting your vote and ink marking.',
  },
  {
    id: 4,
    label: 'Counting',
    icon: '📊',
    subtitle: 'Votes tallied & verified',
    query: 'Explain how vote Counting works after elections. How are EVMs opened, who supervises, how are VVPAT slips verified, and how are results officially declared?',
  },
  {
    id: 5,
    label: 'Results',
    icon: '📢',
    subtitle: 'Winners declared',
    query: 'Explain the Results stage of elections. How are winners officially announced, what is a Certificate of Election, and what happens if results are disputed?',
  },
];

export default function Timeline({ onStepClick }) {
  return (
    <section className="card timeline" aria-labelledby="timeline-heading">
      <h2 id="timeline-heading">
        <span className="section-icon" aria-hidden="true">📅</span>
        Election Timeline
      </h2>
      <ol className="timeline-list">
        {steps.map((step, index) => (
          <li key={step.id} className="timeline-item">
            <button
              className="timeline-step"
              onClick={() => onStepClick({ query: step.query, intent: 'timeline' })}
              aria-label={`Learn about ${step.label}`}
            >
              <span className="step-number" aria-hidden="true">{step.id}</span>
              <span className="step-content">
                <span className="step-label">{step.label}</span>
                <span className="step-subtitle">{step.subtitle}</span>
              </span>
              <span className="step-arrow" aria-hidden="true">→</span>
            </button>
            {index < steps.length - 1 && <div className="timeline-connector" aria-hidden="true"></div>}
          </li>
        ))}
      </ol>
    </section>
  );
}
