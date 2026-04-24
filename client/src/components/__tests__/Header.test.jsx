import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from '../Header';

describe('Header', () => {
  it('renders the ELARA title', () => {
    render(<Header />);
    expect(screen.getByText('ELARA')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<Header />);
    expect(screen.getByText('Election Assistance & Resource Assistant')).toBeInTheDocument();
  });

  it('displays the Powered by Google Gemini badge', () => {
    render(<Header />);
    expect(screen.getByLabelText('Powered by Google Gemini')).toBeInTheDocument();
  });

  it('has a banner role on header element', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});
