const steps = [
  { id: 1, label: 'Registration', icon: '📝', query: 'I clicked the Registration step. Based on my current stage, guide me through voter registration — what documents do I need, where do I go, and what deadlines should I watch for?' },
  { id: 2, label: 'Verification', icon: '🔍', query: 'I clicked the Verification step. Walk me through how voter verification works — what happens after I submit my registration application?' },
  { id: 3, label: 'Polling', icon: '🏛️', query: 'I clicked the Polling step. Tell me exactly what happens on election day at the polling station — step by step, from arrival to voting.' },
  { id: 4, label: 'Counting', icon: '📊', query: 'I clicked the Counting step. Explain how votes are counted, verified, and how the results are officially announced.' },
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
              onClick={() => onStepClick(step.query)}
              aria-label={`Learn about ${step.label}`}
            >
              <span className="step-number" aria-hidden="true">{step.id}</span>
              <span className="step-content">
                <span className="step-label">{step.label}</span>
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
