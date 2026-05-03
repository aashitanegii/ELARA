import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

// Mock analytics
vi.mock('../../analytics', () => ({
  initAnalytics: vi.fn(),
  logEvent: vi.fn(),
}));

// Mock fetch for ChatPanel auto-trigger
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({
    response: 'Welcome.\n\n[BADGE: Beginner Friendly]',
    intent: 'journey',
    powered_by: 'Google Gemini',
  }),
});

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('ELARA')).toBeInTheDocument();
  });

  it('renders the Header component with Gemini badge', () => {
    render(<App />);
    expect(screen.getByLabelText('Powered by Google Gemini')).toBeInTheDocument();
  });

  it('renders the JourneySelector component', () => {
    render(<App />);
    expect(screen.getByRole('group', { name: 'Voting journey stages' })).toBeInTheDocument();
  });

  it('renders the Timeline component', () => {
    render(<App />);
    expect(screen.getByText('Election Timeline')).toBeInTheDocument();
  });

  it('renders the skip-to-content link', () => {
    render(<App />);
    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
  });

  it('renders the language toggle button', () => {
    render(<App />);
    expect(screen.getByLabelText(/switch language/i)).toBeInTheDocument();
  });

  it('toggles language when lang button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const langBtn = screen.getByLabelText(/switch language/i);
    expect(langBtn).toHaveTextContent('हिन्दी');

    await user.click(langBtn);
    expect(screen.getByLabelText(/switch language/i)).toHaveTextContent('English');
  });

  it('renders semantic landmark regions', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
