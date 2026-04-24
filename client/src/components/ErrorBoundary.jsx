import { Component } from 'react';

/**
 * ErrorBoundary catches JavaScript errors in child components
 * and displays a fallback UI instead of a white screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ELARA ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert" aria-live="assertive">
          <div className="error-boundary-content">
            <span className="error-icon" aria-hidden="true">⚠️</span>
            <h2>Something went wrong</h2>
            <p>ELARA encountered an unexpected error. Please refresh the page to try again.</p>
            <button
              className="error-retry-btn"
              onClick={() => window.location.reload()}
              aria-label="Refresh the page"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
