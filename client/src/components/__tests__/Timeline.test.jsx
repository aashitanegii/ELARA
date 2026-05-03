import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Timeline from '../Timeline';

describe('Timeline', () => {
  it('renders all five election steps', () => {
    render(<Timeline onStepClick={() => {}} />);
    expect(screen.getByText('Registration')).toBeInTheDocument();
    expect(screen.getByText('Verification')).toBeInTheDocument();
    expect(screen.getByText('Polling Day')).toBeInTheDocument();
    expect(screen.getByText('Counting')).toBeInTheDocument();
    expect(screen.getByText('Results')).toBeInTheDocument();
  });

  it('calls onStepClick with object containing query and intent when a step is clicked', async () => {
    const mockClick = vi.fn();
    const user = userEvent.setup();

    render(<Timeline onStepClick={mockClick} />);

    // Open accordion first
    await user.click(screen.getByText('Registration'));
    
    // Click the ask button inside accordion
    await user.click(screen.getAllByText('Ask ELARA for Details')[0]);
    
    expect(mockClick).toHaveBeenCalledTimes(1);
    expect(mockClick).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.stringContaining('check if my voter registration was approved'),
        intent: 'timeline',
      })
    );
  });

  it('renders step numbers 1 through 5', () => {
    render(<Timeline onStepClick={() => {}} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders subtitle text for each step', () => {
    render(<Timeline onStepClick={() => {}} />);
    expect(screen.getByText('Enroll as an eligible voter')).toBeInTheDocument();
    expect(screen.getByText('Identity & address confirmation')).toBeInTheDocument();
    expect(screen.getByText('Cast your vote')).toBeInTheDocument();
    expect(screen.getByText('Votes tallied & verified')).toBeInTheDocument();
    expect(screen.getByText('Winners declared')).toBeInTheDocument();
  });

  it('uses a div container for timeline steps', () => {
    render(<Timeline onStepClick={() => {}} />);
    const list = document.querySelector('.timeline-list');
    expect(list.tagName).toBe('DIV');
  });
});
