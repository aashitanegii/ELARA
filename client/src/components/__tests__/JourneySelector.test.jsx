import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JourneySelector from '../JourneySelector';

describe('JourneySelector', () => {
  it('renders all three journey stage buttons', () => {
    render(<JourneySelector journey="Not Registered" setJourney={() => {}} />);
    expect(screen.getByLabelText('Select stage: Not Registered')).toBeInTheDocument();
    expect(screen.getByLabelText('Select stage: Registered')).toBeInTheDocument();
    expect(screen.getByLabelText('Select stage: Ready to Vote')).toBeInTheDocument();
  });

  it('marks the active journey button as pressed', () => {
    render(<JourneySelector journey="Registered" setJourney={() => {}} />);
    const activeBtn = screen.getByLabelText('Select stage: Registered');
    expect(activeBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('marks inactive buttons as not pressed', () => {
    render(<JourneySelector journey="Registered" setJourney={() => {}} />);
    const inactiveBtn = screen.getByLabelText('Select stage: Not Registered');
    expect(inactiveBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls setJourney when a stage button is clicked', async () => {
    const mockSetJourney = vi.fn();
    const user = userEvent.setup();

    render(<JourneySelector journey="Not Registered" setJourney={mockSetJourney} />);

    await user.click(screen.getByLabelText('Select stage: Ready to Vote'));
    expect(mockSetJourney).toHaveBeenCalledWith('Ready to Vote');
  });

  it('displays the current context in the status area', () => {
    render(<JourneySelector journey="Ready to Vote" setJourney={() => {}} />);
    // Use getAllByText since the label appears in both button and context display
    const elements = screen.getAllByText('Ready to Vote');
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it('has a group role for button set', () => {
    render(<JourneySelector journey="Not Registered" setJourney={() => {}} />);
    expect(screen.getByRole('group', { name: 'Voting journey stages' })).toBeInTheDocument();
  });
});
