import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../Header';

describe('Header', () => {
  const defaultProps = { lang: 'en', setLang: vi.fn() };

  it('renders the ELARA title', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('ELARA')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('Election Assistance & Resource Assistant')).toBeInTheDocument();
  });

  it('displays the Powered by Google Gemini badge', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByLabelText('Powered by Google Gemini')).toBeInTheDocument();
  });

  it('has a banner role on header element', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders the language toggle button', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByLabelText(/switch language to hindi/i)).toBeInTheDocument();
  });

  it('shows Hindi option when current language is English', () => {
    render(<Header lang="en" setLang={vi.fn()} />);
    expect(screen.getByText('हिन्दी')).toBeInTheDocument();
  });

  it('shows English option when current language is Hindi', () => {
    render(<Header lang="hi" setLang={vi.fn()} />);
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('calls setLang when toggle is clicked', async () => {
    const mockSetLang = vi.fn();
    const user = userEvent.setup();
    render(<Header lang="en" setLang={mockSetLang} />);

    await user.click(screen.getByLabelText(/switch language/i));
    expect(mockSetLang).toHaveBeenCalledWith('hi');
  });
});
