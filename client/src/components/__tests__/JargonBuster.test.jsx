import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JargonBuster from '../JargonBuster';

describe('JargonBuster', () => {
  it('renders the section heading', () => {
    render(<JargonBuster journey="General" />);
    expect(screen.getByText('Jargon Buster')).toBeInTheDocument();
  });

  it('renders the input field with placeholder', () => {
    render(<JargonBuster journey="General" />);
    const input = screen.getByLabelText('Enter election jargon to simplify');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', expect.stringContaining('Electoral College'));
  });

  it('disables the button when input is empty', () => {
    render(<JargonBuster journey="General" />);
    const button = screen.getByLabelText('Simplify this term');
    expect(button).toBeDisabled();
  });

  it('enables the button when input has text', async () => {
    const user = userEvent.setup();
    render(<JargonBuster journey="General" />);

    const input = screen.getByLabelText('Enter election jargon to simplify');
    await user.type(input, 'Electoral College');

    const button = screen.getByLabelText('Simplify this term');
    expect(button).toBeEnabled();
  });

  it('updates input value on typing', async () => {
    const user = userEvent.setup();
    render(<JargonBuster journey="General" />);

    const input = screen.getByLabelText('Enter election jargon to simplify');
    await user.type(input, 'Constituency');
    expect(input).toHaveValue('Constituency');
  });
});
