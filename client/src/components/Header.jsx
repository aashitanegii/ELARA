export default function Header() {
  return (
    <header className="header" role="banner">
      <div className="header-inner">
        <div className="header-brand">
          <div className="logo-icon" aria-hidden="true">🗳️</div>
          <div>
            <h1 className="header-title">ELARA</h1>
            <p className="header-subtitle">Election Assistance & Resource Assistant</p>
          </div>
        </div>
        <span className="badge" aria-label="Powered by Google Gemini">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
            <path d="M8 0L10 6L16 8L10 10L8 16L6 10L0 8L6 6L8 0Z" fill="currentColor" />
          </svg>
          Powered by Google Gemini
        </span>
      </div>
    </header>
  );
}
